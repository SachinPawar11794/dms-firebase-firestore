# Ready to Deploy! 🚀

## ✅ Completed Steps

- ✅ Google Cloud SDK installed
- ✅ Docker Desktop installed
- ✅ Logged in: `dms@dhananjaygroup.com`
- ✅ Project set: `dhananjaygroup-dms`
- ✅ Billing account linked
- ✅ **Cloud Build API enabled**
- ✅ **Cloud Run API enabled**
- ✅ **Container Registry API enabled**

## 🎯 Final Steps Before Deployment

### Step 1: Start Docker Desktop

1. **Open Docker Desktop:**
   - Click Start menu
   - Search "Docker Desktop"
   - Click to open

2. **Wait for Docker to start:**
   - You'll see a whale icon in system tray
   - Wait until it shows "Docker Desktop is running"
   - This may take 1-2 minutes on first start

3. **Verify Docker is running:**
   ```powershell
   docker --version
   docker ps
   ```
   
   Should show Docker version and no errors.

### Step 2: Deploy to Cloud Run

Once Docker Desktop is running, deploy your API:

```powershell
npm run deploy:cloud-run:ps1
```

**What this does:**
1. Builds your TypeScript code
2. Creates Docker image
3. Pushes to Google Container Registry
4. Deploys to Cloud Run
5. Gives you a public API URL

**Time:** First deployment takes 5-10 minutes

### Step 3: Get Your API URL

After deployment completes, you'll see:
```
✅ Deployment successful!
🌐 Service URL: https://dms-api-xxxxx-uc.a.run.app
```

**Copy this URL!** You'll need it for the frontend.

### Step 4: Update Frontend

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

## ⚠️ Important Notes

### Docker Desktop Must Be Running
- **Required:** Docker Desktop must be running before deployment
- **Check:** Look for whale icon in system tray
- **Verify:** Run `docker ps` - should not show errors

### First Deployment
- Takes **5-10 minutes** (subsequent deployments are faster)
- Be patient, don't cancel the process
- You'll see progress messages

### Service Account Key
- Make sure `serviceAccountKey.json` is in project root
- The deployment script will include it in the Docker image

## Troubleshooting

### "Docker not running" error
**Solution:**
- Start Docker Desktop from Start menu
- Wait for it to fully start
- Verify: `docker ps`

### "Permission denied" error
**Solution:**
```powershell
gcloud projects add-iam-policy-binding dhananjaygroup-dms --member="user:dms@dhananjaygroup.com" --role="roles/run.admin"
```

### Deployment fails
**Solution:**
- Check logs: `gcloud run services logs read dms-api --region asia-south1`
- Verify service account key exists
- Check billing is enabled

## Quick Command Summary

```powershell
# 1. Start Docker Desktop (manually from Start menu)

# 2. Verify Docker
docker ps

# 3. Deploy
npm run deploy:cloud-run:ps1

# 4. After deployment, update frontend .env.production with API URL

# 5. Rebuild and redeploy frontend
cd frontend
npm run build
cd ..
firebase deploy --only hosting
```

## ✅ Success Checklist

- [x] All APIs enabled
- [ ] Docker Desktop started and running
- [ ] Deployed: `npm run deploy:cloud-run:ps1`
- [ ] Got API URL
- [ ] Updated frontend `.env.production`
- [ ] Rebuilt frontend
- [ ] Redeployed frontend

---

**🚀 You're ready! Start Docker Desktop, then run `npm run deploy:cloud-run:ps1`!**
