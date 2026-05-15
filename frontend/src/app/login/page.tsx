"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      setAuth(res.data.data.user, res.data.data.token);
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 font-sans text-gray-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/30">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Sign in to TaskFlow</h1>
          <p className="text-gray-500 mt-2">Enter your credentials to access the workspace</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Email address</label>
              <Input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="h-12 bg-gray-50/50 border-gray-200 focus-visible:bg-white"
                placeholder="name@company.com"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <Link href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">Forgot password?</Link>
              </div>
              <Input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="h-12 bg-gray-50/50 border-gray-200 focus-visible:bg-white"
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20">
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
            
            <p className="text-center text-sm text-gray-500 mt-6">
              Don&apos;t have an account? <Link href="/signup" className="font-semibold text-blue-600 hover:text-blue-500">Create one</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
