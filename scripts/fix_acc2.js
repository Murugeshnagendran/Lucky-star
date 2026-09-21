const fs = require('fs');
let a = fs.readFileSync('src/app/(storefront)/account/page.tsx', 'utf8');
a = a.replace(/\{e\.createdAt\?\.toDate \? e\.createdAt\.toDate\(\)\.toLocaleDateString\('en-IN', \{ day: 'numeric', month: 'short', year: 'numeric' \}\) : 'Recent'\}/g, "{e.createdAt ? new Date(e.createdAt as any).toLocaleDateString() : 'Recent'}");
a = a.replace(/const n = e\.target\.value;/g, "const n: any = e.target.value;");
// Also brute-force toDate replacements
a = a.replace(/e\.createdAt\?\.toDate/g, "e.createdAt");
a = a.replace(/e\.createdAt\.toDate\(\)/g, "new Date(e.createdAt as any)");
fs.writeFileSync('src/app/(storefront)/account/page.tsx', a);
