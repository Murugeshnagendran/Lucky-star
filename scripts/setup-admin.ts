/**
 * Lucky Star — Secure Admin Setup Script
 * 
 * This script creates the first admin user using the Firebase Admin SDK.
 * It runs SERVER-SIDE ONLY and requires a service account key.
 * 
 * The service account key must NEVER be exposed to the browser or committed to git.
 * 
 * Prerequisites:
 *   1. Firebase Console → Project Settings → Service Accounts → Generate New Private Key
 *   2. Save the downloaded JSON as: scripts/serviceAccountKey.json
 *   3. Ensure scripts/serviceAccountKey.json is in .gitignore (already configured)
 * 
 * Usage:
 *   npx tsx scripts/setup-admin.ts <user-email>
 * 
 * Example:
 *   npx tsx scripts/setup-admin.ts admin@luckystar.com
 * 
 * What it does:
 *   1. Initializes Firebase Admin SDK with the service account
 *   2. Looks up the user by email in Firebase Authentication
 *   3. Sets their role to 'admin' in the Firestore users/{uid} document
 *   4. Only works when run with valid service account credentials
 *   5. Cannot be triggered from the browser
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ─── Validate Arguments ────────────────────────────────────────────────────────

const email = process.argv[2];

if (!email) {
  console.error('\\n❌ Usage: npx tsx scripts/setup-admin.ts <user-email>');
  console.error('\\n   Example: npx tsx scripts/setup-admin.ts admin@luckystar.com\\n');
  process.exit(1);
}

// ─── Load Service Account Key ──────────────────────────────────────────────────

const serviceAccountPath = resolve(__dirname, 'serviceAccountKey.json');

let serviceAccount: Record<string, string>;
try {
  const raw = readFileSync(serviceAccountPath, 'utf-8');
  serviceAccount = JSON.parse(raw);
} catch {
  console.error('\\n❌ Could not read service account key.');
  console.error(`   Expected file at: ${serviceAccountPath}`);
  console.error('\\n   To generate one:');
  console.error('   1. Go to Firebase Console → Project Settings → Service Accounts');
  console.error('   2. Click "Generate New Private Key"');
  console.error('   3. Save the file as scripts/serviceAccountKey.json\\n');
  process.exit(1);
}

// ─── Initialize Firebase Admin ─────────────────────────────────────────────────

const app = initializeApp({
  credential: cert(serviceAccount),
});

const auth = getAuth(app);
const db = getFirestore(app);

// ─── Set Admin Role ────────────────────────────────────────────────────────────

async function setupAdmin() {
  console.log(`\\n🔍 Looking up user: ${email}...`);

  try {
    // Find the user by email in Firebase Auth
    const userRecord = await auth.getUserByEmail(email);
    console.log(`✅ Found user: ${userRecord.displayName || userRecord.email} (${userRecord.uid})`);

    // Check if user document exists in Firestore
    const userDocRef = db.collection('users').doc(userRecord.uid);
    const userDoc = await userDocRef.get();

    if (userDoc.exists) {
      const currentRole = userDoc.data()?.role;
      if (currentRole === 'admin') {
        console.log(`ℹ️  User is already an admin. No changes made.\\n`);
        process.exit(0);
      }

      // Update existing document
      await userDocRef.update({
        role: 'admin',
        updatedAt: FieldValue.serverTimestamp(),
      });
      console.log(`✅ Updated role from '${currentRole}' to 'admin'`);
    } else {
      // Create new user document
      await userDocRef.set({
        name: userRecord.displayName || email.split('@')[0],
        email: userRecord.email,
        phone: userRecord.phoneNumber || '',
        role: 'admin',
        addresses: [],
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      console.log(`✅ Created admin user document`);
    }

    console.log(`\\n🎉 Success! ${email} is now an admin.`);
    console.log(`   They can log in at: /admin/login\\n`);
    process.exit(0);

  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error) {
      const firebaseError = error as { code: string; message: string };
      if (firebaseError.code === 'auth/user-not-found') {
        console.error(`\\n❌ No user found with email: ${email}`);
        console.error('   The user must first register at the Lucky Star website.\\n');
        process.exit(1);
      }
    }
    console.error('\\n❌ Error:', error);
    process.exit(1);
  }
}

setupAdmin();
