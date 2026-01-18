# 🚀 Quick Deploy Guide

Fastest way to get your application online!

## ⚡ One-Command Deployment

```powershell
npm run deploy:cloud-build:ps1
```

**That's it!** This will:
1. ✅ Build your backend
2. ✅ Deploy to Cloud Run
3. ✅ Build your frontend
4. ✅ Deploy to Firebase Hosting

## 📋 Before You Deploy

### 1. Set Database Password Secret (One-time)

```powershell
# Create secret for database password
echo "YOUR_DB_PASSWORD" | gcloud secrets create db-password --data-file=-

# Grant Cloud Run access
$projectNumber = gcloud projects describe dhananjaygroup-dms --format="value(projectNumber)"
gcloud secrets add-iam-policy-binding db-password `
  --member="serviceAccount:$projectNumber-compute@developer.gserviceaccount.com" `
  --role="roles/secretmanager.secretAccessor"
```

### 2. Enable APIs (One-time)

```powershell
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

## 🎯 After Deployment

You'll get two URLs:

1. **Backend API**: `https://dms-api-xxxxx-uc.a.run.app`
2. **Frontend App**: `https://dhananjaygroup-dms.web.app`

## ✅ Test It

```powershell
# Test backend
curl https://dms-api-xxxxx-uc.a.run.app/health

# Visit frontend
# Open: https://dhananjaygroup-dms.web.app
```

## 🔧 If Database Password Not Set as Secret

If you haven't set up the secret, you can temporarily use environment variable:

```powershell
# After deployment, update with password
gcloud run services update dms-api `
  --region asia-south1 `
  --update-env-vars "DB_PASSWORD=YOUR_PASSWORD"
```

**⚠️ Note:** Using environment variables is less secure. Use secrets for production!

---

**Ready?** Run: `npm run deploy:cloud-build:ps1` 🚀
