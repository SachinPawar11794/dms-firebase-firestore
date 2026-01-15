# 🔍 Diagnose: Why Builds Show 0 Items

## Step-by-Step Diagnosis

### Step 1: Check Billing (MOST IMPORTANT!)

```powershell
gcloud billing projects describe dhananjaygroup-dms
```

**Expected output:**
```
billingAccountName: billingAccounts/XXXXXX-XXXXXX-XXXXXX
billingEnabled: true
```

**If billing is NOT enabled:**
- ❌ This is why builds show 0 items!
- ✅ Fix: Link billing account (see CHECK_BILLING.md)

### Step 2: Check Project

```powershell
gcloud config get-value project
```

**Should show:** `dhananjaygroup-dms`

**If wrong project:**
```powershell
gcloud config set project dhananjaygroup-dms
```

### Step 3: Check Authentication

```powershell
gcloud auth list
```

**Should show your account with `ACTIVE` status**

**If not authenticated:**
```powershell
gcloud auth login
```

### Step 4: Check APIs Enabled

```powershell
gcloud services list --enabled --filter="name:cloudbuild.googleapis.com"
```

**Should show:** `cloudbuild.googleapis.com`

**If not enabled:**
```powershell
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### Step 5: Try Test Build Submission

Run the test script:

```powershell
npm run test:build
```

This will:
- ✅ Check all prerequisites
- ✅ Submit a build with verbose output
- ✅ Show any errors

### Step 6: Check Cloud Build Console

Go to: https://console.cloud.google.com/cloud-build/builds?project=dhananjaygroup-dms

**Look for:**
- Any error messages
- Builds that failed immediately
- Permission errors

## Most Common Issue: Billing

**90% of cases:** Billing not enabled

**Quick fix:**
```powershell
# List billing accounts
gcloud billing accounts list

# Link to project (replace BILLING_ACCOUNT_ID)
gcloud billing projects link dhananjaygroup-dms --billing-account=BILLING_ACCOUNT_ID

# Verify
gcloud billing projects describe dhananjaygroup-dms
```

## After Fixing Billing

1. Wait 1-2 minutes
2. Try deployment: `npm run deploy:cloud-build:ps1`
3. Check builds: `gcloud builds list`

---

**Run:** `gcloud billing projects describe dhananjaygroup-dms` first!
