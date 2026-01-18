# PostgreSQL Migration Guide

## Overview

This guide explains the migration from Firestore to Google Cloud PostgreSQL for the DMS application. The migration maintains Firebase Authentication and Firebase Storage, only replacing Firestore with PostgreSQL for data storage.

## Why PostgreSQL?

- **Cost-effective**: PostgreSQL has predictable pricing, especially for web applications with structured data
- **Better for relational data**: Your DMS has relationships between users, tasks, employees, etc.
- **ACID compliance**: Better data consistency guarantees
- **SQL queries**: More powerful querying capabilities
- **Better for web apps**: Unlike Firestore which is optimized for real-time apps (chat, gaming)

## Architecture Changes

### Before (Firestore)
```
Frontend → Backend API → Firestore (NoSQL)
                      → Firebase Auth
                      → Firebase Storage
```

### After (PostgreSQL)
```
Frontend → Backend API → PostgreSQL (SQL)
                      → Firebase Auth (still used)
                      → Firebase Storage (still used)
```

## Setup Instructions

### 1. Create Google Cloud PostgreSQL Instance

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **SQL** → **Create Instance**
3. Choose **PostgreSQL**
4. Configure:
   - **Instance ID**: `dms-postgres-instance`
   - **Database version**: PostgreSQL 14 or 15
   - **Region**: Same as your Cloud Run service (e.g., `asia-south1`)
   - **Machine type**: Start with `db-f1-micro` (free tier) or `db-g1-small`
   - **Storage**: 10GB (minimum)
   - **Backup**: Enable automated backups
5. Click **Create**

### 2. Create Database and User

1. Once instance is created, go to **Databases** tab
2. Click **Create database**
   - **Database name**: `dms_db`
3. Go to **Users** tab
4. Click **Add user account**
   - **Username**: `dms_user`
   - **Password**: Generate a strong password (save it!)
   - **Host name**: `%` (allows connections from anywhere)

### 3. Configure Connection

1. Go to **Connections** tab
2. Note the **Public IP address**
3. For production, consider using **Private IP** (requires VPC setup)

### 4. Update Environment Variables

Add these to your `.env` file:

```env
# PostgreSQL Configuration
DB_HOST=YOUR_INSTANCE_PUBLIC_IP
DB_PORT=5432
DB_NAME=dms_db
DB_USER=dms_user
DB_PASSWORD=YOUR_PASSWORD
DB_SSL=true
DB_POOL_MAX=20
DB_POOL_IDLE_TIMEOUT=30000
DB_POOL_CONNECTION_TIMEOUT=2000
```

For Cloud Run, add these as environment variables in your Cloud Run service configuration.

### 5. Run Database Schema

1. Connect to your PostgreSQL instance:
   ```bash
   # Using Cloud SQL Proxy (recommended for local)
   cloud-sql-proxy INSTANCE_CONNECTION_NAME
   
   # Or directly (if IP is whitelisted)
   psql -h YOUR_INSTANCE_IP -U dms_user -d dms_db
   ```

2. Run the schema:
   ```bash
   psql -h YOUR_INSTANCE_IP -U dms_user -d dms_db -f database/schema.sql
   ```

   Or copy and paste the contents of `database/schema.sql` into your PostgreSQL client.

### 6. Install Dependencies

The PostgreSQL client library is already installed:
```bash
npm install
```

### 7. Test Connection

The application will automatically test the connection on startup. You can also test manually:

```typescript
import { testConnection } from './src/config/database.config';
await testConnection();
```

## Migration Steps

### Phase 1: Setup (Completed ✅)
- [x] PostgreSQL configuration
- [x] Database schema creation
- [x] Repository pattern implementation
- [x] User service migration

### Phase 2: Data Migration (Next Steps)

1. **Export existing Firestore data**:
   ```bash
   # Use Firebase CLI or write a script
   firebase firestore:export gs://your-bucket/firestore-export
   ```

2. **Transform and import to PostgreSQL**:
   - Create a migration script to read Firestore export
   - Transform data to match PostgreSQL schema
   - Import into PostgreSQL

3. **Verify data integrity**:
   - Compare record counts
   - Spot-check data accuracy
   - Test application functionality

### Phase 3: Service Migration (In Progress)

- [x] User service
- [ ] Task services (task, taskMaster, taskInstance)
- [ ] HR services (employee, attendance)
- [ ] PMS services (production)
- [ ] Maintenance services
- [ ] Shared services (plant, appSettings)

