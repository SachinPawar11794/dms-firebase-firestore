# DMS Firebase Firestore - Architecture Documentation

## Overview
This document outlines the architecture for a multi-module enterprise application built on Google Cloud Firebase and Firestore. The application follows best practices for scalability, maintainability, and security.

## Technology Stack
- **Backend**: Firebase Functions (Node.js)
- **Database**: Cloud Firestore
- **Authentication**: Firebase Authentication
- **Storage**: Firebase Storage (for file uploads)
- **Hosting**: Firebase Hosting
- **Language**: TypeScript/JavaScript
- **Frontend**: React + TypeScript + Vite
- **State Management**: React Context API + React Query

## Architecture Principles

### 1. Modular Architecture
- Each module is self-contained with its own services, models, and routes
- Modules communicate through well-defined interfaces
- Shared utilities and services are in a common layer
- **CRITICAL: Frontend modules MUST be isolated with Error Boundaries** (see Frontend Module Isolation section below)

### 2. Date Format Standard
- **MANDATORY: All dates in the application MUST be displayed in dd/mm/yyyy format**
- Use `formatDate()` from `frontend/src/utils/dateFormatter.ts` for all date displays
- Never use `toLocaleDateString()` or other locale-dependent methods
- Date formatting utility handles: ISO strings, Date objects, and Firestore Timestamps
- See `frontend/src/utils/dateFormatter.ts` for available functions

### 2. Scalability
- Horizontal scaling through Firebase Functions
- Efficient Firestore queries with proper indexing
- Caching strategies for frequently accessed data
- Batch operations for bulk data processing

### 3. Security
- Role-Based Access Control (RBAC) at module level
- Firestore Security Rules for data protection
- Input validation and sanitization
- Audit logging for sensitive operations

### 4. Best Practices
- Separation of concerns (Models, Services, Controllers)
- Dependency injection for testability
- Error handling and logging
- Type safety with TypeScript
- Code reusability through shared utilities

## Project Structure

```
dms-firebase-firestore/
├── src/
│   ├── config/
│   │   ├── firebase.config.ts
│   │   └── firestore.rules
│   ├── models/
│   │   ├── user.model.ts
│   │   ├── permission.model.ts
│   │   └── common/
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── permission.service.ts
│   │   └── common/
│   ├── modules/
│   │   ├── employee-task-manager/
│   │   │   ├── models/
│   │   │   ├── services/
│   │   │   ├── controllers/
│   │   │   └── routes/
│   │   ├── pms/
│   │   │   ├── models/
│   │   │   ├── services/
│   │   │   ├── controllers/
│   │   │   └── routes/
│   │   ├── human-resource/
│   │   │   ├── models/
│   │   │   ├── services/
│   │   │   ├── controllers/
│   │   │   └── routes/
│   │   ├── maintenance/
│   │   │   ├── models/
│   │   │   ├── services/
│   │   │   ├── controllers/
│   │   │   └── routes/
│   │   └── shared/
│   │       ├── middleware/
│   │       ├── utils/
│   │       └── validators/
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── permission.middleware.ts
│   │   └── error.middleware.ts
│   └── utils/
│       ├── logger.ts
│       ├── response.ts
│       └── validators.ts
├── functions/
│   ├── src/
│   │   └── index.ts
│   └── package.json
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Database Schema (Firestore Collections)

### Users Collection
```
users/{userId}
  - email: string
  - displayName: string
  - role: string (admin, manager, employee, etc.)
  - modulePermissions: {
      employeeTaskManager: ['read', 'write', 'delete'],
      pms: ['read'],
      humanResource: ['read', 'write'],
      maintenance: ['read']
    }
  - createdAt: timestamp
  - updatedAt: timestamp
  - isActive: boolean
```

### Employee Task Manager Collection
```
tasks/{taskId}
  - title: string
  - description: string
  - assignedTo: string (userId)
  - assignedBy: string (userId)
  - status: string (pending, in-progress, completed, cancelled)
  - priority: string (low, medium, high, urgent)
  - dueDate: timestamp
  - createdAt: timestamp
  - updatedAt: timestamp
  - createdBy: string (userId)
```

### PMS (Production Management System) Collection
```
productions/{productionId}
  - productName: string
  - quantity: number
  - unit: string
  - productionDate: timestamp
  - status: string (planned, in-progress, completed, on-hold)
  - assignedTeam: array<string> (userIds)
  - qualityCheck: boolean
  - notes: string
  - createdAt: timestamp
  - updatedAt: timestamp
  - createdBy: string (userId)

productionOrders/{orderId}
  - orderNumber: string
  - productId: string
  - quantity: number
  - deadline: timestamp
  - status: string
  - createdAt: timestamp
