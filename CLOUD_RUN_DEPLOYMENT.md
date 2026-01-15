# Cloud Run Deployment Guide

Complete guide for deploying your Express API to Google Cloud Run.

## Prerequisites

1. **Google Cloud Account**: Sign up at [cloud.google.com](https://cloud.google.com)
2. **Google Cloud CLI**: Install from [cloud.google.com/sdk](https://cloud.google.com/sdk/docs/install)
3. **Docker**: Install from [docker.com](https://www.docker.com/products/docker-desktop)
4. **Firebase Project**: Already set up ✅

## Quick Start

### Step 1: Install Google Cloud CLI

**Windows:**
```powershell
# Download and install from:
# https://cloud.google.com/sdk/docs/install
```

**Mac/Linux:**
```bash
# Install via Homebrew (Mac)
brew install google-cloud-sdk

# Or download from:
# https://cloud.google.com/sdk/docs/install
```

### Step 2: Login and Set Project

```bash
# Login to Google Cloud
gcloud auth login

# Set your Firebase project (replace with your project ID)
gcloud config set project dhananjaygroup-dms

# Verify project
gcloud config get-value project
```

### Step 3: Enable Required APIs

```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### Step 4: Build and Deploy

**Windows (PowerShell):**
```powershell
npm run deploy:cloud-run:ps1
```

**Mac/Linux (Bash):**
```bash
npm run deploy:cloud-run
```

**Or manually:**
```bash
# Build TypeScript
npm ci
npm run build

# Build Docker image
docker build -t gcr.io/dhananjaygroup-dms/dms-api .

# Push to Container Registry
docker push gcr.io/dhananjaygroup-dms/dms-api

# Deploy to Cloud Run
gcloud run deploy dms-api \
  --image gcr.io/dhananjaygroup-dms/dms-api \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 300 \
  --set-env-vars "NODE_ENV=production"
```

### Step 5: Get Your API URL

After deployment, you'll get a URL like:
```
https://dms-api-xxxxx-uc.a.run.app
```

### Step 6: Update Frontend Configuration

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

## Environment Variables

### Setting Environment Variables in Cloud Run

For sensitive data like Firebase service account keys, use Cloud Run secrets:

```bash
# Create a secret from your service account key
gcloud secrets create firebase-service-account \
  --data-file=serviceAccountKey.json

# Grant Cloud Run access to the secret
gcloud secrets add-iam-policy-binding firebase-service-account \
  --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Deploy with secret mounted as environment variable
gcloud run deploy dms-api \
  --image gcr.io/dhananjaygroup-dms/dms-api \
  --update-secrets FIREBASE_SERVICE_ACCOUNT_KEY=firebase-service-account:latest
```

### Common Environment Variables

```bash
gcloud run services update dms-api \
  --update-env-vars \
    "NODE_ENV=production,\
    LOG_LEVEL=info,\
    FIREBASE_PROJECT_ID=dhananjaygroup-dms"
```

## Service Account Key Setup

### Option 1: Use Cloud Run Secrets (Recommended)

1. **Create Secret:**
```bash
gcloud secrets create firebase-service-account \
  --data-file=serviceAccountKey.json \
  --project=dhananjaygroup-dms
```

2. **Grant Access:**
```bash
PROJECT_NUMBER=$(gcloud projects describe dhananjaygroup-dms --format="value(projectNumber)")
gcloud secrets add-iam-policy-binding firebase-service-account \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

3. **Update Deployment Script:**
Add `--update-secrets` flag to mount the secret as an environment variable.

### Option 2: Embed in Docker Image (Not Recommended for Production)

If you must include the service account key in the image:
1. Ensure `serviceAccountKey.json` is in your project root
2. The Dockerfile will copy it automatically
3. ⚠️ **Security Risk**: Key is visible in image layers

## Monitoring and Logs

### View Logs

```bash
# View recent logs
gcloud run services logs read dms-api --region asia-south1

# Follow logs in real-time
gcloud run services logs tail dms-api --region asia-south1

# View logs in Cloud Console
# https://console.cloud.google.com/run/detail/asia-south1/dms-api/logs
```

### View Metrics

```bash
# View service details
gcloud run services describe dms-api --region asia-south1

# View in Cloud Console
# https://console.cloud.google.com/run/detail/asia-south1/dms-api/metrics
```

## Updating Your Deployment

### Update Code and Redeploy

```bash
# Make your code changes
# Build and deploy
npm run deploy:cloud-run
```

### Rollback to Previous Version

```bash
# List revisions
gcloud run revisions list --service dms-api --region asia-south1

# Rollback to specific revision
gcloud run services update-traffic dms-api \
  --to-revisions REVISION_NAME=100 \
  --region asia-south1
```

## Scaling Configuration

### Current Settings

- **Min Instances**: 0 (scales to zero when idle)
- **Max Instances**: 10 (can handle up to 10 concurrent instances)
- **Memory**: 512Mi
- **CPU**: 1 vCPU
- **Timeout**: 300 seconds

### Adjust Scaling

```bash
gcloud run services update dms-api \
  --min-instances 1 \
  --max-instances 20 \
  --memory 1Gi \
  --cpu 2 \
  --region asia-south1
```

## Custom Domain

### Add Custom Domain

```bash
# Map custom domain
gcloud run domain-mappings create \
  --service dms-api \
  --domain api.yourdomain.com \
  --region asia-south1
```

## Cost Optimization

### Current Configuration (Cost-Effective)

- **Min Instances**: 0 (no cost when idle)
- **Memory**: 512Mi (sufficient for most APIs)
- **CPU**: 1 vCPU

### Cost Estimate

- **Free Tier**: 2M requests/month, 360K GB-seconds
- **After Free Tier**: ~$0.40 per million requests
- **Estimated Cost**: $0-10/month for small-medium traffic

## Troubleshooting

### Common Issues

#### 1. "Permission denied" errors

```bash
# Grant Cloud Run Admin role
gcloud projects add-iam-policy-binding dhananjaygroup-dms \
  --member="user:YOUR_EMAIL" \
  --role="roles/run.admin"
```

#### 2. "Image not found" errors

```bash
# Ensure image is pushed
docker push gcr.io/dhananjaygroup-dms/dms-api

# Verify image exists
gcloud container images list --repository=gcr.io/dhananjaygroup-dms
```

#### 3. "Port 8080 not listening" errors

- Cloud Run requires listening on PORT environment variable
- Your code already handles this ✅
- Check logs: `gcloud run services logs read dms-api --region asia-south1`

#### 4. Service Account Key Not Found

- Use Cloud Run secrets (recommended)
- Or ensure `serviceAccountKey.json` is in project root before building

### Debug Locally

```bash
# Build and run Docker container locally
docker build -t dms-api-local .
docker run -p 8080:8080 \
  -e PORT=8080 \
  -e NODE_ENV=production \
  -v $(pwd)/serviceAccountKey.json:/app/serviceAccountKey.json \
  dms-api-local

# Test
curl http://localhost:8080/health
```

## CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/deploy-cloud-run.yml`:

```yaml
name: Deploy to Cloud Run

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - uses: google-github-actions/setup-gcloud@v0
        with:
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          project_id: dhananjaygroup-dms
      
      - name: Build and Deploy
        run: |
          npm ci
          npm run build
          gcloud builds submit --config cloudbuild.yaml
```

## Security Best Practices

1. ✅ **Use Secrets Manager** for sensitive data
2. ✅ **Enable HTTPS only** (automatic with Cloud Run)
3. ✅ **Set up IAM roles** properly
4. ✅ **Enable Cloud Armor** for DDoS protection (optional)
5. ✅ **Regular security updates** (automatic with Cloud Run)

## Next Steps

1. ✅ Deploy API to Cloud Run
2. ✅ Update frontend API URL
3. ✅ Test API endpoints
4. ✅ Set up monitoring alerts
5. ✅ Configure custom domain (optional)

## Support

- **Cloud Run Docs**: https://cloud.google.com/run/docs
- **Cloud Run Pricing**: https://cloud.google.com/run/pricing
- **Troubleshooting**: Check logs in Cloud Console

---

**Your API will be accessible at:** `https://dms-api-xxxxx-uc.a.run.app`

Update your frontend `.env.production` file with this URL!
