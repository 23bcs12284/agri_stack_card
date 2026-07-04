import env from '../config/env.js';

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const verificationLink = `${env.CORS_ORIGIN}/verify-email/${token}`;

  if (env.NODE_ENV === 'development') {
    console.log('═══════════════════════════════════════════');
    console.log('📧 VERIFICATION EMAIL (Dev Mode)');
    console.log(`   To: ${email}`);
    console.log(`   Token: ${token}`);
    console.log(`   Link: ${verificationLink}`);
    console.log('═══════════════════════════════════════════');
    return;
  }

  // Production: integrate with an email service (SendGrid, AWS SES, etc.)
  // For now, log the token even in production as a fallback
  console.log(`📧 Verification email queued for: ${email}`);
  console.log(`   Link: ${verificationLink}`);
}

export async function sendResetPasswordEmail(email: string, token: string): Promise<void> {
  const resetLink = `${env.CORS_ORIGIN}/reset-password/${token}`;

  if (env.NODE_ENV === 'development') {
    console.log('═══════════════════════════════════════════');
    console.log('📧 PASSWORD RESET EMAIL (Dev Mode)');
    console.log(`   To: ${email}`);
    console.log(`   Token: ${token}`);
    console.log(`   Link: ${resetLink}`);
    console.log('═══════════════════════════════════════════');
    return;
  }

  // Production: integrate with an email service
  console.log(`📧 Password reset email queued for: ${email}`);
  console.log(`   Link: ${resetLink}`);
}
