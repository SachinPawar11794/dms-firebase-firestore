# PostgreSQL Cost-Optimized Setup Guide for Internal Web App

## 🎯 Goal: Minimum Cost Configuration

This guide will help you set up Google Cloud PostgreSQL with the **lowest possible cost** for an internal web application.

---

## 💰 Cost Breakdown & Recommendations

### Option 1: Shared-Core (Cheapest) ⭐ RECOMMENDED

**Best for:**
- Internal applications
- < 100 concurrent users
- Development/staging environments
- Low to moderate traffic

**Specifications:**
- **Machine Type**: `db-f1-micro` (Shared-core)
- **vCPUs**: 0.5 shared vCPU
- **RAM**: 0.6 GB
- **Storage**: 10 GB (minimum)
- **Estimated Cost**: **~$7-10/month**

**Limitations:**
- Shared CPU (may be slower during peak times)
- Limited RAM (good for small to medium databases)
- Suitable for internal apps with predictable load

---

### Option 2: Standard (Better Performance)

**Best for:**
- Production internal apps
- 100-500 concurrent users
- Need consistent performance

**Specifications:**
- **Machine Type**: `db-g1-small` (1 shared vCPU)
- **vCPUs**: 1 shared vCPU
- **RAM**: 1.7 GB
- **Storage**: 10 GB
- **Estimated Cost**: **~$25-30/month**

---

## 📋 Step-by-Step Setup (Cost-Optimized)

### Step 1: Navigate to Cloud SQL

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Make sure you're in the correct project: `dhananjaygroup-dms`
3. Navigate to **SQL** in the left menu (under "Databases")
4. Click **"Create Instance"**

---

### Step 2: Choose Database Engine & Edition

1. Click **"Choose PostgreSQL"**
2. Select **PostgreSQL 15** (or 14 - both are fine)
3. **IMPORTANT: Choose Edition**
   - Select **"Enterprise"** ⭐ (NOT Enterprise Plus)
   - **Why Enterprise?**
     - ✅ Lower cost (what you want!)
     - ✅ 99.95% SLA (more than enough for internal apps)
     - ✅ Supports all features you need
     - ✅ Supports shared-core machines (db-f1-micro)
   - **Enterprise Plus** is more expensive and has features you don't need:
     - ❌ 99.99% SLA (overkill for internal apps)
     - ❌ Higher performance machines (more expensive)
     - ❌ Data cache (not needed for small apps)
     - ❌ Longer backup retention (adds cost)

---

### Step 3: Instance Configuration (MINIMUM COST)

#### Instance ID
```
dms-postgres-internal
```

#### Password
- Click **"Generate"** to create a strong password
- **SAVE THIS PASSWORD** - you'll need it later!
- Or create your own strong password (min 8 characters)

#### Region & Zonal Availability
- **Region**: Choose closest to your users (e.g., `asia-south1` for India)
- **Zonal Availability**: Select **"Single zone"** (cheaper than multi-zone)
  - ⚠️ Note: Single zone = no automatic failover, but saves ~30% cost
  - ✅ Fine for internal apps

---

### Step 4: Machine Configuration (CRITICAL - COST SAVINGS)

#### Machine Type
1. Click **"Configure machine"**
2. Select **"Shared-core"** tab (cheapest option)
3. Choose **"db-f1-micro"**
   - **vCPU**: 0.5 shared
   - **RAM**: 0.6 GB
   - **Cost**: ~$7/month

#### Storage
1. **Storage Type**: **HDD** (cheaper than SSD) - **IF AVAILABLE**
   - ⚠️ **IMPORTANT**: HDD option only appears if:
     - Edition is **Enterprise** (NOT Enterprise Plus)
     - Machine series is **Shared-core** or **Dedicated-core**
     - Region supports HDD
   - If HDD doesn't appear, use **SSD** (still acceptable cost)
   - Cost: 
     - HDD: ~$0.09/GB/month = $9/month for 100GB
     - SSD: ~$0.17/GB/month = $17/month for 100GB
   - **If HDD available**: Use it to save ~$8/month
   - **If HDD NOT available**: Use SSD (~$32/month total is still reasonable)

2. **Storage Capacity**: **100 GB** (minimum required)
   - ⚠️ **Note**: Google Cloud SQL requires minimum 100 GB storage
   - You cannot set less than 100 GB
   - This is a Google Cloud requirement

