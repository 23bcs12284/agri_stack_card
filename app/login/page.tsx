"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useFarmer } from '@/context/FarmerContext';
import { motion } from 'framer-motion';
import {
  HiEnvelope,
  HiLockClosed,
  HiEye,
  HiEyeSlash,
  HiExclamationTriangle,
} from 'react-icons/hi2';

// ── Floating Leaf Decoration ────────────────────────────────────────────────

const FloatingLeaf: React.FC<{
  delay: number;
  x: string;
  y: string;
  size: number;
  rotate: number;
}> = ({ delay, x, y, size, rotate }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, rotate: 0 }}
    animate={{
      opacity: [0, 0.25, 0.15],
      y: [20, -15, 20],
      rotate: [rotate, rotate + 20, rotate],
    }}
    transition={{
      duration: 8,
      delay,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
    className="absolute pointer-events-none select-none z-0"
    style={{ left: x, top: y }}
  >
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 3c-1.5 3-4.5 5.5-7 5.5.5 4 2.5 8 7 11.5 4.5-3.5 6.5-7.5 7-11.5-2.5 0-5.5-2.5-7-5.5z"
        fill="currentColor"
        className="text-emerald-400/40 dark:text-emerald-500/20"
      />
      <path
        d="M12 8.5V20M12 11c1.5 1 2.5.5 3.5 0M12 14.5c-1.5 1-2.5.5-3.5 0"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        className="text-emerald-500/30 dark:text-emerald-400/15"
      />
    </svg>
  </motion.div>
);

// ── Login Page ──────────────────────────────────────────────────────────────

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const { addToast } = useFarmer();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Check for Google login errors in query parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlError = params.get('error');
    if (urlError) {
      setError(urlError);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      addToast('Logged in successfully!', 'success');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    const devId = localStorage.getItem('deviceId') || '';
    window.location.href = `/api/auth/google?deviceId=${encodeURIComponent(devId)}`;
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-x-hidden px-4 py-8 md:py-16 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* ── Background Gradient ─────────────────────────────────────────── */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-slate-950 dark:via-emerald-950/40 dark:to-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.15),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.08),transparent)]" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(16,185,129,1) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* ── Floating Leaves ─────────────────────────────────────────────── */}
      <FloatingLeaf delay={0} x="10%" y="15%" size={40} rotate={-15} />
      <FloatingLeaf delay={1.5} x="85%" y="10%" size={32} rotate={20} />
      <FloatingLeaf delay={3} x="75%" y="70%" size={48} rotate={-30} />
      <FloatingLeaf delay={2} x="15%" y="75%" size={36} rotate={10} />
      <FloatingLeaf delay={4} x="50%" y="5%" size={28} rotate={45} />
      <FloatingLeaf delay={2.5} x="90%" y="50%" size={44} rotate={-10} />

      {/* ── Two-Column Glass Card Container ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative w-full max-w-4xl z-10"
      >
        {/* Glow effect behind card */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-emerald-400/20 via-green-400/10 to-teal-400/20 blur-xl dark:from-emerald-500/10 dark:via-green-500/5 dark:to-teal-500/10" />

        <div className="relative grid grid-cols-1 md:grid-cols-12 overflow-hidden rounded-2xl border border-white/40 bg-white/70 shadow-2xl backdrop-blur-xl dark:border-white/[0.06] dark:bg-slate-900/70 dark:shadow-black/25">
          
          {/* ── Column 1: Branding Panel (Left) ────────────────────────── */}
          <div className="md:col-span-5 bg-gradient-to-br from-green-700/90 to-emerald-800/90 p-8 flex flex-col justify-between text-white relative overflow-hidden min-h-[220px] md:min-h-[480px]">
            {/* Organic background Leaf Watermark */}
            <div className="absolute -right-10 -bottom-10 w-48 h-48 opacity-10 pointer-events-none select-none">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <path fill="currentColor" d="M50 15 C35 30, 30 50, 50 85 C70 50, 65 30, 50 15 Z" />
              </svg>
            </div>

            <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left my-auto gap-4">
              <div className="relative h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-white p-1.5 shadow-md border border-white/10 shrink-0">
                <Image
                  src="/assets/logo.png"
                  alt="AgriStack Card Logo"
                  fill
                  className="object-contain p-1.5"
                  priority
                />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                  AgriStack
                </h2>
                <p className="mt-2 text-xs md:text-sm text-emerald-100/90 max-w-xs font-medium leading-relaxed">
                  Generate professional, Aadhaar-style PVC identity cards for agricultural stack credentials seamlessly.
                </p>
              </div>
            </div>

            <div className="relative z-10 hidden md:block border-t border-white/20 pt-4">
              <p className="text-[11px] font-semibold text-emerald-200/90 tracking-wide uppercase">
                Secure, Bilingual, & Print-Ready
              </p>
            </div>
          </div>

          {/* ── Column 2: Login Form Panel (Right) ──────────────────────── */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-center">
            
            {/* Header for mobile view or form focus */}
            <div className="mb-6 text-center md:text-left">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Welcome Back
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Sign in to your AgriStack Farmer ID account
              </p>
            </div>

            {/* Error Alert */}
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

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300"
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
                    className="w-full rounded-xl border border-slate-200 bg-white/60 py-2.5 sm:py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300"
                >
                  Password
                </label>
                <div className="relative">
                  <HiLockClosed className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-slate-200 bg-white/60 py-2.5 sm:py-3 pl-11 pr-12 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition-colors hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                  >
                    {showPassword ? (
                      <HiEyeSlash className="h-5 w-5" />
                    ) : (
                      <HiEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me + Forgot Password */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 accent-emerald-600 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-800"
                  />
                  <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
                    Remember me
                  </span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs sm:text-sm font-semibold text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-2.5 sm:py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:from-green-500 hover:to-emerald-500 hover:shadow-emerald-500/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 dark:shadow-emerald-900/30 dark:focus:ring-offset-slate-900 cursor-pointer"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                        className="inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                      />
                      Signing in...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700/80" />
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                OR
              </span>
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700/80" />
            </div>

            {/* Google OAuth Button */}
            <button
              onClick={handleGoogleLogin}
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white/60 px-4 py-2.5 sm:py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-white hover:shadow-md dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>

            {/* Register Link */}
            <p className="mt-5 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="font-bold text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
              >
                Create account
              </Link>
            </p>

            {/* Privacy Policy */}
            <div className="mt-5 border-t border-slate-200/50 pt-4 text-center dark:border-slate-700/50">
              <Link
                href="/privacy-policy"
                className="text-[11px] font-semibold text-slate-400 hover:text-emerald-600 dark:text-slate-500 dark:hover:text-emerald-400 transition-colors"
              >
                Privacy Policy
              </Link>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
