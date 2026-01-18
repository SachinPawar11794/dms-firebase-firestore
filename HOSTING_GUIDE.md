# 🌐 Online Hosting Guide

Complete guide to host your DMS application online using Google Cloud Platform.

## 🎯 Recommended Hosting Architecture

```
┌─────────────────────────────────┐
│   Firebase Hosting              │
│   Frontend (React)              │
│   https://dhananjaygroup-dms   │
│   .web.app                       │
└──────────────┬──────────────────┘
               │
               │ API Calls
               ▼
┌─────────────────────────────────┐
│   Cloud Run                     │
│   Express API (Backend)         │
│   https://dms-api-xxxxx        │
│   .run.app                      │
└──────────────┬──────────────────┘
               │
               │ Database Queries
               ▼
┌─────────────────────────────────┐
│   Cloud SQL (PostgreSQL)         │
│   Database                      │
│   asia-south1                   │
└─────────────────────────────────┘
```

## 📋 Prerequisites

- ✅ Google Cloud Project: `dhananjaygroup-dms`
- ✅ PostgreSQL instance already created
- ✅ Firebase project configured
- ✅ Service account key (`serviceAccountKey.json`)

## 🚀 Quick Deployment (Recommended)

### Option 1: Automated Cloud Build (Easiest)

This deploys both backend and frontend automatically:

```powershell
# 1. Enable required APIs (one-time)
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# 2. Deploy everything
npm run deploy:cloud-build:ps1
```

**What this does:**
1. ✅ Builds Docker image
2. ✅ Deploys backend to Cloud Run
3. ✅ Builds frontend
4. ✅ Deploys frontend to Firebase Hosting
5. ✅ Configures frontend to use backend API URL

---

### Option 2: Manual Step-by-Step

#### Step 1: Deploy Backend (Cloud Run)

```powershell
# Build and deploy
npm run deploy:cloud-build:ps1

# OR manually:
gcloud builds submit --config cloudbuild.yaml
```

**After deployment, you'll get:**
```
✅ Deployment successful!
🌐 Service URL: https://dms-api-xxxxx-uc.a.run.app
```

#### Step 2: Configure Environment Variables in Cloud Run

Set PostgreSQL connection details in Cloud Run:

```powershell
# Get your API URL first
$apiUrl = gcloud run services describe dms-api --region asia-south1 --format="value(status.url)"

# Update environment variables
gcloud run services update dms-api `
  --region asia-south1 `
  --set-env-vars "DB_HOST=35.244.20.105,DB_PORT=5432,DB_NAME=dms_db,DB_USER=dms_user,DB_PASSWORD=YOUR_PASSWORD,DB_SSL=true,DB_POOL_MAX=20,DB_POOL_IDLE_TIMEOUT=30000,DB_POOL_CONNECTION_TIMEOUT=2000,NODE_ENV=production,FIREBASE_PROJECT_ID=dhananjaygroup-dms"
```

**⚠️ Security Note:** For production, use Cloud Secret Manager instead:

```powershell
# Create secrets
gcloud secrets create db-password --data-file=- <<< "YOUR_PASSWORD"
gcloud secrets create firebase-private-key --data-file=serviceAccountKey.json

# Grant access
$projectNumber = gcloud projects describe dhananjaygroup-dms --format="value(projectNumber)"
gcloud secrets add-iam-policy-binding db-password `
  --member="serviceAccount:$projectNumber-compute@developer.gserviceaccount.com" `
  --role="roles/secretmanager.secretAccessor"
```

#### Step 3: Deploy Frontend

```powershell
# 1. Get backend API URL
$apiUrl = gcloud run services describe dms-api --region asia-south1 --format="value(status.url)"

# 2. Create frontend .env.production
cd frontend
echo "VITE_API_BASE_URL=$apiUrl" > .env.production

# 3. Build frontend
npm run build

# 4. Deploy to Firebase Hosting
cd ..
firebase deploy --only hosting
```

---

## 🔧 Configuration Details

### Backend Environment Variables (Cloud Run)

Required environment variables:

```env
# Node Environment
NODE_ENV=production
PORT=8080

# PostgreSQL Database
DB_HOST=35.244.20.105
DB_PORT=5432
DB_NAME=dms_db
DB_USER=dms_user
DB_PASSWORD=YOUR_PASSWORD
DB_SSL=true
DB_POOL_MAX=20
DB_POOL_IDLE_TIMEOUT=30000
DB_POOL_CONNECTION_TIMEOUT=2000

# Firebase (for Auth & Storage)
FIREBASE_PROJECT_ID=dhananjaygroup-dms
FIREBASE_SERVICE_ACCOUNT_KEY=./serviceAccountKey.json
# OR use individual variables:
# FIREBASE_CLIENT_EMAIL=...
# FIREBASE_PRIVATE_KEY=...
```

### Frontend Environment Variables

Create `frontend/.env.production`:

```env
VITE_API_BASE_URL=https://dms-api-xxxxx-uc.a.run.app
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=dhananjaygroup-dms.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=dhananjaygroup-dms
VITE_FIREBASE_STORAGE_BUCKET=dhananjaygroup-dms.appspot.com
```

---

## 🔒 Security Best Practices

