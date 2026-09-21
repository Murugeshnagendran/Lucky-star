const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:Murugesh9080@db.azasqdafiwfldxpirgba.supabase.co:5432/postgres' });
client.connect().then(async () => {
  const buckets = await client.query("SELECT id, name, public FROM storage.buckets");
  console.log('Buckets:', buckets.rows);
  
  const policies = await client.query("SELECT policyname, permissive, roles, cmd, qual, with_check FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects'");
  console.log('Policies on storage.objects:', policies.rows);
  
  client.end();
}).catch(console.error);
