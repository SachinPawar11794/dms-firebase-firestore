# GitHub Setup Script
# Connects local Git repository to GitHub and pushes code

$ErrorActionPreference = "Stop"

Write-Host "🐙 Setting Up GitHub Connection" -ForegroundColor Green
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check if Git is installed
try {
    $gitVersion = git --version 2>&1
    Write-Host "✅ Git is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Git is not installed" -ForegroundColor Red
    Write-Host "Install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

# Check if Git repository exists
if (-not (Test-Path ".git")) {
    Write-Host "⚠️  Git repository not initialized" -ForegroundColor Yellow
    Write-Host "Initializing Git repository..." -ForegroundColor Cyan
    git init
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to initialize Git" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Git repository initialized" -ForegroundColor Green
    Write-Host ""
}

# Check if there are uncommitted changes
$status = git status --porcelain 2>&1
if ($status -and $status -notmatch "fatal") {
    Write-Host "📋 Uncommitted changes detected" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Files to commit:" -ForegroundColor Cyan
    git status --short | Select-Object -First 10
    Write-Host ""
    $response = Read-Host "Do you want to commit these changes now? (Y/n)"
    if ($response -ne "n" -and $response -ne "N") {
        Write-Host ""
        Write-Host "➕ Adding files..." -ForegroundColor Cyan
        git add .
        Write-Host "💾 Creating commit..." -ForegroundColor Cyan
        $commitMsg = Read-Host "Enter commit message (or press Enter for default)"
        if ([string]::IsNullOrWhiteSpace($commitMsg)) {
            $commitMsg = "Initial commit - DMS Firebase Firestore application"
        }
        git commit -m $commitMsg
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Failed to create commit" -ForegroundColor Red
            exit 1
        }
        Write-Host "✅ Changes committed" -ForegroundColor Green
        Write-Host ""
    }
} else {
    # Check if there are any commits
    $commitCount = git rev-list --count HEAD 2>&1
    if ($commitCount -eq "0" -or $commitCount -match "fatal") {
        Write-Host "📋 No commits yet. Creating initial commit..." -ForegroundColor Yellow
        git add .
        git commit -m "Initial commit - DMS Firebase Firestore application"
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Failed to create initial commit" -ForegroundColor Red
            exit 1
        }
        Write-Host "✅ Initial commit created" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "✅ Repository has commits" -ForegroundColor Green
        Write-Host ""
    }
}

# Check if remote already exists
$remote = git remote get-url origin 2>&1
if ($remote -and $remote -notmatch "fatal") {
    Write-Host "⚠️  GitHub remote already configured:" -ForegroundColor Yellow
    Write-Host "   $remote" -ForegroundColor Cyan
    Write-Host ""
    $response = Read-Host "Do you want to change it? (y/N)"
    if ($response -eq "y" -or $response -eq "Y") {
        git remote remove origin
        Write-Host "✅ Removed existing remote" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "📤 Pushing to existing remote..." -ForegroundColor Cyan
        git branch -M main 2>&1 | Out-Null
        git push -u origin main
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "════════════════════════════════════════" -ForegroundColor Green
            Write-Host "  ✅ Code Pushed to GitHub!" -ForegroundColor Green
            Write-Host "════════════════════════════════════════" -ForegroundColor Green
            Write-Host ""
            Write-Host "🌐 Repository URL: $remote" -ForegroundColor Cyan
        }
        exit 0
    }
}

# Get GitHub repository URL
Write-Host "📝 GitHub Repository Setup" -ForegroundColor Yellow
Write-Host ""
Write-Host "Before continuing, you need to:" -ForegroundColor White
Write-Host "1. Go to https://github.com and sign in (or create account)" -ForegroundColor Cyan
Write-Host "2. Click the '+' icon -> New repository" -ForegroundColor Cyan
Write-Host "3. Enter repository name (example: dms-firebase-firestore)" -ForegroundColor Cyan
Write-Host "4. Choose Public or Private" -ForegroundColor Cyan
Write-Host "5. DO NOT initialize with README, .gitignore, or license" -ForegroundColor Yellow
Write-Host "6. Click Create repository" -ForegroundColor Cyan
Write-Host ""
Write-Host "After creating the repository, GitHub will show you a URL like:" -ForegroundColor White
Write-Host "   https://github.com/YOUR_USERNAME/REPO_NAME.git" -ForegroundColor Cyan
Write-Host ""

