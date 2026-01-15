# Task Master & Task Instance Implementation Guide

## Overview

This document describes the implementation of the Task Master and Task Instance system, which allows administrators and managers to create recurring task templates (Task Masters) that automatically generate task instances for employees based on frequency.

## Architecture

### Backend Structure

#### Models
1. **Plant Model** (`src/modules/shared/models/plant.model.ts`)
   - Represents manufacturing plants/facilities
   - Fields: name, code, address, contactInfo, isActive

2. **TaskMaster Model** (`src/modules/employee-task-manager/models/task-master.model.ts`)
   - Template for recurring tasks
   - Fields: title, description, plantId, assignedTo, assignedBy, priority, frequency, frequencyValue, frequencyUnit, isActive
   - Frequencies: daily, weekly, monthly, quarterly, yearly, custom

3. **TaskInstance Model** (`src/modules/employee-task-manager/models/task-instance.model.ts`)
   - Actual tasks generated from Task Masters
   - Fields: taskMasterId, scheduledDate, dueDate, status, notes, actualDuration, completedAt
   - Inherits most fields from Task Master

#### Services
1. **PlantService** (`src/modules/shared/services/plant.service.ts`)
   - CRUD operations for plants
   - Validates unique plant codes

2. **TaskMasterService** (`src/modules/employee-task-manager/services/task-master.service.ts`)
   - CRUD operations for task masters
   - Filters by plant, employee, frequency, active status

3. **TaskInstanceService** (`src/modules/employee-task-manager/services/task-instance.service.ts`)
   - CRUD operations for task instances
   - **generateTasksFromMasters()**: Automatically generates task instances from active task masters based on frequency
   - Calculates scheduled dates and due dates based on frequency
   - Prevents duplicate task generation for the same day

#### Controllers & Routes
- **Plant Routes**: `/api/v1/plants`
- **Task Master Routes**: `/api/v1/employee-task-manager/task-masters`
- **Task Instance Routes**: `/api/v1/employee-task-manager/task-instances`
  - Special endpoint: `/my-tasks` - Returns tasks assigned to the current user

### Frontend Structure

#### Pages
1. **Tasks.tsx** (`frontend/src/pages/Tasks.tsx`)
   - Main container with tabs
   - Shows "My Tasks" tab for all users
   - Shows "Task Masters" tab for admins/managers only

2. **MyTasks.tsx** (`frontend/src/pages/Tasks/MyTasks.tsx`)
   - Displays tasks assigned to the current user
   - Allows status updates (pending → in-progress → completed)
   - Shows overdue/due soon indicators
   - Task detail modal for viewing full information

3. **TaskMasters.tsx** (`frontend/src/pages/Tasks/TaskMasters.tsx`)
   - Lists all task masters with filters (plant, employee, frequency, status)
   - Create/Edit/Delete task masters
   - Activate/Deactivate task masters
   - Shows plant and employee names (not just IDs)

#### Components
1. **TaskMasterForm.tsx** (`frontend/src/components/tasks/TaskMasterForm.tsx`)
   - Modal form for creating/editing task masters
   - Handles all frequency types including custom
   - Validates required fields

#### Services
1. **plantService.ts** - API calls for plant management
2. **taskMasterService.ts** - API calls for task master management
3. **taskInstanceService.ts** - API calls for task instance management

## Key Features

### Task Master Features
- ✅ Plant-wise organization
- ✅ Employee-wise assignment
- ✅ Multiple frequency options (daily, weekly, monthly, quarterly, yearly, custom)
- ✅ Priority levels (low, medium, high, urgent)
- ✅ Estimated duration tracking
- ✅ Detailed instructions
- ✅ Active/Inactive status
- ✅ Filtering and search capabilities

### Task Instance Features
- ✅ Auto-generated from task masters
- ✅ Scheduled date and due date calculation
- ✅ Status tracking (pending, in-progress, completed, cancelled)
- ✅ Notes and attachments support
- ✅ Actual duration tracking
- ✅ Overdue and due soon indicators
- ✅ User-friendly "My Tasks" view

### Task Generation Logic
The system automatically generates task instances based on:
- **Daily**: Generates tasks every day
- **Weekly**: Generates tasks every 7 days
- **Monthly**: Generates tasks every 30 days
- **Quarterly**: Generates tasks every 90 days
- **Yearly**: Generates tasks every 365 days
- **Custom**: Uses frequencyValue and frequencyUnit (e.g., every 3 days, every 2 weeks)

## API Endpoints

### Plants
- `GET /api/v1/plants` - Get all plants
- `GET /api/v1/plants/:id` - Get plant by ID
- `POST /api/v1/plants` - Create plant
- `PUT /api/v1/plants/:id` - Update plant
- `DELETE /api/v1/plants/:id` - Delete plant

