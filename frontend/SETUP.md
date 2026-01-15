# Frontend Setup Guide

Quick guide to get the frontend application running.

## Quick Start

### 1. Navigate to Frontend Directory

```powershell
cd frontend
```

### 2. Install Dependencies

```powershell
npm install
```

### 3. Create Environment File

Create a `.env` file in the `frontend` directory with your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=AIzaSyAkEjhgCwshoEpgDz0eksVWTsuQNb11ijQ
VITE_FIREBASE_AUTH_DOMAIN=dhananjaygroup-dms.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=dhananjaygroup-dms
VITE_FIREBASE_STORAGE_BUCKET=dhananjaygroup-dms.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=313335683440
VITE_FIREBASE_APP_ID=1:313335683440:web:78d95800dc2e972b8f17b5
VITE_API_BASE_URL=http://localhost:3000
```

**Note:** Use the same Firebase config values from your backend `.env` file, but prefix them with `VITE_`.

### 4. Start Development Server

```powershell
npm run dev
```

The app will open at: `http://localhost:5173`

### 5. Login

Use your Firebase Authentication credentials:
- Email: `dms@dhananjaygroup.com`
- Password: Your Firebase Auth password

## Features

✅ **Authentication** - Firebase Auth integration
✅ **Dashboard** - Overview with statistics
✅ **Tasks** - Full task management interface
✅ **Productions** - Production management (placeholder)
✅ **Employees** - HR management (placeholder)
✅ **Maintenance** - Maintenance management (placeholder)

## Next Steps

1. Complete the placeholder modules (Productions, Employees, Maintenance)
2. Add create/edit forms for tasks
3. Implement filtering and search
4. Add more features as needed

## Troubleshooting

**Port already in use?**
- Change port in `vite.config.ts`

**Authentication errors?**
- Verify Firebase config in `.env`
- Check that user exists in Firebase Authentication

**API connection errors?**
- Ensure backend server is running on port 3000
- Check `VITE_API_BASE_URL` in `.env`
