# Firestore Setup - Quick Reference

## Essential Steps (5 minutes)

### 1. Create Firebase Project
- Go to [Firebase Console](https://console.firebase.google.com/)
- Click "Add project"
- Enter project name → Continue → Create project

### 2. Enable Firestore
- Click **Firestore Database** → **Create database**
- Choose **Production mode**
- Select location → **Enable**

### 3. Enable Authentication
- Click **Authentication** → **Get started**
- Go to **Sign-in method** → Enable **Email/Password**

### 4. Get Service Account Key
- Click ⚙️ → **Project settings** → **Service accounts**
- Click **Generate new private key**
- Save as `serviceAccountKey.json` in project root

### 5. Get Firebase Config
- In **Project settings** → **General** tab
- Click Web icon (`</>`) → Register app
- Copy config values to `.env` file

### 6. Initialize Firebase CLI
```bash
firebase login
firebase init
# Select: Firestore, Functions
# Use existing files when prompted
```

### 7. Deploy Rules & Indexes
```bash
npm run deploy:rules
firebase deploy --only firestore:indexes
```

### 8. Create Admin User
```bash
npm run create-admin admin@example.com password123 "Admin User"
```

## Collections (Auto-created)

These collections will be created automatically when you add data:
- `users` - User accounts
- `tasks` - Employee tasks
- `productions` - Production records
- `employees` - Employee info
- `attendance` - Attendance records
- `maintenanceRequests` - Maintenance requests
- `equipment` - Equipment inventory

## Environment Variables (.env)

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
FIREBASE_SERVICE_ACCOUNT_KEY=./serviceAccountKey.json
NODE_ENV=development
PORT=3000
```

## Verify Setup

```bash
npm run verify-setup
```

## Common Issues

**Permission denied?**
- Deploy rules: `npm run deploy:rules`

**Index not found?**
- ⭐ **Recommended:** Run the query - app will provide automatic index creation link
- Or deploy indexes: `firebase deploy --only firestore:indexes`
- Wait 2-5 minutes for creation
- See [FIRESTORE_INDEXES.md](./FIRESTORE_INDEXES.md) for details

**Can't connect?**
- Check `.env` file has correct values
- Verify `serviceAccountKey.json` exists
- Check `FIREBASE_PROJECT_ID` matches

---

📖 **For detailed instructions, see [FIRESTORE_SETUP.md](./FIRESTORE_SETUP.md)**
