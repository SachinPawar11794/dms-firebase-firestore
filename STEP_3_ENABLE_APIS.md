# Step 3: Enable Required APIs

## Overview

Before deploying to Cloud Run, you need to enable three Google Cloud APIs:
1. **Cloud Build API** - For building Docker images
2. **Cloud Run API** - For running your containerized application
3. **Container Registry API** - For storing Docker images

## Prerequisites

✅ **Before starting, make sure:**
- You've logged in: `gcloud auth login` ✅
- Project is set: `dhananjaygroup-dms` ✅
- You're in a NEW PowerShell window ✅

## Step-by-Step Instructions

### Command 1: Enable Cloud Build API

```powershell
gcloud services enable cloudbuild.googleapis.com
```

**What it does:**
- Enables Google Cloud Build service
- Required for building Docker images from your code
- Takes 1-2 minutes to enable

**Expected output:**
```
Operation "operations/..." finished successfully.
```

### Command 2: Enable Cloud Run API

```powershell
gcloud services enable run.googleapis.com
```

**What it does:**
- Enables Google Cloud Run service
- Required for deploying and running your containerized API
- Takes 1-2 minutes to enable

**Expected output:**
```
Operation "operations/..." finished successfully.
```

### Command 3: Enable Container Registry API

```powershell
gcloud services enable containerregistry.googleapis.com
```

**What it does:**
- Enables Google Container Registry
- Required for storing your Docker images
- Takes 1-2 minutes to enable

**Expected output:**
```
Operation "operations/..." finished successfully.
```

## Run All Three Commands

You can run them one by one, or all at once:

```powershell
# Enable all APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

## Verify APIs Are Enabled

After running the commands, verify they're enabled:

```powershell
gcloud services list --enabled --filter="name:cloudbuild.googleapis.com OR name:run.googleapis.com OR name:containerregistry.googleapis.com"
```

Should show all three APIs listed.

## Alternative: Enable via Console

If you prefer using the web console:

1. **Go to:** https://console.cloud.google.com/apis/library?project=dhananjaygroup-dms

2. **Search and enable each API:**
   - Search: "Cloud Build API" → Click → Enable
   - Search: "Cloud Run API" → Click → Enable
   - Search: "Container Registry API" → Click → Enable

## Troubleshooting

### Error: "Permission denied"
**Solution:**
```powershell
# Grant yourself necessary permissions
gcloud projects add-iam-policy-binding dhananjaygroup-dms --member="user:YOUR_EMAIL" --role="roles/serviceusage.serviceUsageAdmin"
```

### Error: "Billing not enabled"
**Solution:**
- Verify billing is linked: https://console.cloud.google.com/billing?project=dhananjaygroup-dms
- If not linked, link your billing account

### Error: "API already enabled"
**Solution:**
- This is fine! The API is already enabled
- Continue to the next API

### Operation takes too long
**Solution:**
- This is normal, APIs can take 1-2 minutes each
- Be patient, don't cancel the operation
- You can check status in Google Cloud Console

## What Happens Next?

After enabling APIs:
1. ✅ APIs are ready for use
2. ✅ You can proceed to Step 4: Start Docker Desktop
3. ✅ Then Step 5: Deploy to Cloud Run

## Quick Checklist

- [ ] Run: `gcloud services enable cloudbuild.googleapis.com`
- [ ] Run: `gcloud services enable run.googleapis.com`
- [ ] Run: `gcloud services enable containerregistry.googleapis.com`
- [ ] Verify all three are enabled
- [ ] Ready for next step!

## Next Step

After enabling APIs, proceed to:
- **Step 4:** Start Docker Desktop
- **Step 5:** Deploy to Cloud Run

---

**Ready?** Run the three `gcloud services enable` commands above!
