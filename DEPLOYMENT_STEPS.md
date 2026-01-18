# 📝 Step-by-Step Deployment Guide

Complete step-by-step guide to deploy your application online.

## 🎯 Overview

You'll deploy:
- **Backend** → Google Cloud Run (Express API)
- **Frontend** → Firebase Hosting (React App)
- **Database** → Already set up (Cloud SQL PostgreSQL)

## 📋 Prerequisites Checklist

- [ ] Google Cloud project: `dhananjaygroup-dms`
- [ ] PostgreSQL instance running
- [ ] Database schema applied
- [ ] Service account key: `serviceAccountKey.json`
- [ ] gcloud CLI installed
- [ ] Firebase CLI installed

## 🚀 Step 1: Enable Required APIs

```powershell
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

## 🔐 Step 2: Set Up Database Password Secret (Recommended)

For security, store your database password as a secret:

```powershell
# Create secret
echo "YOUR_DB_PASSWORD" | gcloud secrets create db-password --data-file=-

# Grant Cloud Run access
$projectNumber = gcloud projects describe dhananjaygroup-dms --format="value(projectNumber)"
gcloud secrets add-iam-policy-binding db-password `
  --member="serviceAccount:$projectNumber-compute@developer.gserviceaccount.com" `
  --role="roles/secretmanager.secretAccessor"
```

**Skip this if you want to use environment variable (less secure).**

## 🚀 Step 3: Deploy Everything

### Option A: Automated (Recommended)

```powershell
npm run deploy:cloud-build:ps1
```

This automatically:
1. Builds Docker image
2. Deploys backend to Cloud Run
3. Builds frontend
4. Deploys frontend to Firebase Hosting

### Option B: Manual Steps

#### 3a. Deploy Backend

```powershell
gcloud builds submit --config cloudbuild.yaml
```

#### 3b. Set Database Password

If you didn't use secrets, set password as environment variable:

```powershell
gcloud run services update dms-api `
  --region asia-south1 `
  --update-env-vars "DB_PASSWORD=YOUR_PASSWORD"
```

Or if using secrets:

```powershell
gcloud run services update dms-api `
  --region asia-south1 `
  --update-secrets "DB_PASSWORD=db-password:latest"
```

#### 3c. Deploy Frontend

```powershell
# Get backend URL
$apiUrl = gcloud run services describe dms-api --region asia-south1 --format="value(status.url)"

# Create frontend .env.production
cd frontend
echo "VITE_API_BASE_URL=$apiUrl" > .env.production

# Build and deploy
npm run build
cd ..
firebase deploy --only hosting
```

## ✅ Step 4: Verify Deployment

### Test Backend

```powershell
# Get API URL
$apiUrl = gcloud run services describe dms-api --region asia-south1 --format="value(status.url)"

# Test health endpoint
curl "$apiUrl/health"
```

Expected response:
```json
{"status":"ok","timestamp":"2024-..."}
```

### Test Frontend

1. Visit: `https://dhananjaygroup-dms.web.app`
2. Try logging in
3. Create a test record
4. Verify it's saved

### Check Logs

```powershell
# View backend logs
gcloud run services logs read dms-api --region asia-south1

# Should see:
# ✅ Connected to PostgreSQL database
```

## 🔧 Step 5: Configure Environment Variables (If Needed)

If you need to update environment variables:

```powershell
gcloud run services update dms-api `
  --region asia-south1 `
  --update-env-vars "KEY1=value1,KEY2=value2"
```

## 📊 Step 6: Monitor Your Application

### View Logs

```powershell
# Recent logs
gcloud run services logs read dms-api --region asia-south1

# Follow logs
gcloud run services logs tail dms-api --region asia-south1
```

### View in Console

- **Cloud Run**: https://console.cloud.google.com/run?project=dhananjaygroup-dms
- **Firebase Hosting**: https://console.firebase.google.com/project/dhananjaygroup-dms/hosting
- **Cloud SQL**: https://console.cloud.google.com/sql/instances?project=dhananjaygroup-dms

## 🐛 Troubleshooting

### Backend Not Starting

1. **Check logs:**
   ```powershell
   gcloud run services logs read dms-api --region asia-south1
   ```

2. **Common issues:**
   - Database connection timeout → Check IP whitelisting
   - Missing environment variables → Check Cloud Run config
   - Wrong password → Update DB_PASSWORD

### Frontend Can't Connect

1. **Check API URL** in `frontend/.env.production`
2. **Rebuild frontend:**
   ```powershell
   cd frontend
   npm run build
   cd ..
   firebase deploy --only hosting
   ```

### Database Connection Issues

1. **Whitelist Cloud Run IPs** (if using public IP)
2. **Check password** in secrets/environment variables
3. **Verify database is running**

## 🔄 Updating Your Application

### Update Backend

```powershell
# Just redeploy
npm run deploy:cloud-build:ps1
```

### Update Frontend Only

```powershell
cd frontend
npm run build
cd ..
firebase deploy --only hosting
```

## 💰 Cost Monitoring

Monitor your costs:

- **Cloud Run**: https://console.cloud.google.com/run?project=dhananjaygroup-dms
- **Cloud SQL**: https://console.cloud.google.com/sql/instances?project=dhananjaygroup-dms
- **Billing**: https://console.cloud.google.com/billing?project=dhananjaygroup-dms

## ✅ Success Checklist

- [ ] Backend deployed to Cloud Run
- [ ] Frontend deployed to Firebase Hosting
- [ ] Database password configured
- [ ] Health endpoint works
- [ ] Can log in to application
- [ ] Can create/view data
- [ ] Data persists correctly
- [ ] Logs show no errors

---

**Need help?** Check `HOSTING_GUIDE.md` for detailed information.
