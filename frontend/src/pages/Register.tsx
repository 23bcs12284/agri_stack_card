import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerApi, createPaymentOrderApi, getRazorpayKeyApi } from '../api/auth.api';
import logo from '../assets/logo.png';
import { motion } from 'framer-motion';
import {
  HiUser,
  HiEnvelope,
  HiPhone,
  HiLockClosed,
  HiEye,
  HiEyeSlash,
  HiExclamationTriangle,
  HiShieldCheck,
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
      opacity: [0, 0.2, 0.12],
      y: [20, -15, 20],
      rotate: [rotate, rotate + 25, rotate],
    }}
    transition={{ duration: 9, delay, repeat: Infinity, ease: 'easeInOut' }}
    className="absolute pointer-events-none select-none"
    style={{ left: x, top: y }}
  >
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
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

// ── Validation Helpers ──────────────────────────────────────────────────────

const validateEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validatePhone = (phone: string) => /^\d{10}$/.test(phone);

// ── Input Field Helper Component ────────────────────────────────────────────

interface InputFieldProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  type?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  autoComplete?: string;
  rightElement?: React.ReactNode;
  delay: number;
  readOnly?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  icon,
  type = 'text',
  value,
  onChange,
  placeholder,
  autoComplete,
  rightElement,
  delay,
  readOnly = false,
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.4 }}
  >
    <label
      htmlFor={id}
      className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
    >
      {label}
    </label>
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
        {icon}
      </span>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        readOnly={readOnly}
        className="w-full rounded-xl border border-slate-200 bg-white/60 py-3 pl-11 pr-12 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20 read-only:bg-slate-100 dark:read-only:bg-slate-800/40 read-only:opacity-85"
      />
      {rightElement && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2">
          {rightElement}
        </span>
      )}
    </div>
  </motion.div>
);

// ── Register Page ───────────────────────────────────────────────────────────

