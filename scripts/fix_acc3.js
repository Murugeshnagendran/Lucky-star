const fs = require('fs');
let a = fs.readFileSync('src/app/(storefront)/account/page.tsx', 'utf8');
a = a.replace(/e\.created_at/g, "e.createdAt");
a = a.replace(/e\.createdAt\?\.toDate \? new Date\(e\.createdAt as any\)\.toLocaleDateString\('en-IN', \{ day: 'numeric', month: 'short', year: 'numeric' \}\) : 'Recent'/g, "e.createdAt ? new Date(e.createdAt as any).toLocaleDateString() : 'Recent'");
fs.writeFileSync('src/app/(storefront)/account/page.tsx', a);
