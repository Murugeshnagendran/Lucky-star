const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:Murugesh9080@db.azasqdafiwfldxpirgba.supabase.co:5432/postgres'
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to Supabase DB successfully!');
    const res = await client.query('SELECT table_name FROM information_schema.tables WHERE table_schema = $1', ['public']);
    console.log(res.rows.map(r => r.table_name));
    await client.end();
  } catch(e) {
    console.error(e.message);
    process.exit(1);
  }
}
run();
