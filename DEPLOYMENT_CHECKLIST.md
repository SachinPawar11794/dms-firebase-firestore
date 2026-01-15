# Cloud Run Deployment Checklist

Use this checklist to ensure everything is ready for deployment.

## Prerequisites

- [ ] **Google Cloud Account** created
- [ ] **Google Cloud CLI (gcloud)** installed
  - Verify: `gcloud --version`
- [ ] **Docker Desktop** installed and running
  - Verify: `docker --version`
  - Verify: `docker run hello-world`
- [ ] **Logged in to Google Cloud**
  - Verify: `gcloud auth list`
  - If not: `gcloud auth login`
- [ ] **Project set correctly**
  - Verify: `gcloud config get-value project`
  - Should show: `dhananjaygroup-dms`
  - If not: `gcloud config set project dhananjaygroup-dms`

## APIs Enabled

- [ ] **Cloud Build API** enabled
  - Command: `gcloud services enable cloudbuild.googleapis.com`
- [ ] **Cloud Run API** enabled
  - Command: `gcloud services enable run.googleapis.com`
- [ ] **Container Registry API** enabled
  - Command: `gcloud services enable containerregistry.googleapis.com`
- [ ] **Secret Manager API** enabled (optional, for secrets)
  - Command: `gcloud services enable secretmanager.googleapis.com`

## Code Preparation

- [ ] **TypeScript compiles successfully**
  - Command: `npm run build`
- [ ] **Service account key exists** (or alternative method set up)
  - File: `serviceAccountKey.json` in project root
  - OR: Cloud Run secret configured
  - OR: Environment variables ready
- [ ] **Dockerfile exists**
  - File: `Dockerfile` in project root
- [ ] **.dockerignore exists**
  - File: `.dockerignore` in project root

## Deployment Steps

- [ ] **Build TypeScript**
  - Command: `npm run build`
- [ ] **Deploy to Cloud Run**
  - Windows: `npm run deploy:cloud-run:ps1`
  - Mac/Linux: `npm run deploy:cloud-run`
- [ ] **Note the API URL** provided after deployment
  - Format: `https://dms-api-xxxxx-uc.a.run.app`

## Post-Deployment

- [ ] **Test API health endpoint**
  - Command: `curl https://YOUR_API_URL/health`
- [ ] **View logs** (if needed)
  - Command: `gcloud run services logs read dms-api --region asia-south1`
- [ ] **Update frontend environment**
  - Create: `frontend/.env.production`
  - Add: `VITE_API_BASE_URL=https://YOUR_API_URL`
- [ ] **Rebuild frontend**
  - Command: `cd frontend && npm run build`
- [ ] **Redeploy frontend**
  - Command: `firebase deploy --only hosting`

## Verification

- [ ] **API accessible from browser**
  - Visit: `https://YOUR_API_URL/health`
  - Should return: `{"status":"ok","timestamp":"..."}`
- [ ] **Frontend connects to API**
  - Open frontend app
  - Check browser console for API calls
  - Verify no CORS errors
- [ ] **Authentication works**
  - Try logging in
  - Verify API calls include auth token

## Troubleshooting

If deployment fails:

- [ ] Check gcloud authentication: `gcloud auth list`
- [ ] Check project: `gcloud config get-value project`
- [ ] Check Docker: `docker ps`
- [ ] View build logs in Cloud Console
- [ ] Check service account permissions
- [ ] Verify environment variables are set

## Security Checklist

- [ ] **Service account key** not committed to git (check `.gitignore`)
- [ ] **Cloud Run secrets** set up (if using secrets)
- [ ] **Environment variables** set securely
- [ ] **HTTPS only** (automatic with Cloud Run)
- [ ] **CORS** configured correctly
- [ ] **Firestore security rules** deployed

## Cost Monitoring

- [ ] **Billing alerts** set up in Google Cloud Console
- [ ] **Usage monitoring** enabled
- [ ] **Budget limits** configured (optional)

## Documentation

- [ ] **API URL** documented
- [ ] **Environment variables** documented
- [ ] **Deployment process** documented
- [ ] **Team members** informed of new API URL

---

**Status:** ⬜ Not Started | 🟡 In Progress | ✅ Complete

**Last Updated:** [Date]

**Deployed URL:** [Your API URL here]
