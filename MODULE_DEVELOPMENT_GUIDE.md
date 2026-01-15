# Module Development Guide

## ⚠️ CRITICAL: Read This Before Creating Any New Module

This guide outlines the **mandatory requirements** for developing new modules in the DMS application. Following these patterns ensures that:
- ✅ Errors in one module don't crash the entire application
- ✅ Modules can be developed and modified independently
- ✅ Users can continue using other modules when one fails
- ✅ Development is faster and safer

## Quick Reference Checklist

Before creating a new module, ensure you:

- [ ] Read the **Frontend Module Isolation** section in `ARCHITECTURE.md`
- [ ] Review `TASKS_MODULE_ARCHITECTURE.md` as a reference example
- [ ] Understand Error Boundaries and why they're mandatory
- [ ] Plan your module structure following the directory pattern
- [ ] Set up module-specific service layer
- [ ] Wrap your route in ErrorBoundary in `App.tsx`

## Step-by-Step Module Creation

### Step 1: Plan Your Module Structure

```
frontend/src/
├── pages/
│   └── [YourModule]/
│       ├── [YourModule].tsx      # Main page
│       └── [SubPages].tsx        # If needed
├── components/
│   └── [your-module]/
│       └── [Components].tsx      # Module-specific components
└── services/
    └── [yourModule]Service.ts    # API service
```

**Example:**
- Module: "Inventory"
- Directory: `pages/Inventory/`
- Components: `components/inventory/`
- Service: `services/inventoryService.ts`

### Step 2: Create Module Service

Create a service file in `frontend/src/services/`:

```typescript
// frontend/src/services/inventoryService.ts
import apiClient from './api';

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  plantId?: string;
  // ... other fields
}

export interface CreateInventoryItemDto {
  name: string;
  quantity: number;
  plantId?: string;
}

export const inventoryService = {
  getItems: (params?: { plantId?: string }) =>
    apiClient.get('/api/v1/inventory/items', { params }),
  
  getItemById: (id: string) =>
    apiClient.get(`/api/v1/inventory/items/${id}`),
  
  createItem: (data: CreateInventoryItemDto) =>
    apiClient.post('/api/v1/inventory/items', data),
  
  updateItem: (id: string, data: Partial<CreateInventoryItemDto>) =>
    apiClient.put(`/api/v1/inventory/items/${id}`, data),
  
  deleteItem: (id: string) =>
    apiClient.delete(`/api/v1/inventory/items/${id}`),
};
```

### Step 3: Create Module Page

Create the main module page:

```typescript
// frontend/src/pages/Inventory/Inventory.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { usePlant } from '../../contexts/PlantContext';
import { inventoryService, InventoryItem } from '../../services/inventoryService';
import Loading from '../../components/Loading';

const Inventory = () => {
  const { selectedPlant } = usePlant();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  // Data fetching with error handling
  const { data, isLoading, error } = useQuery({
    queryKey: ['inventoryItems', { plantId: selectedPlant?.id, page }],
    queryFn: () => inventoryService.getItems(
      selectedPlant ? { plantId: selectedPlant.id } : undefined
    ),
  });

  // Mutation with error handling
  const createMutation = useMutation({
    mutationFn: inventoryService.createItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventoryItems'] });
    },
  });

  // Error handling
  if (isLoading) return <Loading />;
  
  if (error) {
    return (
      <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Error Loading Inventory</h2>
        <p>{error instanceof Error ? error.message : 'An error occurred'}</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Inventory</h1>
      {/* Your module content */}
    </div>
  );
};

export default Inventory;
```

### Step 4: Add Route with ErrorBoundary

**CRITICAL: This step is MANDATORY. Do not skip it.**

Update `frontend/src/App.tsx`:

```typescript
// frontend/src/App.tsx
import ErrorBoundary from './components/ErrorBoundary';
import Inventory from './pages/Inventory/Inventory';

// ... other imports

<Route path="inventory" element={
  <ErrorBoundary moduleName="Inventory">
    <Inventory />
  </ErrorBoundary>
} />
```

