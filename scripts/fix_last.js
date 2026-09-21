const fs = require('fs');

let a = fs.readFileSync('src/app/(storefront)/account/page.tsx', 'utf8');
a = a.replace(/e\.created_at \? new Date\(e\.created_at\)/g, 'e.createdAt ? new Date(e.createdAt as any)');
fs.writeFileSync('src/app/(storefront)/account/page.tsx', a);

let c = fs.readFileSync('src/app/(storefront)/categories/[slug]/page.tsx', 'utf8');
let count = 0;
let cLines = c.split('\n');
cLines = cLines.filter((line) => {
   if (line.includes("import { supabase }")) {
      count++;
      return count === 1;
   }
   return true;
});
fs.writeFileSync('src/app/(storefront)/categories/[slug]/page.tsx', cLines.join('\n'));
console.log('Fixed account and categories/[slug]');
