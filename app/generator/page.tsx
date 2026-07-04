"use client";

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useFarmer } from '@/context/FarmerContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Home } from './Home';
import { createCardApi } from '@/lib/api/card.api';
import { HiArrowLeft } from 'react-icons/hi2';

export default function GeneratorPage() {
  const { farmerData } = useFarmer();
  const router = useRouter();
  const hasSavedRef = useRef(false);

  // When farmerData is populated after parsing, save to backend
  useEffect(() => {
    if (farmerData && !hasSavedRef.current) {
      hasSavedRef.current = true;

      const saveToBackend = async () => {
        try {
          await createCardApi({ farmerData });
          console.log('Card saved to backend successfully');
        } catch (err) {
          console.error('Failed to save card to backend:', err);
          // Don't block the user — card is still rendered locally
        }
      };

      saveToBackend();
    }

    // Reset the ref when farmerData is cleared
    if (!farmerData) {
      hasSavedRef.current = false;
    }
  }, [farmerData]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
      <Header />

      {/* Back to Dashboard button */}
      <div className="w-full max-w-7xl mx-auto px-4 pt-4 sm:px-6 lg:px-8 no-print">
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          <HiArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>
      </div>

      <main className="flex-1 flex flex-col justify-start pb-8">
        <Home />
      </main>
      <Footer />
    </div>
  );
}
