'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  
  const { signIn, signOut, user, userProfile, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  // State 4: Authenticated + Admin -> Redirect to /admin
  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      router.push('/admin');
    }
  }, [authLoading, user, isAdmin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFormLoading(true);

    try {
      await signIn(email, password);
      // Wait for auth state to propagate and trigger the useEffect above.
      // We don't setFormLoading(false) here because we want the button to stay disabled
      // during the redirect process to prevent multiple clicks.
    } catch (err: unknown) {
      setFormLoading(false);
      const msg = err instanceof Error ? err.message : 'Login failed';
      if (
        msg.includes('user-not-found') ||
        msg.includes('wrong-password') ||
        msg.includes('invalid-credential')
      ) {
        setError('Invalid email or password.');
      } else if (msg.includes('too-many-requests')) {
        setError('Too many failed attempts. Please try again later.');
      } else if (msg.includes('network-request-failed')) {
        setError('Network error. Please check your internet connection.');
      } else {
        setError(msg);
      }
    }
  };

  // State 1 & State 3: authLoading or redirecting admin
  if (authLoading || (user && isAdmin)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-8 w-8 text-[#C41E24]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-neutral-500 font-medium">Authenticating...</p>
        </div>
      </div>
    );
  }

  // State 5: Authenticated + Non-Admin
  if (user && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">🚫</div>
          <h2 className="text-xl font-bold mb-2" style={{ color: '#2D2D2D' }}>Access Denied</h2>
          <p className="text-neutral-500 mb-6">
            You are currently logged in as a customer. This area is restricted to store administrators only.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center justify-center rounded-md font-medium h-10 px-6 text-sm text-white shadow-sm transition-colors w-full"
              style={{ backgroundColor: '#C41E24' }}
            >
              Go to Store
            </button>
            <button
              onClick={async () => {
                await signOut();
                setFormLoading(false);
                setError('');
              }}
              className="inline-flex items-center justify-center rounded-md font-medium h-10 px-6 text-sm transition-colors w-full border border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              Sign Out & Log In as Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  // State 2: Unauthenticated -> Show Login Form
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
        {/* Lucky Star Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1 mb-2">
            <span
              className="text-3xl font-extrabold tracking-tight"
              style={{ fontFamily: 'var(--font-heading)', color: '#C41E24' }}
            >
              LUCKY ★ STAR
            </span>
          </div>
          <h1 className="text-xl font-semibold" style={{ color: '#2D2D2D' }}>Admin Login</h1>
          <p className="text-sm text-neutral-400 mt-1">Store management access only</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@luckystar.com"
            required
            disabled={formLoading}
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            disabled={formLoading}
          />

          <button
            type="submit"
            disabled={formLoading || !email.trim() || !password.trim()}
            className="w-full inline-flex items-center justify-center rounded-lg font-semibold h-11 text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{
              backgroundColor: formLoading ? '#9B1B20' : '#C41E24',
              color: '#FFFFFF',
            }}
          >
            {formLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="text-xs text-center text-neutral-400 mt-6">
          This login is for store administrators only.
          <br />
          Customers can sign in from the{' '}
          <a href="/auth/login" className="text-blue-600 hover:underline">customer login</a> page.
        </p>
      </div>
    </div>
  );
}
