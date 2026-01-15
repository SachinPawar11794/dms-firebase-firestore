/**
 * Script to create user document in Firestore
 * 
 * Usage:
 *   ts-node scripts/create-firestore-user.ts <uid> <email> "<displayName>"
 * 
 * Example:
 *   ts-node scripts/create-firestore-user.ts abc123xyz dms@dhananjaygroup.com "Admin User"
 * 
 * Or if you want to create Auth user too (requires permissions):
 *   ts-node scripts/create-firestore-user.ts --create-auth <email> <password> "<displayName>"
 */

import { db, auth } from '../src/config/firebase.config';
import { Timestamp } from 'firebase-admin/firestore';

async function createFirestoreUser(uid: string, email: string, displayName: string) {
  try {
    console.log('Creating user document in Firestore...');

    const modulePermissions = {
      employeeTaskManager: ['read', 'write', 'delete', 'admin'],
      pms: ['read', 'write', 'delete', 'admin'],
      humanResource: ['read', 'write', 'delete', 'admin'],
      maintenance: ['read', 'write', 'delete', 'admin'],
    };

    const now = Timestamp.now();

    const userData = {
      email,
      displayName,
      role: 'admin',
      modulePermissions,
      createdAt: now,
      updatedAt: now,
      isActive: true,
    };

    await db.collection('users').doc(uid).set(userData);

    console.log('\n✅ User document created successfully in Firestore!');
    console.log(`   UID: ${uid}`);
    console.log(`   Email: ${email}`);
    console.log(`   Display Name: ${displayName}`);
    console.log(`   Role: admin`);
    console.log(`   Permissions: Full access to all modules`);
  } catch (error: any) {
    console.error('❌ Error creating user document:', error.message);
    process.exit(1);
  }
}

async function createAuthUserAndFirestore(email: string, password: string, displayName: string) {
  try {
    console.log('Creating Firebase Auth user...');

    // Create Auth user
    const userRecord = await auth.createUser({
      email,
      password,
      displayName,
      emailVerified: true,
    });

    console.log('✅ Firebase Auth user created:', userRecord.uid);

    // Create Firestore document
    await createFirestoreUser(userRecord.uid, email, displayName);
  } catch (error: any) {
    console.error('❌ Error creating user:', error.message);
    if (error.code === 'auth/email-already-exists') {
      console.error('   User with this email already exists in Firebase Auth');
      console.error('   Please use the UID method instead:');
      console.error(`   ts-node scripts/create-firestore-user.ts <uid> ${email} "${displayName}"`);
    }
    process.exit(1);
  }
}

// Get command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Usage:');
  console.error('  Method 1 (Firestore only - if Auth user already exists):');
  console.error('    ts-node scripts/create-firestore-user.ts <uid> <email> "<displayName>"');
  console.error('');
  console.error('  Method 2 (Create both Auth user and Firestore document):');
  console.error('    ts-node scripts/create-firestore-user.ts --create-auth <email> <password> "<displayName>"');
  console.error('');
  console.error('Examples:');
  console.error('  ts-node scripts/create-firestore-user.ts abc123xyz dms@example.com "Admin User"');
  console.error('  ts-node scripts/create-firestore-user.ts --create-auth admin@example.com password123 "Admin User"');
  process.exit(1);
}

if (args[0] === '--create-auth') {
  // Method 2: Create both Auth user and Firestore document
  if (args.length < 4) {
    console.error('Error: Missing arguments');
    console.error('Usage: ts-node scripts/create-firestore-user.ts --create-auth <email> <password> "<displayName>"');
    process.exit(1);
  }
  const [, email, password, displayName] = args;
  createAuthUserAndFirestore(email, password, displayName)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
} else {
  // Method 1: Create Firestore document only (Auth user already exists)
  if (args.length < 3) {
    console.error('Error: Missing arguments');
    console.error('Usage: ts-node scripts/create-firestore-user.ts <uid> <email> "<displayName>"');
    process.exit(1);
  }
  const [uid, email, displayName] = args;
  createFirestoreUser(uid, email, displayName)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
