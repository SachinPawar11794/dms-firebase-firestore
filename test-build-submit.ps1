# Test Cloud Build submission with verbose output
$ErrorActionPreference = "Continue"

Write-Host "🧪 Testing Cloud Build Submission" -ForegroundColor Yellow
Write-Host ""

# Get project
$PROJECT_ID = gcloud config get-value project 2>&1
if (-not $PROJECT_ID -or $PROJECT_ID -match "ERROR") {
    Write-Host "❌ Project not set!" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Project: $PROJECT_ID" -ForegroundColor Green
Write-Host ""

# Check if we're authenticated
Write-Host "1. Checking authentication..." -ForegroundColor Cyan
$auth = gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>&1
if ($auth) {
    Write-Host "   ✅ Authenticated as: $auth" -ForegroundColor Green
} else {
    Write-Host "   ❌ Not authenticated!" -ForegroundColor Red
    Write-Host "   Run: gcloud auth login" -ForegroundColor Yellow
    exit 1
}

# Check billing
Write-Host ""
Write-Host "2. Checking billing..." -ForegroundColor Cyan
$billing = gcloud billing projects describe $PROJECT_ID --format="value(billingAccountName)" 2>&1
if ($billing -and $billing -notmatch "ERROR") {
    Write-Host "   ✅ Billing account linked: $billing" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  No billing account linked!" -ForegroundColor Yellow
    Write-Host "   Cloud Build requires billing to be enabled" -ForegroundColor Yellow
    Write-Host "   Link billing: https://console.cloud.google.com/billing?project=$PROJECT_ID" -ForegroundColor Cyan
}

# Check APIs
Write-Host ""
Write-Host "3. Checking APIs..." -ForegroundColor Cyan
$apis = @("cloudbuild.googleapis.com", "run.googleapis.com", "containerregistry.googleapis.com")
foreach ($api in $apis) {
    $enabled = gcloud services list --enabled --filter="name:$api" --format="value(name)" 2>&1
    if ($enabled -match $api) {
        Write-Host "   ✅ $api enabled" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  $api not enabled - enabling now..." -ForegroundColor Yellow
        gcloud services enable $api 2>&1 | Out-Null
        Write-Host "   ✅ $api enabled" -ForegroundColor Green
    }
}

# Check Cloud Build service account permissions
Write-Host ""
Write-Host "4. Checking Cloud Build permissions..." -ForegroundColor Cyan
$PROJECT_NUMBER = gcloud projects describe $PROJECT_ID --format="value(projectNumber)" 2>&1
if ($PROJECT_NUMBER) {
    $SERVICE_ACCOUNT = "$PROJECT_NUMBER@cloudbuild.gserviceaccount.com"
    Write-Host "   Service Account: $SERVICE_ACCOUNT" -ForegroundColor White
    
    # Grant permissions
    Write-Host "   Granting permissions..." -ForegroundColor Yellow
    gcloud projects add-iam-policy-binding $PROJECT_ID `
        --member="serviceAccount:$SERVICE_ACCOUNT" `
        --role="roles/run.admin" 2>&1 | Out-Null
    
    gcloud projects add-iam-policy-binding $PROJECT_ID `
        --member="serviceAccount:$SERVICE_ACCOUNT" `
        --role="roles/iam.serviceAccountUser" 2>&1 | Out-Null
    
    Write-Host "   ✅ Permissions granted" -ForegroundColor Green
}

# Check required files
Write-Host ""
Write-Host "5. Checking required files..." -ForegroundColor Cyan
$files = @("cloudbuild.yaml", "Dockerfile", "package.json")
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file exists" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file missing!" -ForegroundColor Red
        exit 1
    }
}

# Try submitting a build with verbose output
Write-Host ""
Write-Host "════════════════════════════════════════" -ForegroundColor Green
Write-Host "  🚀 SUBMITTING BUILD (with verbose output)" -ForegroundColor Green
Write-Host "════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

# Submit build and capture all output
Write-Host "Running: gcloud builds submit --config cloudbuild.yaml --project $PROJECT_ID" -ForegroundColor Cyan
Write-Host ""

$buildOutput = gcloud builds submit --config cloudbuild.yaml --project $PROJECT_ID 2>&1

# Check exit code
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Build submitted successfully!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Build submission failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error output:" -ForegroundColor Yellow
    Write-Host $buildOutput -ForegroundColor Red
}

# Wait a moment
Start-Sleep -Seconds 5

# Check if build appears in list
Write-Host ""
Write-Host "6. Checking if build appears in list..." -ForegroundColor Cyan
$builds = gcloud builds list --limit=5 --format="table(id,status,createTime)" 2>&1
Write-Host $builds

if ($builds -match "Listed 0 items") {
    Write-Host ""
    Write-Host "⚠️  Still showing 0 items!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Possible issues:" -ForegroundColor Yellow
    Write-Host "1. Billing not enabled (Cloud Build requires billing)" -ForegroundColor White
    Write-Host "2. Quota exceeded" -ForegroundColor White
    Write-Host "3. Build submission failed silently" -ForegroundColor White
    Write-Host ""
    Write-Host "Check Cloud Build console:" -ForegroundColor Cyan
    Write-Host "https://console.cloud.google.com/cloud-build/builds?project=$PROJECT_ID" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "✅ Builds are appearing in the list!" -ForegroundColor Green
}
