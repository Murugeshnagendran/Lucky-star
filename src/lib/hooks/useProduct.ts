'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Product } from '@/lib/types';
import { mapProductToCamelCase } from '@/lib/utils/mapper';

export function useProduct(slug: string): { product: Product | null; loading: boolean; error: string | null } {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const fetchProduct = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error: err } = await supabase
          .from('products')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'active')
          .single();

        if (err) throw err;
        
        if (active) {
          if (data) {
            setProduct(mapProductToCamelCase(data) as unknown as Product);
          } else {
            setProduct(null);
            setError('Product not found');
          }
        }
      } catch (err: any) {
        if (active) {
          console.error('Error fetching product:', err);
          setError(err.message || 'Product not found');
          setProduct(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchProduct();

    return () => { active = false; };
  }, [slug]);

  return { product, loading, error };
}
