# Cloud Run Deployment - Complete Guide

This guide covers everything you need to deploy your Express API to Google Cloud Run.

## 📚 Documentation Index

1. **[INSTALL_PREREQUISITES.md](./INSTALL_PREREQUISITES.md)** - Install gcloud CLI (Docker NOT needed!)
2. **[CLOUD_RUN_QUICK_START.md](./CLOUD_RUN_QUICK_START.md)** - Quick 5-minute deployment
3. **[CLOUD_RUN_DEPLOYMENT.md](./CLOUD_RUN_DEPLOYMENT.md)** - Complete deployment guide
4. **[CLOUD_RUN_EXPLANATION.md](./CLOUD_RUN_EXPLANATION.md)** - What is Cloud Run?
5. **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Pre-deployment checklist

## 🚀 Quick Start (If Prerequisites Installed)

```powershell
# 1. Login and set project
gcloud auth login
gcloud config set project dhananjaygroup-dms

# 2. Enable APIs (one-time)
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# 3. Deploy (using Cloud Build - no Docker needed!)
npm run deploy:cloud-build:ps1
```

## 📋 Step-by-Step Process

### Step 1: Install Prerequisites

See [INSTALL_PREREQUISITES.md](./INSTALL_PREREQUISITES.md) for detailed instructions.

**Required:**
- Google Cloud CLI (gcloud)
- Docker Desktop

**Quick Install Links:**
- gcloud: https://cloud.google.com/sdk/docs/install
- Docker: https://www.docker.com/products/docker-desktop

### Step 2: Setup Environment

```powershell
# Login to Google Cloud
gcloud auth login

# Set your project
gcloud config set project dhananjaygroup-dms

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### Step 3: Configure Service Account

**Option A: Embed in Docker (Simplest)**
- Ensure `serviceAccountKey.json` is in project root
- It will be copied into the Docker image automatically

**Option B: Use Cloud Run Secrets (Recommended)**
```powershell
# Create secret
gcloud secrets create firebase-service-account --data-file=serviceAccountKey.json

# Grant access
$projectNumber = gcloud projects describe dhananjaygroup-dms --format="value(projectNumber)"
gcloud secrets add-iam-policy-binding firebase-service-account `
  --member="serviceAccount:$projectNumber-compute@developer.gserviceaccount.com" `
  --role="roles/secretmanager.secretAccessor"
```

**Option C: Environment Variables**
- Set `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` in Cloud Run

### Step 4: Deploy

```powershell
npm run deploy:cloud-run:ps1
```

This will:
1. Build TypeScript → JavaScript
2. Create Docker image
3. Push to Google Container Registry
4. Deploy to Cloud Run
5. Provide you with a public URL

### Step 5: Update Frontend

After deployment, you'll get a URL like:
```
https://dms-api-xxxxx-uc.a.run.app
```

1. Create `frontend/.env.production`:
```env
VITE_API_BASE_URL=https://dms-api-xxxxx-uc.a.run.app
```

2. Rebuild and redeploy frontend:
```powershell
cd frontend
npm run build
cd ..
firebase deploy --only hosting
```

## 🔍 Verification

### Test API

```powershell
# Get your API URL
$apiUrl = gcloud run services describe dms-api --region asia-south1 --format="value(status.url)"

# Test health endpoint
curl "$apiUrl/health"

# Should return: {"status":"ok","timestamp":"..."}
```

### View Logs

```powershell
# View recent logs
gcloud run services logs read dms-api --region asia-south1

# Follow logs in real-time
gcloud run services logs tail dms-api --region asia-south1
```

## 📊 Architecture

```
┌─────────────────────────────────┐
│   Firebase Hosting              │
│   Frontend (React)              │
│   https://dhananjaygroup-dms    │
│   .web.app                       │
└──────────────┬──────────────────┘
               │
               │ API Calls
               ▼
┌─────────────────────────────────┐
│   Cloud Run                     │
│   Express API                   │
│   https://dms-api-xxxxx         │
│   .run.app                      │
└──────────────┬──────────────────┘
               │
               │ Database Queries
               ▼
┌─────────────────────────────────┐
│   Firestore                     │
│   Database                      │
│   asia-south1                   │
└─────────────────────────────────┘
```

## 💰 Cost Estimate

- **Free Tier**: 2M requests/month, 360K GB-seconds
- **After Free Tier**: ~$0.40 per million requests
- **Estimated Monthly Cost**: $0-10 for small-medium traffic

## 🔧 Troubleshooting

### Common Issues

**1. "gcloud: command not found"**
- Install gcloud CLI (see INSTALL_PREREQUISITES.md)
- Restart terminal

**2. "Docker: command not found"**
- Install Docker Desktop
- Ensure Docker Desktop is running

**3. "Permission denied"**
```powershell
gcloud projects add-iam-policy-binding dhananjaygroup-dms `
  --member="user:YOUR_EMAIL" `
  --role="roles/run.admin"
```

**4. "Image not found"**
- Ensure Docker image was pushed successfully
- Check: `gcloud container images list`

**5. "Service account key not found"**
- Ensure `serviceAccountKey.json` exists in project root
- OR use Cloud Run secrets
- OR set environment variables

## 📝 Files Created

- `Dockerfile` - Container configuration
- `.dockerignore` - Files to exclude from Docker build
- `deploy-cloud-run.ps1` - PowerShell deployment script
- `deploy-cloud-run.sh` - Bash deployment script
- `cloudbuild.yaml` - Cloud Build configuration
- `setup-cloud-run-env.ps1` - Environment setup helper

## 🎯 Next Steps After Deployment

1. ✅ Test API endpoints
2. ✅ Update frontend API URL
3. ✅ Set up monitoring alerts
4. ✅ Configure custom domain (optional)
5. ✅ Set up CI/CD (optional)

## 📞 Support

- **Cloud Run Docs**: https://cloud.google.com/run/docs
- **Firebase Docs**: https://firebase.google.com/docs
- **Troubleshooting**: Check logs in Cloud Console

## ✅ Success Checklist

- [ ] Prerequisites installed
- [ ] APIs enabled
- [ ] Service account configured
- [ ] API deployed to Cloud Run
- [ ] API URL obtained
- [ ] Frontend updated with API URL
- [ ] Frontend redeployed
- [ ] API tested and working
- [ ] Logs accessible

---

**Ready to deploy?** Start with [INSTALL_PREREQUISITES.md](./INSTALL_PREREQUISITES.md) if you haven't installed the tools yet, or jump to [CLOUD_RUN_QUICK_START.md](./CLOUD_RUN_QUICK_START.md) if everything is ready!
