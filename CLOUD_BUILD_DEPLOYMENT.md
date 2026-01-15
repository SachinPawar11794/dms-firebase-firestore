# Cloud Build Deployment Guide

## ✅ No Docker Desktop Needed!

This guide uses **Google Cloud Build** to deploy your API. Everything builds in Google Cloud - no local Docker setup required!

## Prerequisites

- ✅ Google Cloud CLI (gcloud) installed
- ✅ Logged in: `gcloud auth login`
- ✅ Project set: `dhananjaygroup-dms`
- ✅ Billing account linked
- ✅ APIs enabled (Cloud Build, Cloud Run, Container Registry)

## Quick Deployment

### Option 1: Using Script (Recommended)

```powershell
npm run deploy:cloud-build:ps1
```

### Option 2: Direct Command

```powershell
gcloud builds submit --config cloudbuild.yaml
```

## What Happens During Deployment

1. **Upload Code** (~30 seconds)
   - Your code is uploaded to Google Cloud Build

2. **Build TypeScript** (~1-2 minutes)
   - Compiles your TypeScript code
   - Creates production build

3. **Build Docker Image** (~2-3 minutes)
   - Creates Docker image in Google Cloud
   - Uses your Dockerfile

4. **Push to Registry** (~1 minute)
   - Pushes image to Google Container Registry

5. **Deploy to Cloud Run** (~2-3 minutes)
   - Deploys your API to Cloud Run
   - Configures networking and scaling

**Total time: ~5-10 minutes**

## After Deployment

You'll get a URL like:
```
https://dms-api-xxxxx-uc.a.run.app
```

### Update Frontend

1. **Create `frontend/.env.production`:**
   ```env
   VITE_API_BASE_URL=https://dms-api-xxxxx-uc.a.run.app
   ```

2. **Rebuild and redeploy frontend:**
   ```powershell
   cd frontend
   npm run build
   cd ..
   firebase deploy --only hosting
   ```

## Monitoring

### View Build Logs

```powershell
# View recent builds
gcloud builds list

# View specific build logs
gcloud builds log BUILD_ID
```

### View Cloud Run Logs

```powershell
# View recent logs
gcloud run services logs read dms-api --region asia-south1

# Follow logs in real-time
gcloud run services logs tail dms-api --region asia-south1
```

### View in Console

- **Builds:** https://console.cloud.google.com/cloud-build/builds?project=dhananjaygroup-dms
- **Cloud Run:** https://console.cloud.google.com/run?project=dhananjaygroup-dms

## Updating Your Deployment

### After Code Changes

Simply run the deployment command again:

```powershell
npm run deploy:cloud-build:ps1
```

Cloud Build will:
- Build new version
- Deploy new version
- Keep old version until new one is ready
- Switch traffic to new version

## Troubleshooting

### Build Fails

**Check build logs:**
```powershell
gcloud builds list --limit=1
gcloud builds log BUILD_ID
```

**Common issues:**
- Missing `serviceAccountKey.json` → Use Cloud Run secrets instead
- TypeScript errors → Fix errors, then redeploy
- Missing dependencies → Check `package.json`

### Service Not Accessible

**Check service status:**
```powershell
gcloud run services describe dms-api --region asia-south1
```

**Check logs:**
```powershell
gcloud run services logs read dms-api --region asia-south1
```

### Permission Errors

**Grant Cloud Build permissions:**
```powershell
PROJECT_NUMBER=$(gcloud projects describe dhananjaygroup-dms --format="value(projectNumber)")
gcloud projects add-iam-policy-binding dhananjaygroup-dms \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/run.admin"
```

## Benefits of Cloud Build

✅ **No Docker Desktop** - Builds in cloud  
✅ **No virtualization** - No Windows features needed  
✅ **Faster builds** - Google's powerful servers  
✅ **Consistent** - Same environment every time  
✅ **Scalable** - Handles large builds easily  

## Cost

- **Free tier:** 120 build-minutes/day
- **After free tier:** $0.003 per build-minute
- **Your builds:** ~5-10 minutes each
- **Estimated cost:** $0-0.03 per deployment (likely free!)

## Summary

**Deploy with one command:**
```powershell
npm run deploy:cloud-build:ps1
```

**That's it!** No Docker Desktop, no virtualization setup, just deploy!

---

**Ready?** Run: `npm run deploy:cloud-build:ps1`
