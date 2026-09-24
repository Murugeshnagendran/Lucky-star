'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Spinner } from '@/components/ui';

function RegisterForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { signUp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  const redirectUrl = searchParams.get('redirect') || '/';

  const formatFirebaseError = (err: unknown): string => {
    if (!err || typeof err !== 'object') return 'An unexpected error occurred. Please try again.';
    const code = (err as { code?: string }).code || '';
    const message = (err as { message?: string }).message || '';

    switch (code) {
      case 'auth/email-already-in-use':
        return 'This email address is already registered. Please log in instead.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use at least 6 characters.';
      case 'auth/network-request-failed':
        return 'Network connection failed. Please check your internet connection.';
      case 'auth/operation-not-allowed':
        return 'Email/Password sign-in is not enabled in Firebase Console. Please enable Email/Password provider.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      default:
        return message || 'Failed to create account. Please try again.';
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await signUp(email.trim(), password, fullName.trim(), phone.trim());
      toast.success('Account created successfully! Welcome to Lucky Star.');
      router.push(redirectUrl);
    } catch (err: unknown) {
      console.error('Registration error:', err);
      const friendlyMessage = formatFirebaseError(err);
      setError(friendlyMessage);
      toast.error(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <img 
              src="/images/lucky-star-logo.png" 
              alt="Lucky Star Home Appliances and Furnitures" 
              className="h-12 w-auto object-contain mx-auto"
            />
            <p className="text-xs text-neutral-500 mt-2">Home Appliances &amp; Furnitures</p>
          </Link>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">Create an account</h2>
          <p className="mt-1 text-sm text-gray-500">Sign up to manage enquiries &amp; wishlist</p>
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

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="fullName">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Anitha Kumar"
              disabled={loading}
              className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-[#C41E24] focus:border-[#C41E24] sm:text-sm disabled:bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              disabled={loading}
              className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-[#C41E24] focus:border-[#C41E24] sm:text-sm disabled:bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              disabled={loading}
              className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-[#C41E24] focus:border-[#C41E24] sm:text-sm disabled:bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              disabled={loading}
              className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-[#C41E24] focus:border-[#C41E24] sm:text-sm disabled:bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="confirmPassword">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              disabled={loading}
              className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-[#C41E24] focus:border-[#C41E24] sm:text-sm disabled:bg-gray-50"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#C41E24] hover:bg-[#9B1B20] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C41E24] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Spinner size="sm" /> Creating Account...
                </span>
              ) : (
                'Register'
              )}
            </button>
            <p className="mt-3 text-xs text-center text-gray-500">
              By registering, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              href={redirectUrl !== '/' ? `/auth/login?redirect=${encodeURIComponent(redirectUrl)}` : '/auth/login'}
              className="font-medium text-[#C41E24] hover:underline"
            >
              Log in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner size="lg" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
