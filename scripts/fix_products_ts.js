const fs = require('fs');

let content = fs.readFileSync('src/app/(storefront)/products/page.tsx', 'utf8');

content = content.replace(/const \[productsRes, cats, brs\] = await Promise\.all\(\[\n\s*fetch\('\/api\/products', \{ cache: 'no-store' \}\),\n\s*getDocuments<Category>\(collections\.categories\),\n\s*getDocuments<Brand>\(collections\.brands\),\n\s*\]\);/g, 
  "const [productsRes, catRes, brandRes] = await Promise.all([fetch('/api/products', { cache: 'no-store' }), supabase.from('categories').select('*').eq('enabled', true), supabase.from('brands').select('*').eq('enabled', true)]);\n        const cats = catRes.data || [];\n        const brs = brandRes.data || [];");

fs.writeFileSync('src/app/(storefront)/products/page.tsx', content);
