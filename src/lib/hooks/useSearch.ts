'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Product } from '@/lib/types';

export function useSearch(searchQuery: string, debounceMs: number = 300): { results: Product[]; loading: boolean } {
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchQuery, debounceMs]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('status', 'active');
          
        if (error) throw error;
        
        const allProducts = data || [];
        
        const lowerQuery = debouncedQuery.toLowerCase();
        const filtered = allProducts
          .filter(p => p.name.toLowerCase().includes(lowerQuery))
          .slice(0, 10);
          
        setResults(filtered);
      } catch (error) {
        console.error('Error searching products:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  return { results, loading };
}
