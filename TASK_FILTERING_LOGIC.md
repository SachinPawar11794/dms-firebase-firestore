# Task Filtering Logic - "My Tasks" Page

## Overview

The "My Tasks" page shows **Task Instances** that are assigned to the currently logged-in user. This document explains how the system determines which tasks to display.

## Flow Diagram

```
User Opens "My Tasks" Page
    ↓
Frontend: MyTasks Component
    ↓
Frontend: taskInstanceService.getMyTasks()
    ↓
API Call: GET /api/v1/employee-task-manager/task-instances/my-tasks
    ↓
Backend: TaskInstanceController.getMyTasks()
    ↓
Extract: req.user!.uid (Authenticated User ID)
    ↓
Backend: TaskInstanceService.getTaskInstances()
    ↓
Firestore Query: taskInstances collection
    ↓
Filter: assignedTo == currentUserId
    ↓
Apply Additional Filters (status, plantId, dates)
    ↓
Return: Filtered Task Instances
```

## Step-by-Step Logic

### 1. **User Authentication** (Backend)

**Location:** `src/modules/employee-task-manager/controllers/task-instance.controller.ts`

```typescript
async getMyTasks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const userId = req.user!.uid;  // ← Gets the logged-in user's Firebase UID
  // ...
}
```

**Key Point:** The system uses the **authenticated user's Firebase UID** from the JWT token to identify which tasks belong to the user.

### 2. **Primary Filter: assignedTo**

**Location:** `src/modules/employee-task-manager/services/task-instance.service.ts`

```typescript
if (queryParams.assignedTo) {
  query = query.where('assignedTo', '==', queryParams.assignedTo);
}
```

**What it does:**
- Filters Task Instances where `assignedTo` field matches the current user's ID
- This is the **primary filter** - only tasks assigned to the logged-in user are shown

### 3. **Additional Filters** (Optional)

The frontend can apply additional filters:

#### A. **Status Filter**
- **Location:** Frontend `MyTasks.tsx`
- **Options:** `all`, `pending`, `in-progress`, `completed`, `cancelled`
- **Applied when:** User selects a status tab
- **Backend:** `query.where('status', '==', statusFilter)`

#### B. **Plant Filter**
- **Location:** Frontend `MyTasks.tsx` (from PlantContext)
- **Applied when:** User selects a plant from the header dropdown
- **Backend:** `query.where('plantId', '==', selectedPlantId)`
- **Note:** If no plant is selected, all plants are shown

#### C. **Date Filters** (Future Enhancement)
- `scheduledDateFrom` - Show tasks scheduled after this date
- `scheduledDateTo` - Show tasks scheduled before this date

### 4. **Query Execution**

**Location:** `src/modules/employee-task-manager/services/task-instance.service.ts`

```typescript
// Order by scheduledDate (descending - newest first)
query = query.orderBy('scheduledDate', 'desc');

// Pagination
const limit = queryParams.limit || 50;
const page = queryParams.page || 1;
const offset = (page - 1) * limit;

const taskInstancesSnapshot = await query.limit(limit).offset(offset).get();
```

**Sorting:** Tasks are sorted by `scheduledDate` in **descending order** (newest first)

**Pagination:** Results are paginated (default: 20 per page)

## Complete Filter Logic

### Backend Query (Firestore)

```typescript
// Base query
let query = db.collection('taskInstances');

// REQUIRED: Filter by assigned user
query = query.where('assignedTo', '==', currentUserId);

// OPTIONAL: Filter by status
if (statusFilter) {
  query = query.where('status', '==', statusFilter);
}

// OPTIONAL: Filter by plant
if (plantId) {
  query = query.where('plantId', '==', plantId);
}

// OPTIONAL: Filter by date range
if (scheduledDateFrom) {
  query = query.where('scheduledDate', '>=', scheduledDateFrom);
}
if (scheduledDateTo) {
  query = query.where('scheduledDate', '<=', scheduledDateTo);
}

// Sort and paginate
query = query.orderBy('scheduledDate', 'desc');
query = query.limit(limit).offset(offset);
```

