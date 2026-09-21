const { MongoClient } = require('mongodb');
const fs = require('fs');

const envLocal = fs.readFileSync('.env.local', 'utf8');
envLocal.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)="?(.*?)"?$/);
  if (match) {
    process.env[match[1]] = match[2];
  }
});

async function runTest() {
  console.log('Testing MongoDB connection...');
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    console.log('Successfully connected to MongoDB Atlas!');
    await client.db().command({ ping: 1 });
    console.log('Pinged your deployment.');
  } catch (err) {
    console.error('Connection failed:', err.message);
  } finally {
    await client.close();
  }
}

runTest();
