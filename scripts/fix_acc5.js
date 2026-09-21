const fs = require('fs');
let a = fs.readFileSync('src/app/(storefront)/account/page.tsx', 'utf8');
a = a.replace(/\(n\)/g, "(n: any)");
fs.writeFileSync('src/app/(storefront)/account/page.tsx', a);
