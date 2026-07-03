'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Logo } from '@/components/logo';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { CheckCircle2, ShieldAlert, Loader2, ArrowLeft } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ''
    }
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setError(null);
    setSuccess(false);
    setSubmitting(true);
    try {
      await resetPassword(data.email);
      setSuccess(true);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to send password recovery email. Please check the address.');
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
          Recover Password
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          We will send password reset instructions to your email address
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-slate-200 shadow-md sm:rounded-2xl sm:px-10">
          
          {success ? (
            <div className="text-center py-6 space-y-4">
              <div className="flex justify-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-850">Instructions Sent!</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                Check your inbox. We have sent a password reset link to your email address. Follow the instructions to choose a new password.
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
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-xl shadow-sm text-xs font-bold text-white bg-[#2D6A4F] hover:bg-[#1f4e38] focus:outline-none transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Send Reset Link</span>
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center text-xs text-slate-500">
                <Link 
                  href="/login" 
                  className="font-bold text-[#2D6A4F] hover:text-[#1a4a35] hover:underline flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to login</span>
                </Link>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
