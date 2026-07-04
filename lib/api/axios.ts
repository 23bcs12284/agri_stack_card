import axios from 'axios';

const API_BASE_URL = '';

// Retrieve or generate persistent device identification UUID
let deviceId = '';
if (typeof window !== 'undefined') {
  deviceId = localStorage.getItem('deviceId') || '';
  if (!deviceId) {
    deviceId = typeof crypto.randomUUID === 'function' 
      ? crypto.randomUUID() 
      : 'dev_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('deviceId', deviceId);
  }
}

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token refresh state tracking
let activeRefreshPromise: Promise<string | null> | null = null;

// Decodes JWT payload on the client side to inspect expiration
function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const payload = JSON.parse(jsonPayload);
    const exp = payload.exp;
    if (!exp) return false;

    // Buffer: check if token is expired or expires in next 10 seconds
    const now = Math.floor(Date.now() / 1000);
    return exp < now + 10;
  } catch {
    return true;
  }
}

// Concurrency-locked token refresh runner
async function refreshAuthToken(): Promise<string | null> {
  if (activeRefreshPromise) {
    console.log('[Axios] Awaiting existing active refresh token request...');
    return activeRefreshPromise;
  }

  console.log('[Axios] Initiating singleton token refresh request...');
  activeRefreshPromise = (async () => {
    try {
      // Use raw axios instance to prevent interceptor loop recursion
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

      const newToken = data.accessToken || data.token || data.data?.accessToken;
      if (newToken) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', newToken);
        }
        console.log('[Axios] Token refreshed successfully.');
        return newToken;
      }
      throw new Error('Empty payload returned in token refresh');
    } catch (err: any) {
      console.error('[Axios] Token refresh failed. Clearing credentials and redirecting.', err.response?.data || err.message);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        if (window.location.pathname !== '/login') {
          const kickoutMsg = err.response?.data?.message || 'Session expired';
          window.location.href = `/login?error=${encodeURIComponent(kickoutMsg)}`;
        }
      }
      return null;
    } finally {
      activeRefreshPromise = null;
    }
  })();

  return activeRefreshPromise;
}

// Request interceptor: attach Authorization header and handle proactive refresh
api.interceptors.request.use(
  async (config) => {
    // Skip refresh token checks on the refresh request itself
    if (config.url === '/api/auth/refresh' || config.url?.endsWith('/refresh')) {
      return config;
    }

    if (typeof window !== 'undefined') {
      let token = localStorage.getItem('accessToken');

      // Proactive check: refresh token before sending request if expired
      if (token && isTokenExpired(token)) {
        console.log('[Axios] Access token is expired, calling proactive refresh...');
        const newToken = await refreshAuthToken();
        if (newToken) {
          token = newToken;
        } else {
          // Token refresh failed, reject config to cancel request
          return Promise.reject(new axios.Cancel('Request cancelled due to expired token and failed refresh.'));
        }
      }

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      if (config.headers) {
        config.headers['x-device-id'] = deviceId;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 with token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If request was cancelled by request interceptor
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Skip handling if this is a guest auth API route (login, register, refresh, etc.)
    const url = originalRequest.url || '';
    const isGuestApiRoute =
      url.includes('/api/auth/login') ||
      url.includes('/api/auth/register') ||
      url.includes('/api/auth/forgot-password') ||
      url.includes('/api/auth/reset-password') ||
      url.includes('/api/auth/google') ||
      url.includes('/api/auth/refresh') ||
      url.endsWith('/login') ||
      url.endsWith('/register') ||
      url.endsWith('/forgot-password') ||
      url.endsWith('/reset-password') ||
      url.endsWith('/google') ||
      url.endsWith('/refresh');

    if (isGuestApiRoute) {
      console.log(`[Axios] 401 on guest auth route: ${url}. Skipping token refresh.`);
      return Promise.reject(error);
    }

    const errorMessage = error.response?.data?.message || '';

    // Direct check for single device login kickout
    if (
      error.response?.status === 401 &&
      (errorMessage.includes('another device') || errorMessage.includes('logged in from another device'))
    ) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        if (window.location.pathname !== '/login') {
          window.location.href = `/login?error=${encodeURIComponent('Your account has been logged in from another device.')}`;
        }
      }
      return Promise.reject(error);
    }

    // Reactive refresh: if 401 and we have not retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log('[Axios] Received 401, attempting reactive token refresh...');
      try {
        const newToken = await refreshAuthToken();
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          if (originalRequest.headers) {
            originalRequest.headers['x-device-id'] = deviceId;
          }
          return api(originalRequest);
        }
      } catch (refreshErr) {
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
