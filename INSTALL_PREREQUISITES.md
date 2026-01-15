# Installing Prerequisites for Cloud Run Deployment

## Required Tools

Before deploying to Cloud Run, you need to install:

1. **Google Cloud CLI (gcloud)** ✅
   - Docker Desktop is NOT needed - we use Cloud Build!

## Step 1: Install Google Cloud CLI

### Windows

1. **Download Installer:**
   - Visit: https://cloud.google.com/sdk/docs/install
   - Download the Windows installer

2. **Run Installer:**
   - Run the downloaded `.exe` file
   - Follow the installation wizard
   - Choose "Add to PATH" when prompted

3. **Verify Installation:**
   ```powershell
   gcloud --version
   ```

4. **Initialize gcloud:**
   ```powershell
   gcloud init
   ```
   - Select your Google account
   - Select project: `dhananjaygroup-dms`
   - Choose default region: `asia-south1`

### Mac

```bash
# Using Homebrew (recommended)
brew install google-cloud-sdk

# Or download from:
# https://cloud.google.com/sdk/docs/install
```

### Linux

```bash
# Add Cloud SDK repository
echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | sudo tee -a /etc/apt/sources.list.d/google-cloud-sdk.list

# Import Google Cloud public key
curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key --keyring /usr/share/keyrings/cloud.google.gpg add -

# Update and install
sudo apt-get update && sudo apt-get install google-cloud-cli
```

## Step 2: Docker Desktop - NOT NEEDED! ✅

**Good news!** You don't need Docker Desktop!

We use **Google Cloud Build** which builds Docker images in the cloud.
- ✅ No Docker Desktop installation needed
- ✅ No virtualization setup required
- ✅ Builds happen in Google Cloud (faster!)
- ✅ Same result - your API deployed to Cloud Run

## Step 3: Login to Google Cloud

After installing gcloud CLI:

```powershell
# Login to your Google account
gcloud auth login

# Set your project
gcloud config set project dhananjaygroup-dms

# Verify
gcloud config get-value project
```

## Step 4: Enable Required APIs

```powershell
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

## Step 5: Verify Installation

Run this command to verify everything is set up:

```powershell
# Check gcloud
gcloud --version

# Check if logged in
gcloud auth list

# Check project
gcloud config get-value project

# Note: Docker Desktop is NOT needed - Cloud Build handles everything!
```

## Troubleshooting

### gcloud: command not found

**Windows:**
- Restart your terminal/PowerShell
- Or add to PATH manually:
  - Add `C:\Users\YOUR_USERNAME\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin` to PATH

**Mac/Linux:**
- Restart terminal
- Or run: `source ~/.bashrc` or `source ~/.zshrc`

### Docker: permission denied

**Linux:**
```bash
sudo usermod -aG docker $USER
# Log out and back in
```

### Docker Desktop not starting

**Windows:**
- Ensure WSL 2 is enabled
- Check Windows Features: Enable "Virtual Machine Platform" and "Windows Subsystem for Linux"
- Restart computer

**Mac:**
- Check System Preferences > Security & Privacy
- Allow Docker Desktop if prompted

## Next Steps

Once prerequisites are installed:

1. ✅ Verify installation (commands above)
2. ✅ Login to Google Cloud
3. ✅ Enable APIs
4. ✅ Proceed with deployment: `npm run deploy:cloud-run:ps1`

See [CLOUD_RUN_DEPLOYMENT.md](./CLOUD_RUN_DEPLOYMENT.md) for deployment steps.
