# Setup Cloud Build Trigger Script
# Helps verify prerequisites and provides commands for setting up automatic deployments

$ErrorActionPreference = "Stop"

Write-Host "Setting Up Cloud Build Trigger for Automatic Deployments" -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host ""

# Check if gcloud is installed
try {
    $gcloudVersion = gcloud --version 2>&1 | Out-Null
    Write-Host "[OK] gcloud CLI is installed" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] gcloud CLI is not installed" -ForegroundColor Red
    Write-Host "Install from: https://cloud.google.com/sdk/docs/install" -ForegroundColor Yellow
    exit 1
}

# Check if logged in
$activeAccount = gcloud auth list --format="value(account)" 2>&1 | Select-String -Pattern "@"
if (-not $activeAccount) {
    Write-Host "[WARNING] Not logged in to gcloud" -ForegroundColor Yellow
    Write-Host "Run: gcloud auth login" -ForegroundColor Cyan
    exit 1
}
Write-Host "[OK] Logged in as: $activeAccount" -ForegroundColor Green

# Get project
$PROJECT_ID = gcloud config get-value project 2>&1
if (-not $PROJECT_ID -or $PROJECT_ID -match "ERROR") {
    Write-Host "[ERROR] No project set" -ForegroundColor Red
    Write-Host "Run: gcloud config set project dhananjaygroup-dms" -ForegroundColor Yellow
    exit 1
}
Write-Host "[OK] Project: $PROJECT_ID" -ForegroundColor Green
Write-Host ""

# Check APIs
Write-Host "Checking required APIs..." -ForegroundColor Cyan
$apis = @(
    "cloudbuild.googleapis.com",
    "run.googleapis.com",
    "containerregistry.googleapis.com"
)

foreach ($api in $apis) {
    $status = gcloud services list --enabled --filter="name:$api" --format="value(name)" 2>&1
    if ($status -match $api) {
        Write-Host "  [OK] $api" -ForegroundColor Green
    } else {
        Write-Host "  [WARNING] $api not enabled" -ForegroundColor Yellow
        Write-Host "    Enabling..." -ForegroundColor Cyan
        gcloud services enable $api --project $PROJECT_ID 2>&1 | Out-Null
        Write-Host "    [OK] Enabled" -ForegroundColor Green
    }
}
Write-Host ""

# Check Cloud Build service account permissions
Write-Host "Checking Cloud Build service account permissions..." -ForegroundColor Cyan
$PROJECT_NUMBER = gcloud projects describe $PROJECT_ID --format="value(projectNumber)" 2>&1
$SERVICE_ACCOUNT = "$PROJECT_NUMBER@cloudbuild.gserviceaccount.com"

$hasPermission = gcloud projects get-iam-policy $PROJECT_ID --flatten="bindings[].members" --filter="bindings.members:serviceAccount:$SERVICE_ACCOUNT AND bindings.role:roles/run.admin" --format="value(bindings.role)" 2>&1

if ($hasPermission) {
    Write-Host "[OK] Cloud Build has Cloud Run Admin permission" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Cloud Build needs Cloud Run Admin permission" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Granting permission..." -ForegroundColor Cyan
    gcloud projects add-iam-policy-binding $PROJECT_ID `
        --member="serviceAccount:$SERVICE_ACCOUNT" `
        --role="roles/run.admin" 2>&1 | Out-Null
    Write-Host "[OK] Permission granted" -ForegroundColor Green
}
Write-Host ""

# Instructions
Write-Host "=========================================================" -ForegroundColor Green
Write-Host "  Setup Instructions" -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Green
Write-Host ""
Write-Host "To set up automatic deployments:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Open Cloud Build Console:" -ForegroundColor White
Write-Host "   https://console.cloud.google.com/cloud-build/triggers?project=$PROJECT_ID" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Click 'Connect Repository' or 'Create Trigger'" -ForegroundColor White
Write-Host ""
Write-Host "3. Connect GitHub:" -ForegroundColor White
Write-Host "   - Select 'GitHub (Cloud Build GitHub App)'" -ForegroundColor Cyan
Write-Host "   - Authorize and select: SachinPawar11794/dms-firebase-firestore" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Create Trigger:" -ForegroundColor White
Write-Host "   - Name: deploy-dms-api" -ForegroundColor Cyan
Write-Host "   - Event: Push to a branch" -ForegroundColor Cyan
Write-Host "   - Branch: ^main$" -ForegroundColor Cyan
Write-Host "   - Configuration: cloudbuild.yaml" -ForegroundColor Cyan
Write-Host ""
Write-Host "5. Click 'Create'" -ForegroundColor White
Write-Host ""
Write-Host "6. Test by pushing a change:" -ForegroundColor White
Write-Host "   git add ." -ForegroundColor Cyan
Write-Host "   git commit -m 'Test automatic deployment'" -ForegroundColor Cyan
Write-Host "   git push origin main" -ForegroundColor Cyan
Write-Host ""
Write-Host "See SETUP_AUTOMATIC_DEPLOYMENTS.md for detailed instructions" -ForegroundColor Yellow
Write-Host ""
