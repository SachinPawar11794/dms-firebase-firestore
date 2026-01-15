# ⏱️ Cloud Build Free Tier - Examples Explained

## 🆓 What "120 Build-Minutes Per Day" Means

**Free Tier:** 120 build-minutes per day

**What counts:**
- Time spent building Docker images
- Time spent running build steps
- Time spent deploying
- **Total time = build duration**

---

## 📊 Examples: What's FREE

### Example 1: Your Typical Build ✅ FREE

**Scenario:**
- Build duration: **7 minutes**
- Builds per day: **5 builds**
- Total: 7 × 5 = **35 minutes/day**

**Cost:** ✅ **FREE** (35 minutes < 120 minutes)

**Remaining free minutes:** 120 - 35 = **85 minutes left**

---

### Example 2: Frequent Deployments ✅ FREE

**Scenario:**
- Build duration: **5 minutes**
- Builds per day: **15 builds**
- Total: 5 × 15 = **75 minutes/day**

**Cost:** ✅ **FREE** (75 minutes < 120 minutes)

**Remaining free minutes:** 120 - 75 = **45 minutes left**

---

### Example 3: Many Quick Builds ✅ FREE

**Scenario:**
- Build duration: **3 minutes**
- Builds per day: **30 builds**
- Total: 3 × 30 = **90 minutes/day**

**Cost:** ✅ **FREE** (90 minutes < 120 minutes)

**Remaining free minutes:** 120 - 90 = **30 minutes left**

---

### Example 4: Maximum Free Usage ✅ FREE

**Scenario:**
- Build duration: **6 minutes**
- Builds per day: **20 builds**
- Total: 6 × 20 = **120 minutes/day**

**Cost:** ✅ **FREE** (exactly at the limit!)

**Remaining free minutes:** 120 - 120 = **0 minutes left**

---

## 💰 Examples: What Costs Money

### Example 5: Slightly Over Free Tier 💵 Small Cost

**Scenario:**
- Build duration: **7 minutes**
- Builds per day: **20 builds**
- Total: 7 × 20 = **140 minutes/day**
- Over free tier: 140 - 120 = **20 minutes**

**Cost:**
- First 120 minutes: **FREE**
- Next 20 minutes: 20 × $0.003 = **$0.06/day**
- **Monthly:** ~$1.80

---

### Example 6: Heavy Usage 💵 Moderate Cost

**Scenario:**
- Build duration: **10 minutes**
- Builds per day: **25 builds**
- Total: 10 × 25 = **250 minutes/day**
- Over free tier: 250 - 120 = **130 minutes**

**Cost:**
- First 120 minutes: **FREE**
- Next 130 minutes: 130 × $0.003 = **$0.39/day**
- **Monthly:** ~$11.70

---

### Example 7: Very Heavy Usage 💵 Higher Cost

**Scenario:**
- Build duration: **8 minutes**
- Builds per day: **50 builds**
- Total: 8 × 50 = **400 minutes/day**
- Over free tier: 400 - 120 = **280 minutes**

**Cost:**
- First 120 minutes: **FREE**
- Next 280 minutes: 280 × $0.003 = **$0.84/day**
- **Monthly:** ~$25.20

---

## 🎯 Your Current Usage

### Typical Day:

**Your builds:**
- Build duration: **~5-7 minutes** per build
- Builds per day: **2-5 builds**
- Total: ~10-35 minutes/day

**Cost:** ✅ **FREE** (well within 120 minutes)

**Example calculation:**
- 5 builds × 7 minutes = 35 minutes
- 35 minutes < 120 minutes = **FREE**

**Remaining free minutes:** 120 - 35 = **85 minutes available**

---

## 📊 Visual Examples

### FREE Scenarios:

```
✅ 1 build × 120 minutes = 120 min → FREE
✅ 2 builds × 60 minutes = 120 min → FREE
✅ 10 builds × 12 minutes = 120 min → FREE
✅ 20 builds × 6 minutes = 120 min → FREE
✅ 40 builds × 3 minutes = 120 min → FREE
```

### PAID Scenarios:

