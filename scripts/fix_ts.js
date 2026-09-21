const fs = require('fs');

// Fix categories/page.tsx
let c = fs.readFileSync('src/app/(storefront)/categories/page.tsx', 'utf8');
c = c.replace(/useEffect\(\(\) => \{\n\s*const q = query\([\s\S]*?return \(\) => unsubscribe\(\);\n\s*\}\, \[\]\);/, `
  useEffect(() => {
    const fetchCategories = async () => {
       const { data } = await supabase.from('categories').select('*').order('name');
       if (data) {
          const mapped = data.map(d => ({
             id: d.id, name: d.name, slug: d.slug, description: d.description,
             imageUrl: d.image_url, enabled: d.enabled
          }));
          setCategories(mapped as any);
       }
       setLoading(false);
    };
    fetchCategories();
  }, []);
`);
fs.writeFileSync('src/app/(storefront)/categories/page.tsx', c);

// Fix categories/[slug]/page.tsx
let cs = fs.readFileSync('src/app/(storefront)/categories/[slug]/page.tsx', 'utf8');
cs = cs.replace(/const { data: categories } = await supabase.from\('categories'\).select\('\*'\);\nif\(!categories\) return <div>Category not found<\/div>;/, '');
cs = cs.replace(/const \[categories\] = await Promise\.all\(\[[\s\S]*?\]\);/, "const { data: categories } = await supabase.from('categories').select('*');\n    if(!categories) return <div>Category not found</div>;");
fs.writeFileSync('src/app/(storefront)/categories/[slug]/page.tsx', cs);

// Fix furniture/page.tsx
let f = fs.readFileSync('src/app/(storefront)/furniture/page.tsx', 'utf8');
f = f.replace(/Timestamp\.fromDate\(new Date\('2024-05-15'\)\)/g, "new Date('2024-05-15').toISOString()");
f = f.replace(/Timestamp\.fromDate\(new Date\('2024-06-10'\)\)/g, "new Date('2024-06-10').toISOString()");
f = f.replace(/Timestamp\.fromDate\(new Date\('2024-07-02'\)\)/g, "new Date('2024-07-02').toISOString()");
f = f.replace(/Timestamp\.fromDate\(new Date\('2024-08-20'\)\)/g, "new Date('2024-08-20').toISOString()");
f = f.replace(/Timestamp\.fromDate\(new Date\('2024-09-01'\)\)/g, "new Date('2024-09-01').toISOString()");
f = f.replace(/Timestamp\.fromDate\(new Date\('2024-09-05'\)\)/g, "new Date('2024-09-05').toISOString()");
f = f.replace(/Timestamp\.fromDate\(new Date\('2024-09-12'\)\)/g, "new Date('2024-09-12').toISOString()");
f = f.replace(/Timestamp\.fromDate\(new Date\('2024-09-14'\)\)/g, "new Date('2024-09-14').toISOString()");
f = f.replace(/Timestamp\.fromDate\(new Date\('2024-09-15'\)\)/g, "new Date('2024-09-15').toISOString()");
f = f.replace(/Timestamp\.fromDate\(new Date\('2024-09-16'\)\)/g, "new Date('2024-09-16').toISOString()");
fs.writeFileSync('src/app/(storefront)/furniture/page.tsx', f);

// Fix types in products, products/[slug], availability
function fixTypes(p) {
    let t = fs.readFileSync(p, 'utf8');
    t = t.replace(/setBrands\(brands\);/g, "setBrands(brands as any);");
    t = t.replace(/setCategories\(categories\);/g, "setCategories(categories as any);");
    t = t.replace(/getDocuments<Category>\(collections.categories\)/g, "supabase.from('categories').select('*').eq('enabled', true).then(res => res.data as any)");
    t = t.replace(/getDocuments<Brand>\(collections.brands\)/g, "supabase.from('brands').select('*').eq('enabled', true).then(res => res.data as any)");
    fs.writeFileSync(p, t);
}
fixTypes('src/app/(storefront)/products/page.tsx');
fixTypes('src/app/(storefront)/products/[slug]/page.tsx');
fixTypes('src/app/(storefront)/availability/page.tsx');
fixTypes('src/app/(storefront)/categories/[slug]/page.tsx');

// Fix account
let a = fs.readFileSync('src/app/(storefront)/account/page.tsx', 'utf8');
a = a.replace(/const n = e\.target\.value/g, 'const n: any = e.target.value');
fs.writeFileSync('src/app/(storefront)/account/page.tsx', a);

console.log('Fixed more TS errors');
