"use client";

import React from 'react';
import { useFarmer } from '@/context/FarmerContext';
import type { LoaderStep } from '@/context/FarmerContext';
import { motion } from 'framer-motion';
import { HiCheck, HiArrowPath } from 'react-icons/hi2';

export const Loader: React.FC = () => {
  const { loadingStatus } = useFarmer();
  const { step, progress, message } = loadingStatus;

  if (step === 'idle' || step === 'done') return null;

  const stepsList: { key: LoaderStep; label: string; desc: string }[] = [
    { key: 'reading', label: 'Reading PDF Document', desc: 'Loading PDF and parsing selectable text contents.' },
    { key: 'extracting-photo', label: 'Extracting Photograph & QR', desc: 'Isolating passport photo and scanning for QR elements.' },
    ...(step === 'ocr' ? [{ key: 'ocr' as LoaderStep, label: 'Running OCR Engine', desc: 'Scanning document image to recognize bilingual text details.' }] : []),
    { key: 'generating', label: 'Generating Card Elements', desc: 'Mapping fields, auto-formatting, and rendering card mockups.' },
  ];

  const getStepStatus = (_currentStep: LoaderStep, index: number) => {
    const activeIndex = stepsList.findIndex((s) => s.key === step);
    const selfIndex = index;

    if (selfIndex < activeIndex) return 'completed';
    if (selfIndex === activeIndex) return 'active';
    return 'upcoming';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 dark:bg-slate-900 dark:border-slate-800"
      >
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          Processing Document
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Please wait while we automatically analyze and extract data from your PDF.
        </p>

        {/* Global Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <motion.div
              className="h-full bg-linear-to-r from-green-500 to-emerald-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Step-by-Step Loader Checklist */}
        <div className="space-y-4 mb-6">
          {stepsList.map((s, idx) => {
            const status = getStepStatus(s.key, idx);
            return (
              <div key={s.key} className="flex gap-3 items-start">
                <div className="flex-none mt-0.5">
                  {status === 'completed' ? (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white">
                      <HiCheck className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                  ) : status === 'active' ? (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-400">
                      <HiArrowPath className="h-3.5 w-3.5 animate-spin" />
                    </div>
                  ) : (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-slate-200 dark:border-slate-800">
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className={`text-xs font-bold ${
                    status === 'active' 
                      ? 'text-slate-800 dark:text-slate-100' 
                      : status === 'completed' 
                      ? 'text-slate-600 dark:text-slate-400' 
                      : 'text-slate-400 dark:text-slate-600'
                  }`}>
                    {s.label}
                  </h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1 leading-snug">
                    {s.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Informative Status Message */}
        <div className="rounded-xl bg-slate-50 p-3 text-center border border-slate-100 dark:bg-slate-800/40 dark:border-slate-800/50">
          <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300 animate-pulse">
            {message || 'Initializing parser...'}
          </p>
        </div>

      </motion.div>
    </div>
  );
};
