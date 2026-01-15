# Next Steps - Cloud Run Deployment

## ✅ Completed
- ✅ Google Cloud SDK installed
- ✅ Docker Desktop installed
- ✅ Project set to: dhananjaygroup-dms

## 🔄 Next Steps

### Step 1: Login to Google Cloud

Open a new PowerShell window and run:

```powershell
gcloud auth login
```

This will:
- Open your browser
- Ask you to select your Google account
- Grant permissions to gcloud CLI

**Note:** Use the same Google account that has access to your Firebase project `dhananjaygroup-dms`

### Step 2: Enable Required APIs

After logging in, run:

```powershell
cd "D:\DMS FIREBASE FIRESTORE"
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### Step 3: Verify Docker Desktop

1. **Start Docker Desktop:**
   - Open Docker Desktop from Start menu
   - Wait for it to start (whale icon in system tray)
   - Verify it says "Docker Desktop is running"

2. **Test Docker:**
   ```powershell
   docker --version
   docker run hello-world
   ```

### Step 4: Deploy to Cloud Run

Once everything is set up:

```powershell
npm run deploy:cloud-run:ps1
```

This will:
1. Build your TypeScript code
2. Create Docker image
3. Push to Google Container Registry
4. Deploy to Cloud Run
5. Give you a public API URL

### Step 5: Update Frontend

After deployment, you'll get a URL like:
```
https://dms-api-xxxxx-uc.a.run.app
```

1. Create `frontend/.env.production`:
```env
VITE_API_BASE_URL=https://dms-api-xxxxx-uc.a.run.app
```

2. Rebuild and redeploy frontend:
```powershell
cd frontend
npm run build
cd ..
firebase deploy --only hosting
```

## 🚀 Quick Command Summary

```powershell
# 1. Login
gcloud auth login

# 2. Enable APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# 3. Start Docker Desktop (manually from Start menu)

# 4. Deploy
npm run deploy:cloud-run:ps1
```

## ⚠️ Important Notes

- **Docker Desktop** must be running before deployment
- **Service Account Key** (`serviceAccountKey.json`) should be in project root
- First deployment may take 5-10 minutes
- You'll need to approve admin prompts during installation

## 📝 Troubleshooting

**"Not logged in" error:**
```powershell
gcloud auth login
```

**"Docker not running" error:**
- Start Docker Desktop from Start menu
- Wait for it to fully start

**"Permission denied" error:**
```powershell
gcloud projects add-iam-policy-binding dhananjaygroup-dms --member="user:YOUR_EMAIL" --role="roles/run.admin"
```

---

**Ready?** Start with `gcloud auth login` in a new PowerShell window!
