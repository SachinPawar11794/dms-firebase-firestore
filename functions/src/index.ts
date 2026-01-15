import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// Example: HTTP Cloud Function
export const helloWorld = functions.https.onRequest((request, response) => {
  response.json({ message: 'Hello from Firebase Functions!' });
});

// Example: Firestore Trigger
export const onUserCreate = functions.firestore
  .document('users/{userId}')
  .onCreate(async (snap, context) => {
    const userData = snap.data();
    console.log('New user created:', userData);
    // Add any additional logic here
  });
