const fs = require('fs');

function migrateFile(filePath, replacements) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Global replacements
    content = content.replace(/import \{ db \} from '@\/lib\/firebase\/config';/g, "import { supabase } from '@/lib/supabase/client';");
    content = content.replace(/import \{ collection, onSnapshot, query, where, getDocs \} from 'firebase\/firestore';/g, '');
    content = content.replace(/import \{ collection, query, where, getDocs \} from 'firebase\/firestore';/g, '');
    content = content.replace(/import \{ collection, onSnapshot, query \} from 'firebase\/firestore';/g, '');
    content = content.replace(/import \{ collections, getDocuments \} from '@\/lib\/firebase\/firestore';/g, "import { supabase } from '@/lib/supabase/client';");
    content = content.replace(/import \{ Timestamp \} from 'firebase\/firestore';/g, '');
    
    // Auth replacements
    content = content.replace(/user\.uid/g, 'user.id');
    content = content.replace(/user\.displayName/g, 'user.user_metadata?.name');
    content = content.replace(/e\.createdAt\?\.toDate \? e\.createdAt\.toDate\(\)\.toLocaleDateString/g, 'e.created_at ? new Date(e.created_at).toLocaleDateString');
    
    for (const {from, to} of replacements) {
        content = content.replace(from, to);
    }
    
    fs.writeFileSync(filePath, content);
    console.log('Migrated', filePath);
}

migrateFile('src/app/(storefront)/account/page.tsx', []);

migrateFile('src/app/(storefront)/categories/page.tsx', [
  {
    from: /const q = query\(collection\(db, 'categories'\)\);\n\s*const unsubscribe = onSnapshot\(q, \(snapshot\) => \{\n\s*const categoriesData: Category\[\] = \[\];\n\s*snapshot\.forEach\(\(doc\) => \{\n\s*categoriesData\.push\(\{ id: doc\.id, \.\.\.doc\.data\(\) \} as Category\);\n\s*\}\);\n\s*setCategories\(categoriesData\);\n\s*setLoading\(false\);\n\s*\}\);/g,
    to: `
    const fetchCategories = async () => {
       const { data } = await supabase.from('categories').select('*').order('name');
       if (data) {
          const mapped = data.map(d => ({
             id: d.id, name: d.name, slug: d.slug, description: d.description,
             imageUrl: d.image_url, enabled: d.enabled
          }));
          setCategories(mapped);
       }
       setLoading(false);
    };
    fetchCategories();
    `
  },
  {
    from: /return \(\) => unsubscribe\(\);/g,
    to: ''
  }
]);

migrateFile('src/app/(storefront)/categories/[slug]/page.tsx', [
  {
    from: /const \[categories\] = await Promise\.all\(\[\n\s*getDocuments<Category>\(collections\.categories\),\n\s*\]\);/g,
    to: "const { data: categories } = await supabase.from('categories').select('*');\nif(!categories) return <div>Category not found</div>;"
  }
]);

// Wait, the products/page.tsx had a duplicate code block in the transcript, I should replace it completely.
// Actually, it's easier to use replace_file_content or a robust script.
