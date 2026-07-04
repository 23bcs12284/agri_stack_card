"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  loginApi,
  registerApi,
  logoutApi,
  getProfileApi,
  refreshTokenApi,
} from '@/lib/api/auth.api';

// ── Types ───────────────────────────────────────────────────────────────────

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  phone?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

// ── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Provider ────────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Validate existing token on mount
  useEffect(() => {
    const initAuth = async () => {
      // Check for Google OAuth redirect token in query parameters
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get('token');
      if (urlToken) {
        localStorage.setItem('accessToken', urlToken);
        // Clean URL to hide token
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      let token = localStorage.getItem('accessToken');
      if (!token) {
        try {
          const refreshRes = await refreshTokenApi();
          const refreshData = refreshRes.data?.data || refreshRes.data;
          token = refreshData.accessToken || refreshData.token;
          if (token) {
            localStorage.setItem('accessToken', token);
          } else {
            setIsLoading(false);
            return;
          }
        } catch {
          setIsLoading(false);
          return;
        }
      }

      try {
        const response = await getProfileApi();
        const profileData = response.data?.data || response.data;
        setUser(profileData);
        if (urlToken) {
          router.push('/'); // Redirect to home if logged in via URL token
        }
      } catch {
        localStorage.removeItem('accessToken');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [router]);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await loginApi(email, password);
      const resData = response.data?.data || response.data;
      const token = resData.tokens?.accessToken || resData.accessToken || resData.token;
      if (token) {
        localStorage.setItem('accessToken', token);
      }
      setUser(resData.user);
      router.push('/');
    },
    [router]
  );

  const register = useCallback(
    async (name: string, email: string, password: string, phone: string) => {
      const response = await registerApi(name, email, password, phone);
      const resData = response.data?.data || response.data;
      const token = resData.tokens?.accessToken || resData.accessToken || resData.token;
      if (token) {
        localStorage.setItem('accessToken', token);
      }
      setUser(resData.user);
      router.push('/');
    },
    [router]
  );

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // Logout even if API call fails
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
      router.push('/login');
    }
  }, [router]);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ── Hook ────────────────────────────────────────────────────────────────────

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
