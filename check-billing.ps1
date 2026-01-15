# Quick billing check script
Write-Host "🔍 Checking Billing Status..." -ForegroundColor Yellow
Write-Host ""

$PROJECT_ID = "dhananjaygroup-dms"

# Check billing
Write-Host "Checking billing for project: $PROJECT_ID" -ForegroundColor Cyan
$billing = gcloud billing projects describe $PROJECT_ID 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Billing Status:" -ForegroundColor Green
    Write-Host $billing -ForegroundColor White
    
    if ($billing -match "billingEnabled: true") {
        Write-Host ""
        Write-Host "✅ Billing is ENABLED" -ForegroundColor Green
        Write-Host ""
        Write-Host "If builds still show 0 items, check:" -ForegroundColor Yellow
        Write-Host "1. Cloud Build API: gcloud services enable cloudbuild.googleapis.com" -ForegroundColor Cyan
        Write-Host "2. Run test: npm run test:build" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "❌ Billing is NOT enabled!" -ForegroundColor Red
        Write-Host ""
        Write-Host "This is why builds show 0 items!" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "To fix:" -ForegroundColor Cyan
        Write-Host "1. List billing accounts: gcloud billing accounts list" -ForegroundColor White
        Write-Host "2. Link account: gcloud billing projects link $PROJECT_ID --billing-account=BILLING_ACCOUNT_ID" -ForegroundColor White
        Write-Host ""
        Write-Host "Or via console:" -ForegroundColor Cyan
        Write-Host "https://console.cloud.google.com/billing?project=$PROJECT_ID" -ForegroundColor White
    }
} else {
    Write-Host ""
    Write-Host "❌ Error checking billing:" -ForegroundColor Red
    Write-Host $billing -ForegroundColor Red
    Write-Host ""
    Write-Host "Possible issues:" -ForegroundColor Yellow
    Write-Host "1. Not authenticated: gcloud auth login" -ForegroundColor Cyan
    Write-Host "2. Wrong project: gcloud config set project $PROJECT_ID" -ForegroundColor Cyan
    Write-Host "3. No access to project" -ForegroundColor Cyan
}
