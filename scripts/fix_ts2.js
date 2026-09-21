const fs = require('fs');
let f = fs.readFileSync('src/app/(storefront)/furniture/page.tsx', 'utf8');
f = f.replace(/export function/g, 'export default function');
f = f.replace(/Timestamp\.fromDate\(new Date\((.*?)\)\)/g, 'new Date($1).toISOString()');
f = f.replace(/Timestamp/g, 'any');
fs.writeFileSync('src/app/(storefront)/furniture/page.tsx', f);

let a = fs.readFileSync('src/app/(storefront)/account/page.tsx', 'utf8');
a = a.replace(/e\.createdAt\?\.toDate \?/g, 'e.created_at ?');
a = a.replace(/e\.createdAt\.toDate\(\)/g, 'new Date(e.created_at)');
a = a.replace(/const n = e\.target\.value/g, 'const n: any = e.target.value');
fs.writeFileSync('src/app/(storefront)/account/page.tsx', a);

function fix(p) {
   let text = fs.readFileSync(p, 'utf8');
   text = text.replace(/setBrands\(brands\)/g, 'setBrands(brands as any)');
   text = text.replace(/setCategories\(categories\)/g, 'setCategories(categories as any)');
   text = text.replace(/import \{ supabase \} from '@\/lib\/supabase\/client';\nimport \{ supabase \} from '@\/lib\/supabase\/client';/g, "import { supabase } from '@/lib/supabase/client';");
   fs.writeFileSync(p, text);
}
fix('src/app/(storefront)/availability/page.tsx');
fix('src/app/(storefront)/categories/[slug]/page.tsx');
fix('src/app/(storefront)/products/[slug]/page.tsx');
fix('src/app/(storefront)/products/page.tsx');

let cs = fs.readFileSync('src/app/(storefront)/categories/[slug]/page.tsx', 'utf8');
cs = cs.replace(/const q = query\(collection\(db, 'products'\), where\('categoryId', '==', categories\[0\]\.id\)\);\n\s*const querySnapshot = await getDocs\(q\);/g, "const { data: querySnapshot } = await supabase.from('products').select('*').eq('category_id', categories[0].id);");
cs = cs.replace(/querySnapshot\.forEach\(\(doc\) => \{\n\s*productsData\.push\(\{ id: doc\.id, \.\.\.doc\.data\(\) \} as Product\);\n\s*\}\);/g, "if (querySnapshot) { productsData = querySnapshot as any; }");
fs.writeFileSync('src/app/(storefront)/categories/[slug]/page.tsx', cs);

let cp = fs.readFileSync('src/app/(storefront)/categories/page.tsx', 'utf8');
cp = cp.replace(/const q = query\(collection\(db, 'categories'\)\);/g, '');
cp = cp.replace(/const unsubscribe = onSnapshot\(q, \(snapshot\) => \{[\s\S]*?\}\);/g, '');
cp = cp.replace(/return \(\) => unsubscribe\(\);/g, '');
fs.writeFileSync('src/app/(storefront)/categories/page.tsx', cp);

console.log('Fixed');
