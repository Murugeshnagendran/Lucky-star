'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface AdminHeaderProps {
  onMenuToggle?: () => void;
}

export default function AdminHeader({ onMenuToggle }: AdminHeaderProps) {
  const router = useRouter();
  const { userProfile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push('/admin/login');
  };

  return (
    <header className="bg-white border-b border-neutral-200 shadow-sm h-16 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 md:hidden"
            aria-label="Toggle Navigation Menu"
          >
            ☰
          </button>
        )}
        <span className="text-base md:text-lg font-semibold text-brand-charcoal">
          Store Management Console
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-brand-charcoal">{userProfile?.name || 'Administrator'}</p>
          <p className="text-xs text-neutral-400 capitalize">{userProfile?.role?.replace('_', ' ') || 'Admin'}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="text-xs md:text-sm font-medium px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}
