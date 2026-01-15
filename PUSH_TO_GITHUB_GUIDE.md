# 📤 Push Code to GitHub - Quick Guide

## 🔄 Your Workflow

Now that automatic deployments are set up, here's your workflow:

---

## 📝 Step-by-Step: Push Code to GitHub

### Step 1: Check What Changed

```powershell
# See what files changed
git status

# See detailed changes
git diff
```

### Step 2: Add Changes

```powershell
# Add all changes
git add .

# Or add specific files
git add filename.ts
```

### Step 3: Commit Changes

```powershell
# Commit with description
git commit -m "Description of your changes"

# Examples:
git commit -m "Add new feature"
git commit -m "Fix bug in user authentication"
git commit -m "Update API endpoints"
```

### Step 4: Push to GitHub

```powershell
# Push to main branch
git push origin main
```

---

## 🚀 What Happens After Push

1. **Push to GitHub** → Code is backed up
2. **Cloud Build detects push** → Build starts automatically (~30 seconds)
3. **Build completes** → Takes 5-10 minutes
4. **Deploys to Cloud Run** → Your changes are live!

**Watch the build:**
- https://console.cloud.google.com/cloud-build/builds?project=dhananjaygroup-dms

---

## 💡 Best Practices

### Commit Messages

**Good commit messages:**
```powershell
git commit -m "Add user profile page"
git commit -m "Fix login authentication bug"
git commit -m "Update plant management API"
git commit -m "Add error handling for API calls"
```

**Bad commit messages:**
```powershell
git commit -m "changes"
git commit -m "fix"
git commit -m "update"
```

### Commit Often

- ✅ Commit after completing a feature
- ✅ Commit after fixing a bug
- ✅ Commit at end of work session
- ❌ Don't wait weeks between commits

---

## 🔍 Quick Commands

### Check Status
```powershell
git status
```

### See Changes
```powershell
git diff
```

### Add All Changes
```powershell
git add .
```

### Commit
```powershell
git commit -m "Your message"
```

### Push
```powershell
git push origin main
```

### All-in-One (if you're confident)
```powershell
git add . && git commit -m "Your changes" && git push origin main
```

---

## 📊 Monitor Deployment

**After pushing, watch:**
- **Build:** https://console.cloud.google.com/cloud-build/builds?project=dhananjaygroup-dms
- **Cloud Run:** https://console.cloud.google.com/run/detail/asia-south1/dms-api?project=dhananjaygroup-dms

---

## ✅ Summary

**Your workflow:**
1. Make changes
2. `git add .`
3. `git commit -m "Description"`
4. `git push origin main`
5. Watch automatic deployment! 🚀

---

**Ready to push? Run the commands above!**
