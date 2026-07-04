import React from 'react';
import ResetPasswordClient from '../ResetPasswordClient';

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function ResetPasswordTokenPage({ params }: PageProps) {
  const { token } = await params;
  return <ResetPasswordClient token={token} />;
}
