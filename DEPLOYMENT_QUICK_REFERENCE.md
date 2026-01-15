# 🚀 Deployment Quick Reference

## ⚡ One-Command Deployments

### Deploy Everything (Backend + Frontend)
```powershell
npm run deploy:all
```

### Deploy Backend Only
```powershell
npm run deploy:cloud-build:ps1
```

### Deploy Frontend Only
```powershell
npm run deploy:frontend
```

---

## 📋 Manual Deployment Steps

### Backend (API)
```powershell
# Option 1: Use script
npm run deploy:cloud-build:ps1

# Option 2: Direct command
gcloud builds submit --config cloudbuild.yaml --project dhananjaygroup-dms
```

**Time:** ~5-10 minutes

### Frontend
```powershell
# Option 1: Use script
npm run deploy:frontend

# Option 2: Step by step
cd frontend
npm run build
cd ..
firebase deploy --only hosting --project dhananjaygroup-dms
```

**Time:** ~1-2 minutes

---

## 🔍 Check Deployment Status

### View Recent Builds
```powershell
gcloud builds list --limit=5
```

### View Build Logs
```powershell
gcloud builds log BUILD_ID
```

### Check Cloud Run Service
```powershell
gcloud run services describe dms-api --region asia-south1 --project dhananjaygroup-dms
```

### View API Logs
```powershell
gcloud run services logs read dms-api --region asia-south1 --project dhananjaygroup-dms
```

---

## 🌐 Live URLs

- **Frontend:** https://dhananjaygroup-dms.web.app
- **Backend API:** https://dms-api-zs4wifhosa-el.a.run.app
- **Health Check:** https://dms-api-zs4wifhosa-el.a.run.app/health

---

## ❓ GitHub Required?

**No!** GitHub is **NOT required** for deployments.

- ✅ You can deploy directly from your local machine
- ✅ Use: `npm run deploy:all` or individual commands
- ✅ Works perfectly without GitHub

**GitHub is optional** for:
- Automatic deployments on push
- Version control and backup
- Team collaboration

See `FUTURE_DEPLOYMENTS.md` for GitHub setup (optional).

---

## 🔄 Typical Workflow

1. **Make code changes**
2. **Test locally** (optional but recommended)
3. **Deploy:**
   ```powershell
   npm run deploy:all
   ```
4. **Verify:**
   - Frontend: https://dhananjaygroup-dms.web.app
   - Backend: https://dms-api-zs4wifhosa-el.a.run.app/health

---

## 🐛 Quick Troubleshooting

### Build Fails
```powershell
gcloud builds list --limit=1
gcloud builds log BUILD_ID
```

### Service Not Working
```powershell
# Check if service is running
gcloud run services describe dms-api --region asia-south1

# Check logs
gcloud run services logs read dms-api --region asia-south1
```

### Frontend Not Updating
1. Clear browser cache (Ctrl+Shift+R)
2. Check Firebase Hosting deployment status
3. Verify `.env.production` has correct API URL

---

**📚 Full Guide:** See `FUTURE_DEPLOYMENTS.md` for detailed instructions.