#### Enable Storage Autoscaling (Optional)
- ✅ **Enable**: Yes (recommended)
- **Maximum storage**: 150 GB (set a limit to control costs)
- This allows automatic growth if needed, but caps at 150GB

---

### Step 5: Backups & Maintenance (COST OPTIMIZATION)

#### Automated Backups
1. **Enable automated backups**: ✅ **YES** (recommended for safety)
   - ⚠️ **IMPORTANT**: Currently shows "Manual" - change to "Automated"
   - Click on "Backup" section and enable automated backups
2. **Backup window**: Choose off-peak hours (e.g., 2 AM - 4 AM)
3. **Backup retention**: **7 days** (minimum, saves cost vs 30 days)
   - Cost: ~$0.08/GB/month for backups
   - 100GB = ~$8.00/month

#### Point-in-time Recovery
- ❌ **Disable** (saves cost)
- Only enable if you need point-in-time recovery
- Cost: Additional ~$0.08/GB/month

#### Maintenance Window
- Choose a time when app usage is low
- Example: Sunday 2 AM - 4 AM

---

### Step 6: Connections & Networking

#### Public IP
1. **Enable public IP**: ✅ **YES** (needed for Cloud Run connection)
2. **Authorized networks**: 
   - Click **"Add network"**
   - Add your office IP (if known) for extra security
   - Or leave empty (will use Cloud Run's IP)

#### Private IP (Optional)
- ❌ **Skip** for now (requires VPC setup, adds complexity)
- Can add later if needed

---

### Step 7: Database Flags (Performance Tuning)

Click **"Add database flag"** and add:

1. **max_connections**: `100` (default is fine for internal app)
2. **shared_buffers**: `153600` (25% of 0.6GB RAM = ~150MB)
3. **work_mem**: `4096` (4MB - adjust based on queries)

**Note**: These are optional - defaults work fine.

---

### Step 8: Labels (Optional)

Add labels for organization:
- **environment**: `internal`
- **project**: `dms`
- **cost-center**: `it`

---

### Step 9: Review & Create

1. Review all settings
2. **Estimated cost**: Should show ~$7-10/month
3. Click **"Create Instance"**
4. Wait 5-10 minutes for instance to be created

---

## 💵 Total Estimated Monthly Cost

### Minimum Configuration (db-f1-micro) ⭐ RECOMMENDED
```
Instance (db-f1-micro):     $7.00/month
Storage (100GB HDD):         $9.00/month  ⚠️ (minimum 100GB required)
Backups (100GB, 7 days):     $8.00/month
----------------------------------------
TOTAL:                      ~$24.00/month
```

### If Using SSD (More Expensive)
```
Instance (db-f1-micro):     $7.00/month
Storage (100GB SSD):        $17.00/month  ⚠️ (50% more expensive!)
Backups (100GB, 7 days):     $8.00/month
----------------------------------------
TOTAL:                      ~$32.00/month
```

**💡 Cost Savings Tip**: Use **HDD** instead of SSD to save ~$8/month on storage!

---

## 🔧 Post-Creation Setup

### Step 1: Create Database

1. Once instance is created, click on it
2. Go to **"Databases"** tab
3. Click **"Create database"**
4. **Database name**: `dms_db`
5. Click **"Create"**

### Step 2: Create User

1. Go to **"Users"** tab
2. Click **"Add user account"**
3. **Username**: `dms_user`
4. **Password**: Generate or create strong password
5. **Host name**: `%` (allows connections from anywhere)
6. Click **"Add"**

### Step 3: Get Connection Details

1. Go to **"Overview"** tab
2. Note the **"Public IP address"** (e.g., `34.123.45.67`)
3. Note the **"Connection name"** (e.g., `dhananjaygroup-dms:asia-south1:dms-postgres-internal`)

---

## 🔐 Security Best Practices (Cost-Free)

### 1. Restrict IP Access (Free)
- Add your office IPs to authorized networks
- Reduces attack surface

### 2. Use Strong Passwords
- Generate passwords in Cloud Console
- Store securely (password manager)

### 3. SSL/TLS (Free)
- Always use SSL connections
- Set `DB_SSL=true` in your `.env`

### 4. Regular Updates
- Enable automatic minor version updates
- Free and improves security

---

## 📊 Monitoring & Cost Control

### Set Up Budget Alerts

1. Go to **Billing** → **Budgets & alerts**
2. Create budget for SQL services
3. Set alert at $15/month (above expected cost)
4. Get notified if costs spike

### Monitor Usage

1. Go to **SQL** → Your instance → **Monitoring**
2. Watch:
   - **CPU utilization** (should be < 50% for shared-core)
   - **Storage usage** (alert if approaching limit)
   - **Connection count** (should be < 50 for internal app)

### Cost Optimization Tips

1. **Right-size storage**: Start with 10GB, increase only if needed
2. **Backup retention**: 7 days is enough for internal apps
3. **Single zone**: Fine for internal apps (saves ~30%)
4. **HDD storage**: Sufficient for internal apps
5. **Monitor connections**: Close unused connections
6. **Review monthly**: Check if you can downgrade after 1 month

---

## 🔄 Scaling Strategy (If Needed Later)

### When to Upgrade

Upgrade from `db-f1-micro` to `db-g1-small` if:
- CPU consistently > 80%
- Slow query performance
- Connection timeouts
- User complaints about speed

### How to Upgrade

1. Go to instance → **"Edit"**
2. Change machine type to `db-g1-small`
3. Takes ~5 minutes (brief downtime)
4. Cost increases to ~$25/month

---

## 🚀 Connection Setup

### Update Environment Variables

Add to your `.env` file:

```env
# PostgreSQL Configuration (Cost-Optimized)
DB_HOST=YOUR_PUBLIC_IP_HERE
DB_PORT=5432
DB_NAME=dms_db
DB_USER=dms_user
DB_PASSWORD=YOUR_PASSWORD_HERE
DB_SSL=true
DB_POOL_MAX=20
DB_POOL_IDLE_TIMEOUT=30000
DB_POOL_CONNECTION_TIMEOUT=2000
```

### Test Connection

```bash
# Test from your local machine
psql -h YOUR_PUBLIC_IP -U dms_user -d dms_db

# Or use Cloud SQL Proxy (recommended for local dev)
```

---

## 📝 Quick Checklist

- [ ] Create PostgreSQL instance with `db-f1-micro`
- [ ] Use single-zone (cheaper)
- [ ] Set storage to 10GB HDD
- [ ] Enable backups (7 days retention)
- [ ] Create database `dms_db`
- [ ] Create user `dms_user`
- [ ] Note public IP address
- [ ] Update `.env` with connection details
- [ ] Run `database/schema.sql` to create tables
- [ ] Test connection from application
- [ ] Set up budget alerts

---

## 🆘 Troubleshooting

### Connection Issues

**Error: "Connection refused"**
- Check firewall rules in Cloud SQL
- Verify public IP is enabled
- Check authorized networks

**Error: "Too many connections"**
- Reduce `DB_POOL_MAX` in `.env`
- Check for connection leaks in code
- Consider upgrading instance

**Slow Performance**
- Check CPU usage in monitoring
- Review slow queries
- Consider upgrading to `db-g1-small`

### Cost Issues

**Unexpected charges**
- Check storage usage (may have grown)
- Review backup retention settings
- Check for multiple instances
- Review billing dashboard

---

## 💡 Pro Tips

1. **Start Small**: Begin with `db-f1-micro`, upgrade only if needed
2. **Monitor First Month**: Watch usage patterns before optimizing
3. **Use Cloud SQL Proxy**: For local development (more secure)
4. **Schedule Maintenance**: During off-hours
5. **Regular Backups**: 7 days is enough, but test restore process
6. **Document Changes**: Keep track of configuration changes

---

## 📚 Next Steps

1. **Create the instance** (follow steps above)
2. **Run database schema**: `psql -f database/schema.sql`
3. **Update `.env`** with connection details
4. **Test connection** from your application
5. **Monitor for 1 week** to ensure stability
6. **Optimize** based on actual usage patterns

---

## 🎯 Summary

**Recommended Configuration:**
- **Instance**: `db-f1-micro` (shared-core)
- **Storage**: 10GB HDD
- **Backups**: 7 days retention
- **Zone**: Single zone
- **Estimated Cost**: **~$9.50/month**

This configuration is perfect for an internal web application with moderate usage. You can always upgrade later if needed!

---

## 📞 Support

If you encounter issues:
1. Check Google Cloud SQL documentation
2. Review instance logs in Cloud Console
3. Check application logs for connection errors
4. Verify environment variables are correct