```

### Human Resource Collection
```
employees/{employeeId}
  - employeeId: string (unique)
  - personalInfo: {
      firstName: string
      lastName: string
      email: string
      phone: string
      address: object
      dateOfBirth: timestamp
    }
  - employmentInfo: {
      department: string
      position: string
      hireDate: timestamp
      salary: number
      employmentType: string (full-time, part-time, contract)
    }
  - documents: array<string> (storage URLs)
  - createdAt: timestamp
  - updatedAt: timestamp

attendance/{attendanceId}
  - employeeId: string
  - date: timestamp
  - checkIn: timestamp
  - checkOut: timestamp
  - status: string (present, absent, leave, half-day)
  - notes: string
```

### Maintenance Collection
```
maintenanceRequests/{requestId}
  - title: string
  - description: string
  - equipmentId: string
  - equipmentName: string
  - priority: string (low, medium, high, urgent)
  - status: string (pending, assigned, in-progress, completed, cancelled)
  - assignedTo: string (userId)
  - requestedBy: string (userId)
  - scheduledDate: timestamp
  - completedDate: timestamp
  - cost: number
  - notes: string
  - createdAt: timestamp
  - updatedAt: timestamp

equipment/{equipmentId}
  - name: string
  - type: string
  - serialNumber: string
  - location: string
  - status: string (operational, maintenance, out-of-order)
  - lastMaintenanceDate: timestamp
  - nextMaintenanceDate: timestamp
  - warrantyExpiry: timestamp
  - createdAt: timestamp
```

### Plants Collection
```
plants/{plantId}
  - name: string
  - code: string (unique plant code)
  - isActive: boolean
  - createdAt: timestamp
  - updatedAt: timestamp
  - createdBy: string (userId)
