"use client";

import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200 bg-white py-6 dark:border-slate-800/80 dark:bg-slate-900/50 transition-colors no-print">
      <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-450 dark:text-slate-500 sm:px-6 lg:px-8">
        <p>© 2026 Agri Stack Card. All Rights Reserved.</p>
        <Link
          href="/privacy-policy"
          className="hover:text-green-600 dark:hover:text-green-400 transition-colors"
        >
          Privacy Policy
        </Link>
      </div>
    </footer>
  );
};
