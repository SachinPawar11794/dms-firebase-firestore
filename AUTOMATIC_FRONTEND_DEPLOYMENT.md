# 🚀 Automatic Frontend Deployment Setup

## ✅ What's Been Configured

Your Cloud Build configuration now automatically deploys **both backend and frontend** when you push to GitHub!

### Deployment Flow

1. **Backend Deployment** (Cloud Run)
   - Builds Docker image
   - Pushes to Container Registry
   - Deploys to Cloud Run service `dms-api`

2. **Get API URL**
   - Retrieves the deployed API URL from Cloud Run
   - Creates `frontend/.env.production` with the API URL

3. **Frontend Build**
   - Installs dependencies (`npm ci`)
   - Builds production bundle (`npm run build`)
   - Output goes to `public/` directory

4. **Frontend Deployment** (Firebase Hosting)
   - Installs Firebase CLI
   - Deploys to Firebase Hosting
   - Your site goes live at: https://dhananjaygroup-dms.web.app

---

## 🔧 Required Permissions

The Cloud Build service account needs these permissions:

### Already Configured (from backend deployment):
- ✅ Cloud Run Admin
- ✅ Service Account User
- ✅ Storage Admin (for Container Registry)

### Additional Permission Needed:
- ✅ **Firebase Hosting Admin** (or Firebase Admin)

---

## 🔐 Grant Firebase Hosting Permission

Run this command to grant the necessary permission:

```powershell
# Get your Cloud Build service account email
$SERVICE_ACCOUNT = "$(gcloud projects describe dhananjaygroup-dms --format='value(projectNumber)')@cloudbuild.gserviceaccount.com"

# Grant Firebase Hosting Admin role
gcloud projects add-iam-policy-binding dhananjaygroup-dms `
  --member="serviceAccount:$SERVICE_ACCOUNT" `
  --role="roles/firebasehosting.admin"
```

Or manually in Google Cloud Console:
1. Go to: https://console.cloud.google.com/iam-admin/iam?project=dhananjaygroup-dms
2. Find the service account: `[PROJECT_NUMBER]@cloudbuild.gserviceaccount.com`
3. Click "Edit" (pencil icon)
4. Click "Add Another Role"
5. Select: **Firebase Hosting Admin**
6. Click "Save"

---

## 🧪 Test the Setup

### Option 1: Wait for Automatic Build
Since you just pushed the changes, Cloud Build should automatically:
1. Detect the push to `main` branch
2. Start a new build
3. Deploy both backend and frontend

**Monitor the build:**
- https://console.cloud.google.com/cloud-build/builds?project=dhananjaygroup-dms

### Option 2: Make a Test Change
```powershell
# Make a small change (e.g., update a comment)
git add .
git commit -m "Test automatic deployment"
git push origin main
```

---

## 📊 What Happens on Each Push

### Before (Manual):
```powershell
# Deploy backend
npm run deploy:cloud-build:ps1

# Deploy frontend
npm run deploy:frontend
```

### After (Automatic):
```powershell
# Just push to GitHub!
git push origin main
# That's it! Both deploy automatically.
```

---

## ⏱️ Build Time

- **Backend deployment**: ~5-10 minutes
- **Frontend build + deployment**: ~2-3 minutes
- **Total**: ~7-13 minutes

---

## 🔍 Monitoring

### View Build Status:
- **Cloud Build Console**: https://console.cloud.google.com/cloud-build/builds?project=dhananjaygroup-dms
- **Build History**: Shows all automatic builds triggered by GitHub pushes

### View Build Logs:
```powershell
# List recent builds
gcloud builds list --limit=5 --project dhananjaygroup-dms

# View specific build logs
gcloud builds log BUILD_ID --project dhananjaygroup-dms
```

---

## 🐛 Troubleshooting

### Build Fails at Frontend Deployment Step

**Error**: `Permission denied` or `Firebase Hosting Admin required`

**Solution**: Grant Firebase Hosting Admin permission (see above)

### Frontend Build Fails

**Error**: `npm ci` fails or build errors

**Solution**: 
- Check `frontend/package.json` is committed
- Verify all dependencies are in `package.json` (not just `package-lock.json`)
- Check build logs for specific errors

### API URL Not Found

**Error**: `API URL: ` (empty)

**Solution**:
- Wait a few seconds after backend deployment
- Verify Cloud Run service exists: `dms-api`
- Check service is in region: `asia-south1`

### Frontend Shows Old Version

**Solution**:
- Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- Wait 1-2 minutes for CDN propagation
- Check Firebase Hosting console for latest deployment

---

## 📝 Configuration Details

### cloudbuild.yaml Structure

```yaml
steps:
  # 1. Build & Deploy Backend (Cloud Run)
  - Build Docker image
  - Push to Container Registry
  - Deploy to Cloud Run
  
  # 2. Get API URL
  - Retrieve Cloud Run service URL
  - Create frontend/.env.production
  
  # 3. Build Frontend
  - Install dependencies (npm ci)
  - Build production bundle (npm run build)
  
  # 4. Deploy Frontend
  - Install Firebase CLI
  - Deploy to Firebase Hosting
```

### Environment Variables

The frontend build automatically gets the API URL:
- **Source**: Cloud Run service URL
- **Destination**: `frontend/.env.production`
- **Format**: `VITE_API_BASE_URL=https://dms-api-xxx.run.app`

---

## ✅ Verification Checklist

- [x] `cloudbuild.yaml` updated with frontend deployment steps
- [x] Changes committed and pushed to GitHub
- [ ] Cloud Build service account has Firebase Hosting Admin permission
- [ ] Test build triggered successfully
- [ ] Both backend and frontend deployed correctly
- [ ] Frontend shows latest changes at https://dhananjaygroup-dms.web.app

---

## 🎯 Next Steps

1. **Grant Firebase Hosting Permission** (if not done)
   - Run the command above or use Google Cloud Console

2. **Monitor First Build**
   - Check Cloud Build console
   - Verify both steps complete successfully

3. **Test Your Changes**
   - Make a small change
   - Push to GitHub
   - Verify automatic deployment works

4. **Enjoy Automatic Deployments!**
   - No more manual deployment steps
   - Just push to GitHub and both deploy automatically

---

## 📚 Related Documentation

- `DEPLOYMENT_QUICK_REFERENCE.md` - Quick deployment commands
- `SETUP_AUTOMATIC_DEPLOYMENTS.md` - Original backend auto-deployment setup
- `cloudbuild.yaml` - Complete build configuration

---

**Last Updated**: After adding frontend deployment to Cloud Build
**Status**: ✅ Configured and ready to test