## Task Assignment Flow

### How Tasks Get Assigned to Users

1. **Task Master Creation:**
   - Admin/Manager creates a Task Master
   - Sets `assignedTo` field to a user's ID
   - Sets `plantId` to a specific plant

2. **Task Instance Generation:**
   - System generates Task Instances from Task Masters
   - Each Task Instance inherits:
     - `assignedTo` from Task Master
     - `plantId` from Task Master
     - `scheduledDate` based on frequency
     - `dueDate` calculated from scheduled date

3. **Task Instance Storage:**
   - Stored in Firestore `taskInstances` collection
   - Each document has `assignedTo` field with user ID

## Example Scenarios

### Scenario 1: User A Views "My Tasks"
- **User ID:** `user123`
- **Query:** `taskInstances.where('assignedTo', '==', 'user123')`
- **Result:** All tasks where `assignedTo = 'user123'`

### Scenario 2: User A Filters by Status
- **User ID:** `user123`
- **Status Filter:** `pending`
- **Query:** 
  ```
  taskInstances
    .where('assignedTo', '==', 'user123')
    .where('status', '==', 'pending')
  ```
- **Result:** Only pending tasks assigned to user123

### Scenario 3: User A Filters by Plant
- **User ID:** `user123`
- **Plant ID:** `plant456`
- **Query:**
  ```
  taskInstances
    .where('assignedTo', '==', 'user123')
    .where('plantId', '==', 'plant456')
  ```
- **Result:** Tasks assigned to user123 for plant456 only

### Scenario 4: User A Filters by Status + Plant
- **User ID:** `user123`
- **Status:** `in-progress`
- **Plant ID:** `plant456`
- **Query:**
  ```
  taskInstances
    .where('assignedTo', '==', 'user123')
    .where('status', '==', 'in-progress')
    .where('plantId', '==', 'plant456')
  ```
- **Result:** In-progress tasks assigned to user123 for plant456

## Important Notes

### 1. **Authentication Required**
- The `assignedTo` filter is **automatically set** from the authenticated user
- Users **cannot** see tasks assigned to other users
- This is enforced at the backend level

### 2. **Plant Filter is Optional**
- If no plant is selected, tasks from **all plants** are shown
- If a plant is selected, only tasks for that plant are shown
- Plant selection is stored in localStorage and persists across sessions

### 3. **Status Filter Default**
- Default status filter is `'all'` (shows all statuses)
- User can filter by: `pending`, `in-progress`, `completed`, `cancelled`

### 4. **Firestore Index Requirements**
- Composite index required for queries with multiple filters
- Example: `assignedTo + status + scheduledDate`
- Indexes are automatically created via Firebase Console links

## Code References

### Frontend
- **Component:** `frontend/src/pages/Tasks/MyTasks.tsx`
- **Service:** `frontend/src/services/taskInstanceService.ts`
- **API Endpoint:** `/api/v1/employee-task-manager/task-instances/my-tasks`

### Backend
- **Controller:** `src/modules/employee-task-manager/controllers/task-instance.controller.ts`
- **Service:** `src/modules/employee-task-manager/services/task-instance.service.ts`
- **Route:** `src/modules/employee-task-manager/routes/task-instance.routes.ts`

## Summary

**The system shows tasks in "My Tasks" based on:**

1. ✅ **Primary Filter:** `assignedTo == currentUserId` (REQUIRED)
2. ✅ **Status Filter:** User-selected status (OPTIONAL)
3. ✅ **Plant Filter:** Selected plant from header (OPTIONAL)
4. ✅ **Date Filters:** Date range filters (OPTIONAL, future)
5. ✅ **Sorting:** By `scheduledDate` descending (newest first)
6. ✅ **Pagination:** 20 tasks per page

**Key Security:** Users can **only** see tasks assigned to them. The `assignedTo` filter is automatically applied from the authenticated user's ID and cannot be overridden by the frontend.
