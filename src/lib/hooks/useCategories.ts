'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Category } from '@/lib/types';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let subscription: any;
    
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const { data, error: err } = await supabase
          .from('categories')
          .select('*')
          .eq('enabled', true)
          .order('display_order', { ascending: true });
          
        if (err) throw err;
        
        const mappedData = data.map(d => ({
          ...d,
          order: d.display_order,
          imageUrl: d.image_url,
          createdAt: d.created_at,
          updatedAt: d.updated_at
        })) as unknown as Category[];
        
        setCategories(mappedData);
      } catch (err: any) {
        console.error('Error fetching categories:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();

    // Supabase Realtime
    const channelName = `categories_changes_${Math.random().toString(36).substring(7)}`;
    subscription = supabase.channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, fetchCategories)
      .subscribe();

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, []);

  return { categories, loading, error };
}
