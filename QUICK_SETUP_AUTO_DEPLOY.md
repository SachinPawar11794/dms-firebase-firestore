# ⚡ Quick Setup: Automatic Deployments

## ✅ Prerequisites Checked!

- ✅ APIs enabled
- ✅ Cloud Build permissions granted
- ✅ Ready to connect GitHub

---

## 🚀 Step-by-Step Setup (5-10 minutes)

### Step 1: Open Cloud Build Console

**Click this link:**
https://console.cloud.google.com/cloud-build/triggers?project=dhananjaygroup-dms

Or navigate manually:
1. Go to: https://console.cloud.google.com
2. Select project: `dhananjaygroup-dms`
3. Go to: **Cloud Build** → **Triggers**

---

### Step 2: Connect GitHub Repository

1. **Click "Connect Repository"** (or "Create Trigger" if you see that first)

2. **Select Source:**
   - Choose **"GitHub (Cloud Build GitHub App)"**
   - Click **"Continue"**

3. **Authenticate:**
   - Click **"Install Google Cloud Build"**
   - You'll be redirected to GitHub
   - **Authorize** Google Cloud Build
   - **Select repository:** `SachinPawar11794/dms-firebase-firestore`
   - Click **"Connect"** or **"Install"**

4. **Repository Connected:**
   - You should see: "Repository connected successfully"
   - Click **"Create Trigger"** (or go back to Triggers page)

---

### Step 3: Create Build Trigger

1. **Click "Create Trigger"**

2. **Fill in Trigger Settings:**
   - **Name:** `deploy-dms-api`
   - **Description:** `Automatic deployment on push to main branch` (optional)

3. **Event Configuration:**
   - **Event:** Select **"Push to a branch"**
   - **Source:** Select **`SachinPawar11794/dms-firebase-firestore`**
   - **Branch:** Enter **`^main$`** (this matches the "main" branch exactly)

4. **Configuration:**
   - **Type:** Select **"Cloud Build configuration file (yaml or json)"**
   - **Location:** Enter **`cloudbuild.yaml`**
   - (This file is already in your repository)

5. **Advanced (Optional - Leave Default):**
   - Service account: Default
   - Substitution variables: Default

6. **Click "Create"** at the bottom

---

### Step 4: Test It!

1. **Make a small test change:**
   ```powershell
   # In your terminal
   echo "# Test automatic deployment" >> test-deploy.txt
   git add test-deploy.txt
   git commit -m "Test automatic deployment"
   git push origin main
   ```

2. **Watch the build:**
   - Go to: https://console.cloud.google.com/cloud-build/builds?project=dhananjaygroup-dms
   - You should see a new build starting automatically!
   - Wait 5-10 minutes for it to complete

3. **Verify deployment:**
   - Check: https://dms-api-zs4wifhosa-el.a.run.app/health
   - Should still work (or show your changes if you made any)

---

## ✅ Success!

Once set up, your workflow becomes:

```powershell
# Make changes
git add .
git commit -m "Your changes"
git push origin main
# That's it! Deployment happens automatically!
```

---

## 📊 Monitor Deployments

**View Builds:**
- https://console.cloud.google.com/cloud-build/builds?project=dhananjaygroup-dms

**View Triggers:**
- https://console.cloud.google.com/cloud-build/triggers?project=dhananjaygroup-dms

---

## 🎯 Quick Reference

**Trigger Name:** `deploy-dms-api`  
**Repository:** `SachinPawar11794/dms-firebase-firestore`  
**Branch:** `main`  
**Config File:** `cloudbuild.yaml`  

---

## 🐛 Troubleshooting

### Can't see "Connect Repository"?
- Make sure you're in the right project: `dhananjaygroup-dms`
- Try refreshing the page

### Build not starting?
- Check trigger is enabled (toggle switch)
- Verify branch name is `main`
- Check repository connection

### Build fails?
- View build logs in Cloud Build console
- Check for permission errors
- Verify `cloudbuild.yaml` is correct

---

**Ready? Start with Step 1 above!** 🚀
