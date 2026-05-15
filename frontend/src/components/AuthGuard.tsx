"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const setAuth = useAuthStore((state) => state.setAuth);
  const logout = useAuthStore((state) => state.logout);
  const [mounted, setMounted] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    setMounted(true);
    if (!token) {
      setIsVerifying(false);
      return;
    }

    if (useAuthStore.getState().user) {
      setIsVerifying(false);
    }

    const verifyToken = async () => {
      try {
        const res = await api.get('/auth/me');
        setAuth(res.data.data, token);
      } catch (error) {
        logout();
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token, setAuth, logout]);

  useEffect(() => {
    if (mounted && !isVerifying && !token) {
      router.push('/login');
    }
  }, [token, router, mounted, isVerifying]);

  if (!mounted || isVerifying) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-sm font-medium text-gray-500">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!token) return null;

  return <>{children}</>;
}
