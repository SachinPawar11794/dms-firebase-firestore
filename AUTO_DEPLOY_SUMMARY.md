# 🚀 Automatic Deployment - Quick Summary

## What You Get

Every time you push code to GitHub `main` branch:
- ✅ Backend automatically builds and deploys to Cloud Run
- ✅ Frontend automatically builds and deploys to Firebase Hosting
- ✅ No manual steps needed!

## Quick Setup

### Option 1: Automated Script

```powershell
npm run setup:auto-deploy
```

### Option 2: Manual Setup

1. **Grant permissions:**
   ```powershell
   $projectNumber = gcloud projects describe dhananjaygroup-dms --format="value(projectNumber)"
   gcloud projects add-iam-policy-binding dhananjaygroup-dms `
     --member="serviceAccount:$projectNumber@cloudbuild.gserviceaccount.com" `
     --role="roles/run.admin"
   gcloud projects add-iam-policy-binding dhananjaygroup-dms `
     --member="serviceAccount:$projectNumber@cloudbuild.gserviceaccount.com" `
     --role="roles/iam.serviceAccountUser"
   ```

2. **Create trigger:**
   - Go to: https://console.cloud.google.com/cloud-build/triggers?project=dhananjaygroup-dms
   - Click "Connect Repository"
   - Select "GitHub (Cloud Build GitHub App)"
   - Connect: `SachinPawar11794/dms-firebase-firestore`
   - Create trigger:
     - Name: `deploy-dms-api`
     - Event: `Push to a branch`
     - Branch: `^main$`
     - Config: `cloudbuild.yaml`

3. **Test:**
   ```powershell
   git add .
   git commit -m "Test auto-deploy"
   git push origin main
   ```

## How It Works

```
You push to GitHub
    ↓
Cloud Build detects push
    ↓
Builds Docker image
    ↓
Deploys to Cloud Run
    ↓
Builds frontend
    ↓
Deploys to Firebase Hosting
    ↓
Your app is live! 🎉
```

## Important Notes

1. **Database Password**: Set `DB_PASSWORD` in Cloud Run after first deployment:
   ```powershell
   gcloud run services update dms-api `
     --region asia-south1 `
     --update-env-vars "DB_PASSWORD=YOUR_PASSWORD"
   ```

2. **Watch Builds**: https://console.cloud.google.com/cloud-build/builds?project=dhananjaygroup-dms

3. **Deployment Time**: Usually 5-10 minutes per deployment

## Troubleshooting

- **Build fails?** Check logs in Cloud Build console
- **App not working?** Check Cloud Run logs
- **Trigger not firing?** Verify GitHub connection

---

**For detailed guide:** See `AUTOMATIC_DEPLOYMENT_SETUP.md`
