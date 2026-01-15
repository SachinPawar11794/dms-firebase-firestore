# Firebase Setup Checklist

Use this checklist to track your progress through the Firebase setup process.

## ✅ Step 1: Create Firebase Project
- [x] Project created
- [ ] Google Analytics configured (optional)

## ⏳ Step 2: Enable Firestore Database
- [ ] Click "Firestore Database" in left sidebar
- [ ] Click "Create database"
- [ ] Choose "Production mode"
- [ ] Select database location
- [ ] Click "Enable"
- [ ] Wait for initialization (1-2 minutes)


## ⏳ Step 3: Enable Firebase Authentication
- [ ] Click "Authentication" in left sidebar
- [ ] Click "Get started"
- [ ] Go to "Sign-in method" tab
- [ ] Enable "Email/Password"
- [ ] Click "Save"

## ⏳ Step 4: Create Service Account Key
- [ ] Click gear icon (⚙️) → "Project settings"
- [ ] Go to "Service accounts" tab
- [ ] Click "Generate new private key"
- [ ] Download JSON file
- [ ] Rename to `serviceAccountKey.json`
- [ ] Place in project root directory

## ⏳ Step 5: Get Firebase Configuration
- [ ] In "Project settings" → "General" tab
- [ ] Scroll to "Your apps" section
- [ ] Click Web icon (`</>`) → Register app
- [ ] Copy configuration values
- [ ] Create `.env` file with values

## ⏳ Step 6: Initialize Firebase CLI
- [ ] Run `firebase login`
- [ ] Run `firebase init`
- [ ] Select Firestore and Functions
- [ ] Select your project
- [ ] Use existing rules/indexes files

## ⏳ Step 7: Deploy Security Rules
- [ ] Run `npm run deploy:rules`
- [ ] Verify rules in Firebase Console

## ⏳ Step 8: Deploy Indexes
- [ ] Run `firebase deploy --only firestore:indexes`
- [ ] Wait for index creation (5-10 minutes)

## ⏳ Step 9: Create Admin User
- [ ] Run `npm run create-admin <email> <password> "<name>"`
- [ ] Or create manually in Firebase Console

## ⏳ Step 10: Verify Setup
- [ ] Run `npm run verify-setup`
- [ ] Test API endpoints

---

**Current Status:** Step 2 - Enable Firestore Database
