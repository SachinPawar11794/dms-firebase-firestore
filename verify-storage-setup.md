# Verify Storage Setup

## Quick Checklist

✅ Storage bucket created: `dhananjaygroup-dms.firebasestorage.app`
✅ Storage rules deployed
⏳ Service account permissions (verify below)
⏳ Test logo upload

## Verify Service Account Permissions

1. Go to: https://console.cloud.google.com/iam-admin/iam?project=dhananjaygroup-dms

2. Find your service account:
   - Look for account ending with `@dhananjaygroup-dms.iam.gserviceaccount.com`
   - Or check your `.env` file for `FIREBASE_CLIENT_EMAIL`

3. Check if it has Storage permissions:
   - Click **Edit** (pencil icon) on the service account
   - Look for one of these roles:
     - ✅ **Storage Admin** (recommended)
     - ✅ **Storage Object Admin**
     - ✅ **Storage Object Creator**

4. If missing, add the role:
   - Click **"Add Another Role"**
   - Search for **"Storage Admin"**
   - Select it and click **"Save"**
   - Wait 2-3 minutes for permissions to propagate

## Test the Setup

1. **Restart your backend server** (if running):
   ```bash
   # Stop current server (Ctrl+C)
   # Then restart:
   npm run dev
   ```

2. **Test logo upload**:
   - Open your app in browser
   - Go to: **App Settings → App Branding**
   - Click **"Upload New Logo"**
   - Select an image file (JPG, PNG, or GIF, max 5MB)
   - Click **"Upload Logo"**
   - Check if upload succeeds!

3. **Verify in Firebase Console**:
   - Go to Storage → Files
   - You should see a `logos/` folder
   - Your uploaded logo should be inside

## Troubleshooting

If upload fails, check:
- Backend console logs for error messages
- Service account has Storage Admin role
- Storage bucket name in `.env` matches: `dhananjaygroup-dms.firebasestorage.app`
- Backend server restarted after adding permissions
