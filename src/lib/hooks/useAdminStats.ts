'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export function useAdminStats() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    inStockCount: 0,
    limitedStockCount: 0,
    outOfStockCount: 0,
    availableOnOrderCount: 0,
    totalEnquiries: 0,
    pendingEnquiries: 0,
    totalFurnitureRequests: 0,
    pendingFurnitureRequests: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        const [
          { count: totalProducts },
          { count: activeProducts },
          { count: inStockCount },
          { count: limitedStockCount },
          { count: outOfStockCount },
          { count: availableOnOrderCount },
          { count: totalEnquiries },
          { count: pendingEnquiries },
          { count: totalFurnitureRequests },
          { count: pendingFurnitureRequests },
        ] = await Promise.all([
          supabase.from('products').select('*', { count: 'exact', head: true }),
          supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'active'),
          supabase.from('products').select('*', { count: 'exact', head: true }).eq('availability_status', 'in_stock'),
          supabase.from('products').select('*', { count: 'exact', head: true }).eq('availability_status', 'limited_stock'),
          supabase.from('products').select('*', { count: 'exact', head: true }).eq('availability_status', 'out_of_stock'),
          supabase.from('products').select('*', { count: 'exact', head: true }).eq('availability_status', 'available_on_order'),
          supabase.from('enquiries').select('*', { count: 'exact', head: true }),
          supabase.from('enquiries').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('furniture_requests').select('*', { count: 'exact', head: true }),
          supabase.from('furniture_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        ]);

        setStats({
          totalProducts: totalProducts || 0,
          activeProducts: activeProducts || 0,
          inStockCount: inStockCount || 0,
          limitedStockCount: limitedStockCount || 0,
          outOfStockCount: outOfStockCount || 0,
          availableOnOrderCount: availableOnOrderCount || 0,
          totalEnquiries: totalEnquiries || 0,
          pendingEnquiries: pendingEnquiries || 0,
          totalFurnitureRequests: totalFurnitureRequests || 0,
          pendingFurnitureRequests: pendingFurnitureRequests || 0
        });
      } catch (err: any) {
        console.error('Error fetching admin stats:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
}
