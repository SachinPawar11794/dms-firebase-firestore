# 💰 Cloud Build Pricing - Complete Guide

## 🆓 Free Tier

### Cloud Build Free Tier:
- ✅ **120 build-minutes per day** (FREE)
- ✅ **10 concurrent builds** (FREE)
- ✅ **No credit card required** for free tier
- ✅ **Resets daily**

**What counts as "build-minutes":**
- Time spent building Docker images
- Time spent running build steps
- Time spent deploying

---

## 💵 When Charges Apply

### After Free Tier:
- **$0.003 per build-minute** (after 120 free minutes/day)
- **Only charged for actual build time**
- **No charge for:**
  - ❌ Failed builds (if they fail quickly)
  - ❌ Time between builds
  - ❌ Storage (separate service)

---

## 📊 Cost Examples

### Example 1: Small Project (Within Free Tier)
**Your typical build:**
- Build time: ~5-7 minutes
- Builds per day: 2-3
- Total: ~10-21 minutes/day

**Cost:** ✅ **FREE** (under 120 minutes/day)

---

### Example 2: Medium Project (Slightly Over)
**Scenario:**
- Build time: ~7 minutes
- Builds per day: 20
- Total: ~140 minutes/day
- Over free tier: 20 minutes

**Cost:**
- First 120 minutes: **FREE**
- Next 20 minutes: 20 × $0.003 = **$0.06/day**
- **Monthly:** ~$1.80

---

### Example 3: Heavy Usage
**Scenario:**
- Build time: ~10 minutes
- Builds per day: 50
- Total: ~500 minutes/day
- Over free tier: 380 minutes

**Cost:**
- First 120 minutes: **FREE**
- Next 380 minutes: 380 × $0.003 = **$1.14/day**
- **Monthly:** ~$34.20

---

## 🎯 Your Current Usage Estimate

**Based on your setup:**
- Build time: ~5-7 minutes per build
- Typical usage: 2-5 builds per day
- Estimated: ~10-35 minutes/day

**Cost:** ✅ **FREE** (well within 120 minutes/day limit)

---

## 📊 Cloud Build vs GitHub Actions Pricing

### Cloud Build Pricing:

| Tier | Minutes | Cost |
|------|---------|------|
| **Free** | 120/day | $0 |
| **Paid** | Per minute | $0.003/min |

**Free tier:** 120 build-minutes/day = **3,600 minutes/month**

---

### GitHub Actions Pricing:

| Tier | Minutes | Cost |
|------|---------|------|
| **Free (Public repos)** | Unlimited | $0 |
| **Free (Private repos)** | 2,000/month | $0 |
| **Paid** | Per minute | $0.008/min (Linux) |

**Free tier:** 2,000 minutes/month for private repos

---

## 🆚 Comparison Table

| Feature | Cloud Build | GitHub Actions |
|---------|-------------|----------------|
| **Free Tier** | 120 min/day (3,600/month) | 2,000 min/month |
| **Free Tier Reset** | Daily | Monthly |
| **Paid Rate** | $0.003/min | $0.008/min (Linux) |
| **Your Usage** | ~10-35 min/day | N/A (not using) |
| **Your Cost** | ✅ FREE | N/A |
| **Best For** | Google Cloud deployments | GitHub-based projects |

---

## 💡 Cost Analysis for Your Project

### Your Current Setup:

**Typical Build:**
- Duration: ~5-7 minutes
- Frequency: 2-5 builds/day
- Daily usage: ~10-35 minutes

**Cost Calculation:**
- Free tier: 120 minutes/day
- Your usage: ~10-35 minutes/day
- **Result:** ✅ **100% FREE**

**Even if you deploy 10 times/day:**
- 10 builds × 7 minutes = 70 minutes/day
- Still **FREE** (under 120 minutes)

---

## 🎯 When You'd Start Paying

### Scenario 1: Very Frequent Deployments
- 20 builds/day × 7 minutes = 140 minutes/day
- Over free tier: 20 minutes
- **Cost:** $0.06/day = **~$1.80/month**

### Scenario 2: Long Build Times
- 5 builds/day × 30 minutes = 150 minutes/day
- Over free tier: 30 minutes
- **Cost:** $0.09/day = **~$2.70/month**

### Scenario 3: Team Usage
- Multiple developers pushing
- 50 builds/day × 7 minutes = 350 minutes/day
- Over free tier: 230 minutes
- **Cost:** $0.69/day = **~$20.70/month**

---

## 💰 Cost Comparison Summary

### Cloud Build:
- ✅ **More free minutes** (3,600/month vs 2,000/month)
- ✅ **Cheaper paid rate** ($0.003/min vs $0.008/min)
- ✅ **Daily reset** (better for burst usage)
- ✅ **Perfect for Google Cloud**

### GitHub Actions:
- ✅ **Unlimited for public repos** (free)
- ⚠️ **Less free minutes** for private repos (2,000/month)
- ⚠️ **More expensive** paid rate
- ✅ **Better for GitHub-native projects**

---

## 🎯 For Your Use Case

**You're deploying to Google Cloud:**
- ✅ **Cloud Build is cheaper** ($0.003/min)
- ✅ **More free minutes** (3,600/month)
- ✅ **Better integration** with Google Cloud
- ✅ **Currently FREE** (well within limits)

**Estimated monthly cost:** **$0** (FREE)

---

## 📊 Cost Monitoring

### Check Your Usage:

**Cloud Build Console:**
- https://console.cloud.google.com/cloud-build/builds?project=dhananjaygroup-dms
- See build durations
- Calculate your usage

**Billing Console:**
- https://console.cloud.google.com/billing?project=dhananjaygroup-dms
- See actual charges
- Set up billing alerts

---

## 💡 Tips to Stay Free

1. **Optimize build times:**
   - Use Docker layer caching
   - Minimize build steps
   - Only build what changed

2. **Monitor usage:**
   - Check build durations
   - Avoid unnecessary builds
   - Use build triggers wisely

3. **Stay within free tier:**
   - 120 minutes/day = plenty for most projects
   - Your usage is well within limits

---

## ✅ Summary

**Cloud Build Pricing:**
- ✅ **120 build-minutes/day FREE**
- ✅ **$0.003/min after free tier**
- ✅ **Your usage: FREE** (well within limits)

**GitHub Actions Pricing:**
- ✅ **2,000 minutes/month FREE** (private repos)
- ✅ **$0.008/min after free tier**
- ⚠️ **More expensive** than Cloud Build

**For Your Project:**
- ✅ **Cloud Build is FREE** (current usage)
- ✅ **Cheaper** if you exceed free tier
- ✅ **Better** for Google Cloud deployments

---

**You're currently using Cloud Build for FREE, and it will likely stay free for your usage level!** 🎉
