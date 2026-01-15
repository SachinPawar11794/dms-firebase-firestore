# Troubleshooting: Tasks Not Appearing in "My Tasks"

## Understanding the System

The task system has **two types** of entities:

1. **Task Masters** (Templates)
   - Recurring task templates
   - Created by admins/managers
   - Stored in `taskMasters` collection
   - **DO NOT appear in "My Tasks"**

2. **Task Instances** (Actual Tasks)
   - Individual tasks generated from Task Masters
   - Assigned to specific employees
   - Stored in `taskInstances` collection
   - **These appear in "My Tasks"**

## Why Tasks Don't Appear

### Issue 1: Only Task Master Created (Most Common)

**Problem:** You created a Task Master, but no Task Instances have been generated yet.

**Solution:**
1. Go to **Task Masters** page
2. Click the **"Generate Tasks"** button (green button in header)
3. This will create Task Instances from all active Task Masters
4. Check **"My Tasks"** page - tasks should now appear

### Issue 2: User ID Mismatch

**Problem:** The Task Master's `assignedTo` field doesn't match your Firebase User ID.

**How to Check:**
1. Open browser console (F12)
2. Check your current user ID:
   ```javascript
   // In browser console
   firebase.auth().currentUser?.uid
   ```
3. Check the Task Master's `assignedTo` field in Firestore
4. They must match exactly

**Solution:**
- Edit the Task Master and ensure `assignedTo` matches your Firebase User ID
- Or create a new Task Master with your user ID

### Issue 3: Task Master is Inactive

**Problem:** The Task Master has `isActive: false`

**Solution:**
- Go to Task Masters page
- Find your Task Master
- Click the **Play** button to activate it
- Then click **"Generate Tasks"**

### Issue 4: Plant Filter Active

**Problem:** A plant is selected in the header, but the task is for a different plant.

**Solution:**
- Clear the plant filter (select "All Plants" in header)
- Or select the correct plant that matches the task's `plantId`

### Issue 5: Status Filter Active

**Problem:** Status filter is set to a specific status, but tasks have different status.

**Solution:**
- Click "All" tab in the status filter
- Or select the correct status

### Issue 6: Date Range Issue

**Problem:** Task's `scheduledDate` is in the past or future, and filters exclude it.

**Solution:**
- Currently, all tasks are shown regardless of date
- Future enhancement may add date filtering

## Step-by-Step Fix

### Step 1: Verify Task Master Setup

1. Go to **Task Masters** page
2. Verify your Task Master exists
3. Check:
   - ✅ `isActive` = true (green "Active" badge)
   - ✅ `assignedTo` = your Firebase User ID
   - ✅ `plantId` = correct plant (if using plant filter)

### Step 2: Generate Task Instances

1. Click **"Generate Tasks"** button (green button in Task Masters header)
2. Wait for success message: "Successfully generated X task instance(s)"
3. If errors occur, check the error message

### Step 3: Check "My Tasks"

1. Go to **"My Tasks"** tab
2. Tasks should now appear
3. If still empty:
   - Check browser console for errors
   - Verify user ID matches
   - Clear all filters

## How Task Generation Works

When you click **"Generate Tasks"**:

1. System finds all **active** Task Masters
2. For each Task Master:
   - Checks if task should be generated based on frequency
   - Calculates `scheduledDate` and `dueDate`
   - Creates a Task Instance with:
     - `assignedTo` = Task Master's `assignedTo`
     - `title`, `description`, `priority` = copied from Task Master
     - `status` = 'pending'
     - `scheduledDate` and `dueDate` = calculated dates
3. Task Instances are stored in `taskInstances` collection
4. These appear in "My Tasks" for the assigned user

## Verification Checklist

- [ ] Task Master exists and is **Active**
- [ ] Task Master's `assignedTo` matches your Firebase User ID
- [ ] Clicked **"Generate Tasks"** button
- [ ] Generation was successful (no errors)
- [ ] No plant filter active (or correct plant selected)
- [ ] Status filter set to "All" (or correct status)
- [ ] Browser console shows no errors
- [ ] Refreshed "My Tasks" page

## Common User ID Issues

### Finding Your User ID

**Method 1: Browser Console**
```javascript
// Open browser console (F12)
firebase.auth().currentUser?.uid
```

**Method 2: User Profile**
- Click your user profile in top right
- Check the user details (ID may be shown)

**Method 3: Network Tab**
- Open browser DevTools → Network tab
- Look at API requests
- Check `Authorization` header or request payloads

### User ID Format

Firebase User IDs look like:
- `dykZXqXAR8efpyUynXbOcvM7Gbs1`
- `QwjBZE3i1PbLKDdyETeQs94m6rl2`

They are **case-sensitive** and must match exactly.

## API Endpoints

### Generate Tasks
```
POST /api/v1/employee-task-manager/task-instances/generate
```

**Requirements:**
- User must be `admin` or `manager`
- Returns: `{ generated: number, errors: number }`

### Get My Tasks
```
GET /api/v1/employee-task-manager/task-instances/my-tasks
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `status` - Filter by status (optional)
- `plantId` - Filter by plant (optional)

## Debugging Steps

### 1. Check Browser Console

Open browser console (F12) and look for:
- API errors (500, 404, etc.)
- Network request failures
- JavaScript errors

### 2. Check Network Tab

1. Open DevTools → Network tab
2. Refresh "My Tasks" page
3. Find the request to `/my-tasks`
4. Check:
   - Request URL and parameters
   - Response status code
   - Response data

### 3. Check Firestore

1. Go to Firebase Console → Firestore Database
2. Check `taskInstances` collection
3. Verify:
   - Documents exist
   - `assignedTo` field matches your user ID
   - `status` field is set
   - `scheduledDate` and `dueDate` are set

### 4. Check Backend Logs

1. Check `logs/combined.log` or `logs/error.log`
2. Look for errors related to:
   - Task instance queries
   - User authentication
   - Firestore queries

## Still Not Working?

If tasks still don't appear after following all steps:

1. **Check Firestore Indexes:**
   - Go to Firebase Console → Firestore → Indexes
   - Ensure composite indexes are created
   - Wait for indexes to build (2-5 minutes)

2. **Verify Permissions:**
   - Ensure you have `employeeTaskManager` module permission
   - Check user role and permissions

3. **Check Task Master Frequency:**
   - Some frequencies may not generate tasks immediately
   - Daily tasks generate for today
   - Weekly tasks generate for current week
   - Monthly tasks generate for current month

4. **Manual Task Creation:**
   - As a workaround, you can manually create Task Instances via API
   - Use POST `/api/v1/employee-task-manager/task-instances`

## Quick Reference

| Issue | Solution |
|-------|----------|
| Task Master created but no tasks | Click "Generate Tasks" button |
| User ID mismatch | Edit Task Master, set correct `assignedTo` |
| Task Master inactive | Activate Task Master (click Play button) |
| Plant filter active | Clear plant filter or select correct plant |
| Status filter active | Set status filter to "All" |
| Generation errors | Check error message, verify Task Master setup |
| No tasks in Firestore | Generate tasks from Task Masters |
| Index errors | Create Firestore composite indexes |

## Summary

**Most Common Issue:** Task Masters are templates. You must **generate Task Instances** from them for tasks to appear in "My Tasks".

**Quick Fix:**
1. Go to Task Masters page
2. Click **"Generate Tasks"** button
3. Check "My Tasks" page
