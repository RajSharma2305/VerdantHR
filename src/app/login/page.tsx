'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Logo } from '@/components/logo';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { ShieldAlert, Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  rememberMe: z.boolean()
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { loginWithEmail, loginWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    setSubmitting(true);
    try {
      await loginWithEmail(data.email, data.password, data.rememberMe);
      // AuthProvider handles redirect
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to sign in. Please verify your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleSubmitting(true);
    try {
      await loginWithGoogle();
      // AuthProvider handles redirect
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to sign in with Google.');
    } finally {
      setGoogleSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-10 h-10 rounded-xl bg-[#004225] flex items-center justify-center shadow-lg border border-white/20">
            <Logo className="w-6 h-6 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-2xl font-black text-slate-800 tracking-tight">
          Sign in to VerdantHR
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          Enterprise Workforce Management Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-slate-200 shadow-md sm:rounded-2xl sm:px-10">
          
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 text-xs text-red-700 flex items-start gap-2.5 rounded-r-lg">
              <ShieldAlert className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Error:</span> {error}
              </div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  placeholder="admin@verdanthr.com"
                  {...register('email')}
                  className={`appearance-none block w-full px-3.5 py-2 border rounded-xl shadow-xs text-xs focus:outline-none focus:bg-white transition-all text-slate-700 ${
                    errors.email 
                      ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                      : 'border-slate-200 focus:border-[#2D6A4F]/30'
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-[10px] text-red-600 font-medium">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-655 uppercase tracking-wider">
                  Password
                </label>
                <div className="text-xs">
                  <Link 
                    href="/forgot-password" 
                    className="font-bold text-[#2D6A4F] hover:text-[#1a4a35] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>
              <div className="mt-1">
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  className={`appearance-none block w-full px-3.5 py-2 border rounded-xl shadow-xs text-xs focus:outline-none focus:bg-white transition-all text-slate-700 ${
                    errors.password 
                      ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                      : 'border-slate-200 focus:border-[#2D6A4F]/30'
                  }`}
                />
                {errors.password && (
                  <p className="mt-1 text-[10px] text-red-600 font-medium">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  type="checkbox"
                  {...register('rememberMe')}
                  className="h-4 w-4 text-[#2D6A4F] focus:ring-[#2D6A4F] border-slate-300 rounded cursor-pointer"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-xs font-medium text-slate-600 cursor-pointer">
                  Remember me
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={submitting || googleSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-xl shadow-sm text-xs font-bold text-white bg-[#2D6A4F] hover:bg-[#1f4e38] focus:outline-none transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Sign In</span>
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-slate-450 uppercase font-semibold text-[10px]">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleSignIn}
                disabled={submitting || googleSubmitting}
                className="w-full inline-flex justify-center py-2 px-4 border border-slate-200 rounded-xl shadow-xs bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {googleSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.2-5.136 4.2A5.857 5.857 0 0 1 8.1 12.75a5.857 5.857 0 0 1 5.89-5.85 5.756 5.756 0 0 1 4.12 1.725l3.145-3.15A10.237 10.237 0 0 0 13.99 2.25c-5.69 0-10.3 4.606-10.3 10.5s4.61 10.5 10.3 10.5c6.03 0 9.77-4.225 9.77-9.96 0-.616-.06-1.11-.15-1.505H12.24z"
                    />
                  </svg>
                )}
                <span>Continue with Google</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don&apos;t have an account?{' '}
            <Link 
              href="/register" 
              className="font-bold text-[#2D6A4F] hover:text-[#1a4a35] hover:underline"
            >
              Sign up free
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
