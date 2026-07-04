"use client";

import React, { useState, useRef } from 'react';
import { useFarmer } from '@/context/FarmerContext';
import { motion } from 'framer-motion';
import { HiDocumentArrowUp } from 'react-icons/hi2';

interface UploadAreaProps {
  onFileSelect: (file: File) => void;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ onFileSelect }) => {
  const { addToast } = useFarmer();
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const validateAndProcessFile = (file: File | null) => {
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      addToast('Invalid file format. Please upload a PDF document.', 'error');
      return;
    }

    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl px-4 sm:px-0">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className={`relative flex min-h-[320px] cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-10 text-center transition-all ${
          isDragActive
            ? 'border-green-500 bg-green-50/50 dark:border-green-400 dark:bg-green-950/20 scale-[1.01] shadow-lg shadow-green-500/10'
            : 'border-slate-300 bg-white hover:border-green-400 hover:bg-slate-50/50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-green-500/80 dark:hover:bg-slate-800/40 shadow-xs'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,application/pdf"
          onChange={handleChange}
        />

        {/* Decorative background blur elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden rounded-3xl">
          <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-green-500/5 blur-3xl" />
          <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-emerald-500/5 blur-3xl" />
        </div>

        <motion.div
          animate={isDragActive ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-green-50 to-green-100 text-green-600 dark:from-green-950/30 dark:to-green-900/40 dark:text-green-400 mb-6 shadow-inner"
        >
          <HiDocumentArrowUp className="h-8 w-8" />
        </motion.div>

        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">
          Upload Farmer PDF
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm">
          Drag & drop your government issued AgriStack or registration PDF document here, or click to browse.
        </p>

        <div className="inline-flex items-center rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          Only PDF format is supported
        </div>
      </motion.div>
    </div>
  );
};
