# Troubleshooting: "Site Can't Be Reached" Error

If you're seeing "This site can't be reached" when trying to access `http://localhost:5173`, follow these steps:

## Step 1: Check if the Server is Running

### Quick Check
Open PowerShell and run:

```powershell
# Check if port 5173 is in use
netstat -ano | findstr :5173
```

**If you see output:** The port is in use, but the server might not be responding correctly.
**If you see nothing:** The server is NOT running - proceed to Step 2.

## Step 2: Start the Development Server

### Option A: Start Frontend Only

```powershell
cd frontend
npm run dev
```

**What to look for:**
- You should see: `VITE v5.x.x  ready in XXX ms`
- You should see: `➜  Local:   http://localhost:5173/`
- **NO errors** in red

### Option B: Start Both Backend and Frontend

From the root directory:

```powershell
npm run dev:all
```

Or use the script:

```powershell
.\start-dev.ps1
```

## Step 3: Verify Server Started Successfully

After running `npm run dev`, you should see output like:

```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

**If you DON'T see this:**
- Check for error messages in red
- Scroll up to see what went wrong

## Common Issues and Solutions

### ❌ Issue 1: "Cannot find module" or "command not found"

**Error messages:**
- `'vite' is not recognized as an internal or external command`
- `Cannot find module 'vite'`

**Solution:**
```powershell
cd frontend
npm install
```

Then try again:
```powershell
npm run dev
```

---

### ❌ Issue 2: Port 5173 Already in Use

**Error message:**
- `Port 5173 is already in use`
- `Error: listen EADDRINUSE: address already in use :::5173`

**Solution A: Kill the process using the port**

```powershell
# Find the process
netstat -ano | findstr :5173

# Note the PID (last number), then kill it:
taskkill /PID <PID_NUMBER> /F
```

**Solution B: Use a different port**

Edit `frontend/vite.config.ts` and change the port:

```typescript
server: {
  port: 5174,  // Change to 5174 or any other available port
  // ... rest of config
}
```

Then access: `http://localhost:5174`

---

### ❌ Issue 3: Dependencies Not Installed

**Symptoms:**
- Server won't start
- Module not found errors

**Solution:**

```powershell
# In root directory
npm install

# In frontend directory
cd frontend
npm install
cd ..
```

---

### ❌ Issue 4: Missing .env File

**Symptoms:**
- Server starts but app shows errors
- Firebase connection errors

**Solution:**

Create `frontend/.env` file with:

```env
VITE_FIREBASE_API_KEY=AIzaSyAkEjhgCwshoEpgDz0eksVWTsuQNb11ijQ
VITE_FIREBASE_AUTH_DOMAIN=dhananjaygroup-dms.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=dhananjaygroup-dms
VITE_FIREBASE_STORAGE_BUCKET=dhananjaygroup-dms.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=313335683440
VITE_FIREBASE_APP_ID=1:313335683440:web:78d95800dc2e972b8f17b5
VITE_API_BASE_URL=http://localhost:3000
```

**Important:** After creating/editing `.env`, restart the dev server!

---

### ❌ Issue 5: Node.js Version Too Old

**Check your Node.js version:**

```powershell
node --version
```

**Required:** Node.js v18 or higher

**If version is too old:**
1. Download latest Node.js from [nodejs.org](https://nodejs.org/)
2. Install it
3. Restart PowerShell
4. Run `npm install` again in both root and frontend directories

---

### ❌ Issue 6: Firewall Blocking Port

**Symptoms:**
- Server starts successfully
- Browser shows "site can't be reached"
- No errors in terminal

**Solution:**

1. Open Windows Defender Firewall
2. Allow Node.js through firewall
3. Or temporarily disable firewall to test

---

### ❌ Issue 7: Wrong URL

**Make sure you're using the correct URL:**

✅ Correct: `http://localhost:5173`
❌ Wrong: `https://localhost:5173` (don't use https)
❌ Wrong: `localhost:5173` (missing http://)
❌ Wrong: `127.0.0.1:5173` (should work, but try localhost first)

---

## Step-by-Step Diagnostic Process

Run these commands in order:

### 1. Check Node.js Installation
```powershell
node --version
npm --version
```
Should show version numbers. If not, install Node.js.

### 2. Navigate to Frontend Directory
```powershell
cd frontend
```

### 3. Check if node_modules Exists
```powershell
Test-Path node_modules
```
Should return `True`. If `False`, run `npm install`.

### 4. Check if .env File Exists
```powershell
Test-Path .env
```
Should return `True`. If `False`, create it (see Issue 4 above).

### 5. Try Starting the Server
```powershell
npm run dev
```

### 6. Check Terminal Output
Look for:
- ✅ `ready in XXX ms` - Server started successfully
- ✅ `Local: http://localhost:5173/` - URL to access
- ❌ Any red error messages - Fix those first

### 7. Test in Browser
- Open browser
- Go to `http://localhost:5173`
- Check browser console (F12) for errors

---

## Quick Fix Checklist

Run through this checklist:

- [ ] Node.js v18+ installed? (`node --version`)
- [ ] In the `frontend` directory? (`cd frontend`)
- [ ] Dependencies installed? (`npm install`)
- [ ] `.env` file exists in `frontend` directory?
- [ ] Port 5173 not in use? (`netstat -ano | findstr :5173`)
- [ ] Server started? (`npm run dev`)
- [ ] See "ready" message in terminal?
- [ ] Using correct URL? (`http://localhost:5173`)

---

## Still Not Working?

If none of the above solutions work:

1. **Check the exact error message** in the terminal when you run `npm run dev`
2. **Check browser console** (F12 → Console tab) for errors
3. **Try a different browser** (Chrome, Firefox, Edge)
4. **Restart your computer** (sometimes fixes port/firewall issues)

---

## Expected Working State

When everything is working correctly:

**Terminal output:**
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Browser:**
- Opens `http://localhost:5173`
- Shows login page or dashboard
- No console errors (F12)

---

## Need More Help?

Share:
1. The exact error message from terminal
2. What happens when you run `npm run dev`
3. Browser console errors (F12)
4. Your Node.js version (`node --version`)
