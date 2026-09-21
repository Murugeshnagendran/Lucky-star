const fs = require('fs');
let a = fs.readFileSync('src/app/(storefront)/account/page.tsx', 'utf8');
a = a.split('\n').map(l => l.includes('toDate') ? "{e.createdAt ? new Date(e.createdAt as any).toLocaleDateString() : 'Recent'}" : l).join('\n');
fs.writeFileSync('src/app/(storefront)/account/page.tsx', a);
