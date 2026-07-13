import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/lib/services/payment.service';

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('x-webhook-signature') || '';
    const timestamp = req.headers.get('x-webhook-timestamp') || '';
    const rawBody = await req.text();

    const isValid = paymentService.verifyWebhookSignature(rawBody, signature, timestamp);
    if (!isValid) {
      console.warn('[CASHFREE WEBHOOK] Invalid signature');
      return NextResponse.json({ success: false, message: 'Invalid signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.type;
    const data = payload.data;

    if (event && data) {
      await paymentService.handleWebhook(event, data);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[CASHFREE WEBHOOK] Error handling webhook:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
