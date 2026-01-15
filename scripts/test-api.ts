/**
 * API Testing Script
 * Tests all API endpoints with proper authentication
 * 
 * Usage:
 *   ts-node scripts/test-api.ts <email> <password>
 * 
 * Example:
 *   ts-node scripts/test-api.ts dms@dhananjaygroup.com password123
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

// Initialize Firebase (client SDK for authentication)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Verify config
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain) {
  console.error('❌ Error: Firebase configuration missing from .env file');
  console.error('Required variables: FIREBASE_API_KEY, FIREBASE_AUTH_DOMAIN, etc.');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'skip';
  message?: string;
  data?: any;
}

const results: TestResult[] = [];

async function getAuthToken(email: string, password: string): Promise<string> {
  try {
    // Verify Firebase config is loaded
    if (!firebaseConfig.apiKey) {
      throw new Error('Firebase API key not found. Check your .env file.');
    }

    console.log('Attempting to sign in...');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();
    return token;
  } catch (error: any) {
    if (error.code === 'auth/invalid-credential') {
      throw new Error(`Invalid credentials. Please verify:\n  1. User exists in Firebase Authentication\n  2. Email: ${email}\n  3. Password is correct\n\nTo create user in Firebase Auth:\n  - Go to Firebase Console → Authentication → Users → Add user`);
    }
    throw new Error(`Authentication failed: ${error.message} (Code: ${error.code || 'unknown'})`);
  }
}

async function testEndpoint(
  name: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  url: string,
  token: string,
  data?: any
): Promise<void> {
  try {
    const config: any = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);

    results.push({
      name,
      status: response.status >= 200 && response.status < 300 ? 'pass' : 'fail',
      message: `Status: ${response.status}`,
      data: response.data,
    });

    console.log(`✅ ${name}: ${response.status} ${response.statusText}`);
  } catch (error: any) {
    const status = error.response?.status || 'N/A';
    const message = error.response?.data?.error?.message || error.message;

    results.push({
      name,
      status: 'fail',
      message: `Error: ${status} - ${message}`,
    });

    console.log(`❌ ${name}: ${status} - ${message}`);
  }
}

async function runTests(email: string, password: string) {
  console.log('🧪 Starting API Tests...\n');
  console.log(`Base URL: ${BASE_URL}\n`);

  // Get authentication token
  console.log('🔐 Authenticating...');
  let token: string;
  try {
    token = await getAuthToken(email, password);
    console.log('✅ Authentication successful\n');
  } catch (error: any) {
    console.error('❌ Authentication failed:', error.message);
    process.exit(1);
  }

  // Health Check (no auth required)
  console.log('📋 Testing Health Endpoint...');
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    results.push({
      name: 'Health Check',
      status: response.status === 200 ? 'pass' : 'fail',
      message: `Status: ${response.status}`,
    });
    console.log(`✅ Health Check: ${response.status}\n`);
  } catch (error: any) {
    results.push({
      name: 'Health Check',
      status: 'fail',
      message: error.message,
    });
    console.log(`❌ Health Check: ${error.message}\n`);
  }

  // User Endpoints
  console.log('👤 Testing User Endpoints...');
  await testEndpoint('Get Current User', 'GET', '/api/v1/users/me', token);
  await testEndpoint('Get All Users', 'GET', '/api/v1/users?page=1&limit=10', token);
  console.log('');

  // Task Endpoints
  console.log('📋 Testing Task Endpoints...');
  await testEndpoint('Get All Tasks', 'GET', '/api/v1/employee-task-manager/tasks?page=1&limit=10', token);
  
  // Create a test task
  const testTask = {
    title: 'Test Task',
    description: 'This is a test task created by API test script',
    assignedTo: 'test-user-id', // Replace with actual user ID if needed
    assignedBy: 'test-user-id',
    priority: 'medium',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
  };
  
  await testEndpoint('Create Task', 'POST', '/api/v1/employee-task-manager/tasks', token, testTask);
  console.log('');

  // Production Endpoints
  console.log('🏭 Testing Production Endpoints...');
  await testEndpoint('Get All Productions', 'GET', '/api/v1/pms/productions?page=1&limit=10', token);
  console.log('');

  // Employee Endpoints
  console.log('👥 Testing Employee Endpoints...');
  await testEndpoint('Get All Employees', 'GET', '/api/v1/human-resource/employees?page=1&limit=10', token);
  console.log('');

  // Maintenance Endpoints
  console.log('🔧 Testing Maintenance Endpoints...');
  await testEndpoint('Get All Maintenance Requests', 'GET', '/api/v1/maintenance/requests?page=1&limit=10', token);
  await testEndpoint('Get All Equipment', 'GET', '/api/v1/maintenance/equipment?page=1&limit=10', token);
  console.log('');

  // Print Summary
  console.log('\n📊 Test Summary:');
  console.log('='.repeat(50));
  const passed = results.filter((r) => r.status === 'pass').length;
  const failed = results.filter((r) => r.status === 'fail').length;
  const total = results.length;

  results.forEach((result) => {
    const icon = result.status === 'pass' ? '✅' : '❌';
    console.log(`${icon} ${result.name}: ${result.message || result.status}`);
  });

  console.log('='.repeat(50));
  console.log(`Total: ${total} | Passed: ${passed} | Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

  if (failed > 0) {
    process.exit(1);
  }
}

// Get command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('Usage: ts-node scripts/test-api.ts <email> <password>');
  console.error('Example: ts-node scripts/test-api.ts dms@dhananjaygroup.com password123');
  process.exit(1);
}

const [email, password] = args;

runTests(email, password)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
