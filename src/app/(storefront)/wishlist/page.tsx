'use client';

import React from 'react';
import Link from 'next/link';

import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { Spinner } from '@/components/ui';

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth();
  const { wishlistItems } = useWishlist();

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  const isLoggedIn = !!user;
  const hasItems = wishlistItems.length > 0;

  if (!isLoggedIn) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
        </div>
        <h1 className="text-2xl font-poppins font-bold text-[#2D2D2D] mb-4">Log in to view your wishlist</h1>
        <p className="text-gray-500 mb-8">Save your favorite appliances and furniture to view them later.</p>
        <Link href="/auth/login" className="px-8 py-3 bg-[#C41E24] text-white font-medium rounded-full hover:bg-[#9B1B20] transition-colors inline-block">
          Log In or Sign Up
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
      <h1 className="text-3xl font-poppins font-bold text-[#2D2D2D] mb-8">My Wishlist</h1>
      
      {!hasItems ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-gray-500 mb-4">Your wishlist is empty.</p>
          <Link href="/products" className="text-[#C41E24] font-medium hover:underline">Browse Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Wishlist Items */}
          {wishlistItems.map((productId, i) => (
            <div key={productId} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm flex flex-col">
              <div className="aspect-square bg-gray-50 relative p-4 flex flex-col justify-between">
                <button className="self-end p-2 text-gray-400 hover:text-red-500 bg-white rounded-full shadow-sm z-10 transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>
                </button>
                <div className="w-24 h-24 bg-gray-200 rounded-md mx-auto absolute inset-0 m-auto"></div>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <span className="text-xs text-gray-500 font-medium mb-1">Product</span>
                <h3 className="font-medium text-[#2D2D2D] text-sm leading-tight mb-4 flex-1">
                  Item ID: {productId.substring(0, 8)}...
                </h3>
                <div className="flex gap-2 mt-auto">
                  <Link href={`/products`} className="flex-1 text-center py-2 bg-[#C41E24] text-white text-xs font-semibold rounded-lg hover:bg-[#9B1B20] transition-colors">
                    View
                  </Link>
                  <a href="https://wa.me/919629599265" className="flex-1 text-center py-2 bg-[#25D366] text-white text-xs font-semibold rounded-lg hover:bg-[#20b858] transition-colors">
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

