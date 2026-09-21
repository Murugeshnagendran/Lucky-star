const fs = require('fs');
let c = fs.readFileSync('src/app/(storefront)/products/page.tsx', 'utf8');

c = c.replace(/import \{ collections, getDocuments \} from '@\/lib\/firebase\/firestore';/, "import { supabase } from '@/lib/supabase/client';");

// Use a more generic replace for the Promise.all
c = c.replace(/const \[categories, brands\] = await Promise\.all\(\[[\s\S]*?\]\);/, 
  "const [catRes, brandRes] = await Promise.all([supabase.from('categories').select('*').eq('enabled', true), supabase.from('brands').select('*').eq('enabled', true)]);\n        const categories = catRes.data || [];\n        const brands = brandRes.data || [];");

c = c.replace(/\(c\) => c\.id === product\.categoryId/g, '(c: any) => c.id === product.categoryId');
c = c.replace(/\(b\) => b\.id === product\.brandId/g, '(b: any) => b.id === product.brandId');
c = c.replace(/product\.categoryId/g, 'product.category_id');
c = c.replace(/product\.brandId/g, 'product.brand_id');
c = c.replace(/product\.originalPrice/g, 'product.original_price');
c = c.replace(/product\.modelNumber/g, 'product.model_number');
c = c.replace(/product\.imageUrl/g, 'product.image_url');
c = c.replace(/product\.stockQuantity/g, 'product.stock_quantity');

fs.writeFileSync('src/app/(storefront)/products/page.tsx', c);
