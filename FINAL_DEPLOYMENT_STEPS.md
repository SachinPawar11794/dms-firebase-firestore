# Final Deployment Steps

## ⚠️ Important: Restart Your Terminal

After installing Google Cloud SDK, you need to **restart your PowerShell/terminal** for `gcloud` to be available.

## Step-by-Step Instructions

### Step 1: Open a NEW PowerShell Window

1. **Close** your current PowerShell window
2. **Open a NEW** PowerShell window
3. **Navigate** to your project:
   ```powershell
   cd "D:\DMS FIREBASE FIRESTORE"
   ```

### Step 2: Login to Google Cloud

```powershell
gcloud auth login
```

This will:
- Open your browser
- Ask you to sign in
- Grant permissions to gcloud CLI

**Use the same Google account that has access to `dhananjaygroup-dms`**

### Step 3: Verify Login

```powershell
gcloud auth list
```

Should show your account with status "ACTIVE".

### Step 4: Set Project (If Not Set)

```powershell
gcloud config set project dhananjaygroup-dms
```

### Step 5: Enable Required APIs

```powershell
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

**Note:** Each command may take 1-2 minutes.

### Step 6: Start Docker Desktop

1. **Open Docker Desktop** from Start menu
2. **Wait** for it to start (whale icon in system tray)
3. **Verify** it's running:
   ```powershell
   docker --version
   docker ps
   ```

### Step 7: Deploy to Cloud Run

```powershell
npm run deploy:cloud-run:ps1
```

**First deployment takes 5-10 minutes.**

This will:
1. Build TypeScript code
2. Create Docker image
3. Push to Container Registry
4. Deploy to Cloud Run
5. Give you a public API URL

### Step 8: Get Your API URL

After deployment, you'll see:
```
✅ Deployment successful!
🌐 Service URL: https://dms-api-xxxxx-uc.a.run.app
```

**Copy this URL!**

### Step 9: Update Frontend

1. **Create `frontend/.env.production`:**
   ```env
   VITE_API_BASE_URL=https://dms-api-xxxxx-uc.a.run.app
   ```
   (Replace with your actual URL)

2. **Rebuild frontend:**
   ```powershell
   cd frontend
   npm run build
   cd ..
   ```

3. **Redeploy frontend:**
   ```powershell
   firebase deploy --only hosting
   ```

## Quick Command Summary

Run these in a **NEW PowerShell window**:

```powershell
# Navigate to project
cd "D:\DMS FIREBASE FIRESTORE"

# Login
gcloud auth login

# Set project
gcloud config set project dhananjaygroup-dms

# Enable APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Start Docker Desktop (manually from Start menu)

# Deploy
npm run deploy:cloud-run:ps1
```

## Troubleshooting

### "gcloud: command not found"
- **Solution:** Restart your PowerShell/terminal window
- The PATH is updated after restart

### "Docker: command not found"
- **Solution:** Start Docker Desktop from Start menu
- Wait for it to fully start

### "Not logged in" error
- **Solution:** Run `gcloud auth login` again
- Complete the browser authentication

### "Billing not enabled" error
- **Solution:** Verify billing is linked at:
  https://console.cloud.google.com/billing?project=dhananjaygroup-dms

## What to Expect

### During Deployment:
- Building TypeScript: ~2 minutes
- Creating Docker image: ~2-3 minutes
- Pushing to registry: ~1-2 minutes
- Deploying to Cloud Run: ~2-3 minutes

**Total: ~5-10 minutes**

### After Deployment:
- You'll get a public HTTPS URL
- Your API will be accessible from anywhere
- It will auto-scale based on traffic
- You'll only pay for usage above free tier

## ✅ Success Checklist

- [ ] Restarted PowerShell window
- [ ] Logged in: `gcloud auth login`
- [ ] Project set: `dhananjaygroup-dms`
- [ ] APIs enabled (3 commands)
- [ ] Docker Desktop running
- [ ] Deployed: `npm run deploy:cloud-run:ps1`
- [ ] Got API URL
- [ ] Updated frontend `.env.production`
- [ ] Rebuilt and redeployed frontend

---

**🚀 Ready?** Start with opening a NEW PowerShell window and running `gcloud auth login`!
