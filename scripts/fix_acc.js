const fs = require('fs');
let a = fs.readFileSync('src/app/(storefront)/account/page.tsx', 'utf8');
a = a.replace(/e\.createdAt\?\.toDate \? e\.createdAt\.toDate\(\)\.toLocaleDateString\('en-IN', \{ day: 'numeric', month: 'short', year: 'numeric' \}\) : 'Recent'/g, "e.createdAt ? new Date(e.createdAt as any).toLocaleDateString() : 'Recent'");
fs.writeFileSync('src/app/(storefront)/account/page.tsx', a);
