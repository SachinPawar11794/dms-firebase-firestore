# Server Diagnostic Script
Write-Host "=== Server Diagnostic ===" -ForegroundColor Cyan

# Check database connection
Write-Host "`n1. Testing database connection..." -ForegroundColor Yellow
node test-db-connection.js
$dbOk = $LASTEXITCODE -eq 0

# Check if port is in use
Write-Host "`n2. Checking port 3000..." -ForegroundColor Yellow
$portCheck = netstat -ano | findstr ":3000"
if ($portCheck) {
    Write-Host "✅ Port 3000 is in use" -ForegroundColor Green
} else {
    Write-Host "❌ Port 3000 is NOT in use" -ForegroundColor Red
}

# Check Node processes
Write-Host "`n3. Checking Node.js processes..." -ForegroundColor Yellow
$nodeProcs = Get-Process | Where-Object { $_.ProcessName -eq "node" }
Write-Host "Found $($nodeProcs.Count) Node.js processes" -ForegroundColor $(if ($nodeProcs.Count -gt 0) { "Green" } else { "Red" })

# Check for common issues
Write-Host "`n4. Checking for common issues..." -ForegroundColor Yellow

# Check if .env exists
if (Test-Path ".env") {
    Write-Host "✅ .env file exists" -ForegroundColor Green
} else {
    Write-Host "❌ .env file missing!" -ForegroundColor Red
}

# Check if node_modules exists
if (Test-Path "node_modules") {
    Write-Host "✅ node_modules exists" -ForegroundColor Green
} else {
    Write-Host "❌ node_modules missing! Run: npm install" -ForegroundColor Red
}

# Summary
Write-Host "`n=== Summary ===" -ForegroundColor Cyan
if ($dbOk) {
    Write-Host "✅ Database connection: OK" -ForegroundColor Green
} else {
    Write-Host "❌ Database connection: FAILED" -ForegroundColor Red
}

Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Check the server window (PowerShell) for error messages" -ForegroundColor White
Write-Host "2. Look for TypeScript compilation errors" -ForegroundColor White
Write-Host "3. Look for 'Cannot find module' errors" -ForegroundColor White
Write-Host "4. Share any error messages you see" -ForegroundColor White
