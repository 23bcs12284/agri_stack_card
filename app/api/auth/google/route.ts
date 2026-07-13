import { NextRequest, NextResponse } from 'next/server';
import env from '@/lib/env';

export async function GET(req: NextRequest) {
  try {
    const deviceId = req.nextUrl.searchParams.get('deviceId') || 'unknown-device';
    const origin = process.env.NODE_ENV === 'production' ? 'https://agri-stack-card.vercel.app' : req.nextUrl.origin;
    const callbackUrl = `${origin}/api/auth/google/callback`;
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(callbackUrl)}&response_type=code&scope=openid%20profile%20email&state=${encodeURIComponent(deviceId)}`;
    
    return NextResponse.redirect(googleAuthUrl);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
