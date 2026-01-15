# 🚨 Quick Fix for Build Issue

## Problem

`gcloud builds list` shows **0 items** = Build submission failed silently.

## Solution (2 steps)

### Step 1: Fix Permissions

```powershell
npm run fix:build-permissions
```

**Or directly:**
```powershell
powershell -ExecutionPolicy Bypass -File diagnose-build-issue.ps1
```

This grants Cloud Build permission to deploy to Cloud Run.

### Step 2: Deploy Again

```powershell
npm run deploy:cloud-build:ps1
```

## What the Fix Does

1. ✅ Enables Cloud Build API
2. ✅ Enables Cloud Run API  
3. ✅ Enables Container Registry API
4. ✅ Grants Cloud Build service account `roles/run.admin`
5. ✅ Grants Cloud Build service account `roles/iam.serviceAccountUser`

## After Fixing

Check if builds are being created:

```powershell
gcloud builds list
```

You should see builds listed (even if they failed).

---

**Run:** `npm run fix:build-permissions` then `npm run deploy:cloud-build:ps1`
