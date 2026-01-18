# 🚀 Automatic Deployment Setup

Set up automatic deployment so that every time you push code to GitHub, your application automatically deploys!

## 🎯 How It Works

```
GitHub Push → Cloud Build Trigger → Build & Deploy → Live Application
```

When you push to GitHub:
1. ✅ Cloud Build detects the push
2. ✅ Builds your Docker image
3. ✅ Deploys backend to Cloud Run
4. ✅ Builds and deploys frontend to Firebase Hosting
5. ✅ Your app is live!

## 📋 Prerequisites

- ✅ GitHub repository connected
- ✅ Google Cloud project: `dhananjaygroup-dms`
- ✅ Cloud Build API enabled
- ✅ Repository: `SachinPawar11794/dms-firebase-firestore`

## 🚀 Quick Setup (Automated)

Run the setup script:

```powershell
npm run setup:auto-deploy
```

This will:
- ✅ Check prerequisites
- ✅ Grant necessary permissions
- ✅ Provide step-by-step instructions

## 📝 Manual Setup (Step-by-Step)

### Step 1: Enable Required APIs

```powershell
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

### Step 2: Grant Cloud Build Permissions

```powershell
# Get project number
$projectNumber = gcloud projects describe dhananjaygroup-dms --format="value(projectNumber)"

# Grant Cloud Run Admin role
gcloud projects add-iam-policy-binding dhananjaygroup-dms `
  --member="serviceAccount:$projectNumber@cloudbuild.gserviceaccount.com" `
  --role="roles/run.admin"

# Grant Service Account User role (for deploying)
gcloud projects add-iam-policy-binding dhananjaygroup-dms `
  --member="serviceAccount:$projectNumber@cloudbuild.gserviceaccount.com" `
  --role="roles/iam.serviceAccountUser"
```

### Step 3: Connect GitHub Repository

1. **Open Cloud Build Console:**
   ```
   https://console.cloud.google.com/cloud-build/triggers?project=dhananjaygroup-dms
   ```

2. **Click "Connect Repository"**

3. **Select Source:**
   - Choose: **"GitHub (Cloud Build GitHub App)"**
   - Click "Continue"

4. **Authenticate GitHub:**
   - Click "Install Google Cloud Build GitHub App"
   - Select your GitHub account
   - Authorize access
   - Select repository: **`SachinPawar11794/dms-firebase-firestore`**
   - Click "Connect"

### Step 4: Create Build Trigger

1. **Click "Create Trigger"**

2. **Configure Trigger:**
   - **Name**: `deploy-dms-api`
   - **Event**: `Push to a branch`
   - **Branch**: `^main$` (regex pattern for main branch)
   - **Configuration**: `Cloud Build configuration file (yaml or json)`
   - **Location**: `Repository`
   - **Cloud Build configuration file**: `cloudbuild.yaml`

3. **Advanced Options (Optional):**
   - **Substitution variables**: You can add custom variables here
   - **Service account**: Leave default (Cloud Build service account)

4. **Click "Create"**

### Step 5: Set Database Password Secret (If Not Done)

```powershell
# Create secret for database password
echo "YOUR_DB_PASSWORD" | gcloud secrets create db-password --data-file=-

# Grant Cloud Run access
$projectNumber = gcloud projects describe dhananjaygroup-dms --format="value(projectNumber)"
gcloud secrets add-iam-policy-binding db-password `
  --member="serviceAccount:$projectNumber-compute@developer.gserviceaccount.com" `
  --role="roles/secretmanager.secretAccessor"
```

**Note:** If you haven't set this up, you'll need to manually set `DB_PASSWORD` in Cloud Run after first deployment.

### Step 6: Test Automatic Deployment

```powershell
# Make a small change
echo "# Test deployment" >> README.md

# Commit and push
git add .
git commit -m "Test automatic deployment"
git push origin main
```

**Watch the deployment:**
1. Go to: https://console.cloud.google.com/cloud-build/builds?project=dhananjaygroup-dms
2. You should see a new build running
3. Wait 5-10 minutes for deployment to complete
4. Check your application - it should be updated!

## ✅ Verification

### Check Build Status

```powershell
# List recent builds
gcloud builds list --limit=5

