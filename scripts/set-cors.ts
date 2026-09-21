import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const serviceAccountPath = resolve(__dirname, 'serviceAccountKey.json');
let serviceAccount: any;

try {
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));
} catch (e) {
  console.error('Error reading serviceAccountKey.json. Please make sure it exists in the scripts directory.');
  process.exit(1);
}

const app = initializeApp({
  credential: cert(serviceAccount),
});

// User needs to replace this with their actual bucket name if it differs
const BUCKET_NAME = 'lucky-star-cc2af.firebasestorage.app';

async function setCors() {
  try {
    const storage = getStorage(app);
    const bucket = storage.bucket(BUCKET_NAME);
    
    const corsConfiguration = [
      {
        origin: ['*'], // Allow all origins for local development
        method: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        maxAgeSeconds: 3600,
        responseHeader: ['Content-Type', 'Authorization', 'Content-Length', 'User-Agent', 'x-goog-resumable'],
      },
    ];
    
    console.log(`Attempting to set CORS on bucket: ${BUCKET_NAME}...`);
    await bucket.setCorsConfiguration(corsConfiguration);
    console.log(`✅ CORS configuration successfully updated for Firebase Storage bucket: ${BUCKET_NAME}`);
  } catch (error) {
    console.error('❌ Error setting CORS configuration:', error);
    console.error('\\nIf you see a 404 or "does not exist" error, make sure you have visited the Firebase Console -> Build -> Storage and clicked "Get Started" to initialize your default bucket!');
  }
}

setCors();
