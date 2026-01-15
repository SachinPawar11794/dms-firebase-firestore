# Deploy to Cloud Run - Final Steps

## ✅ Completed So Far
- ✅ Prerequisites installed (gcloud CLI, Docker Desktop)
- ✅ Project set: `dhananjaygroup-dms`
- ✅ Billing account linked (with $300 credits)
- ✅ Login to Google Cloud (if completed)

## 🚀 Final Steps to Deploy

### Step 1: Complete Google Cloud Login (If Not Done)

If you haven't completed the login:

```powershell
gcloud auth login
```

This will:
- Open your browser
- Ask you to select your Google account
- Grant permissions to gcloud CLI

**Use the same Google account that has access to `dhananjaygroup-dms`**

### Step 2: Enable Required APIs

After logging in, run:

```powershell
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

**Note:** This may take 1-2 minutes per API.

### Step 3: Start Docker Desktop

1. **Open Docker Desktop** from Start menu
2. **Wait for it to start** (whale icon in system tray)
3. **Verify it's running:**
   ```powershell
   docker --version
   docker ps
   ```

**Important:** Docker Desktop must be running before deployment!

### Step 4: Deploy to Cloud Run

Once everything is ready:

```powershell
npm run deploy:cloud-run:ps1
```

This will:
1. ✅ Build TypeScript → JavaScript
2. ✅ Create Docker image
3. ✅ Push to Google Container Registry
4. ✅ Deploy to Cloud Run
5. ✅ Give you a public API URL

**First deployment takes 5-10 minutes.**

### Step 5: Get Your API URL

After deployment completes, you'll see:
```
✅ Deployment successful!
🌐 Service URL: https://dms-api-xxxxx-uc.a.run.app
```

**Copy this URL!** You'll need it for the frontend.

### Step 6: Update Frontend

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

## 🎯 Quick Command Summary

```powershell
# 1. Login (if not done)
gcloud auth login

# 2. Enable APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# 3. Start Docker Desktop (manually from Start menu)

# 4. Deploy
npm run deploy:cloud-run:ps1

# 5. After deployment, update frontend .env.production with API URL

# 6. Rebuild and redeploy frontend
cd frontend
npm run build
cd ..
firebase deploy --only hosting
```

## ⚠️ Troubleshooting

### "Not logged in" error
```powershell
gcloud auth login
```

### "Docker not running" error
- Start Docker Desktop from Start menu
- Wait for it to fully start
- Verify: `docker ps`

### "Billing not enabled" error
- Verify billing is linked: https://console.cloud.google.com/billing?project=dhananjaygroup-dms
- If not linked, link your billing account

### "Permission denied" error
```powershell
gcloud projects add-iam-policy-binding dhananjaygroup-dms --member="user:YOUR_EMAIL" --role="roles/run.admin"
```

## 📊 What Happens During Deployment

1. **Build Phase** (2-3 minutes)
   - Compiles TypeScript
   - Creates production build

2. **Docker Build** (2-3 minutes)
   - Creates container image
   - Packages your application

3. **Push to Registry** (1-2 minutes)
   - Uploads image to Google Container Registry

4. **Deploy to Cloud Run** (2-3 minutes)
   - Creates Cloud Run service
   - Configures networking
   - Starts your API

**Total time: ~5-10 minutes**

## ✅ Success Checklist

After deployment, verify:

- [ ] API URL received (e.g., `https://dms-api-xxxxx-uc.a.run.app`)
- [ ] Health endpoint works: `curl https://YOUR_URL/health`
- [ ] Frontend `.env.production` updated with API URL
- [ ] Frontend rebuilt and redeployed
- [ ] Frontend can connect to API (check browser console)

## 🎉 You're Almost There!

Just complete the steps above and your API will be live on Cloud Run!

---

**Ready?** Start with checking if login is complete, then enable APIs and deploy!
