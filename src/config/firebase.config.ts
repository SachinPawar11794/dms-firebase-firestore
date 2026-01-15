import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

// Initialize Firebase Admin SDK
let app;
if (getApps().length === 0) {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || 'dhananjaygroup-dms';
  
  // For Cloud Run, use Application Default Credentials (ADC)
  // For local development, use service account key file or environment variables
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    // Use service account key file path
    const serviceAccountPath = path.resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    const serviceAccount = require(serviceAccountPath);
    app = initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id || projectId,
    });
  } else if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    // Use individual environment variables
    const serviceAccount: ServiceAccount = {
      projectId: projectId,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
    app = initializeApp({
      credential: cert(serviceAccount),
      projectId: projectId,
    });
  } else {
    // Use Application Default Credentials (for Cloud Run)
    // This will automatically use the service account attached to the Cloud Run service
    app = initializeApp({
      projectId: projectId,
    });
  }
} else {
  app = getApps()[0];
}

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

export default app;
