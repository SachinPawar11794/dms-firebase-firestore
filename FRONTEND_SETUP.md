# Frontend Setup Guide

Guide for setting up a frontend application to connect to the DMS Firebase Firestore API.

## Quick Start

### React + TypeScript (Recommended)

```bash
# Create React app
npx create-react-app dms-frontend --template typescript
cd dms-frontend

# Install Firebase SDK
npm install firebase axios

# Install additional dependencies
npm install react-router-dom @tanstack/react-query
```

### Vue.js

```bash
npm create vue@latest dms-frontend
cd dms-frontend
npm install firebase axios vue-router
```

### Angular

```bash
ng new dms-frontend
cd dms-frontend
npm install firebase axios
```

---

## Firebase Configuration

### 1. Create Firebase Config File

Create `src/config/firebase.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
```

### 2. Environment Variables

Create `.env` file:

```env
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
REACT_APP_API_BASE_URL=http://localhost:3000
```

---

## API Client Setup

### Create API Client

Create `src/services/api.ts`:

```typescript
import axios from 'axios';
import { auth } from '../config/firebase';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

---

## Authentication

### Login Component Example

```typescript
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';

const login = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();
    return { user: userCredential.user, token };
  } catch (error) {
    throw error;
  }
};
```

---

## API Service Examples

### User Service

```typescript
import apiClient from './api';

export const userService = {
  getCurrentUser: async () => {
    const response = await apiClient.get('/api/v1/users/me');
    return response.data;
  },

  getAllUsers: async (page = 1, limit = 50) => {
    const response = await apiClient.get('/api/v1/users', {
      params: { page, limit },
    });
    return response.data;
  },
};
```

### Task Service

```typescript
import apiClient from './api';

export const taskService = {
  getTasks: async (filters?: any) => {
    const response = await apiClient.get('/api/v1/employee-task-manager/tasks', {
      params: filters,
    });
    return response.data;
  },

  createTask: async (taskData: any) => {
    const response = await apiClient.post('/api/v1/employee-task-manager/tasks', taskData);
    return response.data;
  },

  updateTask: async (id: string, taskData: any) => {
    const response = await apiClient.put(`/api/v1/employee-task-manager/tasks/${id}`, taskData);
    return response.data;
  },
};
```

---

## Error Handling

### Error Handler Utility

```typescript
export const handleApiError = (error: any) => {
  if (error.response) {
    // Server responded with error
    const { code, message } = error.response.data.error || {};
    return { code, message };
  } else if (error.request) {
    // Request made but no response
    return { code: 'NETWORK_ERROR', message: 'Network error. Please check your connection.' };
  } else {
    // Something else happened
    return { code: 'UNKNOWN_ERROR', message: error.message };
  }
};
```

---

## State Management

### Using React Query (Recommended)

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { taskService } from '../services/taskService';

// Fetch tasks
const useTasks = (filters?: any) => {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => taskService.getTasks(filters),
  });
};

// Create task
const useCreateTask = () => {
  return useMutation({
    mutationFn: taskService.createTask,
    onSuccess: () => {
      // Invalidate tasks query to refetch
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};
```

---

## Routing

### Protected Routes

```typescript
import { Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './config/firebase';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [user, loading] = useAuthState(auth);

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  return <>{children}</>;
};
```

---

## Best Practices

1. **Token Management:**
   - Store tokens securely
   - Handle token refresh
   - Clear tokens on logout

2. **Error Handling:**
   - Show user-friendly error messages
   - Log errors for debugging
   - Handle network errors gracefully

3. **Loading States:**
   - Show loading indicators
   - Use skeleton screens
   - Optimistic updates

4. **Caching:**
   - Cache API responses
   - Use React Query or similar
   - Implement offline support

5. **Security:**
   - Never expose API keys
   - Use environment variables
   - Validate all inputs
   - Sanitize outputs

---

## Example Project Structure

```
src/
├── components/
│   ├── common/
│   ├── tasks/
│   ├── employees/
│   └── ...
├── services/
│   ├── api.ts
│   ├── authService.ts
│   ├── taskService.ts
│   └── ...
├── hooks/
│   ├── useAuth.ts
│   ├── useTasks.ts
│   └── ...
├── config/
│   └── firebase.ts
├── utils/
│   └── errorHandler.ts
└── App.tsx
```

---

## Testing

### API Mocking

```typescript
// Use MSW (Mock Service Worker) for API mocking
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/v1/users/me', (req, res, ctx) => {
    return res(ctx.json({ success: true, data: mockUser }));
  }),
];
```

---

## Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Firebase Hosting

```bash
firebase init hosting
firebase deploy --only hosting
```

---

## Resources

- [Firebase Web SDK Documentation](https://firebase.google.com/docs/web)
- [React Query Documentation](https://tanstack.com/query/latest)
- [API Documentation](./API_DOCUMENTATION.md)