```

## Frontend Architecture

### Plant Selection System

The application implements a **Plant Selection** feature that allows users to filter and view data specific to a selected plant throughout the application.

#### Implementation Details

1. **Plant Context (`frontend/src/contexts/PlantContext.tsx`)**
   - Global state management for selected plant using React Context API
   - Persists selected plant to `localStorage` for session persistence
   - Provides `usePlant()` hook for accessing selected plant anywhere in the app
   - Storage key: `dms_selected_plant`

2. **Plant Selector Component (in `Layout.tsx`)**
   - Fixed header dropdown at the top of the application
   - Shows all active plants from Plant Master
   - Displays selected plant name and code
   - "All Plants" option to clear selection and view all data
   - Responsive design for mobile and desktop

3. **Usage in Components**
   ```typescript
   import { usePlant } from '../contexts/PlantContext';
   
   const MyComponent = () => {
     const { selectedPlant, setSelectedPlant } = usePlant();
     
     // Filter data based on selected plant
     const filteredData = data.filter(item => 
       !selectedPlant || item.plantId === selectedPlant.id
     );
   };
   ```

4. **Data Filtering Pattern**
   - All data queries should check `selectedPlant` from context
   - When a plant is selected, filter API calls or client-side data by `plantId`
   - When no plant is selected ("All Plants"), show all data
   - Plant selection persists across page navigation

5. **Integration Points**
   - **Tasks**: Filter tasks by selected plant
   - **Productions**: Filter production data by selected plant
   - **Employees**: Filter employees by selected plant
   - **Maintenance**: Filter maintenance records by selected plant
   - **Dashboard**: Show statistics for selected plant

#### Best Practices for Future Development

1. **Always check selected plant in data queries:**
   ```typescript
   const { selectedPlant } = usePlant();
   const plantId = selectedPlant?.id;
   
   // In API calls
   const response = await apiClient.get('/api/v1/tasks', {
     params: plantId ? { plantId } : {}
   });
   ```

2. **Display plant context in page headers:**
   ```typescript
   {selectedPlant && (
     <div>Viewing: {selectedPlant.name} ({selectedPlant.code})</div>
   )}
   ```

3. **Handle plant changes gracefully:**
   - Invalidate React Query cache when plant changes
   - Show loading states during plant switch
   - Maintain scroll position when possible

4. **Plant Master Requirements:**
   - Plants must be created in App Settings → Plant Master
   - Only active plants appear in the selector
   - Plant code must be unique
   - Plant selection is user-specific (stored in localStorage)

5. **Firestore Index Requirements:**
   - A composite index is required for querying plants with `isActive` filter and `name` ordering
   - Index definition is in `firestore.indexes.json`
   - Deploy indexes using: `firebase deploy --only firestore:indexes`
   - Or create manually via the link provided in error messages

6. **Automatic Index Error Handling:**
   - When a Firestore index error occurs, the web app automatically:
     - Detects the `INDEX_REQUIRED` error code
     - Opens Firebase Console in a new tab showing the index creation page
     - Displays an alert with instructions
     - User can click "Create Index" directly from the console
   - Implementation: `frontend/src/services/api.ts` interceptor handles index errors
   - Backend: `src/middleware/error.middleware.ts` extracts index URL from Firestore errors

7. **Plant-Based Data Filtering:**
   - **When a plant is selected**, all modules automatically filter data by that plant:
     - **Dashboard**: Shows statistics and tasks for selected plant only
     - **Tasks**: Filters task instances and task masters by selected plant
     - **Productions**: Filters production data by selected plant
     - **Employees**: Filters employees by selected plant
     - **Maintenance**: Filters maintenance records by selected plant
   - **When "All Plants" is selected**, all data from all plants is shown
   - **Implementation Pattern:**
     ```typescript
     const { selectedPlant } = usePlant();
     
     // Include plantId in query key for cache invalidation
     const { data } = useQuery({
       queryKey: ['tasks', { plantId: selectedPlant?.id }],
       queryFn: () => apiClient.get('/api/v1/tasks', {
         params: selectedPlant ? { plantId: selectedPlant.id } : {}
       })
     });
     ```
   - **Auto-filtering**: TaskMasters page automatically applies selected plant filter
   - **Visual Indicator**: Dashboard shows selected plant name in header
   - **Cache Management**: React Query cache is automatically invalidated when plant changes
   - **Implementation**: `PlantContext` uses `useQueryClient` to invalidate all queries when plant selection changes
   - **Example Implementation:**
     ```typescript
     // In any component
     const { selectedPlant } = usePlant();
     
     // Include plantId in query key for proper cache management
     const { data } = useQuery({
       queryKey: ['tasks', { plantId: selectedPlant?.id }],
       queryFn: () => taskService.getTasks({ 
         plantId: selectedPlant?.id 
       })
     });
     ```
   - **Pages Updated:**
     - ✅ Dashboard: Filters tasks by selected plant, shows plant indicator
     - ✅ Tasks/MyTasks: Filters task instances by selected plant
     - ✅ Tasks/TaskMasters: Auto-applies selected plant filter
     - ✅ User Management: Filters users by selected plant (client-side filtering by plant name/code)
     - ✅ Plant Master: Shows selected plant indicator (master list not filtered)
     - ✅ Productions: Ready for plant filtering (placeholder)
     - ✅ Employees: Ready for plant filtering (placeholder)
     - ✅ Maintenance: Ready for plant filtering (placeholder)
   
   - **Filtering Methods:**
     - **Backend Filtering**: Tasks, Productions, Employees, Maintenance (via API `plantId` parameter)
     - **Client-Side Filtering**: User Management (filters by `plant` field matching plant name/code)
     - **Visual Indicators**: 
       - Filter banner shows when plant is selected
       - Displays count of filtered vs total items
       - Clear message when no data matches filter

8. **Index Error Auto-Redirect:**
   - **Backend Detection**: `src/modules/shared/services/plant.service.ts` detects Firestore index errors (code 9)
   - **Error Extraction**: `src/middleware/error.middleware.ts` extracts index URL from error details
   - **Frontend Handling**: `frontend/src/services/api.ts` interceptor detects `INDEX_REQUIRED` error code
   - **Auto-Redirect**: Automatically opens Firebase Console in new tab with index creation page
   - **User Experience**: 
     - Alert message explains the issue
     - Direct link to create index
     - User can click "Create Index" and wait for build (2-5 minutes)
     - Refresh page once index is ready
   - **Error Flow:**
     ```
     Firestore Error (code 9) 
     → Backend extracts index URL 
     → Returns INDEX_REQUIRED error with URL
     → Frontend interceptor detects error
     → Opens Firebase Console in new tab
     → Shows alert with instructions
     ```

## Permission System

### Permission Levels
1. **None**: No access to the module
2. **Read**: Can view data but cannot modify
3. **Write**: Can create and update data
4. **Delete**: Can delete data
5. **Admin**: Full access including user management

### Permission Structure
```typescript
interface ModulePermission {
  module: string;
  permissions: string[]; // ['read', 'write', 'delete']
}

interface UserPermissions {
  userId: string;
  modulePermissions: {
    [moduleName: string]: string[];
  };
}
```

### Permission Middleware
- Validates user permissions before route access
- Returns 403 Forbidden if user lacks required permission
- Logs permission denials for audit purposes

## API Design

### RESTful Endpoints Structure
```
/api/v1/
  /auth/
    POST /login
    POST /register
    POST /logout
    GET /me
  
  /users/
    GET /users
    GET /users/:id
    PUT /users/:id
    DELETE /users/:id
    PUT /users/:id/permissions
  
  /employee-task-manager/
    GET /tasks
    POST /tasks
    GET /tasks/:id
    PUT /tasks/:id
    DELETE /tasks/:id
    PUT /tasks/:id/status
  
  /pms/
    GET /productions
    POST /productions
    GET /productions/:id
    PUT /productions/:id
    GET /orders
    POST /orders
  
  /human-resource/
    GET /employees
    POST /employees
    GET /employees/:id
    PUT /employees/:id
    GET /attendance
    POST /attendance
  
  /maintenance/
    GET /requests
    POST /requests
    GET /requests/:id
    PUT /requests/:id
    GET /equipment
    POST /equipment
