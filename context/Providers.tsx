"use client";

import React from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { FarmerProvider } from '@/context/FarmerContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <FarmerProvider>
        {children}
      </FarmerProvider>
    </AuthProvider>
  );
}
