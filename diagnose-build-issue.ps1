# Diagnostic script for Cloud Build issues
$ErrorActionPreference = "Continue"

Write-Host "🔍 Diagnosing Cloud Build Issue" -ForegroundColor Yellow
Write-Host ""

# 1. Check project
Write-Host "1. Checking project..." -ForegroundColor Cyan
$PROJECT_ID = gcloud config get-value project 2>&1
if ($PROJECT_ID -and $PROJECT_ID -notmatch "ERROR") {
    Write-Host "   ✅ Project: $PROJECT_ID" -ForegroundColor Green
} else {
    Write-Host "   ❌ Project not set!" -ForegroundColor Red
    exit 1
}

# 2. Check Cloud Build API
Write-Host ""
Write-Host "2. Checking Cloud Build API..." -ForegroundColor Cyan
$buildApi = gcloud services list --enabled --filter="name:cloudbuild.googleapis.com" --format="value(name)" 2>&1
if ($buildApi -match "cloudbuild") {
    Write-Host "   ✅ Cloud Build API enabled" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Cloud Build API might not be enabled" -ForegroundColor Yellow
    Write-Host "   Enabling now..." -ForegroundColor Yellow
    gcloud services enable cloudbuild.googleapis.com 2>&1
}

# 3. Check Cloud Run API
Write-Host ""
Write-Host "3. Checking Cloud Run API..." -ForegroundColor Cyan
$runApi = gcloud services list --enabled --filter="name:run.googleapis.com" --format="value(name)" 2>&1
if ($runApi -match "run") {
    Write-Host "   ✅ Cloud Run API enabled" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Cloud Run API might not be enabled" -ForegroundColor Yellow
    Write-Host "   Enabling now..." -ForegroundColor Yellow
    gcloud services enable run.googleapis.com 2>&1
}

# 4. Check Container Registry API
Write-Host ""
Write-Host "4. Checking Container Registry API..." -ForegroundColor Cyan
$registryApi = gcloud services list --enabled --filter="name:containerregistry.googleapis.com" --format="value(name)" 2>&1
if ($registryApi -match "containerregistry") {
    Write-Host "   ✅ Container Registry API enabled" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Container Registry API might not be enabled" -ForegroundColor Yellow
    Write-Host "   Enabling now..." -ForegroundColor Yellow
    gcloud services enable containerregistry.googleapis.com 2>&1
}

# 5. Get project number for service account
Write-Host ""
Write-Host "5. Checking Cloud Build service account permissions..." -ForegroundColor Cyan
$PROJECT_NUMBER = gcloud projects describe $PROJECT_ID --format="value(projectNumber)" 2>&1
if ($PROJECT_NUMBER) {
    Write-Host "   Project Number: $PROJECT_NUMBER" -ForegroundColor White
    $SERVICE_ACCOUNT = "$PROJECT_NUMBER@cloudbuild.gserviceaccount.com"
    Write-Host "   Service Account: $SERVICE_ACCOUNT" -ForegroundColor White
    
    # Check if Cloud Build has Run Admin role
    Write-Host ""
    Write-Host "   Granting Cloud Build permissions to deploy to Cloud Run..." -ForegroundColor Yellow
    gcloud projects add-iam-policy-binding $PROJECT_ID `
        --member="serviceAccount:$SERVICE_ACCOUNT" `
        --role="roles/run.admin" 2>&1 | Out-Null
    
    gcloud projects add-iam-policy-binding $PROJECT_ID `
        --member="serviceAccount:$SERVICE_ACCOUNT" `
        --role="roles/iam.serviceAccountUser" 2>&1 | Out-Null
    
    Write-Host "   ✅ Permissions granted" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Could not get project number" -ForegroundColor Yellow
}

# 6. Check if cloudbuild.yaml exists
Write-Host ""
Write-Host "6. Checking cloudbuild.yaml..." -ForegroundColor Cyan
if (Test-Path "cloudbuild.yaml") {
    Write-Host "   ✅ cloudbuild.yaml found" -ForegroundColor Green
} else {
    Write-Host "   ❌ cloudbuild.yaml not found!" -ForegroundColor Red
    exit 1
}

# 7. Check if Dockerfile exists
Write-Host ""
Write-Host "7. Checking Dockerfile..." -ForegroundColor Cyan
if (Test-Path "Dockerfile") {
    Write-Host "   ✅ Dockerfile found" -ForegroundColor Green
} else {
    Write-Host "   ❌ Dockerfile not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "════════════════════════════════════════" -ForegroundColor Green
Write-Host "  ✅ DIAGNOSIS COMPLETE" -ForegroundColor Green
Write-Host "════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "Now try deploying again:" -ForegroundColor Yellow
Write-Host "  npm run deploy:cloud-build:ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "Or check build history:" -ForegroundColor Yellow
Write-Host "  gcloud builds list" -ForegroundColor Cyan
Write-Host ""
