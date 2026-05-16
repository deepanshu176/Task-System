"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

type ApiErrorResponse = {
  message?: string;
};

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const setAuth = useAuthStore((state) => state.setAuth);
  const logout = useAuthStore((state) => state.logout);
  const [mounted, setMounted] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    setMounted(true);
    
    // If no token, we can't be authenticated
    if (!token) {
      setIsVerifying(false);
      return;
    }

    // If we already have a user, we can show the UI immediately while verifying in background
    if (user) {
      setIsVerifying(false);
    }

    const verifyToken = async () => {
      try {
        const res = await api.get('/auth/me');
        // Only update if the data is different to avoid unnecessary re-renders
        // though Zustand handles this, it's good to be explicit or just call it once
        setAuth(res.data.data, token);
      } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        if (axiosError.response?.status === 401) {
          logout();
          router.push('/login');
        }
      } finally {
        setIsVerifying(false);
      }
    };

    // Verify token on mount or when token changes
    verifyToken();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]); 

  if (!mounted) return null;

  if (isVerifying && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-xl border-4 border-blue-600 border-t-transparent shadow-lg shadow-blue-600/20"></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">Initializing Workspace...</p>
        </div>
      </div>
    );
  }

  if (!token) return null;

  return <>{children}</>;
}
