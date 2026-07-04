"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { forgotPasswordApi } from '@/lib/api/auth.api';
import { motion } from 'framer-motion';
import {
  HiEnvelope,
  HiArrowLeft,
  HiCheckCircle,
  HiExclamationTriangle,
} from 'react-icons/hi2';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsSubmitting(true);
    try {
      await forgotPasswordApi(email);
      setIsSent(true);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || 'Failed to send reset email. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-12">
      {/* ── Background ──────────────────────────────────────────────── */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-slate-950 dark:via-emerald-950/40 dark:to-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.15),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.08),transparent)]" />
      </div>

      {/* ── Glass Card ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-emerald-400/20 via-green-400/10 to-teal-400/20 blur-xl dark:from-emerald-500/10 dark:via-green-500/5 dark:to-teal-500/10" />

        <div className="relative rounded-2xl border border-white/40 bg-white/70 p-8 shadow-2xl shadow-emerald-900/5 backdrop-blur-xl dark:border-white/[0.06] dark:bg-slate-900/70 dark:shadow-black/20">
          {/* Back link */}
          <Link
            href="/login"
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <HiArrowLeft className="h-4 w-4" />
            Back to login
          </Link>

          {!isSent ? (
            <>
              {/* ── Title ────────────────────────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mb-6"
              >
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Forgot Password
                </h1>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Enter your email and we'll send you a link to reset your password.
                </p>
              </motion.div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-5 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-400"
                >
                  <HiExclamationTriangle className="h-5 w-5 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <HiEnvelope className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="w-full rounded-xl border border-slate-200 bg-white/60 py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-405 transition-all focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20"
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:from-green-500 hover:to-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 dark:shadow-emerald-900/30 dark:focus:ring-offset-slate-900 cursor-pointer"
                  >
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                        />
                        Sending...
                      </span>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>
                </motion.div>
              </form>
            </>
          ) : (
            /* ── Success State ──────────────────────────────────────── */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-4 text-center"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <HiCheckCircle className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
                Check Your Email
              </h2>
              <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
                We've sent a password reset link to{' '}
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {email}
                </span>
                . Please check your inbox and follow the instructions.
              </p>
              <button
                onClick={() => {
                  setIsSent(false);
                  setEmail('');
                }}
                className="text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 cursor-pointer"
              >
                Didn't receive it? Try again
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
