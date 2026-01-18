# Check Server Status and Database Configuration
Write-Host "=== Server Status Check ===" -ForegroundColor Cyan

# Check if .env file exists
if (Test-Path ".env") {
    Write-Host "✅ .env file exists" -ForegroundColor Green
    
    # Check for database configuration
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "DB_HOST") {
        Write-Host "✅ DB_HOST found in .env" -ForegroundColor Green
        $dbHost = ($envContent | Select-String -Pattern "DB_HOST=(.+)" | ForEach-Object { $_.Matches.Groups[1].Value })
        Write-Host "   DB_HOST: $dbHost" -ForegroundColor Yellow
    } else {
        Write-Host "❌ DB_HOST not found in .env" -ForegroundColor Red
        Write-Host "   You need to add PostgreSQL configuration to .env file" -ForegroundColor Yellow
    }
    
    if ($envContent -match "DB_PASSWORD") {
        $dbPassword = ($envContent | Select-String -Pattern "DB_PASSWORD=(.+)" | ForEach-Object { $_.Matches.Groups[1].Value })
        if ($dbPassword -eq "YOUR_PASSWORD_HERE" -or $dbPassword -eq "") {
            Write-Host "❌ DB_PASSWORD is not set or still has placeholder" -ForegroundColor Red
        } else {
            Write-Host "✅ DB_PASSWORD is set" -ForegroundColor Green
        }
    } else {
        Write-Host "❌ DB_PASSWORD not found in .env" -ForegroundColor Red
    }
} else {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
}

Write-Host "`n=== Checking Server Process ===" -ForegroundColor Cyan
$nodeProcesses = Get-Process | Where-Object { $_.ProcessName -eq "node" }
if ($nodeProcesses) {
    Write-Host "✅ Node.js processes running: $($nodeProcesses.Count)" -ForegroundColor Green
} else {
    Write-Host "❌ No Node.js processes found" -ForegroundColor Red
}

Write-Host "`n=== Checking Port 3000 ===" -ForegroundColor Cyan
$port3000 = netstat -ano | findstr ":3000"
if ($port3000) {
    Write-Host "✅ Port 3000 is in use" -ForegroundColor Green
    Write-Host $port3000
} else {
    Write-Host "❌ Port 3000 is not in use - server is not running" -ForegroundColor Red
}

Write-Host "`n=== Next Steps ===" -ForegroundColor Cyan
Write-Host "1. Make sure .env file has PostgreSQL configuration" -ForegroundColor Yellow
Write-Host "2. Check POSTGRESQL_ENV_ADDITION.txt for the configuration to add" -ForegroundColor Yellow
Write-Host "3. Replace YOUR_PASSWORD_HERE with your actual database password" -ForegroundColor Yellow
Write-Host "4. Run: npm run dev" -ForegroundColor Yellow
