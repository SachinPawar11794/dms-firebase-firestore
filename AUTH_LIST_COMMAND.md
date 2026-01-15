# Using gcloud auth list Command

## No Commands Needed Before `gcloud auth list`

You can run `gcloud auth list` directly - **no other commands needed before it**.

## Important: Complete Browser Authentication First

### Before Running `gcloud auth list`:

1. ✅ **Complete the browser authentication:**
   - The browser should be open (from `gcloud auth login`)
   - Select your Google account
   - Click **"Allow"** or **"Continue"**
   - Wait for "Authentication successful" message

2. ✅ **Then** run in PowerShell:
   ```powershell
   gcloud auth list
   ```

## What `gcloud auth list` Does

This command simply **shows** which accounts are logged in. It doesn't require any setup.

**Expected output after successful login:**
```
Credentialed Accounts
ACTIVE  ACCOUNT
*       your-email@gmail.com

To set the active account, run:
    $ gcloud config set account `ACCOUNT`
```

## If You See "No credentialed accounts"

If `gcloud auth list` shows no accounts, it means:
- Browser authentication wasn't completed, OR
- Login failed

**Solution:** Run `gcloud auth login` again and complete the browser authentication.

## Complete Sequence

Here's the complete flow:

```powershell
# 1. Start login (opens browser)
gcloud auth login

# 2. [Complete authentication in browser - click Allow]

# 3. Verify login (no commands needed before this)
gcloud auth list

# 4. Set project (if not already set)
gcloud config set project dhananjaygroup-dms

# 5. Enable APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

## Summary

✅ **No commands needed before `gcloud auth list`**  
✅ **Just complete browser authentication first**  
✅ **Then run `gcloud auth list` directly**

---

**After completing browser authentication, just type: `gcloud auth list`**
