"use client";

import React from 'react';
import { useFarmer } from '@/context/FarmerContext';
import { HiSun, HiMoon, HiArrowPath } from 'react-icons/hi2';

export const Header: React.FC = () => {
  const { theme, setTheme, farmerData, resetAll } = useFarmer();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md transition-colors duration-300 dark:border-slate-800/80 dark:bg-slate-900/80 no-print">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo and App Title */}
        <div className="flex items-center gap-3">
          <img
            src="/assets/logo.png"
            alt="AgriStack Card Logo"
            className="h-10 w-10 rounded-xl object-contain bg-white p-0.5 shadow-sm border border-slate-200 dark:border-slate-700"
          />
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white sm:text-xl">
              AgriStack
            </h1>
            <p className="hidden text-xs font-medium text-slate-500 dark:text-slate-400 sm:block">
              Farmer ID Card Generator
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Reset button - visible if data is loaded */}
          {farmerData && (
            <button
              onClick={resetAll}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/80 cursor-pointer transition-all active:scale-95"
            >
              <HiArrowPath className="h-3.5 w-3.5" />
              Reset
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            aria-label="Toggle Theme"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/80 cursor-pointer transition-all active:scale-90"
          >
            {theme === 'light' ? (
              <HiMoon className="h-5 w-5 text-slate-600" />
            ) : (
              <HiSun className="h-5 w-5 text-amber-400" />
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
