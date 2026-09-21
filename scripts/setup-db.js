const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function main() {
  const connectionString = 'postgresql://postgres:[Murugesh9080]@db.azasqdafiwfldxpirgba.supabase.co:5432/postgres';
  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL');

    const schemaPath = path.join(__dirname, '../supabase/schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    await client.query(sql);
    console.log('Schema executed successfully!');
  } catch (error) {
    console.error('Error executing schema:', error);
  } finally {
    await client.end();
  }
}

main();
