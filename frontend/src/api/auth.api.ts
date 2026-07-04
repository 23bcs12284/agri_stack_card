import api from './axios';

// ── Auth Endpoints ──────────────────────────────────────────────────────────

export const loginApi = (email: string, password: string) =>
  api.post('/api/auth/login', { email, password });

export const registerApi = (
  name: string,
  email: string,
  password?: string,
  phone?: string,
  googleId?: string,
  razorpayOrderId?: string,
  razorpayPaymentId?: string,
  razorpaySignature?: string
) =>
  api.post('/api/auth/register', {
    name,
    email,
    password,
    phone,
    googleId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  });

export const createPaymentOrderApi = (email: string) =>
  api.post('/api/auth/payment-order', { email });

export const getRazorpayKeyApi = () =>
  api.get('/api/auth/razorpay-key');

export const logoutApi = () => api.post('/api/auth/logout');

export const refreshTokenApi = () => api.post('/api/auth/refresh');

export const forgotPasswordApi = (email: string) =>
  api.post('/api/auth/forgot-password', { email });

export const resetPasswordApi = (token: string, password: string) =>
  api.post('/api/auth/reset-password', { token, password });

// ── User Profile Endpoints ──────────────────────────────────────────────────

export const getProfileApi = () => api.get('/api/users/profile');

export const updateProfileApi = (data: {
  name?: string;
  phone?: string;
  avatar?: string;
}) => api.put('/api/users/profile', data);

export const changePasswordApi = (oldPassword: string, newPassword: string) =>
  api.put('/api/users/change-password', { oldPassword, newPassword });
