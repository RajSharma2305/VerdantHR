'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Logo } from '@/components/logo';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { CheckCircle2, ShieldAlert, Loader2 } from 'lucide-react';

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  confirmPassword: z.string().min(6, 'Confirm password must match')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { registerWithEmail } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setError(null);
    setSuccess(false);
    setSubmitting(true);
    try {
      await registerWithEmail(data.email, data.password);
      setSuccess(true);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to create account. Please try again.');
    } finally {
      setSubmitting(false);
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
          Create your account
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          Get started with VerdantHR workforce management portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-slate-200 shadow-md sm:rounded-2xl sm:px-10">
          
          {success ? (
            <div className="text-center py-6 space-y-4">
              <div className="flex justify-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-850">Verification Email Sent!</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                We have sent an email verification link to your registered address. Please check your inbox and verify your email before logging in.
              </p>
              <div className="pt-4">
                <Link
                  href="/login"
                  className="inline-flex justify-center py-2 px-6 border border-transparent rounded-xl shadow-sm text-xs font-bold text-white bg-[#2D6A4F] hover:bg-[#1f4e38] transition-all"
                >
                  Go to Login
                </Link>
              </div>
            </div>
          ) : (
            <>
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
                      placeholder="you@example.com"
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
                  <label className="block text-xs font-bold text-slate-655 uppercase tracking-wider">
                    Password
                  </label>
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

                <div>
                  <label className="block text-xs font-bold text-slate-655 uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <div className="mt-1">
                    <input
                      type="password"
                      placeholder="••••••••"
                      {...register('confirmPassword')}
                      className={`appearance-none block w-full px-3.5 py-2 border rounded-xl shadow-xs text-xs focus:outline-none focus:bg-white transition-all text-slate-700 ${
                        errors.confirmPassword 
                          ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                          : 'border-slate-200 focus:border-[#2D6A4F]/30'
                      }`}
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-[10px] text-red-600 font-medium">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-xl shadow-sm text-xs font-bold text-white bg-[#2D6A4F] hover:bg-[#1f4e38] focus:outline-none transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Register</span>
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center text-xs text-slate-500">
                Already have an account?{' '}
                <Link 
                  href="/login" 
                  className="font-bold text-[#2D6A4F] hover:text-[#1a4a35] hover:underline"
                >
                  Log in here
                </Link>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
