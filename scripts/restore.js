const fs = require('fs');

const filesToRestore = [
  'src/app/(storefront)/page.tsx',
  'src/app/(storefront)/products/page.tsx',
  'src/app/(storefront)/categories/page.tsx',
  'src/app/(storefront)/categories/[slug]/page.tsx',
  'src/app/(storefront)/products/[slug]/page.tsx',
  'src/app/(storefront)/availability/page.tsx',
  'src/app/(storefront)/wishlist/page.tsx',
  'src/app/(storefront)/account/page.tsx',
  'src/app/(storefront)/furniture/page.tsx',
  'src/app/(storefront)/offers/page.tsx',
  'src/app/(storefront)/search/page.tsx',
  'src/components/HomePageCategories.tsx',
  'src/components/storefront/Header.tsx',
  'src/components/storefront/Footer.tsx',
  'src/components/storefront/MobileNav.tsx',
  'src/components/ui/ProductCard.tsx',
  'src/components/ui/index.ts',
  'src/app/(storefront)/layout.tsx'
];

const extracted = JSON.parse(fs.readFileSync('extracted_old_files.json', 'utf8'));

let restoredCount = 0;

for (const relPath of filesToRestore) {
   // Normalize relPath for matching
   const normalizedRelPath = relPath.replace(/\//g, '\\');
   
   const absPathMatches = Object.keys(extracted).filter(k => k.endsWith(normalizedRelPath));
   if (absPathMatches.length > 0) {
      const match = absPathMatches[0];
      const rawContent = extracted[match];
      
      const lines = rawContent.split('\n');
      const cleanLines = [];
      let inCode = false;
      
      for (const line of lines) {
         if (line.match(/^\d+:/)) {
            inCode = true;
            // Extract the actual line content
            const idx = line.indexOf(':');
            let content = line.substring(idx + 1);
            if (content.startsWith(' ')) content = content.substring(1);
            cleanLines.push(content);
         } else if (inCode) {
            if (line.trim() === '') {
                cleanLines.push('');
            }
         }
      }
      
      fs.writeFileSync(relPath, cleanLines.join('\n'));
      console.log('Restored', relPath);
      restoredCount++;
   } else {
      console.log('No backup found for', relPath);
   }
}

console.log('Restoration complete! Total restored:', restoredCount);
