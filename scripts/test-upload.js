const fs = require('fs');
const path = require('path');
const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

const envLocal = fs.readFileSync('.env.local', 'utf8');
envLocal.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)="?(.*?)"?$/);
  if (match) {
    process.env[match[1]] = match[2];
  }
});

async function runTest() {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });

  const uid = 'test-admin-uid';
  await getFirestore().collection('users').doc(uid).set({ role: 'admin' }, { merge: true });
  const customToken = await getAuth().createCustomToken(uid);
  
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: customToken, returnSecureToken: true }),
  });
  
  const authData = await res.json();
  const idToken = authData.idToken;

  const imagePath = 'test-image.jpg';
  const imgBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
  fs.writeFileSync(imagePath, imgBuffer);

  const formData = new FormData();
  const blob = new Blob([imgBuffer], { type: 'image/png' });
  formData.append('file', blob, 'test-image.png');

  console.log('Sending image to Next.js server...');
  const uploadRes = await fetch('http://localhost:3000/api/admin/products/images', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${idToken}` },
    body: formData
  });

  console.log('Image upload status:', uploadRes.status);
  const uploadData = await uploadRes.json();
  console.log('Image Data:', uploadData);

  if (uploadData.url) {
    console.log('Testing product save...');
    const productSaveRes = await fetch('http://localhost:3000/api/admin/products', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test Product',
        categoryId: 'test-cat',
        brandId: 'test-brand',
        price: 99.99,
        images: [uploadData],
        primaryImage: uploadData
      })
    });
    console.log('Product save status:', productSaveRes.status);
    const saveResult = await productSaveRes.json();
    console.log('Save Result:', saveResult);
  }

  process.exit(0);
}

runTest().catch(console.error);
