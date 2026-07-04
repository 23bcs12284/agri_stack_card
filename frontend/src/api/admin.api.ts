import api from './axios';

// ── Admin Endpoints ─────────────────────────────────────────────────────────

export const getStatsApi = () => api.get('/api/admin/stats');

export const getUsersApi = (page?: number, limit?: number) =>
  api.get('/api/admin/users', { params: { page, limit } });

export const deleteUserApi = (id: number | string) =>
  api.delete(`/api/admin/users/${id}`);

export const getAllCardsAdminApi = (page?: number, limit?: number) =>
  api.get('/api/admin/cards', { params: { page, limit } });

export const deleteCardAdminApi = (id: number | string) =>
  api.delete(`/api/admin/cards/${id}`);
