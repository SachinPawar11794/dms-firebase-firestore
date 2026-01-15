# 🐙 GitHub Setup - Step by Step Guide

## Prerequisites

✅ **Git must be installed first!**

If Git is not installed:
1. See `INSTALL_GIT.md` for installation instructions
2. Install Git
3. Restart PowerShell
4. Come back here

---

## 🚀 Complete GitHub Setup Process

### Step 1: Install Git (If Not Already Installed)

**Quick Install:**
```powershell
# Open PowerShell as Administrator
winget install Git.Git
```

**Or download from:** https://git-scm.com/download/win

**Verify:**
```powershell
git --version
```

---

### Step 2: Initialize Git Repository

```powershell
cd "D:\DMS FIREBASE FIRESTORE"
npm run setup:git
```

This will:
- ✅ Initialize Git repository
- ✅ Add all files
- ✅ Create initial commit

---

### Step 3: Create GitHub Account (If Needed)

1. Go to: https://github.com
2. Click "Sign up"
3. Enter your details
4. Verify your email
5. Complete setup

---

### Step 4: Create GitHub Repository

1. **Go to GitHub:** https://github.com
2. **Click the "+" icon** (top right)
3. **Click "New repository"**
4. **Fill in details:**
   - **Repository name:** `dms-firebase-firestore` (or any name)
   - **Description:** (optional) "DMS Firebase Firestore Application"
   - **Visibility:** Choose Public or Private
   - **⚠️ IMPORTANT:** Do NOT check:
     - ❌ Add a README file
     - ❌ Add .gitignore
     - ❌ Choose a license
   - (Leave all unchecked - we already have these files)
5. **Click "Create repository"**

---

### Step 5: Connect Local Repository to GitHub

**Option A: Use Automated Script (Easiest)**

```powershell
npm run setup:github
```

The script will:
- ✅ Check Git status
- ✅ Commit any uncommitted changes
- ✅ Ask for your GitHub repository URL
- ✅ Connect to GitHub
- ✅ Push your code

**Option B: Manual Setup**

```powershell
# 1. Add GitHub as remote (replace with your URL)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# 2. Set main branch
git branch -M main

# 3. Push to GitHub
git push -u origin main
```

**Your GitHub URL will look like:**
```
https://github.com/YOUR_USERNAME/dms-firebase-firestore.git
```

---

### Step 6: Authentication

When you push, GitHub may ask for credentials:

**Option 1: Username + Personal Access Token (Recommended)**

1. **Create Personal Access Token:**
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"
   - Name: `DMS Project`
   - Expiration: Choose duration (90 days, 1 year, etc.)
   - Scopes: Check `repo` (full control of private repositories)
   - Click "Generate token"
   - **Copy the token** (you won't see it again!)

2. **When pushing:**
   - Username: Your GitHub username
   - Password: Paste the Personal Access Token (not your GitHub password)

**Option 2: GitHub CLI (Advanced)**

```powershell
# Install GitHub CLI
winget install GitHub.cli

# Authenticate
gh auth login

# Then push normally
git push -u origin main
```

---

## ✅ Verify Setup

After pushing, verify:

1. **Visit your repository on GitHub:**
   ```
   https://github.com/YOUR_USERNAME/REPO_NAME
   ```

2. **You should see:**
   - ✅ All your files
   - ✅ Commit history
   - ✅ Code is backed up

---

## 🔄 Future Workflow

### Making Changes and Pushing to GitHub

```powershell
# 1. Make your code changes...

# 2. Add changes
git add .

# 3. Commit with description
git commit -m "Description of changes"

# 4. Push to GitHub (cloud backup)
git push origin main
```

### Pulling Latest Changes (If working from multiple computers)

```powershell
git pull origin main
```

---

## 🎯 Quick Commands Reference

```powershell
# Check status
git status

# Add all changes
git add .

# Commit
git commit -m "Your message"

# Push to GitHub
git push origin main

# Pull from GitHub
git pull origin main

# View commit history
git log --oneline

# See what changed
git diff
```

---

## 🔐 Security Notes

### Never Commit These Files:

- ❌ `serviceAccountKey.json` (Firebase service account)
- ❌ `.env` files with secrets
- ❌ Passwords or API keys

**These are already in `.gitignore`** ✅

### If You Accidentally Committed Secrets:

1. **Remove from Git:**
   ```powershell
   git rm --cached serviceAccountKey.json
   git commit -m "Remove service account key"
   git push origin main
   ```

2. **Rotate the secret** (generate new key)

3. **Update `.gitignore`** (already done ✅)

---

## 🐛 Troubleshooting

### "Git is not recognized"
- **Solution:** Install Git (see Step 1)
- **After installing:** Restart PowerShell

### "Repository not found"
- **Solution:** Make sure you created the repository on GitHub first
- **Check:** URL is correct (username and repo name)

### "Authentication failed"
- **Solution:** Use Personal Access Token instead of password
- **Create token:** https://github.com/settings/tokens

### "Permission denied"
- **Solution:** Make sure you have access to the repository
- **Check:** Repository is yours or you have collaborator access

---

## 📚 Next Steps After GitHub Setup

1. ✅ **Code is backed up** - Safe in the cloud
2. ✅ **Set up automatic deployments** (optional)
   - See `FUTURE_DEPLOYMENTS.md`
   - Connect Cloud Build to GitHub
   - Push code → Auto-deploy

---

## ✅ Summary

**Complete Setup Steps:**
1. ✅ Install Git
2. ✅ Initialize Git: `npm run setup:git`
3. ✅ Create GitHub account
4. ✅ Create GitHub repository
5. ✅ Connect and push: `npm run setup:github`

**Time:** ~10-15 minutes total

**Result:** Your code is now backed up on GitHub! 🎉
