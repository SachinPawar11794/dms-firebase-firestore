# ⚡ Quick Auto-Deploy Setup

Fastest way to set up automatic deployment from GitHub!

## 🚀 One-Command Setup

```powershell
npm run setup:auto-deploy
```

This script will:
- ✅ Check all prerequisites
- ✅ Grant necessary permissions
- ✅ Guide you through Cloud Build trigger setup

## 📋 What You Need

1. **GitHub repository**: `SachinPawar11794/dms-firebase-firestore`
2. **Google Cloud project**: `dhananjaygroup-dms`
3. **5 minutes** of your time

## 🎯 Manual Steps (If Script Doesn't Work)

### 1. Grant Permissions

```powershell
$projectNumber = gcloud projects describe dhananjaygroup-dms --format="value(projectNumber)"
gcloud projects add-iam-policy-binding dhananjaygroup-dms `
  --member="serviceAccount:$projectNumber@cloudbuild.gserviceaccount.com" `
  --role="roles/run.admin"
```

### 2. Create Trigger in Console

1. Open: https://console.cloud.google.com/cloud-build/triggers?project=dhananjaygroup-dms
2. Click "Connect Repository"
3. Select "GitHub (Cloud Build GitHub App)"
4. Connect: `SachinPawar11794/dms-firebase-firestore`
5. Click "Create Trigger"
6. Configure:
   - Name: `deploy-dms-api`
   - Event: `Push to a branch`
   - Branch: `^main$`
   - Config file: `cloudbuild.yaml`
7. Click "Create"

### 3. Test It

```powershell
git add .
git commit -m "Test auto-deploy"
git push origin main
```

Watch: https://console.cloud.google.com/cloud-build/builds?project=dhananjaygroup-dms

---

**That's it!** Every push to `main` will now automatically deploy! 🎉
