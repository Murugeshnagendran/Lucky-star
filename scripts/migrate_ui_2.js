const fs = require('fs');

function replaceAll(path) {
   if (!fs.existsSync(path)) return;
   let content = fs.readFileSync(path, 'utf8');
   content = content.replace(/import \{ collections, getDocuments \} from '@\/lib\/firebase\/firestore';/g, "import { supabase } from '@/lib/supabase/client';");
   
   content = content.replace(/getDocuments<Category>\(collections\.categories\)/g, "supabase.from('categories').select('*').eq('enabled', true).then(res => res.data?.map(d => ({id: d.id, name: d.name, slug: d.slug})) || [])");
   content = content.replace(/getDocuments<Brand>\(collections\.brands\)/g, "supabase.from('brands').select('*').eq('enabled', true).then(res => res.data?.map(d => ({id: d.id, name: d.name, slug: d.slug})) || [])");
   
   fs.writeFileSync(path, content);
}

replaceAll('src/app/(storefront)/products/page.tsx');
replaceAll('src/app/(storefront)/categories/[slug]/page.tsx');
replaceAll('src/app/(storefront)/products/[slug]/page.tsx');
replaceAll('src/app/(storefront)/availability/page.tsx');

let furniture = fs.readFileSync('src/app/(storefront)/furniture/page.tsx', 'utf8');
furniture = furniture.replace("import { Timestamp } from 'firebase/firestore';", "");
if (!furniture.includes("export default function")) {
   furniture = furniture.replace("export function FurniturePage", "export default function FurniturePage");
}
fs.writeFileSync('src/app/(storefront)/furniture/page.tsx', furniture);
console.log('Done');
