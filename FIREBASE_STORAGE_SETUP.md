# Firebase Storage Setup Guide

Complete guide to set up Firebase Storage for your DMS application.

## Step 1: Enable Firebase Storage in Firebase Console

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select your project: `dhananjaygroup-dms`

2. **Enable Storage**
   - Click on **"Storage"** in the left sidebar
   - Click **"Get started"** button
   - Choose **"Start in production mode"** (we'll configure rules separately)
   - Select a **storage location** (choose the same region as your Firestore, e.g., `asia-south1`)
   - Click **"Done"**

3. **Wait for Setup**
   - Firebase will create the storage bucket (takes 1-2 minutes)
   - You'll see a message: "Cloud Storage is ready"

## Step 2: Get Your Storage Bucket Name

1. **In Firebase Console**
   - Go to **Storage** → **Files** tab
   - Look at the URL or bucket name shown
   - It will be in format: `dhananjaygroup-dms.appspot.com` or `dhananjaygroup-dms.firebasestorage.app`

2. **Alternative: Check Project Settings**
   - Go to **Project Settings** (gear icon ⚙️)
   - Scroll to **"Your apps"** section
   - Look for **"Storage bucket"** field
   - Copy the bucket name

## Step 3: Update Environment Variables

Add or update the storage bucket in your `.env` file:

```env
# Add this line if not already present
FIREBASE_STORAGE_BUCKET=dhananjaygroup-dms.appspot.com
```

**Note:** Replace `dhananjaygroup-dms.appspot.com` with your actual bucket name.

## Step 4: Deploy Storage Rules

1. **Deploy the rules file**
   ```bash
   firebase deploy --only storage
   ```

2. **Verify rules are deployed**
   - Go to Firebase Console → Storage → Rules tab
   - You should see the rules from `storage.rules` file

## Step 5: Verify Service Account Permissions

Your service account needs Storage permissions:

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/iam-admin/iam?project=dhananjaygroup-dms
   - Find your service account (ends with `@dhananjaygroup-dms.iam.gserviceaccount.com`)

2. **Check/Add Permissions**
   - Click **Edit** (pencil icon) on the service account
   - Ensure it has one of these roles:
     - **Storage Admin** (full access) - Recommended for development
     - **Storage Object Admin** (can manage objects)
     - **Storage Object Creator** (can create objects)
   - If missing, click **"Add Another Role"** and add **"Storage Admin"**
   - Click **"Save"**

## Step 6: Test the Setup

1. **Restart your backend server**
   ```bash
   npm run dev
   ```

2. **Try uploading a logo**
   - Go to your app → App Settings → App Branding
   - Upload a test logo image
   - Check if it uploads successfully

3. **Verify in Firebase Console**
   - Go to Storage → Files
   - You should see a `logos/` folder
   - Your uploaded logo should be inside

## Troubleshooting

### Error: "Bucket does not exist"
- **Solution:** Verify `FIREBASE_STORAGE_BUCKET` in `.env` matches your actual bucket name
- Check Firebase Console → Storage → Files for the correct bucket name

### Error: "Permission denied"
- **Solution:** 
  1. Check service account has Storage Admin role (Step 5)
  2. Wait 2-3 minutes after adding permissions for them to propagate
  3. Restart your backend server

### Error: "Storage not initialized"
- **Solution:** 
  1. Ensure Storage is enabled in Firebase Console (Step 1)
  2. Verify `FIREBASE_STORAGE_BUCKET` is set in `.env`
  3. Restart backend server

### Files not appearing in Storage
- **Solution:**
  1. Check Storage rules are deployed: `firebase deploy --only storage`
  2. Verify rules allow writes for authenticated users
  3. Check backend logs for upload errors

## Storage Rules Explanation

The `storage.rules` file includes:
- **Read access:** All authenticated users can view logos
- **Write access:** Authenticated users can upload images (max 5MB, images only)
- **Delete access:** Authenticated users can delete logos

For production, you might want to restrict uploads to admins only. You can modify the rules accordingly.

## Next Steps

After setup is complete:
1. ✅ Storage is enabled
2. ✅ Rules are deployed
3. ✅ Service account has permissions
4. ✅ Environment variables are set
5. ✅ Test logo upload works

You're all set! 🎉
