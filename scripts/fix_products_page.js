const fs = require('fs');
let c = fs.readFileSync('src/app/(storefront)/products/page.tsx', 'utf8');

c = c.replace(/import \{ collections, getDocuments \} from '@\/lib\/firebase\/firestore';/, "import { supabase } from '@/lib/supabase/client';");
c = c.replace(/const \[categories, brands\] = await Promise\.all\(\[\n\s*getDocuments<Category>\(collections\.categories\),\n\s*getDocuments<Brand>\(collections\.brands\)\n\s*\]\);/g, 
  "const [catRes, brandRes] = await Promise.all([supabase.from('categories').select('*').eq('enabled', true), supabase.from('brands').select('*').eq('enabled', true)]);\n        const categories = catRes.data || [];\n        const brands = brandRes.data || [];");
c = c.replace(/setCategories\(categories\);/g, 'setCategories(categories as any);');
c = c.replace(/setBrands\(brands\);/g, 'setBrands(brands as any);');

fs.writeFileSync('src/app/(storefront)/products/page.tsx', c);
console.log('Fixed products/page.tsx');
