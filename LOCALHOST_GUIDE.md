# Guide: Opening the Web App in Localhost

This guide will help you run the DMS Firebase Firestore web application on your local machine.

## Quick Start (Frontend Only)

If you only need to run the frontend web app:

### Step 1: Navigate to Frontend Directory
```powershell
cd "D:\DMS FIREBASE FIRESTORE\frontend"
```

### Step 2: Install Dependencies (if not already installed)
```powershell
npm install
```

### Step 3: Start the Development Server
```powershell
npm run dev
```

### Step 4: Open in Browser
Once the server starts, you'll see output like:
```
  VITE v5.0.8  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Open your browser and navigate to:** `http://localhost:5173`

---

## Full Stack (Frontend + Backend)

If you need both the frontend and backend running:

### Option 1: Using the PowerShell Script
```powershell
cd "D:\DMS FIREBASE FIRESTORE"
.\start-dev.ps1
```

### Option 2: Using npm Script
```powershell
cd "D:\DMS FIREBASE FIRESTORE"
npm run dev:all
```

This will start:
- **Backend API**: `http://localhost:3000`
- **Frontend App**: `http://localhost:5173`

**Open your browser and navigate to:** `http://localhost:5173`

---

## Manual Start (Step by Step)

### Start Backend (Terminal 1)
```powershell
cd "D:\DMS FIREBASE FIRESTORE"
npm run dev
```

### Start Frontend (Terminal 2)
```powershell
cd "D:\DMS FIREBASE FIRESTORE\frontend"
npm run dev
```

---

## Troubleshooting

### Port Already in Use
If port 5173 is already in use, Vite will automatically try the next available port (5174, 5175, etc.). Check the terminal output for the actual port.

### Dependencies Not Installed
If you get errors about missing modules:
```powershell
# Install root dependencies
cd "D:\DMS FIREBASE FIRESTORE"
npm install

# Install frontend dependencies
cd frontend
npm install
```

### Backend Not Running
If the frontend can't connect to the API:
1. Make sure the backend is running on port 3000
2. Check that your `.env` file is properly configured
3. Verify Firebase credentials are set up

---

## What to Expect

Once running, you should see:
- ✅ Vite development server running
- ✅ Hot Module Replacement (HMR) enabled
- ✅ Fast refresh for React components
- ✅ API proxy configured (frontend `/api` calls → backend `http://localhost:3000`)

---

## Stopping the Server

Press `Ctrl + C` in the terminal where the server is running to stop it.

---

## Next Steps

1. ✅ Open `http://localhost:5173` in your browser
2. ✅ Check browser console for any errors
3. ✅ Verify Firebase connection is working
4. ✅ Test authentication/login functionality

Happy coding! 🚀
