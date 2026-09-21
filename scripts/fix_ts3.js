const fs = require('fs');

function fix(p) {
   let text = fs.readFileSync(p, 'utf8');
   text = text.replace(/setBrands\(brands\);/g, "setBrands(brands as any);");
   text = text.replace(/setBrands\(brands as any\);/g, "setBrands(brands as any);");
   text = text.replace(/setCategories\(categories\);/g, "setCategories(categories as any);");
   text = text.replace(/setCategories\(categories as any\);/g, "setCategories(categories as any);");
   text = text.replace(/import \{ supabase \} from '@\/lib\/supabase\/client';\nimport \{ supabase \} from '@\/lib\/supabase\/client';/g, "import { supabase } from '@/lib/supabase/client';");
   
   // brands.map mapping properties added
   text = text.replace(/name: d\.name, slug: d\.slug/g, "name: d.name, slug: d.slug, enabled: true, createdAt: '', updatedAt: ''");
   text = text.replace(/order: 0, /g, "");
   text = text.replace(/slug: d\.slug/g, "slug: d.slug, order: 0");
   
   fs.writeFileSync(p, text);
}
fix('src/app/(storefront)/availability/page.tsx');
fix('src/app/(storefront)/products/[slug]/page.tsx');
fix('src/app/(storefront)/products/page.tsx');
fix('src/app/(storefront)/categories/[slug]/page.tsx');

let cs = fs.readFileSync('src/app/(storefront)/categories/[slug]/page.tsx', 'utf8');
cs = cs.replace(/import \{ supabase \} from '@\/lib\/supabase\/client';\nimport \{ supabase \} from '@\/lib\/supabase\/client';/g, "import { supabase } from '@/lib/supabase/client';");
cs = cs.replace(/const catData = categoryDoc\.data\(\);/g, "const catData = categoryDoc;");
cs = cs.replace(/catSnapshot\.docs\.length/g, "catSnapshot.length");
cs = cs.replace(/catSnapshot\.docs\[0\]/g, "catSnapshot[0]");
fs.writeFileSync('src/app/(storefront)/categories/[slug]/page.tsx', cs);

let a = fs.readFileSync('src/app/(storefront)/account/page.tsx', 'utf8');
a = a.replace(/e\.createdAt\?\.toDate \? e\.createdAt\.toDate\(\)\.toLocaleDateString/g, "e.created_at ? new Date(e.created_at).toLocaleDateString");
a = a.replace(/const n = e\.target\.value/g, 'const n: any = e.target.value');
fs.writeFileSync('src/app/(storefront)/account/page.tsx', a);

let f = fs.readFileSync('src/app/(storefront)/furniture/page.tsx', 'utf8');
f = f.replace(/export function FurniturePage/g, 'export default function FurniturePage');
fs.writeFileSync('src/app/(storefront)/furniture/page.tsx', f);

console.log('Fixed');
