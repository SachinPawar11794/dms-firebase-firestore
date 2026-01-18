# Quick PostgreSQL Setup (Minimum Cost) - Cheat Sheet

## 🎯 Target: ~$10/month

### Step 1: Create Instance
1. Google Cloud Console → **SQL** → **Create Instance**
2. Choose **PostgreSQL 15**
3. **Edition: Select "Enterprise"** ⭐ (NOT Enterprise Plus - saves cost!)

### Step 2: Configuration
```
Instance ID: dms-postgres-internal
Region: asia-south1 (or closest to you)
Zone: Single zone (cheaper)
```

### Step 3: Machine Type (CRITICAL FOR COST)
```
Tab: Shared-core
Type: db-f1-micro
  - 0.5 shared vCPU
  - 0.6 GB RAM
  - Cost: ~$7/month
```

### Step 4: Storage ⚠️ IMPORTANT
```
Type: HDD (if available) OR SSD (if HDD not shown)
  - HDD only appears with Enterprise edition + Shared-core
  - If only SSD shows, that's okay (~$32/month total)
Size: 100 GB (minimum required - cannot set less)
Autoscaling: Enable (max 150GB)
```
**Note**: 
- Google Cloud SQL requires minimum 100 GB storage
- HDD may not be available in all regions/editions
- If HDD doesn't appear, use SSD (still reasonable cost)

### Step 5: Backups
```
Enable: Yes
Retention: 7 days (minimum)
Point-in-time: Disable (saves cost)
```

### Step 6: Networking
```
Public IP: Enable
Authorized networks: (optional - add your office IP)
```

### Step 7: Create Database & User
```
Database: dms_db
User: dms_user
Password: (generate strong password)
```

## 💰 Cost Breakdown
```
Instance:         $7.00/month
Storage (100GB HDD): $9.00/month  ⚠️ (minimum required)
Backups (7 days):    $8.00/month
─────────────────────────────────
TOTAL:            ~$24.00/month
```

**⚠️ Important**: 
- Minimum storage is **100 GB** (not 10 GB)
- Use **HDD** instead of SSD to save ~$8/month
- Enable **Automated backups** (currently shows "Manual")

## 🔧 After Creation

### Get Connection Info
- Public IP: (from Overview tab)
- Connection name: (from Overview tab)

### Update .env
```env
DB_HOST=YOUR_PUBLIC_IP
DB_PORT=5432
DB_NAME=dms_db
DB_USER=dms_user
DB_PASSWORD=YOUR_PASSWORD
DB_SSL=true
```

### Run Schema
```bash
psql -h YOUR_PUBLIC_IP -U dms_user -d dms_db -f database/schema.sql
```

## ✅ Done!
Your PostgreSQL instance is ready for ~$10/month!
