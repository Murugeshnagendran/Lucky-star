'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Brand } from '@/lib/types';

export function useBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let subscription: any;

    const fetchBrands = async () => {
      try {
        setLoading(true);
        const { data, error: err } = await supabase
          .from('brands')
          .select('*')
          .eq('enabled', true)
          .order('name', { ascending: true });
          
        if (err) throw err;
        
        const mappedData = data.map(d => ({
          ...d,
          imageUrl: d.image_url,
          createdAt: d.created_at,
          updatedAt: d.updated_at
        })) as unknown as Brand[];
        
        setBrands(mappedData);
      } catch (err: any) {
        console.error('Error fetching brands:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();

    const channelName = `brands_changes_${Math.random().toString(36).substring(7)}`;
    subscription = supabase.channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'brands' }, fetchBrands)
      .subscribe();

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, []);

  return { brands, loading, error };
}
