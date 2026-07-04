import Razorpay from 'razorpay';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import env from '@/lib/env';
import { ApiError } from '@/lib/utils/ApiError';

export class PaymentService {
  private getRazorpayInstance() {
    if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay keys are not configured in environment variables');
    }
    return new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    });
  }

  /**
   * Create Razorpay order for ₹299 registration fee
   */
  async createRegistrationOrder(email: string): Promise<any> {
    // 1. Check if user already exists and is paid
    const user = await prisma.user.findUnique({ where: { email } });
    if (user && user.paymentStatus === 'PAID') {
      return { exists: true, message: 'User already registered and paid' };
    }

    const razorpay = this.getRazorpayInstance();
    const receipt = `rcpt_${crypto.randomBytes(8).toString('hex')}`;

    const order = await razorpay.orders.create({
      amount: 29900, // ₹299 in paise
      currency: 'INR',
      receipt,
    });

    // 2. Store payment record with PENDING status
    await prisma.payment.upsert({
      where: { razorpayOrderId: order.id },
      update: {
        amount: 299,
        currency: 'INR',
        status: 'PENDING',
        receipt,
      },
      create: {
        razorpayOrderId: order.id,
        amount: 299,
        currency: 'INR',
        status: 'PENDING',
        receipt,
      },
    });

    return {
      exists: false,
      orderId: order.id,
      amount: 29900,
      currency: 'INR',
    };
  }

  /**
   * Verify signature of Razorpay payment callback
   */
  verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
    const text = `${orderId}|${paymentId}`;
    const generated_signature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    return generated_signature === signature;
  }

  /**
   * Verify Razorpay Webhook signature
   */
  verifyWebhookSignature(body: string, signature: string): boolean {
    if (!env.RAZORPAY_WEBHOOK_SECRET) {
      throw new Error('Razorpay webhook secret is not configured');
    }
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    return expectedSignature === signature;
  }

  /**
   * Handle Webhook events
   */
  async handleWebhook(event: string, payload: any): Promise<void> {
    const paymentEntity = payload.payment.entity;
    const orderId = paymentEntity.order_id;
    const paymentId = paymentEntity.id;
    const amount = paymentEntity.amount / 100; // convert paise to INR
    const currency = paymentEntity.currency;
    const paymentMethod = paymentEntity.method;

    console.log(`[PAYMENT WEBHOOK] Event: ${event}, Order: ${orderId}, Payment: ${paymentId}`);

    if (!orderId) return;

    if (event === 'payment.captured' || event === 'order.paid') {
      // Find the payment record
      const payment = await prisma.payment.findUnique({
        where: { razorpayOrderId: orderId },
      });

      if (!payment) {
        // Webhook retry or out-of-order execution: create payment record if missing
        await prisma.payment.create({
          data: {
            razorpayOrderId: orderId,
            razorpayPaymentId: paymentId,
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
          razorpayPaymentId: paymentId,
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
    } else if (event === 'payment.failed') {
      await prisma.payment.upsert({
        where: { razorpayOrderId: orderId },
        update: {
          razorpayPaymentId: paymentId,
          status: 'FAILED',
        },
        create: {
          razorpayOrderId: orderId,
          razorpayPaymentId: paymentId,
          amount,
          currency,
          status: 'FAILED',
        },
      });
    }
  }
}

export const paymentService = new PaymentService();
