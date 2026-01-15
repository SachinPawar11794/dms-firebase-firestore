# Fix npm ci Error

## Problem

Build is failing at step 0 with:
```
BUILD FAILURE: Build step failure: build step 0 "node:18" failed: step exited with non-zero status: 1
```

This means `npm ci` is failing.

## Common Causes

1. **package-lock.json out of sync** with package.json
2. **Platform-specific dependencies** (some packages don't work in Cloud Build)
3. **Network issues** during install
4. **Missing dependencies** in package-lock.json

## Solution Applied

Changed `npm ci` to `npm install` in `cloudbuild.yaml`:
- `npm ci` requires exact match between package.json and package-lock.json
- `npm install` is more forgiving and will update lock file if needed

## Check Build Logs

To see the exact error:

```powershell
powershell -ExecutionPolicy Bypass -File check-build-logs.ps1
```

Or directly:
```powershell
gcloud builds log 7e135ffa-d00a-41b3-af4e-73b8479506b3
```

Or check console:
https://console.cloud.google.com/cloud-build/builds/7e135ffa-d00a-41b3-af4e-73b8479506b3?project=dhananjaygroup-dms

## Try Again

After fixing, run:

```powershell
gcloud builds submit --config cloudbuild.yaml --project dhananjaygroup-dms
```

## Alternative Fixes

If `npm install` still fails, try:

### Option 1: Update package-lock.json locally
```powershell
npm install
git add package-lock.json
git commit -m "Update package-lock.json"
```

### Option 2: Use npm ci with --legacy-peer-deps
Modify cloudbuild.yaml:
```yaml
- name: 'node:18'
  entrypoint: 'npm'
  args: ['ci', '--legacy-peer-deps']
```

### Option 3: Clear cache and reinstall
```yaml
- name: 'node:18'
  entrypoint: 'bash'
  args:
    - '-c'
    - 'npm cache clean --force && npm install'
```

---

**Check logs first to see the exact error!**