# View build logs
gcloud builds log BUILD_ID
```

### Check Deployment

```powershell
# Get service URL
$apiUrl = gcloud run services describe dms-api --region asia-south1 --format="value(status.url)"

# Test
curl "$apiUrl/health"
```

## 🔧 Configuration Details

### What Gets Deployed

The `cloudbuild.yaml` file defines what happens:

1. **Builds Docker image** from your code
2. **Deploys backend** to Cloud Run
3. **Builds frontend** with correct API URL
4. **Deploys frontend** to Firebase Hosting

### Environment Variables

The deployment automatically sets:
- `NODE_ENV=production`
- `FIREBASE_PROJECT_ID=dhananjaygroup-dms`
- `DB_HOST=35.244.20.105`
- `DB_PORT=5432`
- `DB_NAME=dms_db`
- `DB_USER=dms_user`
- `DB_SSL=true`
- Other database pool settings

**You still need to set `DB_PASSWORD` manually** (or use secrets).

## 🔒 Security Best Practices

### Use Secrets for Sensitive Data

Instead of environment variables, use Cloud Secret Manager:

```powershell
# Create secrets
gcloud secrets create db-password --data-file=- <<< "YOUR_PASSWORD"
gcloud secrets create firebase-service-account --data-file=serviceAccountKey.json

# Update Cloud Run to use secrets
gcloud run services update dms-api `
  --region asia-south1 `
  --update-secrets "DB_PASSWORD=db-password:latest,FIREBASE_SERVICE_ACCOUNT_KEY=firebase-service-account:latest"
```

## 🐛 Troubleshooting

### Build Fails

1. **Check build logs:**
   ```
   https://console.cloud.google.com/cloud-build/builds?project=dhananjaygroup-dms
   ```

2. **Common issues:**
   - Missing permissions → Run Step 2 again
   - API not enabled → Run Step 1 again
   - Database connection → Check password secret

### Deployment Succeeds But App Doesn't Work

1. **Check Cloud Run logs:**
   ```powershell
   gcloud run services logs read dms-api --region asia-south1
   ```

2. **Verify environment variables:**
   ```powershell
   gcloud run services describe dms-api --region asia-south1
   ```

3. **Check database connection:**
   - Verify password is set
   - Check IP whitelisting

### Trigger Not Firing

1. **Verify trigger is active:**
   ```
   https://console.cloud.google.com/cloud-build/triggers?project=dhananjaygroup-dms
   ```

2. **Check branch name:**
   - Trigger should match your branch (usually `main`)

3. **Verify GitHub connection:**
   - Reconnect if needed

## 📊 Monitoring Deployments

### View Build History

```
https://console.cloud.google.com/cloud-build/builds?project=dhananjaygroup-dms
```

### View Deployment Status

```
https://console.cloud.google.com/run?project=dhananjaygroup-dms
```

### Set Up Notifications

1. Go to Cloud Build Settings
2. Enable email notifications
3. Get notified of build failures

## 🔄 Workflow

### Daily Development Workflow

```powershell
# 1. Make changes to your code
# ... edit files ...

# 2. Commit changes
git add .
git commit -m "Add new feature"

# 3. Push to GitHub
git push origin main

# 4. Automatic deployment starts!
# Wait 5-10 minutes, then check your app
```

### Branch Strategy (Optional)

You can create triggers for different branches:

- **`main`** → Production deployment
- **`develop`** → Staging deployment
- **`feature/*`** → Feature testing

## ✅ Success Checklist

- [ ] Cloud Build trigger created
- [ ] GitHub repository connected
- [ ] Permissions granted
- [ ] Database password secret set (or environment variable)
- [ ] Test push completed successfully
- [ ] Application deployed and working
- [ ] Monitoring set up

## 🎯 Next Steps

1. ✅ Set up automatic deployment (this guide)
2. ✅ Test with a small change
3. ✅ Monitor first few deployments
4. ✅ Set up alerts for failures
5. ✅ Document your deployment process

---

**Need help?** Run: `npm run setup:auto-deploy` for automated setup assistance!
