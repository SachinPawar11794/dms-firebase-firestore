# Firestore Indexes Management Guide

## Overview

Firestore requires **composite indexes** for queries that combine multiple `where` clauses with `orderBy`. This guide follows Firebase's **recommended approach** for managing indexes.

## ⭐ Recommended Approach (Best Practice)

**Firebase recommends running queries in your app code to automatically get index creation links.** This is the preferred method because:

1. ✅ Firebase automatically generates the exact index configuration needed
2. ✅ Provides a direct link to create the index in Firebase Console
3. ✅ Ensures indexes match your exact query requirements
4. ✅ Reduces manual configuration errors

### How It Works

1. **Run your query** in the application
2. **Firestore will return an error** if an index is required
3. **The error includes a direct link** to create the index in Firebase Console
4. **Click the link** → Firebase Console opens with the index pre-configured
5. **Click "Create Index"** → Index is created automatically
6. **Wait 2-5 minutes** for the index to build
7. **Refresh your app** → Query will now work

### Example Error Flow

When a query requires an index, you'll see:

```
Error: The query requires an index. 
You can create it here: https://console.firebase.google.com/...
```

The application will:
- Automatically detect index errors
- Open Firebase Console in a new tab
- Show instructions to the user
- Allow one-click index creation

## Current Indexes

### Required Indexes

The following composite indexes are required for the application:

#### 1. Plants Collection
```json
{
  "collectionGroup": "plants",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "isActive", "order": "ASCENDING" },
    { "fieldPath": "name", "order": "ASCENDING" }
  ]
}
```
**Used for:** Filtering active plants and sorting by name

#### 2. Task Instances Collection
**Index 1: Assigned Tasks Query**
- Collection: `taskInstances`
- Fields:
  - `assignedTo` (ASCENDING)
  - `scheduledDate` (DESCENDING)
- **Query:** Get tasks assigned to a user, ordered by scheduled date

**Index 2: Task Instances with Status Filter**
- Collection: `taskInstances`
- Fields:
  - `assignedTo` (ASCENDING)
  - `status` (ASCENDING)
  - `scheduledDate` (DESCENDING)
- **Query:** Get tasks by user and status, ordered by scheduled date

**Index 3: Task Instances with Plant Filter**
- Collection: `taskInstances`
- Fields:
  - `assignedTo` (ASCENDING)
  - `plantId` (ASCENDING)
  - `scheduledDate` (DESCENDING)
- **Query:** Get tasks by user and plant, ordered by scheduled date

#### 3. Task Masters Collection
**Index 1: Task Masters by Plant**
- Collection: `taskMasters`
- Fields:
  - `plantId` (ASCENDING)
  - `createdAt` (DESCENDING)
- **Query:** Get task masters filtered by plant

**Index 2: Task Masters by Employee**
- Collection: `taskMasters`
- Fields:
  - `assignedTo` (ASCENDING)
  - `createdAt` (DESCENDING)
- **Query:** Get task masters assigned to an employee

**Index 3: Task Masters with Status**
- Collection: `taskMasters`
- Fields:
  - `isActive` (ASCENDING)
  - `createdAt` (DESCENDING)
- **Query:** Get active/inactive task masters

## Creating Indexes

### Method 1: Automatic (Recommended) ⭐

1. **Run your application** and perform the action that triggers the query
2. **If an index is required**, you'll see an error message
3. **Click the link** in the error message (or it opens automatically)
4. **Firebase Console opens** with the index pre-configured
5. **Click "Create Index"**
6. **Wait 2-5 minutes** for the index to build
7. **Refresh your application**

### Method 2: Manual via Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** → **Indexes** tab
4. Click **"Add index"** → **"Composite"**
5. Fill in:
   - **Collection ID:** e.g., `taskInstances`
   - **Fields to index:** Add fields in order
     - Field path: `assignedTo`, Order: `Ascending`
     - Field path: `scheduledDate`, Order: `Descending`
   - **Query scopes:** `Collection`
6. Click **"Create"**
7. Wait for index to build (2-5 minutes)

### Method 3: Via firestore.indexes.json

1. Edit `firestore.indexes.json` in the project root
2. Add the index definition:
```json
{
  "indexes": [
    {
      "collectionGroup": "taskInstances",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "assignedTo",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "scheduledDate",
          "order": "DESCENDING"
        }
      ]
    }
  ]
}
```
3. Deploy indexes:
```bash
firebase deploy --only firestore:indexes
```

## Index Status

### Checking Index Status

1. Go to Firebase Console → Firestore Database → **Indexes** tab
2. Find your index in the list
3. Check the **Status** column:
   - ✅ **Enabled** - Index is ready to use
   - ⏳ **Building** - Index is being created (wait 2-5 minutes)
   - ❌ **Error** - Index creation failed (check error message)

### Index Building Time

