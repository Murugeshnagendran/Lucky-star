import { MetadataRoute } from 'next';
import { getSupabaseServerClient } from '@/lib/supabase/server';

const baseUrl = 'https://luckystarhomeappliances.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = getSupabaseServerClient();
  
  // Base static routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/furniture`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/offers`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  try {
    // Fetch dynamic products
    const { data: products } = await supabase
      .from('products')
      .select('slug, updated_at')
      .eq('status', 'active');

    if (products) {
      products.forEach((product: any) => {
        if (product.slug) {
          routes.push({
            url: `${baseUrl}/products/${product.slug}`,
            lastModified: new Date(product.updated_at || new Date()),
            changeFrequency: 'weekly',
            priority: 0.7,
          });
        }
      });
    }

    // Fetch dynamic categories
    const { data: categories } = await supabase
      .from('categories')
      .select('slug, updated_at')
      .eq('enabled', true);

    if (categories) {
      categories.forEach((category: any) => {
        if (category.slug) {
          routes.push({
            url: `${baseUrl}/categories/${category.slug}`,
            lastModified: new Date(category.updated_at || new Date()),
            changeFrequency: 'weekly',
            priority: 0.8,
          });
        }
      });
    }
  } catch (error) {
    console.error('Error generating dynamic sitemap routes:', error);
  }

  return routes;
}
