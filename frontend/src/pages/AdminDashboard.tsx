import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStatsApi, getUsersApi, deleteUserApi, getAllCardsAdminApi, deleteCardAdminApi } from '../api/admin.api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiArrowLeft,
  HiUsers,
  HiDocumentText,
  HiMap,
  HiClock,
  HiTrash,
  HiChevronLeft,
  HiChevronRight,
  HiSun,
  HiMoon,
  HiShieldCheck,
  HiArrowPath,
} from 'react-icons/hi2';
import { Footer } from '../components/Footer';

interface DashboardStats {
  totalUsers: number;
  totalCards: number;
  totalLandRecords: number;
  recentCards: number;
  paidUsers?: number;
  failedPayments?: number;
  pendingPayments?: number;
  revenue?: number;
  recentPayments?: any[];
  activeSessions?: any[];
}

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  createdAt: string;
}

interface AdminCard {
  id: number;
  farmerName: string;
  farmerId: string;
  enrollmentId: string;
  mobile: string;
  createdAt: string;
  user?: { name: string; email: string };
}

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'cards' | 'payments'>('users');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [cards, setCards] = useState<AdminCard[]>([]);
  const [usersPage, setUsersPage] = useState(1);
  const [cardsPage, setCardsPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [cardsTotalPages, setCardsTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{ type: 'user' | 'card'; id: number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  });

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    else fetchCards();
  }, [activeTab, usersPage, cardsPage]);

  const fetchStats = async () => {
    try {
      const response = await getStatsApi();
      setStats(response.data.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await getUsersApi(usersPage, 10);
      const resData = response.data.data;
      setUsers(resData.data || []);
      setUsersTotalPages(resData.pagination?.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCards = async () => {
    setIsLoading(true);
    try {
      const response = await getAllCardsAdminApi(cardsPage, 10);
      const resData = response.data.data;
      setCards(resData.data || []);
      setCardsTotalPages(resData.pagination?.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch cards:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setIsDeleting(true);
    try {
      if (deleteModal.type === 'user') {
        await deleteUserApi(deleteModal.id);
        fetchUsers();
        fetchStats();
      } else {
        await deleteCardAdminApi(deleteModal.id);
        fetchCards();
        fetchStats();
      }
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setIsDeleting(false);
      setDeleteModal(null);
    }
  };

  const statCards = stats
    ? [
        { label: 'Total Users', value: stats.totalUsers, icon: HiUsers, color: 'blue' },
        { label: 'Paid Users', value: stats.paidUsers ?? 0, icon: HiShieldCheck, color: 'green' },
        { label: 'Revenue', value: `₹${stats.revenue ?? 0}`, icon: HiMap, color: 'amber' },
        { label: 'Failed Payments', value: stats.failedPayments ?? 0, icon: HiTrash, color: 'purple' },
        { label: 'Pending Payments', value: stats.pendingPayments ?? 0, icon: HiClock, color: 'blue' },
        { label: 'Total Cards', value: stats.totalCards, icon: HiDocumentText, color: 'green' },
        { label: 'Land Records', value: stats.totalLandRecords, icon: HiMap, color: 'amber' },
        { label: 'Recent (7d)', value: stats.recentCards, icon: HiClock, color: 'purple' },
      ]
    : [];

  const bgMap: Record<string, string> = {
    blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400',
    amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
    purple: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400',
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <HiArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center shadow-md shadow-green-500/20">
                <HiShieldCheck className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">Admin Panel</h1>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs font-semibold text-slate-500 dark:text-slate-400">
              {user?.name}
            </span>
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/80 cursor-pointer transition-all active:scale-90"
            >
              {theme === 'light' ? <HiMoon className="h-5 w-5" /> : <HiSun className="h-5 w-5 text-amber-400" />}
            </button>
            <button
              onClick={logout}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${bgMap[stat.color]}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6 gap-1">
          {[
            { key: 'users' as const, label: 'Users', icon: HiUsers },
            { key: 'cards' as const, label: 'Farmer Cards', icon: HiDocumentText },
            { key: 'payments' as const, label: 'Payments & Sessions', icon: HiClock },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 pb-3 px-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === tab.key
                  ? 'border-green-600 text-green-700 dark:border-green-400 dark:text-green-400'
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table Content */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <HiArrowPath className="h-6 w-6 text-green-500 animate-spin" />
            </div>
          ) : activeTab === 'users' ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      {['Name', 'Email', 'Role', 'Phone', 'Joined', 'Actions'].map((h) => (
                        <th
                          key={h}
                          className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider px-5 py-3"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-sm text-slate-400">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr
                          key={u.id}
                          className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center text-white text-xs font-bold">
                                {u.name?.charAt(0)?.toUpperCase() || '?'}
                              </div>
                              <span className="text-sm font-semibold text-slate-800 dark:text-white">{u.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-400">{u.email}</td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                u.role === 'ADMIN'
                                  ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400'
                                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-400">
                            {u.phone || '—'}
                          </td>
                          <td className="px-5 py-3.5 text-xs text-slate-400">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-3.5">
                            <button
                              onClick={() => setDeleteModal({ type: 'user', id: u.id, name: u.name })}
                              disabled={u.role === 'ADMIN'}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <HiTrash className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {usersTotalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-400">
                    Page {usersPage} of {usersTotalPages}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setUsersPage((p) => Math.max(1, p - 1))}
                      disabled={usersPage <= 1}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-30"
                    >
                      <HiChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setUsersPage((p) => Math.min(usersTotalPages, p + 1))}
                      disabled={usersPage >= usersTotalPages}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-30"
                    >
                      <HiChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : activeTab === 'cards' ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      {['Farmer Name', 'Farmer ID', 'Mobile', 'Uploaded By', 'Date', 'Actions'].map((h) => (
                        <th
                          key={h}
                          className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider px-5 py-3"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cards.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-sm text-slate-400">
                          No cards found
                        </td>
                      </tr>
                    ) : (
                      cards.map((c) => (
                        <tr
                          key={c.id}
                          className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                        >
                          <td className="px-5 py-3.5 text-sm font-semibold text-slate-800 dark:text-white">
                            {c.farmerName || '—'}
                          </td>
                          <td className="px-5 py-3.5 text-xs font-mono text-slate-600 dark:text-slate-400">
                            {c.farmerId || c.enrollmentId || '—'}
                          </td>
                          <td className="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-400">
                            {c.mobile || '—'}
                          </td>
                          <td className="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-400">
                            {c.user?.name || '—'}
                          </td>
                          <td className="px-5 py-3.5 text-xs text-slate-400">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-3.5">
                            <button
                              onClick={() =>
                                setDeleteModal({ type: 'card', id: c.id, name: c.farmerName || 'this card' })
                              }
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                            >
                              <HiTrash className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {cardsTotalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-400">
                    Page {cardsPage} of {cardsTotalPages}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setCardsPage((p) => Math.max(1, p - 1))}
                      disabled={cardsPage <= 1}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-30"
                    >
                      <HiChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setCardsPage((p) => Math.min(cardsTotalPages, p + 1))}
                      disabled={cardsPage >= cardsTotalPages}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-30"
                    >
                      <HiChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-6 space-y-8">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Recent Payments</h3>
                <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                        {['Order ID', 'Payment ID', 'Amount', 'Status', 'User', 'Date'].map((h) => (
                          <th key={h} className="text-[10px] font-bold text-slate-400 uppercase px-5 py-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {!stats?.recentPayments || stats.recentPayments.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-sm text-slate-400">No payment history</td>
                        </tr>
                      ) : (
                        stats.recentPayments.map((p: any) => (
                          <tr key={p.id} className="border-b border-slate-50 dark:border-slate-800/40 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 text-sm">
                            <td className="px-5 py-3.5 font-mono text-xs text-slate-600 dark:text-slate-400">{p.razorpayOrderId}</td>
                            <td className="px-5 py-3.5 font-mono text-xs text-slate-600 dark:text-slate-400">{p.razorpayPaymentId || '—'}</td>
                            <td className="px-5 py-3.5 font-semibold text-slate-700 dark:text-white">₹{p.amount}</td>
                            <td className="px-5 py-3.5">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                p.status === 'PAID'
                                  ? 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400'
                                  : p.status === 'FAILED'
                                  ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                              }`}>{p.status}</span>
                            </td>
                            <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">{p.user?.email || 'Guest Registration'}</td>
                            <td className="px-5 py-3.5 text-xs text-slate-400">{new Date(p.createdAt).toLocaleString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Active Sessions & Device Fingerprints</h3>
                <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                        {['User', 'Device ID', 'Browser', 'OS', 'IP Address', 'Created At'].map((h) => (
                          <th key={h} className="text-[10px] font-bold text-slate-400 uppercase px-5 py-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {!stats?.activeSessions || stats.activeSessions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-sm text-slate-400">No active sessions</td>
                        </tr>
                      ) : (
                        stats.activeSessions.map((s: any) => (
                          <tr key={s.id} className="border-b border-slate-50 dark:border-slate-800/40 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 text-sm">
                            <td className="px-5 py-3.5 font-semibold text-slate-700 dark:text-white">
                              <div>{s.user?.name}</div>
                              <div className="text-xs font-normal text-slate-400">{s.user?.email}</div>
                            </td>
                            <td className="px-5 py-3.5 font-mono text-xs text-slate-600 dark:text-slate-400">{s.deviceId}</td>
                            <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">{s.browser || '—'}</td>
                            <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">{s.os || '—'}</td>
                            <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400 font-mono text-xs">{s.ipAddress || '—'}</td>
                            <td className="px-5 py-3.5 text-xs text-slate-400">{new Date(s.createdAt).toLocaleString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800"
            >
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Delete {deleteModal.type === 'user' ? 'User' : 'Card'}?
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Are you sure you want to delete <strong>{deleteModal.name}</strong>?
                {deleteModal.type === 'user' && ' All their cards and data will also be removed.'}
                {' '}This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModal(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <Footer />
    </div>
  );
};
