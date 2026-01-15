# Quick Start Guide

Get your DMS Firebase Firestore application up and running in minutes!

## Prerequisites Checklist

- [ ] Node.js v18+ installed
- [ ] Firebase CLI installed (`npm install -g firebase-tools`)
- [ ] Firebase project created
- [ ] Firestore Database enabled
- [ ] Firebase Authentication enabled
- [ ] Service account key downloaded

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
cd functions && npm install && cd ..
```

### 2. Configure Environment

Create a `.env` file in the root directory:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT_KEY=./serviceAccountKey.json
NODE_ENV=development
PORT=3000
LOG_LEVEL=info
```

**Important:** Place your Firebase service account key file in the root directory as `serviceAccountKey.json`

### 3. Initialize Firebase (First Time Only)

```bash
firebase login
firebase init
```

Select:
- ✅ Firestore
- ✅ Functions
- Use existing project (select your project)

### 4. Deploy Firestore Security Rules

```bash
npm run deploy:rules
```

### 5. Deploy Firestore Indexes

```bash
firebase deploy --only firestore:indexes
```

### 6. Verify Setup

```bash
npm run verify-setup
```

This will check:
- ✅ Environment variables
- ✅ Firebase connections
- ✅ Database access

### 7. Create Your First Admin User

```bash
npm run create-admin <email> <password> "<displayName>"
```

Example:
```bash
npm run create-admin admin@example.com SecurePass123 "Admin User"
```

### 8. Build and Start

```bash
# Build TypeScript
npm run build

# Start development server
npm run dev
```

The server will start on `http://localhost:3000`

## Verify Installation

### Test Health Endpoint

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Test Authentication

Get a Firebase ID token from your client app, then:

```bash
curl -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN" \
     http://localhost:3000/api/v1/users/me
```

## Common Issues

### ❌ "Cannot find module 'firebase-admin'"
**Solution:** Run `npm install` again

### ❌ "Permission denied" errors
**Solution:** 
1. Verify Firestore rules are deployed: `npm run deploy:rules`
2. Check user permissions in Firestore

### ❌ "Service account key not found"
**Solution:** 
1. Download service account key from Firebase Console
2. Place it in root directory as `serviceAccountKey.json`
3. Update `.env` file path if needed

### ❌ Port 3000 already in use
**Solution:** Change PORT in `.env` file

## Next Steps

1. ✅ Explore the API endpoints (see SETUP.md)
2. ✅ Set up your frontend application
3. ✅ Configure additional modules as needed
4. ✅ Set up CI/CD pipeline
5. ✅ Configure monitoring and alerts

## Getting Help

- 📖 [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture details
- 📖 [SETUP.md](./SETUP.md) - Detailed setup guide
- 📖 [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Project overview

## API Testing

Use tools like Postman or curl to test endpoints:

```bash
# Get current user
curl -H "Authorization: Bearer TOKEN" \
     http://localhost:3000/api/v1/users/me

# Create a task
curl -X POST \
     -H "Authorization: Bearer TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"title":"Test Task","description":"Test","assignedTo":"userId","assignedBy":"userId","priority":"medium","dueDate":"2024-12-31"}' \
     http://localhost:3000/api/v1/employee-task-manager/tasks
```

Happy coding! 🚀
