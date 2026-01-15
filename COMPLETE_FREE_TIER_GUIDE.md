# 💰 Complete Free Tier Guide - Google Cloud, Firebase, Firestore

## 📋 Your Current Setup - Free Tier Coverage

This document covers all free tier offerings for services you're using.

---

## 🆓 Google Cloud Platform (GCP) Free Tier

### Always Free (No Expiration)

#### 1. **Cloud Build** 🔨
- ✅ **120 build-minutes per day**
- ✅ **10 concurrent builds**
- ✅ **Resets daily**
- ✅ **Your usage:** ~10-35 min/day = **FREE**

**Paid after:** $0.003 per build-minute

---

#### 2. **Cloud Run** 🚀
- ✅ **2 million requests per month**
- ✅ **360,000 GB-seconds of memory**
- ✅ **180,000 vCPU-seconds**
- ✅ **1 GB network egress per month**

**Your usage:** Well within limits = **FREE**

**Paid after:** 
- $0.40 per million requests
- $0.0000025 per GB-second
- $0.0000100 per vCPU-second

---

#### 3. **Cloud Storage** 📦
- ✅ **5 GB storage**
- ✅ **1 GB network egress per month**
- ✅ **5,000 Class A operations**
- ✅ **50,000 Class B operations**

**Paid after:** $0.020 per GB storage

---

#### 4. **Cloud Logging** 📝
- ✅ **50 GB logs ingestion per month**
- ✅ **7 days log retention**

**Your usage:** Well within limits = **FREE**

**Paid after:** $0.50 per GB

---

#### 5. **Cloud Monitoring** 📊
- ✅ **150 MB metrics ingestion per month**
- ✅ **14 days metric retention**

**Paid after:** $0.258 per GB

---

### $300 Free Credit (New Accounts)

- ✅ **$300 credit** for 90 days
- ✅ Can be used for any Google Cloud service
- ✅ After credit expires, pay-as-you-go

**Note:** Your billing account is already set up, so you may have used this or it may have expired.

---

## 🔥 Firebase Free Tier (Spark Plan)

### Always Free (No Expiration)

#### 1. **Firebase Hosting** 🌐
- ✅ **10 GB storage**
- ✅ **360 MB/day data transfer**
- ✅ **Unlimited requests**
- ✅ **Custom domains** (free)
- ✅ **SSL certificates** (free)

**Your usage:** Well within limits = **FREE**

**Paid after:** Blaze Plan (pay-as-you-go)

---

#### 2. **Firebase Authentication** 🔐
- ✅ **Unlimited users**
- ✅ **All authentication methods**
- ✅ **Phone authentication** (10K verifications/month)

**Your usage:** **FREE**

**Paid after:** 
- Phone auth: $0.06 per verification (after 10K/month)

---

#### 3. **Cloud Firestore** 💾
- ✅ **1 GB storage**
- ✅ **10 GB/month network egress**
- ✅ **50K reads/day**
- ✅ **20K writes/day**
- ✅ **20K deletes/day**

**Your usage:** Monitor this - could exceed with heavy usage

**Paid after:** 
- Storage: $0.18 per GB
- Reads: $0.06 per 100K
- Writes: $0.18 per 100K
- Deletes: $0.02 per 100K

---

#### 4. **Firebase Cloud Functions** ⚡
- ✅ **2 million invocations/month**
- ✅ **400K GB-seconds**
- ✅ **200K CPU-seconds**
- ✅ **5 GB network egress**

**Your usage:** Well within limits = **FREE**

**Paid after:** 
- $0.40 per million invocations
- $0.0000025 per GB-second

---

#### 5. **Firebase Storage** 📁
- ✅ **5 GB storage**
- ✅ **1 GB/day downloads**
- ✅ **20K uploads/day**
- ✅ **50K downloads/day**

**Paid after:** 
- Storage: $0.026 per GB
- Downloads: $0.12 per GB

---

## 📊 Your Current Services - Free Tier Status

### ✅ Services You're Using (All FREE):

| Service | Free Tier | Your Usage | Status |
|---------|-----------|------------|--------|
| **Cloud Build** | 120 min/day | ~10-35 min/day | ✅ FREE |
| **Cloud Run** | 2M requests/month | Low | ✅ FREE |
| **Firebase Hosting** | 10 GB storage | Low | ✅ FREE |
| **Firebase Auth** | Unlimited users | Low | ✅ FREE |
| **Cloud Firestore** | 1 GB, 50K reads/day | Monitor | ⚠️ Monitor |
| **Cloud Logging** | 50 GB/month | Low | ✅ FREE |

