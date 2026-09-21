const fs = require('fs');
const readline = require('readline');

const matchers = [
  { p: 'src/app/(storefront)/products/page.tsx', m: c => c.includes('products') && c.includes('page.tsx') && !c.includes('[slug]') },
  { p: 'src/app/(storefront)/categories/[slug]/page.tsx', m: c => c.includes('categories') && c.includes('[slug]') && c.includes('page.tsx') },
  { p: 'src/app/(storefront)/availability/page.tsx', m: c => c.includes('availability') && c.includes('page.tsx') },
  { p: 'src/app/(storefront)/wishlist/page.tsx', m: c => c.includes('wishlist') && c.includes('page.tsx') },
  { p: 'src/app/(storefront)/account/page.tsx', m: c => c.includes('account') && c.includes('page.tsx') },
  { p: 'src/app/(storefront)/furniture/page.tsx', m: c => c.includes('furniture') && c.includes('page.tsx') },
  { p: 'src/app/(storefront)/offers/page.tsx', m: c => c.includes('offers') && c.includes('page.tsx') },
  { p: 'src/app/(storefront)/search/page.tsx', m: c => c.includes('search') && c.includes('page.tsx') },
  { p: 'src/components/storefront/Header.tsx', m: c => c.includes('Header.tsx') },
  { p: 'src/app/(storefront)/products/[slug]/page.tsx', m: c => c.includes('products') && c.includes('[slug]') && c.includes('page.tsx') },
  { p: 'src/app/(storefront)/categories/page.tsx', m: c => c.includes('categories') && c.includes('page.tsx') && !c.includes('[slug]') }
];

async function run() {
  const p = 'C:\\\\Users\\\\murug\\\\.gemini\\\\antigravity\\\\brain\\\\61bb08de-4daf-4bc2-96ff-367c95995e56\\\\.system_generated\\\\logs\\\\transcript_full.jsonl';
  const fileStream = fs.createReadStream(p);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
  
  const contents = {};
  
  for await (const line of rl) {
    const obj = JSON.parse(line);
    if (obj.type === 'GENERIC' && obj.content && obj.content.length > 500 && obj.content.includes('File Path:')) {
       // Look at the first line or so to find the file path
       const firstLines = obj.content.substring(0, 300);
       for (const {p, m} of matchers) {
          if (m(firstLines)) {
             const lines = obj.content.split('\n');
             const cleanLines = [];
             let inCode = false;
             
             for (const l of lines) {
                if (l.match(/^\d+:/)) {
                   inCode = true;
                   const idx = l.indexOf(':');
                   let code = l.substring(idx + 1);
                   if (code.startsWith(' ')) code = code.substring(1);
                   cleanLines.push(code);
                } else if (inCode) {
                   if (l.trim() === '') cleanLines.push('');
                }
             }
             
             if (cleanLines.length > 20) {
                contents[p] = cleanLines.join('\n');
             }
          }
       }
    }
  }
  
  for (const [tf, content] of Object.entries(contents)) {
     fs.writeFileSync(tf, content);
     console.log('Restored', tf, 'Lines:', content.split('\n').length);
  }
}
run();
