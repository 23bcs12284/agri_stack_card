import React from 'react';
import { useFarmer } from '../context/FarmerContext';
import { HiPrinter } from 'react-icons/hi2';

export const DownloadButtons: React.FC = () => {
  const { farmerData, addToast } = useFarmer();

  if (!farmerData) return null;

  const handlePrint = () => {
    window.print();
    addToast('Opening print dialog...', 'info');
  };

  return (
    <div className="w-full flex flex-col sm:flex-row gap-3 items-center justify-center p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 no-print">
      <button
        onClick={handlePrint}
        className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-650 rounded-xl text-sm font-bold text-white cursor-pointer shadow-md transition-all active:scale-97"
      >
        <HiPrinter className="h-4.5 w-4.5" />
        Print Card
      </button>
    </div>
  );
};
