# Complete Login Steps

## Current Status

✅ `gcloud auth login` command executed  
✅ Browser should be open with Google sign-in page  
⏳ **Next:** Complete authentication in browser

## What to Do Now

### Step 1: Complete Browser Authentication

1. **In your browser** (should have opened automatically):
   - Select your Google account (the one with access to `dhananjaygroup-dms`)
   - Click **"Allow"** or **"Continue"** to grant permissions
   - Wait for the success message

2. **Return to PowerShell:**
   - After clicking Allow, the browser will show "Authentication successful"
   - You can close the browser tab
   - Return to your PowerShell window

### Step 2: Verify Login Success

In PowerShell, run:

```powershell
gcloud auth list
```

**Expected output:**
```
Credentialed Accounts
ACTIVE  ACCOUNT
*       your-email@gmail.com

To set the active account, run:
    $ gcloud config set account `ACCOUNT`
```

✅ If you see your account listed as "ACTIVE", login was successful!

### Step 3: Set Project (If Not Already Set)

```powershell
gcloud config set project dhananjaygroup-dms
```

Verify:
```powershell
gcloud config get-value project
```

Should show: `dhananjaygroup-dms`

### Step 4: Enable APIs

Now that you're logged in, enable the required APIs:

```powershell
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

Each command will take 1-2 minutes and show:
```
Operation "operations/..." finished successfully.
```

## Troubleshooting

### Browser didn't open?
**Solution:**
- Copy the URL from PowerShell
- Paste it into your browser manually
- Complete authentication

### Wrong account selected?
**Solution:**
```powershell
# List all accounts
gcloud auth list

# Set specific account
gcloud config set account YOUR_EMAIL@example.com
```

### "Authentication failed"?
**Solution:**
- Make sure you're using the account that has access to `dhananjaygroup-dms`
- Try logging in again: `gcloud auth login`

## Next Steps After Login

Once login is verified:

1. ✅ Enable APIs (3 commands above)
2. ✅ Start Docker Desktop
3. ✅ Deploy: `npm run deploy:cloud-run:ps1`

---

**Complete the browser authentication, then verify with `gcloud auth list`!**
