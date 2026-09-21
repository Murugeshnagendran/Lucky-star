'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User as UserIcon, MessageSquare, Heart, LogOut, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { ProductEnquiry, ENQUIRY_STATUS_LABELS, EnquiryStatus } from '@/lib/types';
import { Spinner, Badge, Button, useToast } from '@/components/ui';

export default function AccountPage() {
  const { user, userProfile, loading, signOut, isAdmin } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [enquiries, setEnquiries] = useState<ProductEnquiry[]>([]);
  const [enquiriesLoading, setEnquiriesLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login?redirect=/account');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '');
      setPhone(userProfile.phone || '');
    }
  }, [userProfile]);

  useEffect(() => {
    async function loadUserEnquiries() {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('enquiries')
          .select('*')
          .eq('customerId', user.id)
          .order('createdAt', { ascending: false });
        if (error) throw error;
        setEnquiries(data || []);
      } catch (err) {
        console.error('Error loading enquiries:', err);
      } finally {
        setEnquiriesLoading(false);
      }
    }

    if (user) {
      loadUserEnquiries();
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: name.trim(),
          phone: phone.trim(),
        })
        .eq('id', user.id);
      if (error) throw error;
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully.');
      router.push('/');
    } catch (err) {
      console.error('Error signing out:', err);
      toast.error('Failed to log out.');
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const initials = (name || user.user_metadata?.name || user.email || 'U')
    .split(' ')
    .map((n: any) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const getBadgeVariant = (status: EnquiryStatus) => {
    switch (status) {
      case 'new': return 'warning';
      case 'contacted': return 'info';
      case 'quoted': return 'success';
      case 'closed': return 'neutral';
      default: return 'neutral';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <div className="w-full md:w-64 flex-shrink-0">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-24">
          <div className="p-6 bg-gray-50 border-b border-gray-100 text-center">
            <div className="w-16 h-16 bg-red-100 text-[#C41E24] rounded-full mx-auto flex items-center justify-center text-xl font-bold mb-3">
              {initials}
            </div>
            <h2 className="font-poppins font-semibold text-[#2D2D2D] truncate">
              {name || user.user_metadata?.name || 'Customer'}
            </h2>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>

          <nav className="p-2 space-y-1">
            <a
              href="#profile"
              className="flex items-center px-4 py-3 text-sm font-medium text-[#C41E24] bg-red-50 rounded-lg"
            >
              <UserIcon size={18} className="mr-3" /> My Profile
            </a>
            <a
              href="#enquiries"
              className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              <MessageSquare size={18} className="mr-3 text-gray-400" /> My Enquiries
            </a>
            <Link
              href="/wishlist"
              className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              <Heart size={18} className="mr-3 text-gray-400" /> Wishlist
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center px-4 py-3 text-sm font-medium text-[#C41E24] bg-red-50 hover:bg-red-100 rounded-lg"
              >
                <Shield size={18} className="mr-3" /> Admin Dashboard
              </Link>
            )}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg mt-2 border-t border-gray-100 transition-colors text-left"
            >
              <LogOut size={18} className="mr-3" /> Logout
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 space-y-8">
        {/* Profile Info */}
        <section id="profile" className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-xl font-poppins font-semibold text-[#2D2D2D] mb-6">Profile Information</h3>
          <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="profile-name">
                Full Name
              </label>
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-[#C41E24] focus:border-[#C41E24]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="profile-email">
                Email Address
              </label>
              <input
                id="profile-email"
                type="email"
                value={user.email || ''}
                disabled
                className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2 text-sm text-gray-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="profile-phone">
                Phone Number
              </label>
              <input
                id="profile-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-[#C41E24] focus:border-[#C41E24]"
              />
            </div>
            <Button type="submit" variant="primary" disabled={savingProfile}>
              {savingProfile ? <Spinner size="sm" /> : 'Save Changes'}
            </Button>
          </form>
        </section>

        {/* My Enquiries */}
        <section id="enquiries" className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-xl font-poppins font-semibold text-[#2D2D2D] mb-6">My Enquiries</h3>
          {enquiriesLoading ? (
            <div className="py-8 flex justify-center">
              <Spinner size="md" />
            </div>
          ) : enquiries.length === 0 ? (
            <div className="py-8 text-center text-neutral-400">
              <p className="text-sm">You haven't submitted any product enquiries yet.</p>
              <Link href="/products" className="inline-block mt-3 text-xs text-brand-red font-medium hover:underline">
                Browse Products →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Product</th>
                    <th className="px-4 py-3 font-medium text-center">Quantity</th>
                    <th className="px-4 py-3 font-medium text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {enquiries.map((e) => (
                    <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 text-gray-500 text-xs whitespace-nowrap">
{e.createdAt ? new Date(e.createdAt as any).toLocaleDateString() : 'Recent'}
                      </td>
                      <td className="px-4 py-4 text-[#2D2D2D] font-medium">
                        <div>{e.productName}</div>
                        {e.productModel && <div className="text-xs text-neutral-400 font-normal">Model: {e.productModel}</div>}
                      </td>
                      <td className="px-4 py-4 text-center">{e.quantity}</td>
                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        <Badge variant={getBadgeVariant(e.status)}>
                          {ENQUIRY_STATUS_LABELS[e.status] || e.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

