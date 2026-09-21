const fs = require('fs');

let cs = fs.readFileSync('src/app/(storefront)/categories/[slug]/page.tsx', 'utf8');
cs = cs.replace(/const catQuery = query\([\s\S]*?\);\n\s*const catSnapshot = await getDocs\(catQuery\);/g, "const { data: catSnapshot } = await supabase.from('categories').select('*').eq('slug', slug.toLowerCase());");
cs = cs.replace(/if \(catSnapshot\.empty\)/g, "if (!catSnapshot || catSnapshot.length === 0)");
cs = cs.replace(/const categoryDoc = catSnapshot\.docs\[0\];/g, "const categoryDoc = catSnapshot[0];");
cs = cs.replace(/const catData = categoryDoc\.data\(\);/g, "const catData = categoryDoc;");
cs = cs.replace(/const currentCategory = \{\n\s*id: categoryDoc\.id,\n\s*\.\.\.catData\n\s*\} as Category;/g, "const currentCategory = catData as any;");
cs = cs.replace(/import \{ supabase \} from '@\/lib\/supabase\/client';\nimport \{ supabase \} from '@\/lib\/supabase\/client';/g, "import { supabase } from '@/lib/supabase/client';");
fs.writeFileSync('src/app/(storefront)/categories/[slug]/page.tsx', cs);

let cp = fs.readFileSync('src/app/(storefront)/categories/page.tsx', 'utf8');
cp = cp.replace(/const unsubscribe = onSnapshot\([\s\S]*?\}\);/g, "");
fs.writeFileSync('src/app/(storefront)/categories/page.tsx', cp);

console.log('Fixed');
