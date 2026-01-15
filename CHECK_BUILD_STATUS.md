# Check Cloud Build Status

## Current Situation

The deployment script submitted the build to Cloud Build, but the service might still be deploying.

Cloud Build takes **5-10 minutes** to complete. The script tried to get the service URL too early.

## How to Check Build Status

### Option 1: Check in PowerShell

```powershell
# List recent builds
gcloud builds list --limit=5

# View latest build details
gcloud builds list --limit=1 --format="table(id,status,createTime)"
```

**Status values:**
- `WORKING` = Still building
- `SUCCESS` = Build completed successfully
- `FAILURE` = Build failed (check logs)

### Option 2: Check in Google Cloud Console

1. Go to: https://console.cloud.google.com/cloud-build/builds?project=dhananjaygroup-dms
2. Click on the latest build
3. See detailed logs and status

### Option 3: Check Cloud Run Service

```powershell
# List Cloud Run services
gcloud run services list --region asia-south1

# Get service URL (if it exists)
gcloud run services describe dms-api --region asia-south1 --format 'value(status.url)'
```

## What to Do Now

### If Build is Still Running (WORKING)

**Wait 5-10 minutes**, then check again:

```powershell
gcloud builds list --limit=1
```

### If Build Completed (SUCCESS)

Check if service was deployed:

```powershell
gcloud run services list --region asia-south1
```

If `dms-api` appears, get the URL:

```powershell
gcloud run services describe dms-api --region asia-south1 --format 'value(status.url)'
```

### If Build Failed (FAILURE)

View build logs:

```powershell
# Get build ID
$BUILD_ID = gcloud builds list --limit=1 --format="value(id)"

# View logs
gcloud builds log $BUILD_ID
```

## Common Issues

### Build Failed - Missing Files

**Error:** "Cannot find file" or "Missing package.json"

**Solution:** Make sure you're in the project root directory:
```powershell
cd "D:\DMS FIREBASE FIRESTORE"
```

### Build Failed - Service Account Permissions

**Error:** "Permission denied" or "Service account lacks permissions"

**Solution:** Grant Cloud Build permissions:
```powershell
$PROJECT_NUMBER = gcloud projects describe dhananjaygroup-dms --format="value(projectNumber)"
gcloud projects add-iam-policy-binding dhananjaygroup-dms --member="serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com" --role="roles/run.admin"
```

### Service Not Found After Build

**Possible reasons:**
1. Build still running (wait and check)
2. Deployment step failed (check build logs)
3. Service name mismatch (check cloudbuild.yaml)

## Quick Status Check Commands

Run these to check everything:

```powershell
# Check build status
gcloud builds list --limit=1

# Check Cloud Run services
gcloud run services list --region asia-south1

# If service exists, get URL
gcloud run services describe dms-api --region asia-south1 --format 'value(status.url)'
```

---

**Run:** `gcloud builds list --limit=1` to see current build status!