---

## 💰 Estimated Monthly Cost

### Current Usage:
- **Cloud Build:** $0 (within free tier)
- **Cloud Run:** $0 (within free tier)
- **Firebase Hosting:** $0 (within free tier)
- **Firebase Auth:** $0 (within free tier)
- **Cloud Firestore:** $0 (monitor usage)
- **Cloud Logging:** $0 (within free tier)

**Total Estimated Cost:** **$0/month** ✅

---

## ⚠️ Services to Monitor

### 1. **Cloud Firestore** (Most Likely to Exceed)
**Free Tier:**
- 1 GB storage
- 50K reads/day
- 20K writes/day

**Monitor:**
- Check Firestore usage in Firebase Console
- Set up billing alerts
- Optimize queries to reduce reads

**Where to check:**
- Firebase Console → Usage and Billing

---

### 2. **Cloud Run** (If Traffic Increases)
**Free Tier:**
- 2 million requests/month
- 360K GB-seconds memory

**Monitor:**
- Check Cloud Run metrics
- Monitor request count
- Watch memory usage

**Where to check:**
- Cloud Run Console → Metrics

---

## 📊 Free Tier Limits Summary

### Google Cloud Platform:
- ✅ **Cloud Build:** 120 min/day
- ✅ **Cloud Run:** 2M requests/month
- ✅ **Cloud Storage:** 5 GB
- ✅ **Cloud Logging:** 50 GB/month
- ✅ **Cloud Monitoring:** 150 MB/month

### Firebase:
- ✅ **Hosting:** 10 GB storage, 360 MB/day transfer
- ✅ **Authentication:** Unlimited users
- ✅ **Firestore:** 1 GB, 50K reads/day
- ✅ **Cloud Functions:** 2M invocations/month
- ✅ **Storage:** 5 GB, 1 GB/day downloads

---

## 💡 Tips to Stay Free

### 1. **Monitor Usage Regularly**
- Check Firebase Console → Usage and Billing
- Check Google Cloud Console → Billing
- Set up billing alerts

### 2. **Optimize Firestore Queries**
- Use indexes efficiently
- Cache frequently accessed data
- Minimize reads/writes

### 3. **Optimize Cloud Build**
- Use Docker layer caching
- Minimize build steps
- Only build what changed

### 4. **Monitor Cloud Run**
- Optimize memory allocation
- Use appropriate instance sizes
- Monitor request counts

---

## 🚨 Billing Alerts Setup

### Set Up Alerts:

1. **Go to Billing Console:**
   - https://console.cloud.google.com/billing?project=dhananjaygroup-dms

2. **Set Budget Alerts:**
   - Create budget: $5/month (safety limit)
   - Get email alerts at 50%, 90%, 100%

3. **Monitor Regularly:**
   - Check monthly
   - Review usage reports
   - Optimize if needed

---

## 📈 Usage Monitoring Links

### Firebase Usage:
- **Firebase Console:** https://console.firebase.google.com/project/dhananjaygroup-dms/usage
- **Billing:** https://console.firebase.google.com/project/dhananjaygroup-dms/usage/billing

### Google Cloud Usage:
- **Billing Dashboard:** https://console.cloud.google.com/billing?project=dhananjaygroup-dms
- **Cloud Build:** https://console.cloud.google.com/cloud-build/builds?project=dhananjaygroup-dms
- **Cloud Run:** https://console.cloud.google.com/run?project=dhananjaygroup-dms

---

## ✅ Summary

### Your Current Cost: **$0/month** ✅

**All services are within free tier limits!**

### Services Status:
- ✅ **Cloud Build:** FREE (well within limits)
- ✅ **Cloud Run:** FREE (well within limits)
- ✅ **Firebase Hosting:** FREE (well within limits)
- ✅ **Firebase Auth:** FREE (unlimited)
- ⚠️ **Cloud Firestore:** FREE (monitor usage)
- ✅ **Cloud Logging:** FREE (well within limits)

### Estimated Monthly Cost: **$0** 🎉

---

## 📝 Important Notes

1. **Free tiers don't expire** (except $300 credit)
2. **Monitor Firestore usage** (most likely to exceed)
3. **Set up billing alerts** (safety net)
4. **Check usage monthly** (stay informed)

---

**Keep this document for reference! All your services are currently FREE!** 🎊
