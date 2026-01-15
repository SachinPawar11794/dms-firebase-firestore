/**
 * Script to verify Firebase setup and configuration
 */

import * as dotenv from 'dotenv';
import { db, auth } from '../src/config/firebase.config';

dotenv.config();

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
}

async function verifySetup(): Promise<void> {
  const results: CheckResult[] = [];

  console.log('🔍 Verifying Firebase Setup...\n');

  // Check environment variables
  console.log('Checking environment variables...');
  const requiredEnvVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_SERVICE_ACCOUNT_KEY',
  ];

  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      results.push({
        name: `Environment: ${envVar}`,
        status: 'pass',
        message: '✓ Set',
      });
    } else {
      results.push({
        name: `Environment: ${envVar}`,
        status: 'fail',
        message: '✗ Missing',
      });
    }
  }

  // Check Firebase connection
  console.log('Checking Firebase connection...');
  try {
    // Try to access Firestore
    await db.collection('_test').limit(1).get();
    results.push({
      name: 'Firestore Connection',
      status: 'pass',
      message: '✓ Connected',
    });
  } catch (error: any) {
    results.push({
      name: 'Firestore Connection',
      status: 'fail',
      message: `✗ Failed: ${error.message}`,
    });
  }

  // Check Auth connection
  try {
    await auth.listUsers(1);
    results.push({
      name: 'Auth Connection',
      status: 'pass',
      message: '✓ Connected',
    });
  } catch (error: any) {
    results.push({
      name: 'Auth Connection',
      status: 'fail',
      message: `✗ Failed: ${error.message}`,
    });
  }

  // Check if users collection exists and has data
  try {
    const usersSnapshot = await db.collection('users').limit(1).get();
    if (usersSnapshot.empty) {
      results.push({
        name: 'Users Collection',
        status: 'warning',
        message: '⚠ Collection exists but is empty (create an admin user)',
      });
    } else {
      results.push({
        name: 'Users Collection',
        status: 'pass',
        message: '✓ Collection exists with data',
      });
    }
  } catch (error: any) {
    results.push({
      name: 'Users Collection',
      status: 'warning',
      message: '⚠ Collection may not exist yet (this is OK for new setup)',
    });
  }

  // Print results
  console.log('\n📊 Verification Results:\n');
  results.forEach((result) => {
    const icon = result.status === 'pass' ? '✓' : result.status === 'fail' ? '✗' : '⚠';
    const color = result.status === 'pass' ? '\x1b[32m' : result.status === 'fail' ? '\x1b[31m' : '\x1b[33m';
    console.log(`${color}${icon}\x1b[0m ${result.name}: ${result.message}`);
  });

  const failed = results.filter((r) => r.status === 'fail').length;
  const warnings = results.filter((r) => r.status === 'warning').length;

  console.log('\n');
  if (failed === 0) {
    console.log('✅ Setup verification complete!');
    if (warnings > 0) {
      console.log(`⚠️  ${warnings} warning(s) - review above`);
    }
  } else {
    console.log(`❌ Setup verification failed with ${failed} error(s)`);
    console.log('   Please fix the errors above before proceeding');
    process.exit(1);
  }
}

verifySetup()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error during verification:', error);
    process.exit(1);
  });
