import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Retrieve or generate persistent device identification UUID
let deviceId = localStorage.getItem('deviceId');
if (!deviceId) {
  deviceId = typeof crypto.randomUUID === 'function' 
    ? crypto.randomUUID() 
    : 'dev_' + Math.random().toString(36).substring(2, 15);
  localStorage.setItem('deviceId', deviceId);
}

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track whether we're already refreshing to prevent infinite loops
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor: attach Bearer token and device ID
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.headers) {
      config.headers['x-device-id'] = deviceId;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 with token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Direct check for single device login kickout
    const errorMessage = error.response?.data?.message || '';
    if (
      error.response?.status === 401 &&
      (errorMessage.includes('another device') || errorMessage.includes('logged in from another device'))
    ) {
      localStorage.removeItem('accessToken');
      if (window.location.pathname !== '/login') {
        window.location.href = `/login?error=${encodeURIComponent('Your account has been logged in from another device.')}`;
      }
      return Promise.reject(error);
    }

    // If 401 and we haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            if (originalRequest.headers) {
              originalRequest.headers['x-device-id'] = deviceId;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${API_BASE_URL}/api/auth/refresh`,
          {},
          {
            withCredentials: true,
            headers: {
              'x-device-id': deviceId,
            },
          }
        );

        const newToken = data.accessToken || data.token;
        if (newToken) {
          localStorage.setItem('accessToken', newToken);
          api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          if (originalRequest.headers) {
            originalRequest.headers['x-device-id'] = deviceId;
          }
          processQueue(null, newToken);
          return api(originalRequest);
        }

        throw new Error('No token in refresh response');
      } catch (refreshError: any) {
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        // Redirect to login - only if we're not already there
        if (window.location.pathname !== '/login') {
          const kickoutMsg = refreshError.response?.data?.message || 'Session expired';
          window.location.href = `/login?error=${encodeURIComponent(kickoutMsg)}`;
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
