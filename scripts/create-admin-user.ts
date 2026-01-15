/**
 * Script to create the first admin user
 * 
 * Usage:
 *   ts-node scripts/create-admin-user.ts <email> <password> <displayName>
 * 
 * Example:
 *   ts-node scripts/create-admin-user.ts admin@example.com SecurePass123 "Admin User"
 */

import { auth, db } from '../src/config/firebase.config';
import { Timestamp } from 'firebase-admin/firestore';

async function createAdminUser(email: string, password: string, displayName: string) {
  try {
    console.log('Creating admin user...');

    // Create Firebase Auth user
    const userRecord = await auth.createUser({
      email,
      password,
      displayName,
      emailVerified: true,
    });

    console.log('Firebase Auth user created:', userRecord.uid);

    // Create user document in Firestore with admin permissions
    const modulePermissions = {
      employeeTaskManager: ['read', 'write', 'delete', 'admin'],
      pms: ['read', 'write', 'delete', 'admin'],
      humanResource: ['read', 'write', 'delete', 'admin'],
      maintenance: ['read', 'write', 'delete', 'admin'],
    };

    await db.collection('users').doc(userRecord.uid).set({
      email,
      displayName,
      role: 'admin',
      modulePermissions,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      isActive: true,
    });

    console.log('User document created in Firestore');
    console.log('\n✅ Admin user created successfully!');
    console.log(`   Email: ${email}`);
    console.log(`   UID: ${userRecord.uid}`);
    console.log(`   Role: admin`);
    console.log(`   Permissions: Full access to all modules`);
  } catch (error: any) {
    console.error('❌ Error creating admin user:', error.message);
    if (error.code === 'auth/email-already-exists') {
      console.error('   User with this email already exists');
    }
    process.exit(1);
  }
}

// Get command line arguments
const args = process.argv.slice(2);

if (args.length < 3) {
  console.error('Usage: ts-node scripts/create-admin-user.ts <email> <password> <displayName>');
  console.error('Example: ts-node scripts/create-admin-user.ts admin@example.com SecurePass123 "Admin User"');
  process.exit(1);
}

const [email, password, displayName] = args;

createAdminUser(email, password, displayName)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
