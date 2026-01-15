# Cloud Run Deployment Script for PowerShell
# This script builds and deploys the Express API to Google Cloud Run

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting Cloud Run Deployment" -ForegroundColor Green
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
$activeAccount = gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>&1
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

# Enable required APIs
Write-Host "📋 Enabling required APIs..." -ForegroundColor Yellow
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Build the application
Write-Host "🔨 Building TypeScript..." -ForegroundColor Yellow
npm ci
npm run build

# Set image name
$IMAGE_NAME = "gcr.io/$PROJECT_ID/dms-api"
Write-Host "🐳 Building Docker image: $IMAGE_NAME" -ForegroundColor Yellow

# Build Docker image
docker build -t "$IMAGE_NAME`:latest" .

# Push to Container Registry
Write-Host "📤 Pushing image to Container Registry..." -ForegroundColor Yellow
docker push "$IMAGE_NAME`:latest"

# Deploy to Cloud Run
Write-Host "🚀 Deploying to Cloud Run..." -ForegroundColor Yellow

# Set environment variables
$envVars = @(
    "NODE_ENV=production",
    "FIREBASE_PROJECT_ID=$PROJECT_ID"
)

# Check if serviceAccountKey.json exists and add path
if (Test-Path "serviceAccountKey.json") {
    $envVars += "FIREBASE_SERVICE_ACCOUNT_KEY=./serviceAccountKey.json"
    Write-Host "✅ Service account key found - will be included in deployment" -ForegroundColor Green
} else {
    Write-Host "⚠️  serviceAccountKey.json not found" -ForegroundColor Yellow
    Write-Host "   You'll need to set FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY as environment variables" -ForegroundColor Yellow
    Write-Host "   Or use Cloud Run secrets (see CLOUD_RUN_DEPLOYMENT.md)" -ForegroundColor Yellow
}

$envVarsString = $envVars -join ","

gcloud run deploy dms-api `
  --image "$IMAGE_NAME`:latest" `
  --platform managed `
  --region asia-south1 `
  --allow-unauthenticated `
  --memory 512Mi `
  --cpu 1 `
  --min-instances 0 `
  --max-instances 10 `
  --timeout 300 `
  --set-env-vars "$envVarsString" `
  --project "$PROJECT_ID"

# Get the service URL
$SERVICE_URL = gcloud run services describe dms-api --platform managed --region asia-south1 --format 'value(status.url)'

Write-Host ""
Write-Host "✅ Deployment successful!" -ForegroundColor Green
Write-Host "🌐 Service URL: $SERVICE_URL" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "1. Update your frontend .env file with: VITE_API_BASE_URL=$SERVICE_URL"
Write-Host "2. Test the API: curl $SERVICE_URL/health"
Write-Host "3. View logs: gcloud run services logs read dms-api --region asia-south1"
