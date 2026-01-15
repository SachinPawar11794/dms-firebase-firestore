# 📦 Install Git for Windows

## Quick Installation

### Option 1: Using Winget (Recommended - Fastest)

Open PowerShell as Administrator and run:

```powershell
winget install Git.Git
```

### Option 2: Download Installer

1. **Download Git:**
   - Go to: https://git-scm.com/download/win
   - Download the installer (64-bit)

2. **Run Installer:**
   - Double-click the downloaded file
   - Click "Next" through the installation
   - **Important:** Keep default options (especially "Git from the command line")
   - Click "Install"

3. **Restart PowerShell:**
   - Close and reopen PowerShell
   - Verify installation:
     ```powershell
     git --version
     ```

---

## After Installation

Once Git is installed, you can:

1. **Initialize Git repository:**
   ```powershell
   npm run setup:git
   ```

2. **Set up GitHub:**
   ```powershell
   npm run setup:github
   ```

---

## Verify Installation

After installing, verify Git works:

```powershell
git --version
```

You should see something like: `git version 2.xx.x.windows.x`

---

## Next Steps

1. ✅ Install Git (see above)
2. ✅ Initialize repository: `npm run setup:git`
3. ✅ Connect to GitHub: `npm run setup:github`
