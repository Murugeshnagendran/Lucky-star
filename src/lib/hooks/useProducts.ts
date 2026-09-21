'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Product, AvailabilityStatus } from '@/lib/types';
import { mapProductToCamelCase } from '@/lib/utils/mapper';

export interface UseProductsOptions {
  categoryId?: string;
  brandId?: string;
  availabilityStatus?: AvailabilityStatus;
  searchQuery?: string;
  featured?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'name_asc';
  limit?: number;
}

export interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
}

export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  
  const fetchLimit = options.limit || 20;

  useEffect(() => {
    let active = true;

    const fetchInitial = async () => {
      setLoading(true);
      setError(null);
      setPage(0);

      try {
        let query = supabase.from('products').select('*').eq('status', 'active');

        if (options.categoryId) query = query.eq('category_id', options.categoryId);
        if (options.brandId) query = query.eq('brand_id', options.brandId);
        if (options.availabilityStatus) query = query.eq('availability_status', options.availabilityStatus);
        if (options.featured !== undefined) query = query.eq('featured', options.featured);
        
        if (options.searchQuery) {
          query = query.ilike('name', `%${options.searchQuery}%`);
        }

        if (options.sortBy === 'price_asc') {
          query = query.order('selling_price', { ascending: true });
        } else if (options.sortBy === 'price_desc') {
          query = query.order('selling_price', { ascending: false });
        } else if (options.sortBy === 'name_asc') {
          query = query.order('name', { ascending: true });
        } else {
          query = query.order('created_at', { ascending: false });
        }

        query = query.range(0, fetchLimit - 1);

        const { data, error } = await query;
        if (error) throw error;

        if (active) {
          const mapped = data.map(mapProductToCamelCase);
          setProducts(mapped as unknown as Product[]);
          setHasMore(data.length === fetchLimit);
        }
      } catch (err: any) {
        if (active) {
          console.error('Error fetching products:', err);
          setError(err.message);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchInitial();

    return () => { active = false; };
  }, [
    options.categoryId, 
    options.brandId, 
    options.availabilityStatus, 
    options.featured, 
    options.sortBy, 
    options.searchQuery,
    fetchLimit
  ]);

  const loadMore = async () => {
    if (!hasMore || loading) return;

    try {
      const nextPage = page + 1;
      
      let query = supabase.from('products').select('*').eq('status', 'active');

      if (options.categoryId) query = query.eq('category_id', options.categoryId);
      if (options.brandId) query = query.eq('brand_id', options.brandId);
      if (options.availabilityStatus) query = query.eq('availability_status', options.availabilityStatus);
      if (options.featured !== undefined) query = query.eq('featured', options.featured);
      
      if (options.searchQuery) {
        query = query.ilike('name', `%${options.searchQuery}%`);
      }

      if (options.sortBy === 'price_asc') {
        query = query.order('selling_price', { ascending: true });
      } else if (options.sortBy === 'price_desc') {
        query = query.order('selling_price', { ascending: false });
      } else if (options.sortBy === 'name_asc') {
        query = query.order('name', { ascending: true });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const from = nextPage * fetchLimit;
      const to = from + fetchLimit - 1;
      
      query = query.range(from, to);

      const { data, error } = await query;
      if (error) throw error;

      const mapped = data.map(mapProductToCamelCase);
      setProducts(prev => [...prev, ...(mapped as unknown as Product[])]);
      setHasMore(data.length === fetchLimit);
      setPage(nextPage);
    } catch (err: any) {
      console.error('Error loading more products:', err);
      setError(err.message);
    }
  };

  return { products, loading, error, hasMore, loadMore };
}
