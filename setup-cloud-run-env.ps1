# Cloud Run Environment Setup Script
# This script helps set up environment variables for Cloud Run deployment

Write-Host "🔧 Cloud Run Environment Setup" -ForegroundColor Green
Write-Host ""

# Check if serviceAccountKey.json exists
if (Test-Path "serviceAccountKey.json") {
    Write-Host "✅ Found serviceAccountKey.json" -ForegroundColor Green
    
    # Ask user how they want to handle the service account
    Write-Host ""
    Write-Host "How do you want to handle the service account key?" -ForegroundColor Yellow
    Write-Host "1. Embed in Docker image (simpler, less secure)"
    Write-Host "2. Use Cloud Run Secrets (recommended, more secure)"
    Write-Host "3. Use environment variables (manual setup)"
    Write-Host ""
    $choice = Read-Host "Enter choice (1-3)"
    
    if ($choice -eq "2") {
        Write-Host ""
        Write-Host "📝 Setting up Cloud Run Secret..." -ForegroundColor Yellow
        
        # Get project number
        $projectNumber = gcloud projects describe dhananjaygroup-dms --format="value(projectNumber)" 2>&1
        if ($projectNumber) {
            Write-Host "Project Number: $projectNumber" -ForegroundColor Cyan
            
            Write-Host ""
            Write-Host "Run these commands to set up the secret:" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "# Create secret" -ForegroundColor Cyan
            Write-Host "gcloud secrets create firebase-service-account --data-file=serviceAccountKey.json --project=dhananjaygroup-dms" -ForegroundColor White
            Write-Host ""
            Write-Host "# Grant access to Cloud Run" -ForegroundColor Cyan
            Write-Host "gcloud secrets add-iam-policy-binding firebase-service-account --member=`"serviceAccount:$projectNumber-compute@developer.gserviceaccount.com`" --role=`"roles/secretmanager.secretAccessor`" --project=dhananjaygroup-dms" -ForegroundColor White
            Write-Host ""
            Write-Host "# Deploy with secret" -ForegroundColor Cyan
            Write-Host "gcloud run services update dms-api --update-secrets FIREBASE_SERVICE_ACCOUNT_KEY=firebase-service-account:latest --region asia-south1" -ForegroundColor White
        }
    } elseif ($choice -eq "3") {
        Write-Host ""
        Write-Host "📝 Environment Variable Setup" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "You'll need to set these environment variables in Cloud Run:" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "FIREBASE_PROJECT_ID=dhananjaygroup-dms" -ForegroundColor White
        Write-Host "FIREBASE_CLIENT_EMAIL=<from serviceAccountKey.json>" -ForegroundColor White
        Write-Host "FIREBASE_PRIVATE_KEY=<from serviceAccountKey.json>" -ForegroundColor White
        Write-Host ""
        Write-Host "Set them via:" -ForegroundColor Yellow
        Write-Host "gcloud run services update dms-api --update-env-vars `"FIREBASE_PROJECT_ID=dhananjaygroup-dms,FIREBASE_CLIENT_EMAIL=...,FIREBASE_PRIVATE_KEY=...`" --region asia-south1" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "✅ Will embed service account key in Docker image" -ForegroundColor Green
        Write-Host "⚠️  Note: This is less secure but simpler for development" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  serviceAccountKey.json not found" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "You'll need to either:" -ForegroundColor Cyan
    Write-Host "1. Place serviceAccountKey.json in project root, OR" -ForegroundColor White
    Write-Host "2. Use Cloud Run secrets, OR" -ForegroundColor White
    Write-Host "3. Set environment variables in Cloud Run" -ForegroundColor White
}

Write-Host ""
Write-Host "📋 Required Environment Variables for Cloud Run:" -ForegroundColor Yellow
Write-Host ""
Write-Host "NODE_ENV=production" -ForegroundColor White
Write-Host "FIREBASE_PROJECT_ID=dhananjaygroup-dms" -ForegroundColor White
Write-Host ""
Write-Host "Optional:" -ForegroundColor Cyan
Write-Host "LOG_LEVEL=info" -ForegroundColor White
Write-Host "PORT=8080 (set automatically by Cloud Run)" -ForegroundColor White

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Install prerequisites (see INSTALL_PREREQUISITES.md)" -ForegroundColor White
Write-Host "2. Run: npm run deploy:cloud-run:ps1" -ForegroundColor White
