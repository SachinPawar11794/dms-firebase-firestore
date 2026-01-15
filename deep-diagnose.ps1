# Deep diagnostic for Cloud Build issues
$ErrorActionPreference = "Continue"

Write-Host "🔍 Deep Diagnostic for Cloud Build" -ForegroundColor Yellow
Write-Host ""

$PROJECT_ID = "dhananjaygroup-dms"

# 1. Verify project
Write-Host "1. Checking project..." -ForegroundColor Cyan
$currentProject = gcloud config get-value project 2>&1
if ($currentProject -eq $PROJECT_ID) {
    Write-Host "   ✅ Project correct: $PROJECT_ID" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Project mismatch! Current: $currentProject" -ForegroundColor Yellow
    Write-Host "   Setting project to $PROJECT_ID..." -ForegroundColor Yellow
    gcloud config set project $PROJECT_ID 2>&1 | Out-Null
}

# 2. Check Cloud Build API
Write-Host ""
Write-Host "2. Checking Cloud Build API..." -ForegroundColor Cyan
$buildApi = gcloud services list --enabled --filter="name:cloudbuild.googleapis.com" --format="value(name)" 2>&1
if ($buildApi -match "cloudbuild") {
    Write-Host "   ✅ Cloud Build API enabled" -ForegroundColor Green
} else {
    Write-Host "   ❌ Cloud Build API NOT enabled!" -ForegroundColor Red
    Write-Host "   Enabling now..." -ForegroundColor Yellow
    gcloud services enable cloudbuild.googleapis.com 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Cloud Build API enabled" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Failed to enable API!" -ForegroundColor Red
    }
}

# 3. Check Cloud Build service account permissions
Write-Host ""
Write-Host "3. Checking Cloud Build service account..." -ForegroundColor Cyan
$PROJECT_NUMBER = gcloud projects describe $PROJECT_ID --format="value(projectNumber)" 2>&1
if ($PROJECT_NUMBER) {
    $SERVICE_ACCOUNT = "$PROJECT_NUMBER@cloudbuild.gserviceaccount.com"
    Write-Host "   Service Account: $SERVICE_ACCOUNT" -ForegroundColor White
    
    # Check current permissions
    Write-Host "   Checking permissions..." -ForegroundColor Yellow
    $permissions = gcloud projects get-iam-policy $PROJECT_ID --flatten="bindings[].members" --filter="bindings.members:serviceAccount:$SERVICE_ACCOUNT" --format="value(bindings.role)" 2>&1
    
    $hasRunAdmin = $permissions -match "roles/run.admin"
    $hasServiceAccountUser = $permissions -match "roles/iam.serviceAccountUser"
    
    if ($hasRunAdmin -and $hasServiceAccountUser) {
        Write-Host "   ✅ Permissions OK" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Missing permissions, granting..." -ForegroundColor Yellow
        gcloud projects add-iam-policy-binding $PROJECT_ID `
            --member="serviceAccount:$SERVICE_ACCOUNT" `
            --role="roles/run.admin" 2>&1 | Out-Null
        
        gcloud projects add-iam-policy-binding $PROJECT_ID `
            --member="serviceAccount:$SERVICE_ACCOUNT" `
            --role="roles/iam.serviceAccountUser" 2>&1 | Out-Null
        
        Write-Host "   ✅ Permissions granted" -ForegroundColor Green
    }
} else {
    Write-Host "   ⚠️  Could not get project number" -ForegroundColor Yellow
}

# 4. Check if cloudbuild.yaml exists and is valid
Write-Host ""
Write-Host "4. Checking cloudbuild.yaml..." -ForegroundColor Cyan
if (Test-Path "cloudbuild.yaml") {
    Write-Host "   ✅ cloudbuild.yaml exists" -ForegroundColor Green
    
    # Check if we're in the right directory
    $currentDir = Get-Location
    Write-Host "   Current directory: $currentDir" -ForegroundColor White
    
    if ($currentDir -notmatch "DMS FIREBASE FIRESTORE") {
        Write-Host "   ⚠️  Not in project root! Changing..." -ForegroundColor Yellow
        Set-Location "D:\DMS FIREBASE FIRESTORE"
        Write-Host "   ✅ Changed to project root" -ForegroundColor Green
    }
} else {
    Write-Host "   ❌ cloudbuild.yaml not found!" -ForegroundColor Red
    Write-Host "   Current directory: $(Get-Location)" -ForegroundColor Yellow
    exit 1
}

# 5. Try submitting a build with full output
Write-Host ""
Write-Host "════════════════════════════════════════" -ForegroundColor Green
Write-Host "  5. SUBMITTING BUILD (with full output)" -ForegroundColor Green
Write-Host "════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

# Change to project root if needed
Set-Location "D:\DMS FIREBASE FIRESTORE"

Write-Host "Submitting build..." -ForegroundColor Cyan
Write-Host "Command: gcloud builds submit --config cloudbuild.yaml --project $PROJECT_ID" -ForegroundColor Gray
Write-Host ""

# Submit build and show all output
$buildResult = gcloud builds submit --config cloudbuild.yaml --project $PROJECT_ID 2>&1
$buildExitCode = $LASTEXITCODE

Write-Host $buildResult

Write-Host ""
if ($buildExitCode -eq 0) {
    Write-Host "✅ Build submitted successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Build submission failed with exit code: $buildExitCode" -ForegroundColor Red
}

# 6. Wait and check builds
Write-Host ""
Write-Host "6. Waiting 10 seconds, then checking builds..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "Checking build list..." -ForegroundColor Cyan
$builds = gcloud builds list --limit=10 --format='table(id,status,createTime)' 2>&1
Write-Host $builds

if ($builds -match "Listed 0 items") {
    Write-Host ""
    Write-Host "⚠️  Still showing 0 items!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Possible causes:" -ForegroundColor Yellow
    Write-Host "1. Build submission failed silently (check output above)" -ForegroundColor White
    Write-Host "2. Wrong project (check: gcloud config get-value project)" -ForegroundColor White
    Write-Host "3. Cloud Build API not fully enabled (wait 2-3 minutes)" -ForegroundColor White
    Write-Host "4. Check Cloud Build console:" -ForegroundColor White
    Write-Host "   https://console.cloud.google.com/cloud-build/builds?project=$PROJECT_ID" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "✅ Builds are appearing!" -ForegroundColor Green
}

# 7. Check Cloud Build console link
Write-Host ""
Write-Host "════════════════════════════════════════" -ForegroundColor Green
Write-Host "  📊 CHECK CLOUD BUILD CONSOLE" -ForegroundColor Green
Write-Host "════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "Open this URL to see builds:" -ForegroundColor Cyan
Write-Host "https://console.cloud.google.com/cloud-build/builds?project=$PROJECT_ID" -ForegroundColor White
Write-Host ""
