"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Zap, ArrowRight, Globe } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      setAuth(res.data.data.user, res.data.data.token);
      toast.success('Signed in successfully.');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F8FAFC] text-slate-900 overflow-hidden font-sans">
      {/* Visual Side */}
      <div className="hidden md:flex flex-1 relative items-center justify-center p-20 overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/30 via-[#020617] to-[#020617] pointer-events-none" />
        <div className="absolute top-[-20%] right-[-20%] w-[800px] h-[800px] bg-blue-600/10 blur-[150px] rounded-full" />
        
        <div className="relative z-10 max-w-lg">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-10 shadow-[0_0_30px_rgba(37,99,235,0.4)]">
            <Zap className="w-8 h-8 text-white fill-current" />
          </div>
          <h2 className="text-6xl font-black tracking-tighter leading-none mb-6 text-white">
            Work <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 drop-shadow-[0_0_20px_rgba(37,99,235,0.3)]">Smarter.</span>
          </h2>
          <p className="text-lg text-slate-400 font-medium leading-relaxed mb-10 italic">
            Lumina is the next-generation workspace for high-velocity teams. 
            Automate workflows and scale with absolute precision.
          </p>
          <div className="flex gap-4">
            <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-xs font-bold uppercase tracking-widest text-white/40">System Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-20 relative bg-white shadow-2xl z-10">
        <div className="w-full max-w-md relative">
          <div className="mb-12 text-center md:text-left">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mb-6 md:hidden mx-auto shadow-lg shadow-blue-600/20">
               <Zap className="w-6 h-6 fill-current" />
            </div>
            <h1 className="text-4xl font-black tracking-tight mb-3 text-slate-900">Sign In</h1>
            <p className="text-slate-500 font-medium">Welcome back to your Lumina workspace.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
              <Input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="h-14 bg-slate-50 border-slate-200 rounded-2xl focus:border-blue-600 focus:ring-0 transition-all font-medium placeholder:text-slate-300"
                placeholder="name@company.com"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Password</label>
                <Link href="/forgot-password" className="text-xs font-bold uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-all">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative group">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  className="h-14 bg-slate-50 border-slate-200 rounded-2xl focus:border-blue-600 focus:ring-0 transition-all pr-14 font-medium placeholder:text-slate-300"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-[0_10px_25px_rgba(37,99,235,0.2)] transition-all group overflow-hidden relative"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? 'Signing in...' : 'Sign In'} 
                {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </span>
            </Button>

            <div className="relative flex items-center justify-center py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <span className="relative z-10 px-4 text-[10px] font-black uppercase tracking-widest text-slate-300 bg-white">OR CONTINUE WITH</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <button type="button" className="h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-all font-bold text-sm text-slate-600">
                  <Globe className="w-5 h-5 text-slate-400" /> Github
               </button>
               <button type="button" className="h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-all font-bold text-sm text-slate-600">
                  <span className="w-5 h-5 flex items-center justify-center font-black text-slate-400 text-xs">G</span> Google
               </button>
            </div>
            
            <p className="text-center text-sm text-slate-500 mt-10 font-medium">
              New to Lumina? <Link href="/signup" className="font-black text-blue-600 hover:text-blue-700 transition-all underline underline-offset-8">Create Account</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