```
💵 1 build × 150 minutes = 150 min → $0.09 (30 min over)
💵 20 builds × 7 minutes = 140 min → $0.06 (20 min over)
💵 30 builds × 5 minutes = 150 min → $0.09 (30 min over)
```

---

## 🔢 How Build Minutes Work

### What Counts:
- ✅ **Docker build time** (compiling TypeScript, building image)
- ✅ **Push to registry** (uploading image)
- ✅ **Deploy to Cloud Run** (deployment time)
- ✅ **All build steps** (everything in cloudbuild.yaml)

### What Doesn't Count:
- ❌ Time between builds
- ❌ Time builds are queued (waiting)
- ❌ Failed builds (if they fail quickly)
- ❌ Storage costs (separate)

---

## 📈 Daily Reset

**Important:** Free tier resets **every day at midnight UTC**

**Example:**
- Day 1: Used 100 minutes → 20 minutes left
- Day 2: **Resets to 120 minutes** (fresh start!)
- Day 2: Used 50 minutes → 70 minutes left

**You get 120 minutes EVERY day!**

---

## 💡 Real-World Scenarios

### Scenario A: Solo Developer (You) ✅ FREE

**Typical day:**
- Morning: 1 build (7 min)
- Afternoon: 2 builds (14 min)
- Evening: 1 build (7 min)
- **Total: 28 minutes**

**Cost:** ✅ **FREE**
**Remaining:** 92 minutes

---

### Scenario B: Small Team ✅ FREE

**Typical day:**
- Developer 1: 3 builds (21 min)
- Developer 2: 4 builds (28 min)
- Developer 3: 2 builds (14 min)
- **Total: 63 minutes**

**Cost:** ✅ **FREE**
**Remaining:** 57 minutes

---

### Scenario C: Active Development ✅ FREE

**Typical day:**
- Feature development: 8 builds (56 min)
- Bug fixes: 4 builds (28 min)
- Testing: 3 builds (21 min)
- **Total: 105 minutes**

**Cost:** ✅ **FREE**
**Remaining:** 15 minutes

---

### Scenario D: Very Active (Might Exceed) 💵 Small Cost

**Typical day:**
- Continuous deployment: 25 builds (175 min)
- **Total: 175 minutes**
- Over free tier: 55 minutes

**Cost:** $0.17/day = **~$5/month**

---

## 🎯 Summary Table

| Builds/Day | Duration | Total Minutes | Cost | Status |
|------------|----------|---------------|------|--------|
| 5 builds | 7 min | 35 min | $0 | ✅ FREE |
| 10 builds | 7 min | 70 min | $0 | ✅ FREE |
| 15 builds | 7 min | 105 min | $0 | ✅ FREE |
| 17 builds | 7 min | 119 min | $0 | ✅ FREE |
| 18 builds | 7 min | 126 min | $0.02/day | 💵 $0.60/month |
| 20 builds | 7 min | 140 min | $0.06/day | 💵 $1.80/month |
| 30 builds | 7 min | 210 min | $0.27/day | 💵 $8.10/month |

---

## ✅ Your Situation

**Your typical usage:**
- Builds per day: **2-5 builds**
- Build duration: **5-7 minutes**
- Total: **~10-35 minutes/day**

**Cost:** ✅ **FREE** (well within 120 minutes)

**Even if you deploy 10 times/day:**
- 10 × 7 minutes = 70 minutes
- Still **FREE**!

**You'd need ~17 builds/day to hit the limit!**

---

## 📝 Key Points

1. **120 minutes = total build time per day**
2. **Resets daily** (fresh 120 minutes every day)
3. **Your usage is well within limits** (FREE)
4. **Only pay for minutes over 120**

---

## 🎉 Bottom Line

**What's FREE:**
- ✅ Up to 120 build-minutes per day
- ✅ Your current usage (10-35 min/day) = **FREE**
- ✅ Even 15-17 builds/day = **FREE**

**What costs money:**
- 💵 Only minutes over 120 per day
- 💵 $0.003 per minute over limit
- 💵 Your usage: **$0** (well within free tier)

---

**Your usage is FREE and will likely stay FREE!** 🎊
