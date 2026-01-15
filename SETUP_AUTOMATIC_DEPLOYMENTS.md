# 🚀 Set Up Automatic Deployments - Step by Step

## 🎯 What This Does

After setup, every time you push code to GitHub:
- ✅ Cloud Build automatically detects the push
- ✅ Builds your Docker image
- ✅ Deploys to Cloud Run
- ✅ Your changes go live automatically!

**No manual deployment needed!**

---

## 📋 Prerequisites

- ✅ GitHub repository created: https://github.com/SachinPawar11794/dms-firebase-firestore
- ✅ Code pushed to GitHub
- ✅ Google Cloud project: `dhananjaygroup-dms`
- ✅ Cloud Build API enabled
- ✅ Cloud Run service exists: `dms-api`

---

## 🔧 Setup Steps

### Step 1: Connect GitHub to Google Cloud Build

1. **Open Cloud Build Console:**
   - Go to: https://console.cloud.google.com/cloud-build/triggers?project=dhananjaygroup-dms
   - Or navigate: Cloud Build → Triggers

2. **Click "Connect Repository"** (if first time) or **"Create Trigger"**

3. **Select Source:**
   - Choose **"GitHub (Cloud Build GitHub App)"**
   - Click **"Continue"**

4. **Authenticate GitHub:**
   - Click **"Install Google Cloud Build"**
   - Select your GitHub account
   - Authorize Google Cloud Build
   - Select repository: **`SachinPawar11794/dms-firebase-firestore`**
   - Click **"Connect"**

5. **Repository Connected:**
   - You should see: "Repository connected successfully"
   - Click **"Create Trigger"**

---

### Step 2: Create Build Trigger

1. **Trigger Settings:**
   - **Name:** `deploy-dms-api`
   - **Description:** `Automatic deployment on push to main branch`

2. **Event Configuration:**
   - **Event:** `Push to a branch`
   - **Source:** `SachinPawar11794/dms-firebase-firestore`
   - **Branch:** `^main$` (regex pattern - matches "main" branch exactly)

3. **Configuration:**
   - **Type:** `Cloud Build configuration file (yaml or json)`
   - **Location:** `cloudbuild.yaml`
   - (Leave other fields as default)

4. **Advanced (Optional):**
   - **Substitution variables:** Leave default
   - **Service account:** Leave default (uses Cloud Build service account)

5. **Click "Create"**

---

### Step 3: Grant Permissions (If Needed)

The Cloud Build service account needs permissions to deploy to Cloud Run.

**Check if permissions are set:**
```powershell
# Get Cloud Build service account
$PROJECT_NUMBER = gcloud projects describe dhananjaygroup-dms --format="value(projectNumber)"
$SERVICE_ACCOUNT = "$PROJECT_NUMBER@cloudbuild.gserviceaccount.com"

# Grant Cloud Run Admin role
gcloud projects add-iam-policy-binding dhananjaygroup-dms `
  --member="serviceAccount:$SERVICE_ACCOUNT" `
  --role="roles/run.admin"
```

**Or do it via Console:**
1. Go to: IAM & Admin → IAM
2. Find: `[PROJECT_NUMBER]@cloudbuild.gserviceaccount.com`
3. Click edit → Add role: **Cloud Run Admin**

---

### Step 4: Test the Trigger

1. **Make a small change:**
   ```powershell
   # Edit any file (e.g., add a comment)
   # Or create a test file
   echo "# Test" >> test-deploy.txt
   ```

2. **Commit and push:**
   ```powershell
   git add .
   git commit -m "Test automatic deployment"
   git push origin main
   ```

3. **Watch the build:**
   - Go to: https://console.cloud.google.com/cloud-build/builds?project=dhananjaygroup-dms
   - You should see a new build starting automatically
   - Wait 5-10 minutes for deployment

4. **Verify deployment:**
   - Check Cloud Run: https://console.cloud.google.com/run/detail/asia-south1/dms-api?project=dhananjaygroup-dms
   - Test API: https://dms-api-zs4wifhosa-el.a.run.app/health

---

## ✅ Verification

### Check Trigger Status:

1. **View Triggers:**
   - https://console.cloud.google.com/cloud-build/triggers?project=dhananjaygroup-dms
   - You should see: `deploy-dms-api` trigger

2. **View Build History:**
   - https://console.cloud.google.com/cloud-build/builds?project=dhananjaygroup-dms
   - See all automatic builds

3. **Test Push:**
   - Make a change and push
   - Build should start automatically

---

## 🔄 How It Works

### Before (Manual):
```powershell
# Make changes
# Run: npm run deploy:cloud-build:ps1
# Wait 5-10 minutes
```

### After (Automatic):
```powershell
# Make changes
git add .
git commit -m "Your changes"
git push origin main
# That's it! Deployment happens automatically!
```

---

## 🎯 Workflow

### Daily Development:

1. **Make changes** to your code
2. **Test locally** (optional but recommended)
3. **Commit and push:**
   ```powershell
   git add .
   git commit -m "Description of changes"
   git push origin main
   ```
4. **Automatic deployment** starts
5. **Wait 5-10 minutes** for deployment
6. **Verify** your changes are live

---

## 📊 Monitor Deployments

### View Build Status:

**Cloud Build Console:**
- https://console.cloud.google.com/cloud-build/builds?project=dhananjaygroup-dms

**View Logs:**
```powershell
# List recent builds
gcloud builds list --limit=5 --project dhananjaygroup-dms

# View specific build logs
gcloud builds log BUILD_ID --project dhananjaygroup-dms
```

---

## 🔧 Troubleshooting

### Build Not Starting:

1. **Check trigger is enabled:**
   - Go to Cloud Build → Triggers
   - Make sure trigger is enabled (toggle switch)

2. **Check branch name:**
   - Trigger should watch `^main$`
   - Your branch should be `main`

3. **Check repository connection:**
   - Verify GitHub repository is connected
   - Reconnect if needed

### Build Fails:

1. **Check build logs:**
   - Go to Cloud Build → Builds
   - Click on failed build
   - View logs for errors

2. **Common issues:**
   - Missing permissions (grant Cloud Run Admin)
   - Build configuration errors
   - Docker build failures

### Permission Errors:

```powershell
# Grant Cloud Run Admin to Cloud Build service account
$PROJECT_NUMBER = gcloud projects describe dhananjaygroup-dms --format="value(projectNumber)"
gcloud projects add-iam-policy-binding dhananjaygroup-dms `
  --member="serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com" `
  --role="roles/run.admin"
```

---

## 🎉 Success!

Once set up, your workflow becomes:

1. **Code** → Push to GitHub
2. **Build** → Automatic (Cloud Build)
3. **Deploy** → Automatic (Cloud Run)
4. **Live** → Your changes are deployed!

**No manual steps needed!**

---

## 📝 Summary

**What you'll have:**
- ✅ Automatic deployments on every push
- ✅ Build history and logs
- ✅ No manual deployment commands
- ✅ Team-friendly (anyone can deploy by pushing)

**Time to set up:** ~10 minutes

**Time saved per deployment:** ~5-10 minutes (no manual steps)

---

**Ready to set it up? Follow the steps above!** 🚀