# Pre-fill with user's repository URL
$defaultRepoUrl = "https://github.com/SachinPawar11794/dms-firebase-firestore.git"
Write-Host "Your repository URL: $defaultRepoUrl" -ForegroundColor Cyan
Write-Host ""
$repoUrl = Read-Host "Press Enter to use this URL, or type a different one"
if ([string]::IsNullOrWhiteSpace($repoUrl)) {
    $repoUrl = $defaultRepoUrl
}

if ([string]::IsNullOrWhiteSpace($repoUrl)) {
    Write-Host ""
    Write-Host "⏭️  Skipping automatic setup" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To connect manually, run:" -ForegroundColor White
    Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git" -ForegroundColor Cyan
    Write-Host "   git branch -M main" -ForegroundColor Cyan
    Write-Host "   git push -u origin main" -ForegroundColor Cyan
    Write-Host ""
    exit 0
}

# Validate URL format
if ($repoUrl -notmatch "^https://github\.com/") {
    Write-Host "⚠️  URL should start with https://github.com/" -ForegroundColor Yellow
    Write-Host "   Example: https://github.com/username/repo-name.git" -ForegroundColor Cyan
    $response = Read-Host "Continue anyway? (y/N)"
    if ($response -ne "y" -and $response -ne "Y") {
        exit 0
    }
}

# Add .git extension if missing
if ($repoUrl -notmatch "\.git$") {
    $repoUrl = $repoUrl + ".git"
}

# Add remote
Write-Host ""
Write-Host "🔗 Connecting to GitHub..." -ForegroundColor Cyan
git remote add origin $repoUrl 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to add remote. It might already exist." -ForegroundColor Red
    Write-Host "   Try: git remote remove origin" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Remote added: $repoUrl" -ForegroundColor Green
Write-Host ""

# Set main branch
Write-Host "🌿 Setting main branch..." -ForegroundColor Cyan
git branch -M main 2>&1 | Out-Null
Write-Host "✅ Branch set to main" -ForegroundColor Green
Write-Host ""

# Push to GitHub
Write-Host "📤 Pushing code to GitHub..." -ForegroundColor Cyan
Write-Host "   (This may ask for your GitHub credentials)" -ForegroundColor Yellow
Write-Host ""

git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "════════════════════════════════════════" -ForegroundColor Green
    Write-Host "  ✅ SUCCESS! Code Pushed to GitHub!" -ForegroundColor Green
    Write-Host "════════════════════════════════════════" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Your repository is now at:" -ForegroundColor Cyan
    Write-Host "   $repoUrl" -ForegroundColor White
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Visit your repository on GitHub to verify" -ForegroundColor White
    Write-Host "2. For future updates, use:" -ForegroundColor White
    Write-Host "   git add ." -ForegroundColor Cyan
    Write-Host '   git commit -m "Your changes"' -ForegroundColor Cyan
    Write-Host "   git push origin main" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "3. (Optional) Set up automatic deployments:" -ForegroundColor White
    Write-Host "   See FUTURE_DEPLOYMENTS.md for Cloud Build triggers" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Push failed. Common issues:" -ForegroundColor Red
    Write-Host ""
    Write-Host "1. Authentication required:" -ForegroundColor Yellow
    Write-Host "   - GitHub may ask for username/password" -ForegroundColor White
    Write-Host "   - For better security, use Personal Access Token:" -ForegroundColor White
    Write-Host "     https://github.com/settings/tokens" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "2. Repository does not exist:" -ForegroundColor Yellow
    Write-Host "   - Make sure you created it on GitHub first" -ForegroundColor White
    Write-Host "   - Check the URL is correct" -ForegroundColor White
    Write-Host ""
    Write-Host "3. Try manual push:" -ForegroundColor Yellow
    Write-Host "   git push -u origin main" -ForegroundColor Cyan
    Write-Host ""
}
