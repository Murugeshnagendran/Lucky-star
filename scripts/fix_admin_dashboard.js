const fs = require('fs');

let content = fs.readFileSync('src/app/admin/page.tsx', 'utf8');

// Add the mappers import
content = content.replace(
  /import \{ getImageUrl \} from '@\/lib\/utils\/image';/,
  "import { getImageUrl } from '@/lib/utils/image';\nimport { mapEnquiryToCamelCase, mapFurnitureRequestToCamelCase, mapProductToCamelCase } from '@/lib/utils/mapper';"
);

// Fix the Supabase queries
content = content.replace(
  /supabase\.from\('products'\)\.select\('\*'\)/,
  "supabase.from('products').select('*')"
);
content = content.replace(
  /supabase\.from\('productEnquiries'\)\.select\('\*'\)\.order\('createdAt', \{ ascending: false \}\)/,
  "supabase.from('enquiries').select('*').order('created_at', { ascending: false })"
);
content = content.replace(
  /supabase\.from\('furnitureRequests'\)\.select\('\*'\)\.order\('createdAt', \{ ascending: false \}\)/,
  "supabase.from('furniture_requests').select('*').order('created_at', { ascending: false })"
);

// Map the data
content = content.replace(
  /const enqs = enqsData \|\| \[\];/,
  "const enqs = (enqsData || []).map(mapEnquiryToCamelCase) as any;"
);
content = content.replace(
  /const frs = frsData \|\| \[\];/,
  "const frs = (frsData || []).map(mapFurnitureRequestToCamelCase) as any;"
);
content = content.replace(
  /const prods = prodsData \|\| \[\];/,
  "const prods = (prodsData || []).map(mapProductToCamelCase) as any;"
);

fs.writeFileSync('src/app/admin/page.tsx', content);
console.log('Fixed admin/page.tsx');