### 1. Use Cloud Secret Manager (Recommended)

Instead of plain environment variables:

```powershell
# Create secrets
gcloud secrets create db-password --data-file=- <<< "YOUR_PASSWORD"
gcloud secrets create firebase-service-account --data-file=serviceAccountKey.json

# Update Cloud Run to use secrets
gcloud run services update dms-api `
  --region asia-south1 `
  --update-secrets "DB_PASSWORD=db-password:latest,FIREBASE_SERVICE_ACCOUNT_KEY=firebase-service-account:latest"
```

### 2. Database IP Whitelisting

Ensure Cloud Run can access PostgreSQL:

```powershell
# Get Cloud Run IP ranges (if needed)
# Cloud Run uses dynamic IPs, so you may need to:
# 1. Allow all IPs temporarily for testing
# 2. Use Private IP connection (recommended for production)
```

### 3. Enable CORS Properly

Already configured in `src/index.ts` with CORS middleware.

---

## 📊 Monitoring & Logs

### View Logs

```powershell
# View recent logs
gcloud run services logs read dms-api --region asia-south1

# Follow logs in real-time
gcloud run services logs tail dms-api --region asia-south1

# View logs in browser
# Go to: https://console.cloud.google.com/run/detail/asia-south1/dms-api/logs
```

### Monitor Performance

```powershell
# View service metrics
gcloud run services describe dms-api --region asia-south1

# Check database connections
# Go to: https://console.cloud.google.com/sql/instances/dms-postgres/overview
```

---

## 🧪 Testing After Deployment

### 1. Test Backend API

```powershell
# Get API URL
$apiUrl = gcloud run services describe dms-api --region asia-south1 --format="value(status.url)"

# Test health endpoint
curl "$apiUrl/health"

# Should return: {"status":"ok","timestamp":"..."}
```

### 2. Test Frontend

1. Visit: `https://dhananjaygroup-dms.web.app`
2. Test login
3. Test creating records
4. Verify data is saved to PostgreSQL

### 3. Test Database Connection

Check Cloud Run logs for:
```
✅ Connected to PostgreSQL database
```

---

## 💰 Cost Estimate

### Cloud Run (Backend)
- **Free Tier**: 2M requests/month, 360K GB-seconds
- **After Free Tier**: ~$0.40 per million requests
- **Estimated**: $0-10/month for small-medium traffic

### Cloud SQL (PostgreSQL)
- **Your Setup**: db-f1-micro, 100GB storage
- **Estimated**: ~$15-25/month

### Firebase Hosting (Frontend)
- **Free Tier**: 10GB storage, 360MB/day transfer
- **After Free Tier**: $0.026/GB storage, $0.15/GB transfer
- **Estimated**: $0-5/month

### Total Estimated Cost: $15-40/month

---

## 🔄 Updating/Re-deploying

### Update Backend

```powershell
# Just run the deployment again
npm run deploy:cloud-build:ps1
```

### Update Frontend Only

```powershell
cd frontend
npm run build
cd ..
firebase deploy --only hosting
```

### Rollback (if needed)

```powershell
# List revisions
gcloud run revisions list --service dms-api --region asia-south1

# Rollback to previous revision
gcloud run services update-traffic dms-api `
  --region asia-south1 `
  --to-revisions REVISION_NAME=100
```

---

## 🐛 Troubleshooting

### Backend Not Starting

1. **Check logs:**
   ```powershell
   gcloud run services logs read dms-api --region asia-south1
   ```

2. **Common issues:**
   - Database connection timeout → Check IP whitelisting
   - Missing environment variables → Check Cloud Run config
   - Service account issues → Verify `serviceAccountKey.json`

### Frontend Can't Connect to Backend

1. **Check CORS settings** in backend
2. **Verify API URL** in `frontend/.env.production`
3. **Check browser console** for errors

### Database Connection Issues

1. **Verify IP whitelisting** in Cloud SQL
2. **Check password** in environment variables
3. **Test connection locally** first

---

## 📝 Deployment Checklist

Before deploying:

- [ ] PostgreSQL instance running
- [ ] Database schema applied
- [ ] Environment variables ready
- [ ] Service account key available
- [ ] APIs enabled in Google Cloud
- [ ] Frontend `.env.production` configured
- [ ] Tested locally first

After deploying:

- [ ] Backend health endpoint works
- [ ] Frontend loads correctly
- [ ] Can log in
- [ ] Can create/view data
- [ ] Data persists in PostgreSQL
- [ ] Logs show no errors

---

## 🎯 Next Steps

1. ✅ Deploy backend to Cloud Run
2. ✅ Deploy frontend to Firebase Hosting
3. ✅ Configure environment variables
4. ✅ Test all features
5. ✅ Set up monitoring alerts
6. ✅ Configure custom domain (optional)

---

## 📚 Additional Resources

- **Cloud Run Docs**: https://cloud.google.com/run/docs
- **Firebase Hosting**: https://firebase.google.com/docs/hosting
- **Cloud SQL**: https://cloud.google.com/sql/docs/postgres
- **Cloud Build**: https://cloud.google.com/build/docs

---

**Ready to deploy?** Start with: `npm run deploy:cloud-build:ps1` 🚀