const Register: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [googleId, setGoogleId] = useState('');
  const [isGoogleSignup, setIsGoogleSignup] = useState(false);

  // Check for Google login parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gEmail = params.get('email');
    const gName = params.get('name');
    const gGoogleId = params.get('googleId');

    if (gEmail && gName && gGoogleId) {
      setEmail(gEmail);
      setName(gName);
      setGoogleId(gGoogleId);
      setIsGoogleSignup(true);
    }
  }, []);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!name.trim()) return setError('Name is required');
    if (!validateEmail(email)) return setError('Please enter a valid email');
    if (!validatePhone(phone))
      return setError('Phone must be exactly 10 digits');
    
    if (!isGoogleSignup) {
      if (password.length < 6)
        return setError('Password must be at least 6 characters');
      if (password !== confirmPassword)
        return setError('Passwords do not match');
    }
    
    if (!acceptTerms)
      return setError('You must accept the terms and conditions');

    setIsSubmitting(true);
    try {
      // 1. Load Razorpay Script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        setError('Failed to load Razorpay payment gateway. Please check your network connection.');
        setIsSubmitting(false);
        return;
      }

      // 1.5 Fetch Razorpay Key dynamically from Backend
      const keyRes = await getRazorpayKeyApi();
      const razorpayKeyId = keyRes.data.data.keyId;

      // 2. Create Razorpay Order
      const orderRes = await createPaymentOrderApi(email);
      if (orderRes.data.data.exists) {
        setError('Account with this email has already been paid and registered. Please sign in.');
        setIsSubmitting(false);
        return;
      }

      const orderData = orderRes.data.data;

      // 3. Configure Razorpay options
      const options = {
        key: razorpayKeyId || 'rzp_test_H29Y6k8VjE1a6C', // Default test key
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Agri Stack Card',
        description: 'One-Time Registration Fee (₹300)',
        order_id: orderData.orderId,
        handler: async (response: any) => {
          try {
            setIsSubmitting(true);
            const regRes = await registerApi(
              name,
              email,
              isGoogleSignup ? undefined : password,
              phone,
              isGoogleSignup ? googleId : undefined,
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );

            localStorage.setItem('accessToken', regRes.data.data.accessToken);
            window.location.href = '/';
          } catch (regErr: any) {
            setError(regErr?.response?.data?.message || 'Payment signature verification failed.');
            setIsSubmitting(false);
          }
        },
        prefill: {
          name,
          email,
          contact: phone,
        },
        theme: {
          color: '#10B981',
        },
        modal: {
          ondismiss: () => {
            setError('Registration fee payment was cancelled. Please complete payment to register.');
            setIsSubmitting(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Registration failed. Please try again.';
      setError(msg);
      setIsSubmitting(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    if (!password) return { width: '0%', color: '', label: '' };
    if (password.length < 4)
      return { width: '25%', color: 'bg-red-500', label: 'Weak' };
    if (password.length < 6)
      return { width: '50%', color: 'bg-yellow-500', label: 'Fair' };
    if (password.length < 10)
      return { width: '75%', color: 'bg-emerald-500', label: 'Good' };
    return { width: '100%', color: 'bg-emerald-600', label: 'Strong' };
  };

  const strength = getPasswordStrength();

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-12">
      {/* ── Background ──────────────────────────────────────────────── */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-slate-950 dark:via-emerald-950/40 dark:to-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.15),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.08),transparent)]" />
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(16,185,129,1) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Floating Leaves */}
      <FloatingLeaf delay={0} x="8%" y="12%" size={38} rotate={-20} />
      <FloatingLeaf delay={2} x="88%" y="8%" size={30} rotate={25} />
      <FloatingLeaf delay={1} x="80%" y="75%" size={44} rotate={-25} />
      <FloatingLeaf delay={3} x="12%" y="80%" size={34} rotate={15} />
      <FloatingLeaf delay={4.5} x="55%" y="3%" size={26} rotate={40} />

      {/* ── Glass Card ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-emerald-400/20 via-green-400/10 to-teal-400/20 blur-xl dark:from-emerald-500/10 dark:via-green-500/5 dark:to-teal-500/10" />

        <div className="relative rounded-2xl border border-white/40 bg-white/70 p-8 shadow-2xl shadow-emerald-900/5 backdrop-blur-xl dark:border-white/[0.06] dark:bg-slate-900/70 dark:shadow-black/20">
          {/* ── Logo & Title ────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="mb-7 flex flex-col items-center"
          >
            <img
              src={logo}
              alt="AgriStack Card Logo"
              className="mb-4 h-16 w-16 rounded-2xl object-contain bg-white p-1 shadow-md border border-slate-100 dark:border-slate-800"
            />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Create Account
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Join AgriStack and start generating cards
            </p>
          </motion.div>

          {/* ── Error ───────────────────────────────────────────────── */}
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

          {/* ── Form ────────────────────────────────────────────────── */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              id="name"
              label="Full Name"
              icon={<HiUser className="h-5 w-5" />}
              value={name}
              onChange={setName}
              placeholder="John Doe"
              autoComplete="name"
              readOnly={isGoogleSignup}
              delay={0.2}
            />

            <InputField
              id="email"
              label="Email Address"
              icon={<HiEnvelope className="h-5 w-5" />}
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              autoComplete="email"
              readOnly={isGoogleSignup}
              delay={0.25}
            />

            <InputField
              id="phone"
              label="Phone Number"
              icon={<HiPhone className="h-5 w-5" />}
              value={phone}
              onChange={(val) => setPhone(val.replace(/\D/g, '').slice(0, 10))}
              placeholder="9876543210"
              autoComplete="tel"
              delay={0.3}
            />

            {!isGoogleSignup && (
              <>
                <InputField
                  id="password"
                  label="Password"
                  icon={<HiLockClosed className="h-5 w-5" />}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={setPassword}
                  placeholder="Min 6 characters"
                  autoComplete="new-password"
                  delay={0.35}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                    >
                      {showPassword ? (
                        <HiEyeSlash className="h-5 w-5" />
                      ) : (
                        <HiEye className="h-5 w-5" />
                      )}
                    </button>
                  }
                />

                {/* Password strength */}
                {password && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2"
                  >
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: strength.width }}
                        className={`h-full rounded-full ${strength.color}`}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {strength.label}
                    </span>
                  </motion.div>
                )}

                <InputField
                  id="confirmPassword"
                  label="Confirm Password"
                  icon={<HiShieldCheck className="h-5 w-5" />}
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  delay={0.4}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                    >
                      {showConfirm ? (
                        <HiEyeSlash className="h-5 w-5" />
                      ) : (
                        <HiEye className="h-5 w-5" />
                      )}
                    </button>
                  }
                />
              </>
            )}

            {/* Terms */}
            <motion.label
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.4 }}
              className="flex items-start gap-2.5 cursor-pointer select-none pt-1"
            >
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 accent-emerald-600 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-800"
              />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                I agree to the{' '}
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  Terms of Service
                </span>{' '}
                and{' '}
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  Privacy Policy
                </span>
              </span>
            </motion.label>

            {/* Submit */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative mt-2 w-full overflow-hidden rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:from-green-500 hover:to-emerald-500 hover:shadow-emerald-500/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 dark:shadow-emerald-900/30 dark:focus:ring-offset-slate-900 cursor-pointer"
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
                    Creating account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </motion.div>
          </form>

          {/* ── Login Link ────────────────────────────────────────────── */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400"
          >
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
            >
              Sign in
            </Link>
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.85, duration: 0.4 }}
            className="mt-6 border-t border-slate-200/50 pt-4 text-center dark:border-slate-700/50"
          >
            <Link
              to="/privacy-policy"
              className="text-xs font-semibold text-slate-450 hover:text-emerald-600 dark:text-slate-500 dark:hover:text-emerald-400 transition-colors"
            >
              Privacy Policy
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
