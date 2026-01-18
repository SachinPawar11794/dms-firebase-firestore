# PostgreSQL Connection Test Script
# Run this script to test your PostgreSQL connection

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PostgreSQL Connection Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Navigate to project directory
Write-Host "[1/4] Navigating to project directory..." -ForegroundColor Yellow
$projectPath = "D:\DMS FIREBASE FIRESTORE"
Set-Location $projectPath
Write-Host "✓ Current directory: $(Get-Location)" -ForegroundColor Green
Write-Host ""

# Step 2: Check if .env file exists
Write-Host "[2/4] Checking .env file..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✓ .env file found" -ForegroundColor Green
    
    # Check if PostgreSQL config exists
    $envContent = Get-Content .env -Raw
    if ($envContent -match "DB_HOST") {
        Write-Host "✓ PostgreSQL configuration found in .env" -ForegroundColor Green
        
        # Display DB_HOST (mask password)
        $dbHost = ($envContent | Select-String -Pattern "DB_HOST=(.+)" | ForEach-Object { $_.Matches.Groups[1].Value })
        Write-Host "  Database Host: $dbHost" -ForegroundColor Gray
    } else {
        Write-Host "✗ PostgreSQL configuration not found in .env" -ForegroundColor Red
        Write-Host "  Please add PostgreSQL configuration to .env file" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✗ .env file not found" -ForegroundColor Red
    Write-Host "  Please create .env file with PostgreSQL configuration" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 3: Check if node_modules exists
Write-Host "[3/4] Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "✓ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "⚠ Dependencies not found. Installing..." -ForegroundColor Yellow
    npm install
    Write-Host "✓ Dependencies installed" -ForegroundColor Green
}
Write-Host ""

# Step 4: Start the development server
Write-Host "[4/4] Starting development server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Server Starting..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Look for these messages:" -ForegroundColor Yellow
Write-Host "  ✓ 'Connected to PostgreSQL database' - Connection successful" -ForegroundColor Green
Write-Host "  ✗ Any error messages - Check the error below" -ForegroundColor Red
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

# Start the server
npm run dev
