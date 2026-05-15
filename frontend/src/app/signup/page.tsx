"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must not exceed 50 characters').trim(),
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[!@#$%^&*]/, 'Must contain at least one special character (!@#$%^&*)'),
});

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema)
  });

  const onSubmit = async (data: SignupForm) => {
    try {
      setLoading(true);
      const res = await api.post('/auth/signup', data);
      setAuth(res.data.data.user, res.data.data.token);
      toast.success('Account created successfully');
      router.push('/dashboard');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Signup failed');
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
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Create an Account</h1>
          <p className="text-gray-500 mt-2">Join TaskFlow and start managing your team</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <Input 
                placeholder="John Doe" 
                {...register('name')} 
                className={`h-12 bg-gray-50/50 border-gray-200 focus-visible:bg-white ${errors.name ? 'border-red-500' : ''}`}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1 font-medium">{errors.name.message}</p>}
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Email address</label>
              <Input 
                placeholder="name@company.com" 
                {...register('email')} 
                className={`h-12 bg-gray-50/50 border-gray-200 focus-visible:bg-white ${errors.email ? 'border-red-500' : ''}`}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1 font-medium">{errors.email.message}</p>}
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                {...register('password')} 
                className={`h-12 bg-gray-50/50 border-gray-200 focus-visible:bg-white ${errors.password ? 'border-red-500' : ''}`}
              />
              {errors.password && <p className="text-xs text-red-500 mt-1 font-medium">{errors.password.message}</p>}
            </div>
            
            <Button type="submit" disabled={loading} className="w-full h-12 mt-2 text-base font-semibold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20">
              {loading ? 'Creating account...' : 'Sign up'}
            </Button>
            
            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account? <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500">Log in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
