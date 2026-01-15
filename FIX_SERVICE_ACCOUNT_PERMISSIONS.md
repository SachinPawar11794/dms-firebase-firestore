# Fix Service Account Permissions for User Creation

## Problem
When trying to create users from the web app, you get an error:
```
Service account lacks permissions. Please grant "Service Usage Consumer" and "Firebase Admin SDK Administrator Service Agent" roles
```

## Solution: Grant Required Permissions

### Step 1: Open Google Cloud Console IAM
1. Go to: https://console.cloud.google.com/iam-admin/iam?project=dhananjaygroup-dms
2. Or navigate: Google Cloud Console → IAM & Admin → IAM

### Step 2: Find Your Service Account
1. Look for a service account that ends with: `@dhananjaygroup-dms.iam.gserviceaccount.com`
2. This is the service account used by your Firebase Admin SDK
3. It's usually named something like: `firebase-adminsdk-xxxxx@dhananjaygroup-dms.iam.gserviceaccount.com`

### Step 3: Edit Service Account Permissions
1. Click the **Edit** (pencil icon) next to your service account
2. Click **"ADD ANOTHER ROLE"**
3. Add these two roles (one at a time):

   **Role 1:**
   - Type: `Service Usage Consumer`
   - Select: `Service Usage Consumer`

   **Role 2:**
   - Click **"ADD ANOTHER ROLE"** again
   - Type: `Firebase Admin SDK Administrator Service Agent`
   - Select: `Firebase Admin SDK Administrator Service Agent`

4. Click **"SAVE"**

### Step 4: Wait for Propagation
- Permissions can take 2-5 minutes to propagate
- Try creating a user again after waiting

### Step 5: Verify
1. Go back to your web app
2. Try creating a user again
3. It should work now!

---

## Alternative: Manual User Creation

If you prefer not to fix permissions, you can still create users manually:

### Method 1: Firebase Console
1. Go to Firebase Console → Authentication → Users
2. Click "Add user"
3. Enter email and password
4. Copy the User UID
5. Use the script: `npm run create-firestore-user <UID> <email> "<name>"`

### Method 2: Use Script with Auth Creation
The script can create both Auth user and Firestore document if permissions are fixed.

---

## Troubleshooting

### Still Getting Permission Errors?
1. **Check service account name**: Make sure you're editing the correct service account
2. **Wait longer**: Permissions can take up to 10 minutes to propagate
3. **Check project**: Ensure you're in the correct project (`dhananjaygroup-dms`)
4. **Verify roles**: Double-check both roles are added

### Can't Find Service Account?
1. Check your `.env` file for `FIREBASE_SERVICE_ACCOUNT_KEY`
2. The service account email should be in that JSON file
3. Look for `"client_email"` field

### Need Help?
- Check Firebase Console → Project Settings → Service Accounts
- Or contact your Google Cloud administrator

---

## Quick Reference

**Required Roles:**
- ✅ Service Usage Consumer
- ✅ Firebase Admin SDK Administrator Service Agent

**IAM Page:**
https://console.cloud.google.com/iam-admin/iam?project=dhananjaygroup-dms

**After fixing, wait 2-5 minutes before testing again.**
