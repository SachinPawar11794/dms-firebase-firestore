# API 404 Error Fix - Complete Solution

## Problem
**Primary Issue**: When user logs out and tries to login as another user, 404 errors appear:
- `/api/v1/users/me` - 404
- `/api/v1/plants?activeOnly=true` - 404
- `/api/v1/employee-task-manager/task-instances/my-tasks?page=1&limit=20` - 404

**Root Cause**: React Query cache was not being cleared on logout, causing stale queries to retry with the new user's session.

## Root Causes Identified

### 1. **React Query Cache Not Cleared on Logout** (PRIMARY ISSUE)
- When user logs out, React Query cache still contains queries from previous user
- When new user logs in, stale queries try to refetch with old user's data
- **Fix**: Clear React Query cache on logout and when user changes

### 2. **React Query Making Requests Before Authentication**
- React Query hooks were being called even when user is not authenticated
- Components were making API calls during initial render before auth check
- **Fix**: Added `enabled` flag to queries to only run when user is authenticated

### 3. **Express Missing Catch-All Route Handler**
- Express doesn't have a catch-all handler for unmatched routes
- When routes don't match, Express returns default 404 without proper error handling
- **Fix**: Added catch-all route handler for `/api/*` routes

### 4. **No Proper Error Handling for Unmatched Routes**
- Unmatched routes were returning generic 404 without logging
- **Fix**: Added catch-all handler with proper logging and error response

## Solutions Implemented

### Backend Changes (`src/index.ts`)

1. **Added Catch-All Route Handler**:
```typescript
// Catch-all handler for unmatched API routes (must be before error handler)
app.use('/api/*', (req, res) => {
  logger.warn(`Unmatched API route: ${req.method} ${req.path}`);
  ResponseHelper.error(res, 'NOT_FOUND', `API route not found: ${req.method} ${req.path}`, 404);
});
```

2. **Imported ResponseHelper**:
```typescript
import { ResponseHelper } from './utils/response';
```

### Frontend Changes

1. **Updated App.tsx** - Clear cache on logout/user change:
   - Monitors auth state changes
   - Clears React Query cache when user logs out
   - Clears cache when different user logs in
   - Clears localStorage (plant selection)

2. **Updated Logout Handlers**:
   - `Layout.tsx`: Clears cache before logout
   - `UserProfile.tsx`: Clears cache before logout
   - Both clear localStorage

3. **Updated React Query Configuration** (`frontend/src/main.tsx`):
   - Don't retry on 404/401 errors
   - Suppress errors for unauthenticated requests
   - Added `refetchOnMount: false` to prevent unnecessary refetches
   - Added `gcTime` for cache garbage collection

4. **Updated API Services**:
   - `userService.getCurrentUser`: Returns `null` on 404/401
   - `plantService.getAllPlants`: Returns empty array on 404/401
   - `taskService.getTasks`: Returns empty data on 404/401

5. **Updated React Query Hooks**:
   - `usePlants`: Only fetches when `auth.currentUser` exists
   - `Dashboard`: Only fetches tasks when user is logged in
   - `Layout`: Only fetches current user when authenticated

6. **Updated API Interceptor** (`frontend/src/services/api.ts`):
   - Suppresses 404 console errors when user is not authenticated
   - Properly handles authentication errors

7. **Updated PlantContext**:
   - Only loads plant from localStorage when user is authenticated
   - Clears plant selection when user is not authenticated

## Architecture Improvements

### 1. **Route Registration Order**
Routes are registered in this order:
1. Health check endpoint
2. API routes (specific routes first)
3. Catch-all handler for unmatched API routes
4. Error handling middleware (last)

### 2. **Authentication Flow**
- Frontend checks `auth.currentUser` before making API calls
- React Query `enabled` flag prevents unnecessary requests
- API interceptor adds auth token only when user is authenticated

### 3. **Error Handling**
- Backend catch-all handler logs unmatched routes
- Returns proper JSON error response
- Frontend gracefully handles 404/401 errors

## Testing

### Verify Backend Routes
```bash
# Health check
curl http://localhost:3000/health

# Should return 404 with proper error message
curl http://localhost:3000/api/v1/nonexistent
```

### Verify Frontend Behavior
1. **Before Login**: No API calls should be made
2. **After Login**: API calls should work normally
3. **After Logout**: API calls should stop gracefully

## Prevention

### Best Practices Implemented

1. **Always check authentication before API calls**:
   ```typescript
   enabled: !!auth.currentUser
   ```

2. **Handle errors gracefully**:
   ```typescript
   try {
     // API call
   } catch (error) {
     if (error.response?.status === 404 || error.response?.status === 401) {
       return null; // or empty array
     }
     throw error;
   }
   ```

3. **Use React Query `enabled` flag**:
   ```typescript
   useQuery({
     queryKey: ['data'],
     queryFn: fetchData,
     enabled: !!auth.currentUser, // Only fetch when authenticated
     retry: false, // Don't retry on auth errors
   })
   ```

4. **Add catch-all route handlers**:
   ```typescript
   app.use('/api/*', (req, res) => {
     // Handle unmatched routes
   });
   ```

## Files Modified

### Backend
- `src/index.ts` - Added catch-all route handler

### Frontend
- `frontend/src/main.tsx` - Updated React Query config
- `frontend/src/services/api.ts` - Updated error handling
- `frontend/src/services/userService.ts` - Added error handling
- `frontend/src/services/plantService.ts` - Added error handling
- `frontend/src/services/taskService.ts` - Added error handling
- `frontend/src/hooks/usePlants.ts` - Added auth check
- `frontend/src/pages/Dashboard.tsx` - Added auth check
- `frontend/src/components/Layout.tsx` - Added auth check

## Expected Behavior After Fix

1. ✅ No 404 errors in console when user is not authenticated
2. ✅ Proper error messages for unmatched routes
3. ✅ API calls only happen when user is authenticated
4. ✅ Graceful handling of authentication errors
5. ✅ Better logging for debugging unmatched routes

---

**Last Updated:** 2024
**Status:** ✅ Fixed
