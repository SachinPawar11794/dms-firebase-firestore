# Tasks Module Architecture

## Overview

The Tasks Module is designed as a **self-contained, isolated module** that can be developed and modified without affecting other parts of the application. This document explains the architecture and best practices.

## Module Structure

```
frontend/src/
├── pages/
│   └── Tasks/
│       ├── Tasks.tsx          # Main Tasks page (tab container)
│       ├── TaskMasters.tsx    # Task Masters management
│       └── MyTasks.tsx        # User's assigned tasks
├── components/
│   └── tasks/
│       └── TaskMasterForm.tsx # Reusable form component
└── services/
    ├── taskMasterService.ts   # Task Master API calls
    └── taskInstanceService.ts # Task Instance API calls
```

## Isolation Strategy

### 1. **Error Boundaries**

Each module is wrapped in an `ErrorBoundary` component to prevent errors from crashing the entire app:

```tsx
<Route path="tasks" element={
  <ErrorBoundary moduleName="Tasks">
    <Tasks />
  </ErrorBoundary>
} />
```

**Benefits:**
- Errors in Tasks module don't crash other modules
- Users can continue using other parts of the app
- Clear error messages specific to the module

### 2. **Route-Based Code Splitting**

Routes are defined separately, allowing for:
- Lazy loading (future enhancement)
- Independent module development
- Better code organization

### 3. **Service Layer Isolation**

Task-related API calls are isolated in:
- `taskMasterService.ts` - Task Master operations
- `taskInstanceService.ts` - Task Instance operations

**Benefits:**
- Changes to task API don't affect other modules
- Easy to test and mock
- Clear separation of concerns

### 4. **Component Isolation**

Task components are in their own directory:
- `pages/Tasks/` - Task pages
- `components/tasks/` - Task-specific components

**Benefits:**
- Easy to find and modify task-related code
- Clear module boundaries
- Reduced risk of accidental changes to other modules

## Why the Entire App Stops

### Current Issues

1. **No Error Boundaries (Before Fix)**
   - Any error in a component crashes the entire app
   - React unmounts the entire component tree
   - User loses all state and must refresh

2. **Shared State**
   - Some state is shared across modules (e.g., `PlantContext`)
   - Errors in shared contexts affect all modules

3. **Hot Module Replacement (HMR)**
   - Vite's HMR can cause full reloads on syntax errors
   - Type errors can prevent compilation

### Solutions Implemented

1. **Error Boundaries Added**
   - Each route wrapped in `ErrorBoundary`
   - Errors are caught and displayed within the module
   - Other modules continue to work

2. **Better Error Handling**
   - Try-catch blocks in critical functions
   - Graceful error messages
   - Development error details

3. **Module-Specific Error Messages**
   - Clear indication of which module failed
   - "Try Again" button to reset error state
   - Development mode shows stack traces

## Best Practices for Module Development

### 1. **Keep Components Self-Contained**

```tsx
// ✅ Good: Self-contained component
const TaskMasters = () => {
  // All state and logic here
  // No dependencies on other modules
};

// ❌ Bad: Tightly coupled
const TaskMasters = () => {
  // Directly accessing other module's state
  const productionData = useProductions(); // Don't do this
};
```

### 2. **Use Error Boundaries**

```tsx
// ✅ Good: Wrap in ErrorBoundary
<ErrorBoundary moduleName="Tasks">
  <Tasks />
</ErrorBoundary>

// ❌ Bad: No error handling
<Tasks /> // Crashes entire app on error
```

### 3. **Isolate API Calls**

```tsx
// ✅ Good: Module-specific service
import { taskMasterService } from '../../services/taskMasterService';

// ❌ Bad: Direct API calls in component
const response = await fetch('/api/task-masters'); // Hard to test
```

### 4. **Use TypeScript Interfaces**

```tsx
// ✅ Good: Clear type definitions
interface TaskMaster {
  id: string;
  title: string;
  // ...
}

// ❌ Bad: Using 'any'
const taskMaster: any = { ... };
```

