# Firestore Setup Guide

This guide will walk you through setting up Firestore for the DMS Firebase Firestore application.

## Prerequisites

- Google account
- Firebase account (free tier is sufficient)
- Firebase CLI installed (`npm install -g firebase-tools`)

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name (e.g., "DMS Firebase Firestore")
4. Click **Continue**
5. **Disable** Google Analytics (optional, can enable later)
6. Click **Create project**
7. Wait for project creation to complete
8. Click **Continue**

## Step 2: Enable Firestore Database

1. In your Firebase project dashboard, click on **Firestore Database** in the left sidebar
2. Click **"Create database"**
3. Choose **"Start in production mode"** (we'll add security rules later)
4. Select a **location** for your database (choose closest to your users)
   - Recommended: `us-central1`, `europe-west1`, or `asia-southeast1`
5. Click **Enable**
6. Wait for Firestore to initialize (takes 1-2 minutes)

## Step 3: Enable Firebase Authentication

1. In the left sidebar, click **Authentication**
2. Click **"Get started"**
3. Go to **Sign-in method** tab
4. Enable **Email/Password**:
   - Click on **Email/Password**
   - Toggle **Enable** to ON
   - Click **Save**
5. (Optional) Enable other providers as needed:
   - Google
   - Microsoft
   - etc.

## Step 4: Create Service Account Key

1. Click the **gear icon** (⚙️) next to "Project Overview" in the left sidebar
2. Select **Project settings**
3. Go to **Service accounts** tab
4. Click **"Generate new private key"**
5. Click **"Generate key"** in the confirmation dialog
6. A JSON file will download - **SAVE THIS FILE SECURELY**
7. Rename it to `serviceAccountKey.json`
8. Place it in your project root directory: `D:\DMS FIREBASE FIRESTORE\serviceAccountKey.json`

**⚠️ IMPORTANT:** Never commit this file to version control! It's already in `.gitignore`

## Step 5: Get Firebase Configuration

1. In **Project settings**, go to **General** tab
2. Scroll down to **Your apps** section
3. Click the **Web icon** (`</>`) to add a web app
4. Register app with a nickname (e.g., "DMS Web App")
5. Copy the Firebase configuration values:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`

6. Add these to your `.env` file:
   ```env
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_API_KEY=your-api-key
   FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   FIREBASE_APP_ID=your-app-id
   FIREBASE_SERVICE_ACCOUNT_KEY=./serviceAccountKey.json
   ```

## Step 6: Initialize Firebase CLI

1. Open terminal in your project directory
2. Login to Firebase:
   ```bash
   firebase login
   ```
3. Initialize Firebase:
   ```bash
   firebase init
   ```
4. Select the following:
   - ✅ **Firestore**: Configure security rules and indexes
   - ✅ **Functions**: Configure a Cloud Functions directory
   - (Optional) **Hosting**: If you plan to host a frontend
5. Select your Firebase project from the list
6. For Firestore:
   - Use existing `firestore.rules` file: **Yes**
   - File: `src/config/firestore.rules`
   - Use existing `firestore.indexes.json`: **Yes**
   - File: `firestore.indexes.json`
7. For Functions:
   - Language: **TypeScript**
   - Use ESLint: **Yes**
   - Install dependencies: **Yes**

## Step 7: Deploy Firestore Security Rules

1. Deploy security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```
   Or use the npm script:
   ```bash
   npm run deploy:rules
   ```

2. Verify rules are deployed:
   - Go to Firestore Database in Firebase Console
   - Click on **Rules** tab
   - You should see your security rules

## Step 8: Deploy Firestore Indexes

1. Deploy indexes:
   ```bash
   firebase deploy --only firestore:indexes
   ```

2. Verify indexes:
   - Go to Firestore Database
   - Click on **Indexes** tab
   - You should see your composite indexes being created
   - ⚠️ Note: Index creation can take several minutes

## Step 9: Create Initial Collections Structure

Firestore will create collections automatically when you add documents. However, you can manually create the structure:

### Collections to Create:

1. **users** - User accounts and permissions
2. **tasks** - Employee tasks
3. **productions** - Production records
4. **productionOrders** - Production orders
5. **employees** - Employee information
6. **attendance** - Attendance records
7. **maintenanceRequests** - Maintenance requests
8. **equipment** - Equipment inventory

### How to Create Collections:

**Option 1: Via Firebase Console (Manual)**
1. Go to Firestore Database
2. Click **"Start collection"**
3. Enter collection ID (e.g., "users")
4. Add a test document (you can delete it later)
5. Repeat for each collection

**Option 2: Via Code (Automatic)**
Collections will be created automatically when you:
- Create your first admin user
- Add your first task, production, etc.

## Step 10: Set Up Firestore Security Rules

The security rules are already configured in `src/config/firestore.rules`. After deploying, verify they work:

1. Go to Firestore Database → **Rules** tab
2. Review the rules
3. Test rules using the **Rules Playground** (optional)

### Understanding the Rules:

- **Users collection**: Users can read their own data, HR can manage all users
- **Tasks collection**: Requires `employeeTaskManager` module permission
- **Productions collection**: Requires `pms` module permission
- **Employees collection**: Requires `humanResource` module permission
- **Maintenance collection**: Requires `maintenance` module permission

## Step 11: Create Your First Admin User

After setting up authentication and Firestore:

1. Use the provided script:
   ```bash
   npm run create-admin admin@example.com SecurePassword123 "Admin User"
   ```

2. Or manually via Firebase Console:
   - Go to Authentication → Users
   - Click **"Add user"**
   - Enter email and password
   - Then create user document in Firestore with admin permissions

### Manual User Document Creation:

In Firestore Console, add a document to `users` collection:

**Document ID**: `{firebase-auth-uid}`

**Fields**:
```json
{
  "email": "admin@example.com",
  "displayName": "Admin User",
  "role": "admin",
  "modulePermissions": {
    "employeeTaskManager": ["read", "write", "delete", "admin"],
    "pms": ["read", "write", "delete", "admin"],
    "humanResource": ["read", "write", "delete", "admin"],
    "maintenance": ["read", "write", "delete", "admin"]
  },
  "createdAt": [Current Timestamp],
  "updatedAt": [Current Timestamp],
  "isActive": true
}
```

## Step 12: Verify Setup

Run the verification script:

```bash
npm run verify-setup
```

This will check:
- ✅ Environment variables
- ✅ Firestore connection
- ✅ Auth connection
- ✅ Users collection

## Step 13: Test Firestore Connection

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Test the health endpoint:
   ```bash
   curl http://localhost:3000/health
   ```

3. Test with authentication (get a Firebase ID token first):
   ```bash
   curl -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN" \
        http://localhost:3000/api/v1/users/me
   ```

## Firestore Indexes Explained

> ⭐ **Recommended Approach:** Firebase recommends running queries in your app code to automatically get index creation links. See [FIRESTORE_INDEXES.md](./FIRESTORE_INDEXES.md) for detailed guide.

### Quick Overview

Firestore requires **composite indexes** for queries that combine multiple `where` clauses with `orderBy`. 

**The application automatically:**
- Detects when an index is required
- Provides a direct link to create the index in Firebase Console
- Opens the console automatically with the index pre-configured

### Current Indexes in firestore.indexes.json

The following composite indexes are configured:

1. **plants** collection:
   - `isActive` + `name` (for filtering active plants and sorting by name)

2. **taskInstances** collection:
   - `assignedTo` + `scheduledDate` (for user's tasks ordered by date)
   - Additional indexes will be added as queries are used

3. **taskMasters** collection:
   - Indexes will be added as needed

### Creating New Indexes

**Method 1: Automatic (Recommended) ⭐**
1. Run your query in the application
2. If an index is required, a link will be provided automatically
3. Click the link → Firebase Console opens with index pre-configured
4. Click "Create Index" → Wait 2-5 minutes
5. Refresh your application

**Method 2: Manual**
1. See [FIRESTORE_INDEXES.md](./FIRESTORE_INDEXES.md) for detailed instructions
2. Or use Firebase Console → Firestore → Indexes → Add Index

**For complete index management guide, see [FIRESTORE_INDEXES.md](./FIRESTORE_INDEXES.md)**

## Important Firestore Settings

### Billing

- Firestore has a **free tier** (Spark plan) with limits
- For production, consider upgrading to **Blaze plan** (pay-as-you-go)
- Free tier includes:
  - 50K reads/day
  - 20K writes/day
  - 20K deletes/day
  - 1 GB storage

### Security Best Practices

1. ✅ Never expose service account keys
2. ✅ Use security rules for data protection
3. ✅ Validate all inputs server-side
4. ✅ Use authentication for all operations
5. ✅ Implement proper error handling

### Performance Tips

1. Use indexes for frequently queried fields
2. Limit query results with pagination
3. Use composite indexes for complex queries
4. Cache frequently accessed data
5. Use batch operations for bulk writes

## Troubleshooting

### Issue: "Permission denied" errors

**Solution:**
1. Verify security rules are deployed: `firebase deploy --only firestore:rules`
2. Check user permissions in Firestore
3. Verify user document exists in `users` collection
4. Check module permissions in user document

### Issue: "Index not found" errors

**Solution:**
1. **Recommended:** Run the query in your app - it will provide an automatic index creation link
2. Click the link to open Firebase Console with the index pre-configured
3. Click "Create Index" and wait 2-5 minutes for it to build
4. **Alternative:** Deploy indexes: `firebase deploy --only firestore:indexes`
5. Check Indexes tab in Firestore Console for status
6. See [FIRESTORE_INDEXES.md](./FIRESTORE_INDEXES.md) for detailed troubleshooting

### Issue: Cannot connect to Firestore

**Solution:**
1. Verify service account key path in `.env`
2. Check `FIREBASE_PROJECT_ID` matches your project
3. Ensure service account has proper permissions
4. Check internet connection

### Issue: Collections not appearing

**Solution:**
- Collections are created automatically when first document is added
- Use the API or Firebase Console to add first document
- Check Rules tab to ensure rules allow creation

## Next Steps

After completing Firestore setup:

1. ✅ Create your first admin user
2. ✅ Test API endpoints
3. ✅ Set up your frontend application
4. ✅ Configure additional Firebase services (Storage, etc.)
5. ✅ Set up monitoring and alerts

## Additional Resources

- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firestore Indexes](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Firebase Console](https://console.firebase.google.com/)

## Quick Reference Commands

```bash
# Deploy security rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes

# Deploy everything
firebase deploy

# View Firestore data
# (Use Firebase Console web interface)

# Create admin user
npm run create-admin <email> <password> "<name>"

# Verify setup
npm run verify-setup
```

---

**✅ Once you complete these steps, your Firestore database will be ready for the DMS application!**
