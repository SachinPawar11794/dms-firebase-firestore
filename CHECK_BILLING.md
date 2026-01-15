# 🔍 Check Billing Status

## Critical Issue: Builds Not Appearing

If `gcloud builds list` shows **0 items**, the most common cause is **billing not enabled**.

## Quick Check

Run this command:

```powershell
gcloud billing projects describe dhananjaygroup-dms
```

### If you see:
```
billingAccountName: billingAccounts/XXXXXX-XXXXXX-XXXXXX
billingEnabled: true
```
✅ **Billing is enabled** - Check other issues below

### If you see:
```
ERROR: (gcloud.billing.projects.describe) Project 'dhananjaygroup-dms' not found or access denied.
```
OR
```
billingEnabled: false
```
❌ **Billing is NOT enabled** - This is the problem!

## Fix: Enable Billing

### Option 1: Link Existing Billing Account (Recommended)

You mentioned you have a billing account with $300 credits. Link it:

1. **List your billing accounts:**
   ```powershell
   gcloud billing accounts list
   ```

2. **Link to project:**
   ```powershell
   # Replace BILLING_ACCOUNT_ID with actual ID from step 1
   gcloud billing projects link dhananjaygroup-dms --billing-account=BILLING_ACCOUNT_ID
   ```

3. **Verify:**
   ```powershell
   gcloud billing projects describe dhananjaygroup-dms
   ```

### Option 2: Via Console

1. Go to: https://console.cloud.google.com/billing?project=dhananjaygroup-dms
2. Click "Link a billing account"
3. Select your existing account (with $300 credits)
4. Confirm

## Why Billing is Required

Cloud Build **requires billing** to be enabled, even for:
- ✅ Free tier usage
- ✅ $300 free credits
- ✅ First-time users

**Without billing:**
- ❌ Builds won't be created
- ❌ `gcloud builds list` shows 0 items
- ❌ Build submission fails silently

## After Enabling Billing

1. **Wait 1-2 minutes** for changes to propagate

2. **Try deployment again:**
   ```powershell
   npm run deploy:cloud-build:ps1
   ```

3. **Check builds:**
   ```powershell
   gcloud builds list
   ```

You should now see builds appearing!

## Other Possible Issues (if billing is enabled)

### 1. Cloud Build API Not Enabled

```powershell
gcloud services enable cloudbuild.googleapis.com
```

### 2. Wrong Project

```powershell
gcloud config get-value project
# Should show: dhananjaygroup-dms
```

### 3. Not Authenticated

```powershell
gcloud auth list
# Should show your account
```

---

**Most likely fix:** Enable billing! Run `gcloud billing projects describe dhananjaygroup-dms` to check.
