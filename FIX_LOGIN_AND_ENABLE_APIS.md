# Fix Login and Enable APIs

## Current Issue

You're seeing this error:
```
ERROR: (gcloud.services.enable) You do not currently have an active account selected.
Please run: $ gcloud auth login
```

This means you need to **login to Google Cloud** first.

## Solution: Complete Login

### Step 1: Login to Google Cloud

Run this command in PowerShell:

```powershell
gcloud auth login
```

**What happens:**
1. Opens your default web browser
2. Shows Google account selection page
3. Select the account that has access to `dhananjaygroup-dms`
4. Click "Allow" to grant permissions
5. Returns to PowerShell showing "You are now logged in"

### Step 2: Verify Login

After logging in, verify:

```powershell
gcloud auth list
```

Should show your account with status "ACTIVE".

### Step 3: Set Project (If Needed)

Make sure project is set:

```powershell
gcloud config set project dhananjaygroup-dms
```

Verify:
```powershell
gcloud config get-value project
```

Should show: `dhananjaygroup-dms`

### Step 4: Now Enable APIs

After login is complete, run:

```powershell
# Enable Cloud Build API
gcloud services enable cloudbuild.googleapis.com

# Enable Cloud Run API
gcloud services enable run.googleapis.com

# Enable Container Registry API
gcloud services enable containerregistry.googleapis.com
```

## Complete Command Sequence

Run these commands **in order**:

```powershell
# 1. Login (opens browser)
gcloud auth login

# 2. Verify login
gcloud auth list

# 3. Set project
gcloud config set project dhananjaygroup-dms

# 4. Enable APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

## Troubleshooting Login

### Browser doesn't open
**Solution:**
```powershell
# Use no-browser flag and copy the URL manually
gcloud auth login --no-browser
```

### Wrong account selected
**Solution:**
```powershell
# List all accounts
gcloud auth list

# Set specific account
gcloud config set account YOUR_EMAIL@example.com
```

### "Permission denied" after login
**Solution:**
- Make sure you're using the account that has access to `dhananjaygroup-dms`
- Check project permissions in Google Cloud Console

## After APIs Are Enabled

Once all three APIs are enabled successfully, you'll see:
```
Operation "operations/..." finished successfully.
```

Then proceed to:
- **Step 4:** Start Docker Desktop
- **Step 5:** Deploy to Cloud Run

---

**Start with:** `gcloud auth login` and complete the browser authentication!
