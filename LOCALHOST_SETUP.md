# How to Open Web App in Localhost

This guide will help you run the DMS Firebase Firestore web application on your local machine.

## Prerequisites

Before starting, ensure you have:
- ✅ Node.js v18 or higher installed
- ✅ npm (comes with Node.js)
- ✅ Firebase project configured

## Quick Start (Easiest Method)

### Option 1: Using the Provided Script (Recommended)

Since you're on Windows, use the PowerShell script:

```powershell
.\start-dev.ps1
```

Or use the batch file:

```cmd
start-dev.bat
```

This will automatically:
- Install dependencies if needed
- Start both backend and frontend servers
- Display the URLs where the app is running

**The web app will be available at:** `http://localhost:5173`

---

## Manual Setup (Step-by-Step)

If you prefer to set things up manually or the script doesn't work:

### Step 1: Install Backend Dependencies

Open PowerShell in the project root directory and run:

```powershell
npm install
```

### Step 2: Install Frontend Dependencies

```powershell
cd frontend
npm install
cd ..
```

### Step 3: Configure Environment Variables

#### Backend Configuration

Create a `.env` file in the root directory (if it doesn't exist):

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT_KEY=./serviceAccountKey.json
NODE_ENV=development
PORT=3000
LOG_LEVEL=info
```

**Important:** Make sure `serviceAccountKey.json` is in the root directory.

#### Frontend Configuration

Create a `frontend/.env` file:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_API_BASE_URL=http://localhost:3000
```

### Step 4: Start the Development Servers

#### Option A: Start Both Servers Together

From the root directory:

```powershell
npm run dev:all
```

This starts:
- **Backend API:** `http://localhost:3000`
- **Frontend App:** `http://localhost:5173`

#### Option B: Start Servers Separately

**Terminal 1 - Backend:**
```powershell
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```

### Step 5: Open the Web App

Once the servers are running, open your web browser and navigate to:

**🌐 Frontend Web App:** [http://localhost:5173](http://localhost:5173)

**🔧 Backend API:** [http://localhost:3000](http://localhost:3000)

---

## Verifying Everything Works

### Check Backend Health

Open a browser or use PowerShell:

```powershell
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Check Frontend

- Open `http://localhost:5173` in your browser
- You should see the login page or dashboard
- If you see any errors, check the browser console (F12)

---

## Troubleshooting

### ❌ Port Already in Use

**Error:** `Port 3000 is already in use` or `Port 5173 is already in use`

**Solution:**
1. Find and close the process using the port:
   ```powershell
   # For port 3000
   netstat -ano | findstr :3000
   # Note the PID, then kill it:
   taskkill /PID <PID> /F
   
   # For port 5173
   netstat -ano | findstr :5173
   taskkill /PID <PID> /F
   ```

2. Or change the port in `.env` files

### ❌ Dependencies Not Installed

**Error:** `Cannot find module` or `command not found`

**Solution:**
```powershell
# In root directory
npm install

# In frontend directory
cd frontend
npm install
```

### ❌ Firebase Configuration Missing

**Error:** Firebase connection errors

**Solution:**
1. Verify `.env` files exist in both root and `frontend` directories
2. Check that Firebase credentials are correct
3. Ensure `serviceAccountKey.json` exists in root directory

### ❌ Frontend Can't Connect to Backend

**Error:** API calls failing or CORS errors

**Solution:**
1. Ensure backend is running on `http://localhost:3000`
2. Check `VITE_API_BASE_URL` in `frontend/.env` is set to `http://localhost:3000`
3. Restart both servers after changing `.env` files

---

## Stopping the Servers

To stop the development servers:
- Press `Ctrl + C` in the terminal where the servers are running
- If using `dev:all`, this stops both servers

---

## Next Steps

Once the app is running:
1. ✅ Log in with your Firebase Auth credentials
2. ✅ Explore the application features
3. ✅ Check the browser console for any errors
4. ✅ Review API documentation in `API_DOCUMENTATION.md`

---

## Summary

**Quickest way to start:**
```powershell
.\start-dev.ps1
```

**Then open:** [http://localhost:5173](http://localhost:5173)

Happy coding! 🚀
