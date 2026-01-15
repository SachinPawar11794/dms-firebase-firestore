# Check build logs
$BUILD_ID = "7e135ffa-d00a-41b3-af4e-73b8479506b3"

Write-Host "📋 Fetching build logs..." -ForegroundColor Cyan
Write-Host ""

# Get logs (last 100 lines to see the error)
gcloud builds log $BUILD_ID --limit=100 2>&1

Write-Host ""
Write-Host "════════════════════════════════════════" -ForegroundColor Green
Write-Host "  Or view in console:" -ForegroundColor Yellow
Write-Host "════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "https://console.cloud.google.com/cloud-build/builds/$BUILD_ID?project=dhananjaygroup-dms" -ForegroundColor Cyan