### Phase 4: Testing

1. **Unit tests**: Test all repository methods
2. **Integration tests**: Test API endpoints
3. **End-to-end tests**: Test complete user flows
4. **Performance tests**: Compare query performance

### Phase 5: Deployment

1. **Staging deployment**: Deploy to staging environment
2. **Data migration**: Run migration script
3. **Smoke tests**: Verify critical paths
4. **Production deployment**: Deploy to production
5. **Monitor**: Watch for errors and performance issues

## Database Schema

The PostgreSQL schema includes:

- **users**: User accounts (linked to Firebase Auth via `firebase_uid`)
- **plants**: Plant/location information
- **employees**: Employee records
- **attendance**: Attendance tracking
- **tasks**: One-off tasks
- **task_masters**: Recurring task templates
- **task_instances**: Generated task instances
- **productions**: Production records
- **production_orders**: Production orders
- **maintenance_requests**: Maintenance requests
- **equipment**: Equipment records
- **app_settings**: Application settings

See `database/schema.sql` for complete schema definition.

## Key Differences from Firestore

### 1. IDs
- **Firestore**: Document IDs (strings)
- **PostgreSQL**: UUIDs (auto-generated)

### 2. Timestamps
- **Firestore**: `Timestamp` objects
- **PostgreSQL**: `TIMESTAMP WITH TIME ZONE`

### 3. Queries
- **Firestore**: `.where()`, `.orderBy()`, `.limit()`
- **PostgreSQL**: SQL `WHERE`, `ORDER BY`, `LIMIT`

### 4. Relationships
- **Firestore**: References (manual)
- **PostgreSQL**: Foreign keys (enforced)

### 5. Transactions
- **Firestore**: Limited transaction support
- **PostgreSQL**: Full ACID transactions

## Backward Compatibility

The code maintains backward compatibility during migration:

1. **Firebase UID support**: Users can be found by Firebase UID or PostgreSQL ID
2. **Gradual migration**: Services can be migrated one at a time
3. **Dual support**: Both Firestore and PostgreSQL can coexist during transition

## Troubleshooting

### Connection Issues

**Error: "Connection refused"**
- Check firewall rules in Google Cloud Console
- Ensure your IP is whitelisted (or use Cloud SQL Proxy)
- Verify instance is running

**Error: "Authentication failed"**
- Verify username and password
- Check user permissions in PostgreSQL

**Error: "Database does not exist"**
- Create the database: `CREATE DATABASE dms_db;`
- Verify database name in connection string

### Performance Issues

**Slow queries**
- Check indexes are created (see `database/schema.sql`)
- Use `EXPLAIN ANALYZE` to debug queries
- Consider connection pooling settings

**Connection pool exhaustion**
- Increase `DB_POOL_MAX` in environment variables
- Check for connection leaks (unclosed connections)

## Cost Comparison

### Firestore Pricing (Example)
- **Reads**: $0.06 per 100,000 documents
- **Writes**: $0.18 per 100,000 documents
- **Storage**: $0.18 per GB/month
- **Estimated monthly**: $50-200+ (grows with usage)

### Cloud SQL PostgreSQL Pricing (Example)
- **Instance**: $7-25/month (db-f1-micro to db-g1-small)
- **Storage**: $0.17 per GB/month
- **Backups**: $0.08 per GB/month
- **Estimated monthly**: $10-50 (more predictable)

**Note**: Actual costs depend on usage. PostgreSQL is generally more cost-effective for structured data with predictable query patterns.

## Next Steps

1. **Set up PostgreSQL instance** (follow steps above)
2. **Run database schema** (`database/schema.sql`)
3. **Update environment variables**
4. **Test connection**
5. **Migrate remaining services** (see TODO list)
6. **Run data migration script** (to be created)
7. **Deploy and test**

## Support

For issues or questions:
1. Check this guide
2. Review `database/schema.sql` for schema details
3. Check repository classes in `src/repositories/`
4. Review service classes for usage examples

## Rollback Plan

If you need to rollback to Firestore:

1. Keep Firestore code in place (it's marked as deprecated but still works)
2. Update services to use `db` from `firebase.config.ts` instead of repositories
3. Remove PostgreSQL environment variables
4. Redeploy

The codebase is designed to allow gradual migration and easy rollback if needed.
