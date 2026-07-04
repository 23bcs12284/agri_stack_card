import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/lib/services/payment.service';

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('x-razorpay-signature');
    if (!signature) {
      return NextResponse.json({ success: false, message: 'Missing razorpay webhook signature' }, { status: 400 });
    }

    const rawBody = await req.text();
    const isValid = paymentService.verifyWebhookSignature(rawBody, signature);
    
    if (!isValid) {
      return NextResponse.json({ success: false, message: 'Invalid webhook signature' }, { status: 400 });
    }

    const body = JSON.parse(rawBody);
    const { event, payload } = body;
    await paymentService.handleWebhook(event, payload);

    return NextResponse.json({ success: true, message: 'Webhook processed' }, { status: 200 });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ success: false, message: 'Webhook processing failed' }, { status: 500 });
  }
}
