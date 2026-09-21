'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Spinner } from '@/components/ui';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { resetPassword } = useAuth();
  const toast = useToast();

  const formatFirebaseError = (err: unknown): string => {
    if (!err || typeof err !== 'object') return 'An unexpected error occurred. Please try again.';
    const code = (err as { code?: string }).code || '';
    const message = (err as { message?: string }).message || '';

    switch (code) {
      case 'auth/user-not-found':
        return 'No user found with this email address.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection.';
      default:
        return message || 'Failed to send password reset email.';
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);

    try {
      await resetPassword(email.trim());
      setSubmitted(true);
      toast.success('Password reset link sent to your email!');
    } catch (err: unknown) {
      console.error('Password reset error:', err);
      const friendlyMsg = formatFirebaseError(err);
      setError(friendlyMsg);
      toast.error(friendlyMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="flex items-center justify-center text-2xl font-bold font-poppins text-[#C41E24]">
              <span>LUCKY</span>
              <svg className="w-6 h-6 mx-1 text-yellow-500 fill-current" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
              <span>STAR</span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">Home Appliances &amp; Furnitures</p>
          </Link>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">Reset Password</h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your registered email address and we'll send you a password reset link.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg" role="alert">
            <div className="flex items-start">
              <div className="flex-shrink-0 text-red-500 mt-0.5">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {submitted ? (
          <div className="text-center space-y-6">
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm">
              We have sent a password reset link to <strong>{email}</strong>. Please check your inbox (and spam folder) and follow the instructions to reset your password.
            </div>
            <Link
              href="/auth/login"
              className="w-full inline-flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-[#C41E24] hover:bg-[#9B1B20] transition-colors"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                Email Address
              </label>
              <input 
                id="email"
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                disabled={loading}
                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-[#C41E24] focus:border-[#C41E24] sm:text-sm disabled:bg-gray-50" 
              />
            </div>

            <div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-[#C41E24] hover:bg-[#9B1B20] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C41E24] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Spinner size="sm" /> Sending Link...
                  </span>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 text-center">
          <Link href="/auth/login" className="text-sm font-medium text-[#2D2D2D] hover:text-[#C41E24]">
            &larr; Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