- **Small collections** (< 1,000 documents): 1-2 minutes
- **Medium collections** (1,000-10,000 documents): 2-5 minutes
- **Large collections** (> 10,000 documents): 5-15 minutes

## Query Patterns That Require Indexes

### ✅ Single Field Queries (No Index Needed)
```typescript
// These work without indexes
db.collection('tasks').where('status', '==', 'pending').get();
db.collection('tasks').orderBy('createdAt', 'desc').get();
```

### ❌ Composite Queries (Index Required)
```typescript
// These require composite indexes
db.collection('tasks')
  .where('assignedTo', '==', userId)
  .orderBy('scheduledDate', 'desc')
  .get();

db.collection('tasks')
  .where('assignedTo', '==', userId)
  .where('status', '==', 'pending')
  .orderBy('scheduledDate', 'desc')
  .get();
```

## Application Behavior

### Automatic Index Detection

The application automatically:
1. **Detects** when a Firestore index is required
2. **Extracts** the index creation URL from the error
3. **Opens** Firebase Console in a new tab
4. **Displays** user-friendly instructions
5. **Allows** one-click index creation

### Error Handling

**Backend (`src/middleware/error.middleware.ts`):**
- Catches Firestore index errors
- Extracts index URL from error message
- Returns structured error response with index URL

**Frontend (`frontend/src/services/api.ts`):**
- Intercepts index error responses
- Opens Firebase Console automatically
- Shows alert with instructions

## Updating firestore.indexes.json

When you create indexes via the recommended method (automatic links), you should also update `firestore.indexes.json` to:

1. **Keep indexes in version control**
2. **Deploy indexes to other environments** (staging, production)
3. **Document required indexes** for the team

### Example: Adding Task Instances Index

```json
{
  "indexes": [
    {
      "collectionGroup": "plants",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "isActive", "order": "ASCENDING" },
        { "fieldPath": "name", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "taskInstances",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "assignedTo", "order": "ASCENDING" },
        { "fieldPath": "scheduledDate", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

Then deploy:
```bash
firebase deploy --only firestore:indexes
```

## Best Practices

### ✅ DO

1. **Use the recommended approach** - Run queries to get automatic index links
2. **Update firestore.indexes.json** after creating indexes manually
3. **Deploy indexes to all environments** (dev, staging, production)
4. **Document new indexes** in this file
5. **Wait for indexes to build** before testing queries
6. **Monitor index status** in Firebase Console

### ❌ DON'T

1. **Don't create indexes manually** without updating `firestore.indexes.json`
2. **Don't skip index creation** - queries will fail
3. **Don't delete indexes** that are in use
4. **Don't create unnecessary indexes** - they consume storage
5. **Don't ignore index errors** - they indicate missing indexes

## Troubleshooting

### Issue: "Index not found" error persists

**Solution:**
1. Check index status in Firebase Console
2. Wait for index to finish building (can take 5-10 minutes)
3. Verify index fields match your query exactly
4. Check that collection name is correct

### Issue: Index is building but taking too long

**Solution:**
1. Large collections take longer to index
2. Check Firebase Console for progress
3. Index building cannot be cancelled once started
4. Wait patiently - it will complete

### Issue: Multiple indexes needed for same collection

**Solution:**
1. Each unique query pattern needs its own index
2. Create all required indexes
3. Update `firestore.indexes.json` with all indexes
4. Deploy all at once

### Issue: Index creation fails

**Solution:**
1. Check Firebase Console for error details
2. Verify field names are correct
3. Ensure collection exists
4. Check Firebase project permissions
5. Try creating index manually via Console

## Monitoring Index Usage

### View Index Usage

1. Go to Firebase Console → Firestore Database → **Indexes** tab
2. Click on an index to view details
3. Check **Usage** section to see query patterns

### Index Costs

- **Index storage:** Counts toward Firestore storage quota
- **Index writes:** Counts toward Firestore write quota
- **No additional read costs** for using indexes

## Quick Reference

### Commands

```bash
# Deploy all indexes from firestore.indexes.json
firebase deploy --only firestore:indexes

# View current indexes
# (Use Firebase Console → Firestore → Indexes tab)
```

### Index Creation Checklist

- [ ] Run query in application
- [ ] Get index creation link from error
- [ ] Click link to open Firebase Console
- [ ] Click "Create Index"
- [ ] Wait for index to build (2-5 minutes)
- [ ] Update `firestore.indexes.json`
- [ ] Commit changes to version control
- [ ] Deploy to other environments if needed
- [ ] Test query again
- [ ] Document index in this file

## Related Files

- `firestore.indexes.json` - Index definitions for deployment
- `src/middleware/error.middleware.ts` - Error handling for index errors
- `frontend/src/services/api.ts` - Frontend index error handling
- `FIRESTORE_SETUP.md` - General Firestore setup guide

---

**Remember:** Always follow Firebase's recommended approach - run queries in your app to get automatic index creation links! ⭐
