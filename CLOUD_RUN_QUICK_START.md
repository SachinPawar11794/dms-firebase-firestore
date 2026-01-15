# Cloud Run Quick Start Guide

## 🚀 Quick Deployment (5 Minutes)

### Prerequisites Check
```bash
# Check if gcloud is installed
gcloud --version

# Check if you're logged in
gcloud auth list

# Note: Docker Desktop is NOT needed - Cloud Build handles everything!
```

### Step 1: Set Your Project
```bash
gcloud config set project dhananjaygroup-dms
```

### Step 2: Enable APIs (One-time)
```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### Step 3: Deploy (Using Cloud Build)
**Windows:**
```powershell
npm run deploy:cloud-build:ps1
```

**Mac/Linux:**
```bash
npm run deploy:cloud-build
```

**Or directly:**
```bash
gcloud builds submit --config cloudbuild.yaml
```

### Step 4: Get Your API URL
After deployment, copy the URL shown (e.g., `https://dms-api-xxxxx-uc.a.run.app`)

### Step 5: Update Frontend
1. Create `frontend/.env.production`:
```env
VITE_API_BASE_URL=https://dms-api-xxxxx-uc.a.run.app
```

2. Rebuild and redeploy frontend:
```bash
cd frontend
npm run build
cd ..
firebase deploy --only hosting
```

## ✅ Done!

Your API is now live and accessible from anywhere!

## 📝 Important Notes

- **Service Account Key**: The deployment script will try to copy `serviceAccountKey.json` if it exists
- **Environment Variables**: Set via Cloud Run console or CLI
- **Logs**: View in Cloud Console or via `gcloud run services logs read dms-api --region asia-south1`

## 🔧 Troubleshooting

**Permission Errors:**
```bash
gcloud projects add-iam-policy-binding dhananjaygroup-dms \
  --member="user:YOUR_EMAIL" \
  --role="roles/run.admin"
```

**View Logs:**
```bash
gcloud run services logs read dms-api --region asia-south1
```

## 📚 Full Documentation

See [CLOUD_RUN_DEPLOYMENT.md](./CLOUD_RUN_DEPLOYMENT.md) for complete guide.
