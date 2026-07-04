"use client";

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ResetPasswordClient from './ResetPasswordClient';

function ResetPasswordQueryContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  return <ResetPasswordClient token={token} />;
}

export default function ResetPasswordQueryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-10 w-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordQueryContent />
    </Suspense>
  );
}
