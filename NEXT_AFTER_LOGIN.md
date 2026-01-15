# Next Steps After Successful Login

## ✅ Login Status

**Great!** Your login was successful:
- ✅ Active account: `dms@dhananjaygroup.com`
- ✅ Account is ACTIVE

## 🚀 Next: Enable Required APIs

Now you need to enable 3 APIs. Run these commands **one at a time**:

### Command 1: Enable Cloud Build API

```powershell
gcloud services enable cloudbuild.googleapis.com
```

**Wait for:** `Operation "operations/..." finished successfully.`

### Command 2: Enable Cloud Run API

```powershell
gcloud services enable run.googleapis.com
```

**Wait for:** `Operation "operations/..." finished successfully.`

### Command 3: Enable Container Registry API

```powershell
gcloud services enable containerregistry.googleapis.com
```

**Wait for:** `Operation "operations/..." finished successfully.`

## ⏱️ Timing

- Each command takes **1-2 minutes** to complete
- Wait for each one to finish before running the next
- You'll see "Operation finished successfully" when done

## ✅ After All APIs Are Enabled

Once all three APIs show "Operation finished successfully", proceed to:

1. **Step 4:** Start Docker Desktop
2. **Step 5:** Deploy to Cloud Run

## Quick Checklist

- [x] Login successful (`dms@dhananjaygroup.com`)
- [ ] Enable Cloud Build API
- [ ] Enable Cloud Run API
- [ ] Enable Container Registry API
- [ ] Start Docker Desktop
- [ ] Deploy to Cloud Run

---

**Run the 3 `gcloud services enable` commands above!**
