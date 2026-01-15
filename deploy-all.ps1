# Deploy Both Frontend and Backend
# This script deploys both the backend API and frontend in sequence

$ErrorActionPreference = "Stop"

Write-Host "🚀 Deploying Complete Application" -ForegroundColor Green
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Step 1: Deploy Backend
Write-Host "📦 Step 1: Deploying Backend API..." -ForegroundColor Yellow
Write-Host ""

$backendScript = Join-Path $PSScriptRoot "deploy-cloud-build.ps1"
if (Test-Path $backendScript) {
    & $backendScript
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "❌ Backend deployment failed. Stopping." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "⚠️  deploy-cloud-build.ps1 not found. Running direct command..." -ForegroundColor Yellow
    gcloud builds submit --config cloudbuild.yaml --project dhananjaygroup-dms
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "❌ Backend deployment failed. Stopping." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "✅ Backend deployed successfully!" -ForegroundColor Green
Write-Host ""

# Get the service URL to update frontend
Write-Host "🔍 Getting API URL..." -ForegroundColor Cyan
$SERVICE_URL = gcloud run services describe dms-api --platform managed --region asia-south1 --format 'value(status.url)' --project dhananjaygroup-dms 2>&1

if ($SERVICE_URL -and $SERVICE_URL -notmatch "ERROR") {
    Write-Host "✅ API URL: $SERVICE_URL" -ForegroundColor Green
    Write-Host ""
    
    # Update frontend .env.production
    Write-Host "📝 Updating frontend API URL..." -ForegroundColor Yellow
    $envFile = Join-Path $PSScriptRoot "frontend\.env.production"
    $envContent = "VITE_API_BASE_URL=$SERVICE_URL"
    $envContent | Out-File -FilePath $envFile -Encoding utf8 -Force
    Write-Host "✅ Updated frontend/.env.production" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "⚠️  Could not get API URL. Using existing .env.production" -ForegroundColor Yellow
    Write-Host ""
}

# Step 2: Deploy Frontend
Write-Host "🎨 Step 2: Building and Deploying Frontend..." -ForegroundColor Yellow
Write-Host ""

$frontendDir = Join-Path $PSScriptRoot "frontend"
if (-not (Test-Path $frontendDir)) {
    Write-Host "❌ Frontend directory not found!" -ForegroundColor Red
    exit 1
}

# Build frontend
Write-Host "🔨 Building frontend..." -ForegroundColor Cyan
Push-Location $frontendDir
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Frontend build failed!" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

Write-Host "✅ Frontend built successfully!" -ForegroundColor Green
Write-Host ""

# Deploy to Firebase Hosting
Write-Host "🚀 Deploying to Firebase Hosting..." -ForegroundColor Cyan
firebase deploy --only hosting --project dhananjaygroup-dms
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Frontend deployment failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "════════════════════════════════════════" -ForegroundColor Green
Write-Host "  ✅ COMPLETE DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
Write-Host "════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Your application is live:" -ForegroundColor Cyan
if ($SERVICE_URL) {
    Write-Host "   Backend API: $SERVICE_URL" -ForegroundColor White
}
Write-Host "   Frontend:    https://dhananjaygroup-dms.web.app" -ForegroundColor White
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "1. Test frontend: https://dhananjaygroup-dms.web.app" -ForegroundColor White
if ($SERVICE_URL) {
    Write-Host "2. Test API: $SERVICE_URL/health" -ForegroundColor White
}
Write-Host ""
