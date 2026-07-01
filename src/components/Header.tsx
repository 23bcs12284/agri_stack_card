import React from 'react';
import { useFarmer } from '../context/FarmerContext';
import { HiSun, HiMoon, HiArrowPath } from 'react-icons/hi2';

export const Header: React.FC = () => {
  const { theme, setTheme, farmerData, resetAll } = useFarmer();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md transition-colors duration-300 dark:border-slate-800/80 dark:bg-slate-900/80 no-print">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo and App Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-green-500 to-emerald-700 shadow-md shadow-green-500/20">
            {/* AgriStack Leaf SVG Logo */}
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 21s3-3 7-3 7 3 7 3M12 3c-4.418 0-8 3.582-8 8 0 2.22 1.008 4.205 2.618 5.539L12 21l5.382-4.461C18.992 15.205 20 13.22 20 11c0-4.418-3.582-8-8-8z"
                className="hidden"
              />
              {/* Custom leaf path */}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 2C6.48 2 2 6.48 2 12c0 4.42 3.58 8 8 8V12H7l5-7 5 7h-3v8c4.42 0 8-3.58 8-8 0-5.52-4.48-10-10-10z"
                className="hidden"
              />
              {/* Better leaf SVG */}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
                className="hidden"
              />
              {/* Leaf Icon path */}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3c-1.5 3-4.5 5.5-7 5.5.5 4 2.5 8 7 11.5 4.5-3.5 6.5-7.5 7-11.5-2.5 0-5.5-2.5-7-5.5z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8.5V20M12 11c1.5 1 2.5.5 3.5 0M12 14.5c-1.5 1-2.5.5-3.5 0"
              />
            </svg>
          </div>
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
