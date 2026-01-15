# Cloud Build Deployment Script for PowerShell
# This script deploys the Express API to Google Cloud Run using Cloud Build
# No Docker Desktop required - builds happen in Google Cloud!

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting Cloud Build Deployment" -ForegroundColor Green
Write-Host "   (No Docker Desktop needed - builds in Google Cloud)" -ForegroundColor Cyan
Write-Host ""

# Check if gcloud CLI is installed
try {
    $gcloudVersion = gcloud --version 2>&1 | Out-Null
} catch {
    Write-Host "❌ Error: gcloud CLI is not installed" -ForegroundColor Red
    Write-Host "Install it from: https://cloud.google.com/sdk/docs/install" -ForegroundColor Yellow
    exit 1
}

# Check if user is logged in
$activeAccount = gcloud auth list --format="value(account)" 2>&1 | Select-String -Pattern "@"
if (-not $activeAccount) {
    Write-Host "⚠️  Not logged in to gcloud. Logging in..." -ForegroundColor Yellow
    gcloud auth login
}

# Get project ID
$PROJECT_ID = gcloud config get-value project 2>&1
if (-not $PROJECT_ID -or $PROJECT_ID -match "ERROR") {
    Write-Host "❌ Error: No project set. Run: gcloud config set project YOUR_PROJECT_ID" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Project: $PROJECT_ID" -ForegroundColor Green

# Enable required APIs (if not already enabled)
Write-Host "📋 Checking APIs..." -ForegroundColor Yellow
gcloud services enable cloudbuild.googleapis.com --quiet 2>&1 | Out-Null
gcloud services enable run.googleapis.com --quiet 2>&1 | Out-Null
gcloud services enable containerregistry.googleapis.com --quiet 2>&1 | Out-Null
Write-Host "✅ APIs ready" -ForegroundColor Green

# Check if cloudbuild.yaml exists
if (-not (Test-Path "cloudbuild.yaml")) {
    Write-Host "❌ Error: cloudbuild.yaml not found" -ForegroundColor Red
    exit 1
}

# Check if serviceAccountKey.json exists
if (Test-Path "serviceAccountKey.json") {
    Write-Host "✅ Service account key found" -ForegroundColor Green
} else {
    Write-Host "⚠️  serviceAccountKey.json not found" -ForegroundColor Yellow
    Write-Host "   Cloud Build will use default service account" -ForegroundColor Yellow
    Write-Host "   Make sure it has Firestore permissions" -ForegroundColor Yellow
}

# Submit build to Cloud Build
Write-Host ""
Write-Host "🔨 Submitting build to Cloud Build..." -ForegroundColor Yellow
Write-Host "   This will build your Docker image in Google Cloud" -ForegroundColor Cyan
Write-Host "   First build takes 5-10 minutes..." -ForegroundColor Yellow
Write-Host ""

gcloud builds submit --config cloudbuild.yaml --project "$PROJECT_ID"

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Build failed. Check the error messages above." -ForegroundColor Red
    Write-Host ""
    Write-Host "View build logs:" -ForegroundColor Yellow
    Write-Host "  gcloud builds list --limit=1" -ForegroundColor Cyan
    Write-Host "  gcloud builds log BUILD_ID" -ForegroundColor Cyan
    exit 1
}

# Wait a moment for deployment to complete
Write-Host ""
Write-Host "⏳ Waiting for deployment to complete..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Get the service URL
Write-Host ""
Write-Host "🔍 Getting service URL..." -ForegroundColor Yellow
$SERVICE_URL = gcloud run services describe dms-api --platform managed --region asia-south1 --format 'value(status.url)' 2>&1

if ($SERVICE_URL -and $SERVICE_URL -notmatch "ERROR") {
    Write-Host ""
    Write-Host "════════════════════════════════════════" -ForegroundColor Green
    Write-Host "  ✅ DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
    Write-Host "════════════════════════════════════════" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Your API is live at:" -ForegroundColor Cyan
    Write-Host "   $SERVICE_URL" -ForegroundColor White
    Write-Host ""
    Write-Host "📝 Next steps:" -ForegroundColor Yellow
    Write-Host "1. Test API: curl $SERVICE_URL/health" -ForegroundColor White
    Write-Host "2. Update frontend .env.production:" -ForegroundColor White
    Write-Host "   VITE_API_BASE_URL=$SERVICE_URL" -ForegroundColor Cyan
    Write-Host "3. Rebuild and redeploy frontend:" -ForegroundColor White
    Write-Host "   cd frontend" -ForegroundColor Cyan
    Write-Host "   npm run build" -ForegroundColor Cyan
    Write-Host "   cd .." -ForegroundColor Cyan
    Write-Host "   firebase deploy --only hosting" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📊 View logs:" -ForegroundColor Yellow
    Write-Host "   gcloud run services logs read dms-api --region asia-south1" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "⚠️  Deployment completed but couldn't get service URL" -ForegroundColor Yellow
    Write-Host "   Check Cloud Run console: https://console.cloud.google.com/run?project=$PROJECT_ID" -ForegroundColor Cyan
}
