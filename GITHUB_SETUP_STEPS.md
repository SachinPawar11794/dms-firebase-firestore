# 🚀 GitHub Setup - Manual Steps

## ⚠️ Important First Step

**If you just installed Git, you MUST:**
1. **Close PowerShell completely**
2. **Reopen PowerShell**
3. This allows Git to be recognized in your PATH

---

## ✅ After Restarting PowerShell

### Step 1: Navigate to Your Project

```powershell
cd "D:\DMS FIREBASE FIRESTORE"
```

### Step 2: Verify Git Works

```powershell
git --version
```

You should see: `git version 2.xx.x.windows.x`

### Step 3: Run Setup Script

```powershell
npm run setup:github
```

The script will:
- ✅ Initialize Git repository
- ✅ Commit all your files
- ✅ Connect to your GitHub repository
- ✅ Push your code

**Your repository URL:** https://github.com/SachinPawar11794/dms-firebase-firestore.git

---

## 🔐 Authentication

When pushing, GitHub will ask for:

**Username:** `SachinPawar11794`

**Password:** Use a **Personal Access Token** (not your GitHub password)

### Create Personal Access Token:

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Fill in:
   - **Note:** `DMS Project`
   - **Expiration:** Choose (90 days, 1 year, etc.)
   - **Scopes:** Check `repo` (full control)
4. Click **"Generate token"**
5. **Copy the token** immediately
6. When `git push` asks for password, paste the token

---

## 📋 Manual Steps (If Script Doesn't Work)

If you prefer to do it manually:

```powershell
# 1. Initialize Git
git init

# 2. Add all files
git add .

# 3. Create initial commit
git commit -m "Initial commit - DMS Firebase Firestore application"

# 4. Connect to GitHub
git remote add origin https://github.com/SachinPawar11794/dms-firebase-firestore.git

# 5. Set main branch
git branch -M main

# 6. Push to GitHub
git push -u origin main
```

---

## ✅ Verify Success

After pushing, visit:
https://github.com/SachinPawar11794/dms-firebase-firestore

You should see all your files!

---

## 🔄 Future Updates

To push changes in the future:

```powershell
git add .
git commit -m "Description of changes"
git push origin main
```

---

**Next:** Close and reopen PowerShell, then run `npm run setup:github` 🚀
