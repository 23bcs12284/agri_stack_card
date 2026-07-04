import React from 'react';
import { useFarmer } from '../context/FarmerContext';
import { usePdfParser } from '../hooks/usePdfParser';
import { UploadArea } from '../components/UploadArea';
import { Preview } from '../components/Preview';
import { EditableForm } from '../components/EditableForm';
import { DownloadButtons } from '../components/DownloadButtons';
import { Loader } from '../components/Loader';
import { motion, AnimatePresence } from 'framer-motion';
import { HiXMark } from 'react-icons/hi2';

export const Home: React.FC = () => {
  const { farmerData, toasts, removeToast } = useFarmer();
  const { parsePdf } = usePdfParser();

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col items-center justify-start relative">
      
      {/* Step Loader Overlay */}
      <Loader />

      {/* Main Content Area */}
      {!farmerData ? (
        <div className="w-full flex-1 flex flex-col items-center justify-center py-10 sm:py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              AgriStack Farmer ID Card Generator
            </h2>
            <p className="mt-3 text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Automatically extract credentials, personal profiles, land schedules, and passport photographs from registration documents to create print-ready cards.
            </p>
          </motion.div>

          <UploadArea onFileSelect={parsePdf} />
        </div>
      ) : (
        <div className="w-full flex flex-col gap-8 items-stretch justify-start">
          
          {/* Live Preview + Download Controls */}
          <div className="flex flex-col gap-6 items-center">
            <Preview />
            <DownloadButtons />
          </div>

          <hr className="border-slate-200 dark:border-slate-800 no-print" />

          {/* Form Editor Section */}
          <div className="w-full max-w-4xl mx-auto no-print">
            <EditableForm />
          </div>

        </div>
      )}

      {/* Toast Notification Container Stack */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none no-print">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`pointer-events-auto flex items-center justify-between rounded-xl px-4 py-3 shadow-lg border text-xs font-semibold ${
                toast.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/90 dark:border-emerald-900/60 dark:text-emerald-300'
                  : toast.type === 'error'
                  ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/90 dark:border-red-900/60 dark:text-red-300'
                  : 'bg-slate-50 border-slate-200 text-slate-800 dark:bg-slate-850/95 dark:border-slate-800 dark:text-slate-200'
              }`}
            >
              <span>{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-3 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                <HiXMark className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
};
