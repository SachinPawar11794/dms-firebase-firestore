# Setup Guide

This guide will help you set up and run the DMS Firebase Firestore application.

## Prerequisites

1. **Node.js** (v18 or higher)
   - Download from [nodejs.org](https://nodejs.org/)

2. **Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

3. **Firebase Project**
   - Create a new project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Firestore Database
   - Enable Authentication (Email/Password or other providers)

4. **Service Account Key**
   - Go to Firebase Console > Project Settings > Service Accounts
   - Generate a new private key
   - Save it securely (e.g., `serviceAccountKey.json`)

## Installation Steps

### 1. Clone and Install Dependencies

```bash
# Install root dependencies
npm install

# Install functions dependencies
cd functions
npm install
cd ..
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id

# Service Account (path to service account key file)
FIREBASE_SERVICE_ACCOUNT_KEY=./serviceAccountKey.json

# Or use individual service account fields:
# FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
# FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Environment
NODE_ENV=development
PORT=3000

# Logging
LOG_LEVEL=info
```

### 3. Initialize Firebase

```bash
firebase login
firebase init
```

During initialization:
- Select Firestore, Functions, and Hosting (if needed)
- Use existing project or create new one
- Follow the prompts

### 4. Deploy Firestore Rules and Indexes

```bash
# Deploy security rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes
```

### 5. Build the Project

```bash
npm run build
```

### 6. Create Logs Directory

```bash
mkdir logs
```

## Running the Application

### Development Mode

```bash
npm run dev
```

The server will start on `http://localhost:3000`

### Production Mode

```bash
npm run build
npm start
```

## API Endpoints

### Authentication
All endpoints (except `/health`) require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <firebase-id-token>
```

### Base URL
```
http://localhost:3000/api/v1
```

### Available Endpoints

#### Health Check
- `GET /health` - Check server status

#### Users
- `GET /users/me` - Get current user
- `GET /users` - Get all users (requires HR read permission)
- `GET /users/:id` - Get user by ID
- `POST /users` - Create user (requires HR write permission)
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `PUT /users/:id/permissions` - Update user permissions

#### Employee Task Manager
- `GET /employee-task-manager/tasks` - Get all tasks
- `GET /employee-task-manager/tasks/:id` - Get task by ID
- `POST /employee-task-manager/tasks` - Create task
- `PUT /employee-task-manager/tasks/:id` - Update task
- `PATCH /employee-task-manager/tasks/:id/status` - Update task status
- `DELETE /employee-task-manager/tasks/:id` - Delete task

#### Production Management System (PMS)
- `GET /pms/productions` - Get all productions
- `GET /pms/productions/:id` - Get production by ID
- `POST /pms/productions` - Create production
- `PUT /pms/productions/:id` - Update production
- `DELETE /pms/productions/:id` - Delete production

#### Human Resource
- `GET /human-resource/employees` - Get all employees
- `GET /human-resource/employees/:id` - Get employee by ID
- `POST /human-resource/employees` - Create employee
- `PUT /human-resource/employees/:id` - Update employee
- `DELETE /human-resource/employees/:id` - Delete employee
- `POST /human-resource/employees/attendance` - Create attendance record
- `GET /human-resource/employees/attendance/:employeeId` - Get attendance records

#### Maintenance
- `GET /maintenance/requests` - Get all maintenance requests
- `GET /maintenance/requests/:id` - Get maintenance request by ID
- `POST /maintenance/requests` - Create maintenance request
- `PUT /maintenance/requests/:id` - Update maintenance request
- `DELETE /maintenance/requests/:id` - Delete maintenance request
- `GET /maintenance/equipment` - Get all equipment
- `GET /maintenance/equipment/:id` - Get equipment by ID
- `POST /maintenance/equipment` - Create equipment
- `PUT /maintenance/equipment/:id` - Update equipment
- `DELETE /maintenance/equipment/:id` - Delete equipment

## Setting Up Initial User

To create the first admin user, you'll need to:

1. Create a user in Firebase Authentication (via Firebase Console or Admin SDK)
2. Create a corresponding user document in Firestore with admin permissions

Example using Firebase Admin SDK:

```typescript
import { auth, db } from './src/config/firebase.config';
import { Timestamp } from 'firebase-admin/firestore';

// Create auth user
const userRecord = await auth.createUser({
  email: 'admin@example.com',
  password: 'secure-password',
  displayName: 'Admin User',
});

// Create user document with admin permissions
await db.collection('users').doc(userRecord.uid).set({
  email: 'admin@example.com',
  displayName: 'Admin User',
  role: 'admin',
  modulePermissions: {
    employeeTaskManager: ['read', 'write', 'delete', 'admin'],
    pms: ['read', 'write', 'delete', 'admin'],
    humanResource: ['read', 'write', 'delete', 'admin'],
    maintenance: ['read', 'write', 'delete', 'admin'],
  },
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
  isActive: true,
});
```

## Testing

Run tests (when implemented):
```bash
npm test
```

## Deployment

### Deploy Firestore Rules
```bash
npm run deploy:rules
```

### Deploy Firebase Functions
```bash
npm run deploy:functions
```

### Deploy Everything
```bash
firebase deploy
```

## Troubleshooting

### Common Issues

1. **Firebase Admin SDK Error**
   - Ensure service account key is correctly configured
   - Check that FIREBASE_PROJECT_ID matches your project

2. **Permission Denied Errors**
   - Verify Firestore security rules are deployed
   - Check user permissions in Firestore

3. **Port Already in Use**
   - Change PORT in .env file
   - Or kill the process using the port

4. **Module Not Found**
   - Run `npm install` again
   - Check that all dependencies are installed

## Next Steps

1. Set up your first admin user
2. Configure additional modules as needed
3. Customize permissions for your organization
4. Set up monitoring and logging
5. Configure CI/CD pipeline

## Support

For issues or questions, refer to:
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture documentation
- [README.md](./README.md) - Project overview