### Step 5: Add Navigation (Optional)

Update `frontend/src/components/Layout.tsx` to add navigation item:

```typescript
const navItems = [
  // ... existing items
  {
    path: '/inventory',
    label: 'Inventory',
    icon: <Package size={20} />,
  },
];
```

## Error Handling Best Practices

### 1. Always Handle Loading States

```typescript
// ✅ Good
if (isLoading) return <Loading />;

// ❌ Bad
return <div>{data.map(...)}</div>; // Crashes if data is undefined
```

### 2. Always Handle Error States

```typescript
// ✅ Good
if (error) {
  return <ErrorDisplay error={error} />;
}

// ❌ Bad
return <div>{data.map(...)}</div>; // Crashes on error
```

### 3. Use Try-Catch in Async Functions

```typescript
// ✅ Good
const handleSubmit = async () => {
  try {
    await createMutation.mutateAsync(data);
    // Success handling
  } catch (error) {
    // Error handling
    console.error('Error creating item:', error);
  }
};

// ❌ Bad
const handleSubmit = async () => {
  await createMutation.mutateAsync(data); // Unhandled error
};
```

### 4. Validate Data Before Rendering

```typescript
// ✅ Good
if (!data || !Array.isArray(data)) {
  return <div>No data available</div>;
}

return <div>{data.map(...)}</div>;

// ❌ Bad
return <div>{data.map(...)}</div>; // Crashes if data is null
```

## Module Communication Rules

### ✅ Allowed

1. **Shared Contexts (Read-Only)**
   ```typescript
   const { selectedPlant } = usePlant(); // ✅ OK
   const { data: currentUser } = useQuery(...); // ✅ OK
   ```

2. **Shared Services (Read-Only)**
   ```typescript
   import { userService } from '../../services/userService'; // ✅ OK
   import { plantService } from '../../services/plantService'; // ✅ OK
   ```

3. **Navigation**
   ```typescript
   import { useNavigate } from 'react-router-dom';
   navigate('/dashboard'); // ✅ OK
   ```

### ❌ Not Allowed

1. **Direct Component Imports**
   ```typescript
   import Dashboard from '../Dashboard'; // ❌ Don't do this
   ```

2. **Shared State Between Modules**
   ```typescript
   // ❌ Don't share state
   const [sharedState, setSharedState] = useState();
   ```

3. **Cross-Module Dependencies**
   ```typescript
   import { useTasks } from '../Tasks'; // ❌ Don't do this
   ```

## Testing Your Module Isolation

After creating your module, test that it's properly isolated:

1. **Introduce an intentional error:**
   ```typescript
   const MyModule = () => {
     throw new Error('Test error'); // Intentional error
     return <div>Content</div>;
   };
   ```

2. **Verify other modules still work:**
   - Navigate to Dashboard → Should work
   - Navigate to Tasks → Should work
   - Navigate to your module → Should show error message

3. **Check error message:**
   - Should show your module name
   - Should have "Try Again" button
   - Should not crash other modules

4. **Fix the error and verify:**
   - Remove the intentional error
   - Module should work normally again

## Common Mistakes

### ❌ Mistake 1: Skipping ErrorBoundary

```typescript
// ❌ Wrong
<Route path="inventory" element={<Inventory />} />

// ✅ Correct
<Route path="inventory" element={
  <ErrorBoundary moduleName="Inventory">
    <Inventory />
  </ErrorBoundary>
} />
```

### ❌ Mistake 2: No Error Handling

```typescript
// ❌ Wrong
const { data } = useQuery(...);
return <div>{data.map(...)}</div>;

// ✅ Correct
const { data, isLoading, error } = useQuery(...);
if (isLoading) return <Loading />;
if (error) return <ErrorDisplay error={error} />;
return <div>{data.map(...)}</div>;
```

### ❌ Mistake 3: Cross-Module Dependencies