### 5. **Handle Loading and Error States**

```tsx
// ✅ Good: Proper state handling
if (isLoading) return <Loading />;
if (error) return <ErrorDisplay error={error} />;
return <TaskList data={data} />;

// ❌ Bad: No error handling
return <TaskList data={data} />; // Crashes if data is undefined
```

## Module Communication

### Allowed Communication

1. **Shared Contexts** (Read-Only)
   - `PlantContext` - Plant selection
   - `UserContext` - Current user (via `useQuery`)

2. **Shared Services** (Read-Only)
   - `userService` - User information
   - `plantService` - Plant information

3. **Navigation**
   - Use `react-router-dom` for navigation
   - Don't directly import other module components

### Avoided Communication

1. **Direct Component Imports**
   ```tsx
   // ❌ Don't do this
   import Dashboard from '../Dashboard';
   ```

2. **Shared State Management**
   ```tsx
   // ❌ Don't share state between modules
   const [sharedState, setSharedState] = useState();
   ```

3. **Cross-Module Dependencies**
   ```tsx
   // ❌ Don't depend on other modules
   import { useProductions } from '../Productions';
   ```

## Development Workflow

### When Modifying Tasks Module

1. **Work in Isolation**
   - Focus on `frontend/src/pages/Tasks/` directory
   - Modify only task-related components
   - Test in isolation

2. **Error Handling**
   - Add try-catch blocks
   - Handle loading states
   - Provide user-friendly error messages

3. **Testing**
   - Test the Tasks module independently
   - Verify other modules still work
   - Check error boundaries

### Hot Module Replacement (HMR)

Vite's HMR should work for:
- ✅ Component changes (styles, JSX)
- ✅ State changes
- ✅ Function updates

HMR may fail for:
- ❌ Syntax errors (prevents compilation)
- ❌ Type errors (in strict mode)
- ❌ Import errors (missing files)

**Solution:** Fix errors immediately to restore HMR.

## Error Recovery

### Automatic Recovery

1. **Error Boundary Reset**
   - Click "Try Again" button
   - Component re-renders
   - State is preserved (if using React Query)

2. **Page Refresh**
   - Full page reload
   - All state is lost
   - Last resort

### Development Mode

- Error boundaries show detailed stack traces
- Console shows full error information
- Source maps available for debugging

## Future Improvements

### 1. **Lazy Loading**

```tsx
// Future: Load modules on demand
const Tasks = lazy(() => import('./pages/Tasks'));

<Route path="tasks" element={
  <Suspense fallback={<Loading />}>
    <ErrorBoundary moduleName="Tasks">
      <Tasks />
    </ErrorBoundary>
  </Suspense>
} />
```

**Benefits:**
- Faster initial load
- Smaller bundle size
- Better code splitting

### 2. **Module-Specific State Management**

```tsx
// Future: Module-specific context
const TasksProvider = ({ children }) => {
  // Tasks-specific state
  return <TasksContext.Provider>{children}</TasksContext.Provider>;
};
```

### 3. **Module Testing**

```tsx
// Future: Isolated module tests
describe('Tasks Module', () => {
  it('should render without errors', () => {
    render(
      <ErrorBoundary>
        <Tasks />
      </ErrorBoundary>
    );
  });
});
```

## Summary

**Current Architecture:**
- ✅ Error boundaries isolate module errors
- ✅ Route-based module separation
- ✅ Service layer isolation
- ✅ Component directory structure

**When Modifying Tasks Module:**
- ✅ Only affects Tasks module
- ✅ Errors don't crash other modules
- ✅ Clear error messages
- ✅ Easy to test and debug

**Best Practices:**
- ✅ Keep components self-contained
- ✅ Use error boundaries
- ✅ Isolate API calls
- ✅ Handle loading/error states
- ✅ Avoid cross-module dependencies

The Tasks Module is now properly isolated and can be modified without affecting other parts of the application.
