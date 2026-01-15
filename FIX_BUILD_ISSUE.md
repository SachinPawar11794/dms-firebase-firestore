# Fix Cloud Build Issue

## Problem

`gcloud builds list` shows **0 items**, which means the build submission failed silently.

## Root Cause

The Cloud Build service account needs permissions to deploy to Cloud Run.

## Solution

Run the diagnostic script to fix permissions:

```powershell
powershell -ExecutionPolicy Bypass -File diagnose-build-issue.ps1
```

This will:
1. ✅ Verify project is set correctly
2. ✅ Enable required APIs (Cloud Build, Cloud Run, Container Registry)
3. ✅ Grant Cloud Build service account permissions to deploy to Cloud Run
4. ✅ Verify required files exist

## Manual Fix (if script doesn't work)

### Step 1: Get Project Number

```powershell
gcloud projects describe dhananjaygroup-dms --format="value(projectNumber)"
```

### Step 2: Grant Permissions

Replace `PROJECT_NUMBER` with the number from Step 1:

```powershell
$PROJECT_NUMBER = "YOUR_PROJECT_NUMBER"
$PROJECT_ID = "dhananjaygroup-dms"

# Grant Cloud Build permission to deploy to Cloud Run
gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member="serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com" `
    --role="roles/run.admin"

# Grant permission to use service accounts
gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member="serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com" `
    --role="roles/iam.serviceAccountUser"
```

### Step 3: Verify APIs Enabled

```powershell
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### Step 4: Try Deployment Again

```powershell
npm run deploy:cloud-build:ps1
```

## Check Build Status

After running the fix, check if builds are being created:

```powershell
# List all builds
gcloud builds list

# Watch for new builds (refresh every few seconds)
gcloud builds list --limit=5 --format="table(id,status,createTime)"
```

## Still Not Working?

### Check Cloud Build Console

1. Go to: https://console.cloud.google.com/cloud-build/builds?project=dhananjaygroup-dms
2. Look for any error messages
3. Check if builds are being created but failing

### Check Logs

```powershell
# Get latest build ID
$BUILD_ID = gcloud builds list --limit=1 --format="value(id)"

# View logs
gcloud builds log $BUILD_ID
```

### Common Issues

1. **Billing not enabled**: Cloud Build requires billing
   - Check: https://console.cloud.google.com/billing?project=dhananjaygroup-dms

2. **Quota exceeded**: Free tier has limits
   - Check: https://console.cloud.google.com/iam-admin/quotas?project=dhananjaygroup-dms

3. **Wrong project**: Make sure you're in the right project
   ```powershell
   gcloud config get-value project
   ```

---

**Run:** `powershell -ExecutionPolicy Bypass -File diagnose-build-issue.ps1`
