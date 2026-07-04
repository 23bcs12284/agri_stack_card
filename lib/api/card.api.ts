import api from './axios';
import type { FarmerData } from '@/context/FarmerContext';

// ── Card Endpoints ──────────────────────────────────────────────────────────

export const createCardApi = (data: {
  farmerData: FarmerData;
  pdfFile?: File;
}) => {
  const formData = new FormData();
  formData.append('farmerData', JSON.stringify(data.farmerData));
  if (data.pdfFile) {
    formData.append('pdfFile', data.pdfFile);
  }
  return api.post('/api/cards', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getCardsApi = (page?: number, limit?: number) =>
  api.get('/api/cards', { params: { page, limit } });

export const getCardByIdApi = (id: number | string) => api.get(`/api/cards/${id}`);

export const updateCardApi = (id: number | string, data: any) =>
  api.put(`/api/cards/${id}`, data);

export const deleteCardApi = (id: number | string) => api.delete(`/api/cards/${id}`);

export const searchCardsApi = (query: string) =>
  api.get('/api/cards/search', { params: { q: query } });
