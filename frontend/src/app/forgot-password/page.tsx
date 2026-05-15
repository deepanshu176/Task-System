"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Zap, ArrowLeft, Mail, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setIsSent(true);
      toast.success('Reset link sent to your email.');
    } catch {
      toast.error('Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] text-slate-900 p-8 font-sans overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/5 to-transparent pointer-events-none" />
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/5 blur-[150px] rounded-full" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="mb-10 text-center">
          <div className="w-16 h-16 bg-blue-600/10 border border-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-sm">
            <Zap className="w-8 h-8 text-blue-600 fill-current" />
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-3 text-slate-900">Reset Password</h1>
          <p className="text-slate-500 font-medium">Regain access to your Lumina account.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50">
          {!isSent ? (
            <form onSubmit={handleReset} className="space-y-8">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <Input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    className="h-14 bg-slate-50 border-slate-200 rounded-2xl pl-12 focus:border-blue-600 focus:ring-0 transition-all font-medium placeholder:text-slate-300"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-[0_10px_25px_rgba(37,99,235,0.2)] transition-all group"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>

              <Link href="/login" className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-all mt-4">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </form>
          ) : (
            <div className="text-center py-10">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-black mb-4 text-slate-900">Link Sent</h3>
              <p className="text-slate-500 font-medium leading-relaxed mb-10 italic">
                A secure recovery link has been sent to your email address. Please check your inbox.
              </p>
              <Button 
                asChild
                className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl transition-all"
              >
                <Link href="/login">Return to Login</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
