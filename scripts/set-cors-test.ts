import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const serviceAccount = JSON.parse(readFileSync(resolve(__dirname, 'serviceAccountKey.json'), 'utf-8'));

const app = initializeApp({
  credential: cert(serviceAccount),
});

const BUCKET_NAME = 'lucky-star-cc2af.firebasestorage.app';

async function setCors() {
  try {
    const bucket = getStorage(app).bucket(BUCKET_NAME);
    
    // First, verify bucket exists
    const [exists] = await bucket.exists();
    if (!exists) {
      console.error(`Bucket ${BUCKET_NAME} does not exist.`);
      
      // Let's check appspot
      const appspotBucket = getStorage(app).bucket('lucky-star-cc2af.appspot.com');
      const [appspotExists] = await appspotBucket.exists();
      if (appspotExists) {
        console.log('Found lucky-star-cc2af.appspot.com instead! Setting CORS on it...');
        await appspotBucket.setCorsConfiguration([{
          origin: ['*'],
          method: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
          maxAgeSeconds: 3600,
          responseHeader: ['Content-Type', 'Authorization', 'Content-Length', 'User-Agent', 'x-goog-resumable'],
        }]);
        console.log('✅ CORS set on appspot bucket');
      }
      return;
    }

    const corsConfiguration = [
      {
        origin: ['*'],
        method: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        maxAgeSeconds: 3600,
        responseHeader: ['Content-Type', 'Authorization', 'Content-Length', 'User-Agent', 'x-goog-resumable'],
      },
    ];
    
    await bucket.setCorsConfiguration(corsConfiguration);
    console.log(`✅ CORS configuration successfully updated for Firebase Storage bucket: ${BUCKET_NAME}`);
  } catch (error) {
    console.error('❌ Error setting CORS configuration:', error);
  }
}

setCors();
