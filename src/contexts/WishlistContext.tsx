'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  wishlistItems: string[];
  loading: boolean;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let subscription: any;

    if (user) {
      setLoading(true);
      
      const fetchWishlist = async () => {
        try {
          const { data, error } = await supabase
            .from('wishlists')
            .select('product_id')
            .eq('user_id', user.id);
            
          if (error) throw error;
          
          if (data) {
            setWishlistItems(data.map((item: any) => item.product_id));
          }
        } catch (error) {
          console.error('Error fetching wishlist:', error);
          setWishlistItems([]);
        } finally {
          setLoading(false);
        }
      };
      
      fetchWishlist();
      
      // Set up realtime subscription
      const channelName = `wishlist_changes_${Math.random().toString(36).substring(7)}`;
      subscription = supabase
        .channel(channelName)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'wishlists',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          if (payload.eventType === 'INSERT') {
            setWishlistItems(prev => [...prev, payload.new.product_id]);
          } else if (payload.eventType === 'DELETE') {
            setWishlistItems(prev => prev.filter(id => id !== payload.old.product_id));
          }
        })
        .subscribe();
        
    } else {
      const localWishlist = localStorage.getItem('wishlist');
      if (localWishlist) {
        try {
          setWishlistItems(JSON.parse(localWishlist));
        } catch (e) {
          console.error('Error parsing local wishlist', e);
          setWishlistItems([]);
        }
      } else {
        setWishlistItems([]);
      }
      setLoading(false);
    }
    
    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [user]);

  useEffect(() => {
    if (!user && !loading) {
      localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, user, loading]);

  const addToWishlist = async (productId: string) => {
    if (user) {
      await supabase
        .from('wishlists')
        .insert({ user_id: user.id, product_id: productId });
    } else {
      if (!wishlistItems.includes(productId)) {
        setWishlistItems(prev => [...prev, productId]);
      }
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (user) {
      await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
    } else {
      setWishlistItems(prev => prev.filter(id => id !== productId));
    }
  };

  const isInWishlist = (productId: string) => wishlistItems.includes(productId);

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      loading,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      wishlistCount: wishlistItems.length
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
