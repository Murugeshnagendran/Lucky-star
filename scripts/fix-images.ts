import fs from 'fs';
import path from 'path';

const walkSync = (dir: string, filelist: string[] = []): string[] => {
  if (!fs.existsSync(dir)) return filelist;
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith('.tsx') || dirFile.endsWith('.ts')) {
        filelist.push(dirFile);
      }
    }
  });
  return filelist;
};

const files = walkSync(path.join(process.cwd(), 'src/app'));
files.push(path.join(process.cwd(), 'src/components/ui/ProductCard.tsx'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  let changed = false;

  if (content.includes('product.primaryImage') && !content.includes('getImageUrl(')) {
    content = content.replace(/product\.primaryImage/g, 'getImageUrl(product.primaryImage)');
    if (!content.includes('getImageUrl')) {
      content = `import { getImageUrl } from '@/lib/utils/image';\n` + content;
    }
    changed = true;
  }
  
  if (content.includes('p.primaryImage') && !content.includes('getImageUrl(')) {
    content = content.replace(/p\.primaryImage/g, 'getImageUrl(p.primaryImage)');
    if (!content.includes('getImageUrl')) {
      content = `import { getImageUrl } from '@/lib/utils/image';\n` + content;
    }
    changed = true;
  }

  // Clean up the accidental inject in categories/[slug]/page.tsx
  if (content.includes('import { getImageUrl } from \'@/lib/utils/image\';\n//...')) {
    content = content.replace(`import { getImageUrl } from '@/lib/utils/image';\n//...\n`, '');
    if (!content.includes(`import { getImageUrl } from '@/lib/utils/image';`)) {
      content = `import { getImageUrl } from '@/lib/utils/image';\n` + content;
    }
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`Updated ${file}`);
  }
});
