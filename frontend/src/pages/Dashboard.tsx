import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFarmer } from '../context/FarmerContext';
import { getCardsApi, searchCardsApi } from '../api/card.api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiDocumentText,
  HiArrowUpTray,
  HiMagnifyingGlass,
  HiCreditCard,
  HiCalendarDays,
  HiUser,
  HiArrowRightOnRectangle,
  HiSun,
  HiMoon,
  HiUserCircle,
  HiFolder,
  HiXMark,
} from 'react-icons/hi2';

import logo from '../assets/logo.png';
import { Footer } from '../components/Footer';

// ── Types ───────────────────────────────────────────────────────────────────

interface CardEntry {
  id: string;
  farmerName: string;
  farmerId: string;
  createdAt: string;
  photo?: string;
  updatedAt?: string;
  landRecords?: any[];
}

// ── Stat Card ───────────────────────────────────────────────────────────────

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
  delay: number;
}> = ({ icon, label, value, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="flex items-center gap-4 rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
  >
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color}`}
    >
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">
        {value}
      </p>
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  </motion.div>
);

// ── Card Entry Component ────────────────────────────────────────────────────

const CardItem: React.FC<{ card: CardEntry; index: number }> = ({
  card,
  index,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 + index * 0.05, duration: 0.35 }}
  >
    <Link
      to={`/cards/${card.id}`}
      className="group flex items-center gap-4 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-900/50"
    >
      {/* Thumbnail / Avatar */}
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
        {card.photo ? (
          <img
            src={card.photo}
            alt={card.farmerName}
            className="h-full w-full object-cover"
          />
        ) : (
          <HiUser className="h-7 w-7 text-emerald-400 dark:text-emerald-500" />
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-slate-900 group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-400">
          {card.farmerName || 'Unnamed Farmer'}
        </h3>
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
          ID: {card.farmerId || '—'}
        </p>
      </div>

      {/* Date */}
      <div className="hidden shrink-0 text-right sm:block">
        <p className="text-xs text-slate-400 dark:text-slate-500">
          {new Date(card.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </p>
      </div>
    </Link>
  </motion.div>
);

// ── Dashboard Page ──────────────────────────────────────────────────────────

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useFarmer();
  const navigate = useNavigate();

  const [cards, setCards] = useState<CardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CardEntry[] | null>(null);

  // Fetch cards on mount
  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await getCardsApi(1, 50);
        const resData = response.data.data;
        setCards(resData.data || []);
      } catch {
        // API might not be available yet — show empty state
        setCards([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCards();
  }, []);

  // Search with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const response = await searchCardsApi(searchQuery);
        setSearchResults(response.data.data || []);
      } catch {
        setSearchResults([]);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Compute stats
  const displayedCards = searchResults ?? cards;
  const totalCards = cards.length;
  const recentCards = useMemo(() => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return cards.filter(
      (c) => new Date(c.createdAt).getTime() > sevenDaysAgo
    ).length;
  }, [cards]);
  const totalLandRecords = useMemo(() => {
    return cards.reduce((sum, c) => sum + (c.landRecords?.length || 0), 0);
  }, [cards]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
      {/* ── Header Bar ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md transition-colors dark:border-slate-800/80 dark:bg-slate-900/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logo}
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
          </Link>

          {/* Right controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Welcome */}
            <span className="hidden text-sm font-medium text-slate-600 dark:text-slate-300 md:block">
              Welcome,{' '}
              <span className="font-semibold text-slate-900 dark:text-white">
                {user?.name?.split(' ')[0] || 'User'}
              </span>
            </span>

            {/* Profile */}
            <Link
              to="/profile"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/80"
              title="Profile"
            >
              <HiUserCircle className="h-5 w-5" />
            </Link>

            {/* Admin link */}
            {user?.role === 'ADMIN' && (
              <Link
                to="/admin"
                className="hidden items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-all hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400 dark:hover:bg-emerald-900/50 sm:flex"
              >
                Admin
              </Link>
            )}

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              aria-label="Toggle theme"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-xs transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/80 cursor-pointer"
            >
              {theme === 'light' ? (
                <HiMoon className="h-5 w-5 text-slate-600" />
              ) : (
                <HiSun className="h-5 w-5 text-amber-400" />
              )}
            </button>

            {/* Logout */}
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-all hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-red-950 dark:hover:border-red-900 dark:hover:text-red-400 cursor-pointer"
            >
              <HiArrowRightOnRectangle className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content ────────────────────────────────────────────── */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Row */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            icon={
              <HiCreditCard className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            }
            label="Total Cards"
            value={totalCards}
            color="bg-emerald-100 dark:bg-emerald-900/30"
            delay={0.1}
          />
          <StatCard
            icon={
              <HiCalendarDays className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            }
            label="Recent (7 days)"
            value={recentCards}
            color="bg-blue-100 dark:bg-blue-900/30"
            delay={0.2}
          />
          <StatCard
            icon={
              <HiDocumentText className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            }
            label="Land Records"
            value={totalLandRecords}
            color="bg-amber-100 dark:bg-amber-900/30"
            delay={0.3}
          />
        </div>

        {/* CTA + Search Row */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <button
              onClick={() => navigate('/generator')}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:from-green-500 hover:to-emerald-500 hover:shadow-emerald-500/30 active:scale-[0.97] cursor-pointer"
            >
              <HiArrowUpTray className="h-5 w-5" />
              Upload New PDF
            </button>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
            className="relative max-w-md flex-1"
          >
            <HiMagnifyingGlass className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by farmer name or ID..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-10 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
              >
                <HiXMark className="h-4 w-4" />
              </button>
            )}
          </motion.div>
        </div>

        {/* Section Title */}
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {searchResults !== null ? 'Search Results' : 'Recent Cards'}
          </h2>
          {searchResults !== null && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "
              {searchQuery}"
            </p>
          )}
        </div>

        {/* Cards List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-slate-200 dark:bg-slate-800" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="h-3 w-28 rounded bg-slate-100 dark:bg-slate-800/60" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : displayedCards.length > 0 ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={searchQuery}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {displayedCards.map((card, index) => (
                <CardItem key={card.id} card={card} index={index} />
              ))}
            </motion.div>
          </AnimatePresence>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 py-16 dark:border-slate-800"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
              <HiFolder className="h-8 w-8 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="mb-1 text-base font-semibold text-slate-700 dark:text-slate-300">
              {searchResults !== null ? 'No results found' : 'No cards yet'}
            </h3>
            <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">
              {searchResults !== null
                ? 'Try a different search term.'
                : 'Upload a farmer registration PDF to get started.'}
            </p>
            {searchResults === null && (
              <button
                onClick={() => navigate('/generator')}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:from-green-500 hover:to-emerald-500 active:scale-[0.97] cursor-pointer"
              >
                <HiArrowUpTray className="h-5 w-5" />
                Upload PDF
              </button>
            )}
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