### Task Masters
- `GET /api/v1/employee-task-manager/task-masters` - Get task masters (with filters)
- `GET /api/v1/employee-task-manager/task-masters/:id` - Get task master by ID
- `POST /api/v1/employee-task-manager/task-masters` - Create task master
- `PUT /api/v1/employee-task-manager/task-masters/:id` - Update task master
- `DELETE /api/v1/employee-task-manager/task-masters/:id` - Delete task master

### Task Instances
- `GET /api/v1/employee-task-manager/task-instances` - Get all task instances (with filters)
- `GET /api/v1/employee-task-manager/task-instances/my-tasks` - Get current user's tasks
- `GET /api/v1/employee-task-manager/task-instances/:id` - Get task instance by ID
- `POST /api/v1/employee-task-manager/task-instances` - Create task instance (manual)
- `PUT /api/v1/employee-task-manager/task-instances/:id` - Update task instance
- `DELETE /api/v1/employee-task-manager/task-instances/:id` - Delete task instance
- `POST /api/v1/employee-task-manager/task-instances/generate` - Generate tasks from masters (admin/manager only)

## Usage Guide

### For Administrators/Managers

1. **Create Plants** (if not already created)
   - Navigate to Plants section (if available) or use API
   - Create plants with unique codes

2. **Create Task Masters**
   - Go to Tasks → Task Masters tab
   - Click "New Task Master"
   - Fill in:
     - Title and Description
     - Select Plant
     - Select Employee to assign to
     - Set Priority
     - Choose Frequency (daily, weekly, monthly, etc.)
     - Add estimated duration and instructions (optional)
   - Save

3. **Generate Tasks**
   - Click "Generate Tasks" button (or set up scheduled job)
   - System will create task instances for all active task masters based on their frequency

4. **Manage Task Masters**
   - Filter by plant, employee, frequency, or status
   - Edit or delete task masters
   - Activate/Deactivate task masters

### For Employees

1. **View My Tasks**
   - Navigate to Tasks → My Tasks tab
   - View all assigned tasks
   - Filter by status (All, Pending, In Progress, Completed)

2. **Update Task Status**
   - Click "Start" to change status from Pending to In Progress
   - Click "Complete" to mark task as completed
   - View task details for more information

3. **Task Indicators**
   - ⚠️ Overdue: Tasks past their due date
   - ⚠️ Due Soon: Tasks due within 3 days

## Scheduled Task Generation

To automatically generate tasks, you need to set up a scheduled job. Options:

### Option 1: Cloud Function (Recommended)
Create a scheduled Cloud Function that runs daily:

```typescript
// cloud-functions/src/index.ts
import * as functions from 'firebase-functions';
import { taskInstanceService } from '../src/modules/employee-task-manager/services/task-instance.service';

export const generateTasksDaily = functions.pubsub
  .schedule('0 0 * * *') // Every day at midnight
  .timeZone('UTC')
  .onRun(async (context) => {
    const result = await taskInstanceService.generateTasksFromMasters();
    console.log(`Generated ${result.generated} tasks, ${result.errors} errors`);
    return null;
  });
```

### Option 2: Manual Trigger
Admins/Managers can manually trigger task generation via the API endpoint:
`POST /api/v1/employee-task-manager/task-instances/generate`

### Option 3: Cron Job
Set up a cron job on your server to call the generate endpoint daily.

## Database Collections

### Firestore Collections
- `plants/{plantId}` - Plant information
- `taskMasters/{taskMasterId}` - Task master templates
- `taskInstances/{taskInstanceId}` - Generated task instances

## Permissions

- **Task Masters**: Only admins and managers can create/edit/delete
- **Task Instances**: 
  - All authenticated users can view their own tasks
  - Users can update their own task status
  - Admins/managers can view and update all tasks

## Next Steps

1. ✅ Backend models, services, controllers, and routes - **COMPLETED**
2. ✅ Frontend pages and components - **COMPLETED**
3. ⏳ Set up Cloud Function for scheduled task generation
4. ⏳ Add email notifications for new tasks
5. ⏳ Add task completion reports/analytics
6. ⏳ Add bulk task operations
7. ⏳ Add task templates/categories

## Testing

To test the implementation:

1. Create a plant via API or frontend
2. Create a task master with daily frequency
3. Manually trigger task generation
4. Verify task instances are created
5. Log in as the assigned employee
6. View tasks in "My Tasks"
7. Update task status
8. Verify changes are reflected

## Notes

- Task instances are generated based on the `lastGenerated` timestamp in task masters
- The system prevents duplicate task generation for the same scheduled date
- Task masters can be deactivated to stop generating new tasks
- Existing task instances are not affected when a task master is deactivated
