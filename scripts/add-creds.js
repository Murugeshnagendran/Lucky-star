const fs = require('fs');
const data = JSON.parse(fs.readFileSync('scripts/serviceAccountKey.json', 'utf8'));
const envPath = '.env.local';
let envContent = fs.readFileSync(envPath, 'utf8');

if (!envContent.includes('FIREBASE_CLIENT_EMAIL')) {
  envContent += `\nFIREBASE_CLIENT_EMAIL="${data.client_email}"`;
  envContent += `\nFIREBASE_PRIVATE_KEY="${data.private_key.replace(/\n/g, '\\n')}"\n`;
  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log('Added credentials');
} else {
  console.log('Credentials already exist');
}