```

## Security Rules (Firestore)

### General Rules
- Users can only read/write their own user document
- Module access controlled by permission system
- Admin users have full access
- Timestamps automatically managed

### Example Security Rule Structure
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null && 
                     (request.auth.uid == userId || 
                      hasPermission('humanResource', 'read'));
      allow write: if request.auth != null && 
                      (request.auth.uid == userId || 
                       hasPermission('humanResource', 'write'));
    }
    
    // Tasks collection
    match /tasks/{taskId} {
      allow read: if request.auth != null && 
                     hasPermission('employeeTaskManager', 'read');
      allow create: if request.auth != null && 
                       hasPermission('employeeTaskManager', 'write');
      allow update: if request.auth != null && 
                       (hasPermission('employeeTaskManager', 'write') ||
                        resource.data.assignedTo == request.auth.uid);
      allow delete: if request.auth != null && 
                       hasPermission('employeeTaskManager', 'delete');
    }
  }
}
```

## Error Handling

### Standard Error Response Format
```typescript
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: any
  }
}
```

### Error Codes
- `AUTH_REQUIRED`: Authentication required
- `PERMISSION_DENIED`: Insufficient permissions
- `VALIDATION_ERROR`: Input validation failed
- `NOT_FOUND`: Resource not found
- `INTERNAL_ERROR`: Server error

## Logging and Monitoring

### Log Levels
- **INFO**: General information
- **WARN**: Warning messages
- **ERROR**: Error messages
- **DEBUG**: Debug information (development only)

### Audit Logging
- User authentication events
- Permission changes
- Data modifications (create, update, delete)
- Sensitive operations

## Testing Strategy

### Unit Tests
- Service layer functions
- Utility functions
- Validators

### Integration Tests
- API endpoints
- Database operations
- Permission system

### Test Structure
```
tests/
  ├── unit/
  ├── integration/
  └── e2e/
```

## Deployment

### Environment Variables
- `FIREBASE_PROJECT_ID`
- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_STORAGE_BUCKET`
- `NODE_ENV`

### Deployment Steps
1. Build TypeScript to JavaScript
2. Deploy Firestore security rules
3. Deploy Firebase Functions
4. Deploy Firebase Hosting (if applicable)
5. Run database migrations (if any)

## Future Enhancements

1. **Real-time Updates**: WebSocket support for live data updates
2. **Reporting Module**: Analytics and reporting dashboard
3. **Notification System**: Push notifications for important events
4. **File Management**: Enhanced file upload and management
5. **API Rate Limiting**: Prevent abuse and ensure fair usage
6. **Caching Layer**: Redis for frequently accessed data
7. **Search Functionality**: Full-text search across modules
8. **Export/Import**: Data export and import capabilities

## Module-Specific Details

### Employee Task Manager
- Task assignment and tracking
- Priority management
- Status workflow
- Due date reminders
- Task comments and attachments

### PMS (Production Management System)
- Production planning and scheduling
- Order management
- Quality control tracking
- Resource allocation
- Production reports

### Human Resource
- Employee information management
- Attendance tracking
- Leave management
- Payroll integration (future)
- Performance reviews (future)

### Maintenance
- Equipment tracking
- Maintenance scheduling
- Request management
- Cost tracking
- Maintenance history

## Best Practices Checklist

- [x] Modular architecture
- [x] **Frontend module isolation with Error Boundaries (MANDATORY)**
- [x] Role-based access control
- [x] Input validation
- [x] Error handling
- [x] Logging
- [x] Type safety
- [x] Security rules
- [x] Scalable database design
- [x] API versioning
- [x] Documentation

**⚠️ CRITICAL FOR ALL FUTURE MODULES:** Before creating any new module, developers MUST:
1. Read `MODULE_DEVELOPMENT_GUIDE.md` - Complete step-by-step guide
2. Review `TASKS_MODULE_ARCHITECTURE.md` - Reference implementation
3. Follow the **Frontend Module Isolation** pattern (see section above)
4. Wrap ALL module routes in `ErrorBoundary` component
5. Ensure proper error handling in all components

**Failure to follow these patterns will result in:**
- ❌ Entire application crashes when module has errors
- ❌ Poor user experience
- ❌ Difficult development and debugging
- ❌ Code review rejection
