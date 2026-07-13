import crypto from 'crypto';
import prisma from '@/lib/prisma';
import env from '@/lib/env';
import { ApiError } from '@/lib/utils/ApiError';

export class PaymentService {
  private getBaseUrl() {
    return env.CASHFREE_MODE === 'production'
      ? 'https://api.cashfree.com/pg'
      : 'https://sandbox.cashfree.com/pg';
  }

  /**
   * Create Cashfree order for ₹299 registration fee
   */
  async createRegistrationOrder(email: string, name?: string, phone?: string, origin?: string): Promise<any> {
    // 1. Check if user already exists and is paid
    const user = await prisma.user.findUnique({ where: { email } });
    if (user && user.paymentStatus === 'PAID') {
      return { exists: true, message: 'User already registered and paid' };
    }

    const orderId = `order_${crypto.randomBytes(8).toString('hex')}`;
    const receipt = `rcpt_${crypto.randomBytes(8).toString('hex')}`;
    const baseUrl = this.getBaseUrl();

    const payload = {
      order_id: orderId,
      order_amount: 299.00,
      order_currency: 'INR',
      customer_details: {
        customer_id: `cust_${email.replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 45)}`,
        customer_name: name || 'Guest User',
        customer_email: email,
        customer_phone: phone || '9999999999',
      },
      order_meta: {
        return_url: `${origin || 'http://localhost:3000'}/register?status=callback&order_id={order_id}`,
      },
    };

    const response = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'x-client-id': env.CASHFREE_APP_ID,
        'x-client-secret': env.CASHFREE_SECRET_KEY,
        'x-api-version': '2023-08-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[CASHFREE] Failed to create order:', errorText);
      throw ApiError.badRequest('Failed to create payment order with Cashfree');
    }

    const orderData = await response.json() as any;

    // 2. Store payment record with PENDING status
    await prisma.payment.upsert({
      where: { cashfreeOrderId: orderId },
      update: {
        amount: 299,
        currency: 'INR',
        status: 'PENDING',
        receipt,
      },
      create: {
        cashfreeOrderId: orderId,
        amount: 299,
        currency: 'INR',
        status: 'PENDING',
        receipt,
      },
    });

    return {
      exists: false,
      orderId,
      paymentSessionId: orderData.payment_session_id,
      amount: 299.00,
      currency: 'INR',
    };
  }

  /**
   * Verify status of Cashfree payment order
   */
  async verifyOrderPayment(orderId: string): Promise<boolean> {
    const baseUrl = this.getBaseUrl();
    const response = await fetch(`${baseUrl}/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'x-client-id': env.CASHFREE_APP_ID,
        'x-client-secret': env.CASHFREE_SECRET_KEY,
        'x-api-version': '2023-08-01',
      },
    });

    if (!response.ok) {
      console.error(`[CASHFREE] Failed to fetch order status. HTTP status: ${response.status}`);
      return false;
    }

    const orderData = await response.json() as any;
    console.log(`[CASHFREE] Order status for ${orderId}: ${orderData.order_status}`);
    return orderData.order_status === 'PAID';
  }

  /**
   * Get payments for an order to extract payment details
   */
  async getOrderPaymentDetails(orderId: string): Promise<any> {
    const baseUrl = this.getBaseUrl();
    const response = await fetch(`${baseUrl}/orders/${orderId}/payments`, {
      method: 'GET',
      headers: {
        'x-client-id': env.CASHFREE_APP_ID,
        'x-client-secret': env.CASHFREE_SECRET_KEY,
        'x-api-version': '2023-08-01',
      },
    });

    if (!response.ok) {
      console.error(`[CASHFREE] Failed to fetch order payments. HTTP status: ${response.status}`);
      return null;
    }

    const payments = await response.json() as any[];
    const successfulPayment = payments.find((p) => p.payment_status === 'SUCCESS');
    if (!successfulPayment) {
      return null;
    }

    return {
      paymentId: successfulPayment.cf_payment_id,
      paymentMethod: successfulPayment.payment_group || 'unknown',
      reference: successfulPayment.bank_reference || null,
    };
  }

  /**
   * Verify Cashfree Webhook signature
   */
  verifyWebhookSignature(rawBody: string, signature: string, timestamp: string): boolean {
    const signatureData = timestamp + rawBody;
    const computedSignature = crypto
      .createHmac('sha256', env.CASHFREE_SECRET_KEY)
      .update(signatureData)
      .digest('base64');

    return computedSignature === signature;
  }

  /**
   * Handle Webhook events
   */
  async handleWebhook(event: string, payload: any): Promise<void> {
    const orderDetails = payload.order;
    if (!orderDetails) return;

    const orderId = orderDetails.order_id;
    const amount = orderDetails.order_amount;
    const currency = orderDetails.order_currency;

    const paymentDetails = payload.payment;
    const paymentId = paymentDetails ? paymentDetails.cf_payment_id : null;
    const paymentMethod = paymentDetails ? paymentDetails.payment_group : 'unknown';

    console.log(`[PAYMENT WEBHOOK] Event: ${event}, Order: ${orderId}, Payment: ${paymentId}`);

    if (!orderId) return;

    if (event === 'ORDER_PAID') {
      // Find the payment record
      const payment = await prisma.payment.findUnique({
        where: { cashfreeOrderId: orderId },
      });

      if (!payment) {
        // Webhook retry or out-of-order execution: create payment record if missing
        await prisma.payment.create({
          data: {
            cashfreeOrderId: orderId,
            cashfreePaymentId: paymentId,
            amount,
            currency,
            status: 'PAID',
            paymentMethod,
            paidAt: new Date(),
          },
        });
        return;
      }

      if (payment.status === 'PAID') {
        console.log(`[PAYMENT WEBHOOK] Payment for order ${orderId} already processed (idempotent ignore)`);
        return;
      }

      // Update payment record to PAID
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          cashfreePaymentId: paymentId,
          status: 'PAID',
          paymentMethod,
          paidAt: new Date(),
        },
      });

      // If there is an associated user, mark them as paid too
      if (payment.userId) {
        await prisma.user.update({
          where: { id: payment.userId },
          data: { paymentStatus: 'PAID', subscriptionType: 'ONE_TIME' },
        });
      }
    } else if (event === 'ORDER_FAILED') {
      await prisma.payment.upsert({
        where: { cashfreeOrderId: orderId },
        update: {
          cashfreePaymentId: paymentId,
          status: 'FAILED',
        },
        create: {
          cashfreeOrderId: orderId,
          cashfreePaymentId: paymentId,
          amount,
          currency,
          status: 'FAILED',
        },
      });
    }
  }
}

export const paymentService = new PaymentService();
