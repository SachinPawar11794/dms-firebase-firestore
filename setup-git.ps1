# Git Setup Script
# Initializes Git repository and creates first commit

$ErrorActionPreference = "Stop"

Write-Host "📦 Setting Up Git Repository" -ForegroundColor Green
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check if Git is installed
try {
    $gitVersion = git --version 2>&1
    Write-Host "✅ Git is installed: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Git is not installed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "Or use: winget install Git.Git" -ForegroundColor Yellow
    exit 1
}

# Check if already a Git repository
if (Test-Path ".git") {
    Write-Host "⚠️  Git repository already initialized" -ForegroundColor Yellow
    Write-Host ""
    $response = Read-Host "Do you want to reinitialize? (y/N)"
    if ($response -ne "y" -and $response -ne "Y") {
        Write-Host "Skipping initialization." -ForegroundColor Yellow
        exit 0
    }
    Write-Host ""
}

# Initialize Git repository
Write-Host "🔧 Initializing Git repository..." -ForegroundColor Cyan
git init
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to initialize Git repository" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Git repository initialized" -ForegroundColor Green
Write-Host ""

# Check if .gitignore exists
if (Test-Path ".gitignore") {
    Write-Host "✅ .gitignore found" -ForegroundColor Green
} else {
    Write-Host "⚠️  .gitignore not found - creating one..." -ForegroundColor Yellow
    # Create basic .gitignore
    @"
node_modules/
dist/
.env
.env.local
*.log
.DS_Store
Thumbs.db
serviceAccountKey.json
"@ | Out-File -FilePath ".gitignore" -Encoding utf8
    Write-Host "✅ Created .gitignore" -ForegroundColor Green
}
Write-Host ""

# Show what will be committed
Write-Host "📋 Checking files to commit..." -ForegroundColor Cyan
git status --short | Select-Object -First 20
Write-Host ""

# Ask for confirmation
Write-Host "This will:" -ForegroundColor Yellow
Write-Host "  1. Add all files to Git" -ForegroundColor White
Write-Host "  2. Create initial commit" -ForegroundColor White
Write-Host ""
$response = Read-Host "Continue? (Y/n)"
if ($response -eq "n" -or $response -eq "N") {
    Write-Host "Cancelled." -ForegroundColor Yellow
    exit 0
}
Write-Host ""

# Add all files
Write-Host "➕ Adding files to Git..." -ForegroundColor Cyan
git add .
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to add files" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Files added" -ForegroundColor Green
Write-Host ""

# Create initial commit
Write-Host "💾 Creating initial commit..." -ForegroundColor Cyan
$commitMessage = "Initial commit - DMS Firebase Firestore application"
git commit -m $commitMessage
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to create commit" -ForegroundColor Red
    Write-Host "   (This might be normal if there are no changes to commit)" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Initial commit created" -ForegroundColor Green
Write-Host ""

# Show status
Write-Host "📊 Repository Status:" -ForegroundColor Cyan
git log --oneline -1
Write-Host ""

# Ask about GitHub
Write-Host "════════════════════════════════════════" -ForegroundColor Green
Write-Host "  ✅ Git Setup Complete!" -ForegroundColor Green
Write-Host "════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Make regular commits when you make changes:" -ForegroundColor White
Write-Host "   git add ." -ForegroundColor Cyan
Write-Host "   git commit -m 'Description of changes'" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. View your commit history:" -ForegroundColor White
Write-Host "   git log --oneline" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. (Optional) Set up GitHub for cloud backup:" -ForegroundColor White
Write-Host "   - Create repository on GitHub.com" -ForegroundColor Cyan
Write-Host "   - Run: git remote add origin https://github.com/USERNAME/REPO.git" -ForegroundColor Cyan
Write-Host "   - Run: git push -u origin main" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 See GIT_SETUP_GUIDE.md for detailed instructions" -ForegroundColor Yellow
Write-Host ""