```typescript
// ❌ Wrong
import Tasks from '../Tasks/Tasks';

// ✅ Correct
// Don't import other module components
// Use navigation instead: navigate('/tasks');
```

### ❌ Mistake 4: Missing Type Definitions

```typescript
// ❌ Wrong
const data: any = await apiClient.get(...);

// ✅ Correct
const data: InventoryItem[] = await inventoryService.getItems();
```

## Module Naming Conventions

- **Directory names**: PascalCase (e.g., `Inventory`, `TaskMasters`)
- **Component names**: PascalCase (e.g., `Inventory.tsx`, `InventoryList.tsx`)
- **Service names**: camelCase with "Service" suffix (e.g., `inventoryService.ts`)
- **Route paths**: kebab-case (e.g., `/inventory`, `/task-masters`)

## Date Formatting Requirements

**⚠️ MANDATORY: All dates MUST be displayed in dd/mm/yyyy format**

### Using the Date Formatter Utility

```typescript
// ✅ Correct: Import and use the date formatter
import { formatDate, formatDateTime } from '../../utils/dateFormatter';

// Display date only
<div>{formatDate(item.createdAt)}</div> // Output: "15/01/2024"

// Display date and time
<div>{formatDateTime(item.updatedAt)}</div> // Output: "15/01/2024 14:30"
```

### Available Functions

- `formatDate(dateValue)` - Returns `dd/mm/yyyy`
- `formatDateTime(dateValue)` - Returns `dd/mm/yyyy HH:mm`
- `formatDateTimeWithSeconds(dateValue)` - Returns `dd/mm/yyyy HH:mm:ss`
- `parseDate(dateValue)` - Safely parses dates from various formats
- `getRelativeTime(dateValue)` - Returns relative time (e.g., "2 days ago")

### Common Mistakes

```typescript
// ❌ Wrong: Using locale-dependent methods
<div>{new Date(date).toLocaleDateString()}</div> // Different format per locale
<div>{new Date(date).toLocaleString()}</div> // Different format per locale

// ✅ Correct: Using the date formatter
import { formatDate } from '../../utils/dateFormatter';
<div>{formatDate(date)}</div> // Always dd/mm/yyyy
```

### Example Implementation

```typescript
import { formatDate, formatDateTime } from '../../utils/dateFormatter';

const MyModule = () => {
  const { data } = useQuery(...);
  
  return (
    <div>
      <table>
        <tr>
          <td>Created: {formatDate(item.createdAt)}</td>
          <td>Updated: {formatDateTime(item.updatedAt)}</td>
        </tr>
      </table>
    </div>
  );
};
```

## Integration with Plant Selection

If your module has plant-specific data, integrate with Plant Context:

```typescript
import { usePlant } from '../../contexts/PlantContext';

const MyModule = () => {
  const { selectedPlant } = usePlant();
  
  const { data } = useQuery({
    queryKey: ['myModuleData', { plantId: selectedPlant?.id }],
    queryFn: () => myModuleService.getData(
      selectedPlant ? { plantId: selectedPlant.id } : undefined
    ),
  });
  
  // Include plantId in query key for cache invalidation
  // Filter data based on selected plant
};
```

## Summary

**Remember:**
1. ✅ **Always wrap routes in ErrorBoundary** - This is MANDATORY
2. ✅ **Handle loading and error states** - Never assume data exists
3. ✅ **Keep modules self-contained** - No cross-module dependencies
4. ✅ **Use TypeScript interfaces** - Type safety is important
5. ✅ **Follow directory structure** - Consistency across modules
6. ✅ **Test module isolation** - Verify errors don't crash other modules

**When in doubt, refer to:**
- `TASKS_MODULE_ARCHITECTURE.md` - Complete example
- `ARCHITECTURE.md` - Frontend Module Isolation section
- `frontend/src/pages/Tasks/` - Reference implementation

**Questions?** Review the Tasks module implementation as a reference.
