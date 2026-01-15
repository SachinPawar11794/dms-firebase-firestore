# API Documentation

Complete API documentation for the DMS Firebase Firestore application.

## Base URL

```
Development: http://localhost:3000
Production: https://your-domain.com
```

## Authentication

All endpoints (except `/health`) require authentication via Firebase ID token.

### How to Get a Token

1. **Using Firebase Web SDK:**
   ```javascript
   import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
   
   const auth = getAuth();
   const userCredential = await signInWithEmailAndPassword(auth, email, password);
   const token = await userCredential.user.getIdToken();
   ```

2. **Using the API Test Script:**
   ```bash
   npm run test-api <email> <password>
   ```

### Headers

```
Authorization: Bearer <firebase-id-token>
Content-Type: application/json
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "pagination": { ... } // if applicable
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": { ... }
  }
}
```

### Pagination
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "totalPages": 2
  }
}
```

---

## Endpoints

### Health Check

#### `GET /health`
Check server status (no authentication required).

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-12T13:48:27.693Z"
}
```

---

### Users

#### `GET /api/v1/users/me`
Get current authenticated user.

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "email": "user@example.com",
    "displayName": "User Name",
    "role": "admin",
    "modulePermissions": { ... },
    "isActive": true
  }
}
```

#### `GET /api/v1/users`
Get all users (requires HR read permission).

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)

**Response:**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": { ... }
}
```

#### `GET /api/v1/users/:id`
Get user by ID.

#### `POST /api/v1/users`
Create new user (requires HR write permission).

**Body:**
```json
{
  "email": "user@example.com",
  "displayName": "User Name",
  "role": "employee"
}
```

#### `PUT /api/v1/users/:id`
Update user (requires HR write permission).

#### `DELETE /api/v1/users/:id`
Delete user (requires HR delete permission).

#### `PUT /api/v1/users/:id/permissions`
Update user module permissions.

**Body:**
```json
{
  "module": "employeeTaskManager",
  "permissions": ["read", "write"]
}
```

---

### Employee Task Manager

#### `GET /api/v1/employee-task-manager/tasks`
Get all tasks.

**Query Parameters:**
- `page`, `limit`: Pagination
- `status`: Filter by status (pending, in-progress, completed, cancelled)
- `priority`: Filter by priority (low, medium, high, urgent)
- `assignedTo`: Filter by assignee user ID
- `assignedBy`: Filter by assigner user ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "task-id",
      "title": "Task Title",
      "description": "Task description",
      "assignedTo": "user-id",
      "assignedBy": "user-id",
      "status": "pending",
      "priority": "high",
      "dueDate": "2024-12-31T23:59:59Z",
      "createdAt": "2024-01-12T13:48:27.693Z"
    }
  ],
  "pagination": { ... }
}
```

#### `GET /api/v1/employee-task-manager/tasks/:id`
Get task by ID.

#### `POST /api/v1/employee-task-manager/tasks`
Create new task (requires write permission).

**Body:**
```json
{
  "title": "Task Title",
  "description": "Task description",
  "assignedTo": "user-id",
  "assignedBy": "user-id",
  "priority": "high",
  "dueDate": "2024-12-31T23:59:59Z",
  "tags": ["urgent", "important"]
}
```

#### `PUT /api/v1/employee-task-manager/tasks/:id`
Update task (requires write permission).

#### `PATCH /api/v1/employee-task-manager/tasks/:id/status`
Update task status.

**Body:**
```json
{
  "status": "in-progress"
}
```

#### `DELETE /api/v1/employee-task-manager/tasks/:id`
Delete task (requires delete permission).

---

### Production Management System (PMS)

#### `GET /api/v1/pms/productions`
Get all productions.

**Query Parameters:**
- `page`, `limit`: Pagination

#### `GET /api/v1/pms/productions/:id`
Get production by ID.

#### `POST /api/v1/pms/productions`
Create new production (requires write permission).

**Body:**
```json
{
  "productName": "Product Name",
  "quantity": 100,
  "unit": "pieces",
  "productionDate": "2024-12-31T00:00:00Z",
  "assignedTeam": ["user-id-1", "user-id-2"],
  "notes": "Production notes"
}
```

#### `PUT /api/v1/pms/productions/:id`
Update production.

#### `DELETE /api/v1/pms/productions/:id`
Delete production.

---

### Human Resource

#### `GET /api/v1/human-resource/employees`
Get all employees.

**Query Parameters:**
- `page`, `limit`: Pagination

#### `GET /api/v1/human-resource/employees/:id`
Get employee by ID.

#### `POST /api/v1/human-resource/employees`
Create new employee (requires write permission).

**Body:**
```json
{
  "employeeId": "EMP001",
  "personalInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    },
    "dateOfBirth": "1990-01-01T00:00:00Z"
  },
  "employmentInfo": {
    "department": "Engineering",
    "position": "Software Engineer",
    "hireDate": "2024-01-01T00:00:00Z",
    "salary": 75000,
    "employmentType": "full-time"
  }
}
```

#### `POST /api/v1/human-resource/employees/attendance`
Create attendance record.

**Body:**
```json
{
  "employeeId": "employee-id",
  "date": "2024-01-15T00:00:00Z",
  "checkIn": "2024-01-15T09:00:00Z",
  "checkOut": "2024-01-15T17:00:00Z",
  "status": "present"
}
```

#### `GET /api/v1/human-resource/employees/attendance/:employeeId`
Get attendance records for an employee.

---

### Maintenance

#### `GET /api/v1/maintenance/requests`
Get all maintenance requests.

#### `GET /api/v1/maintenance/requests/:id`
Get maintenance request by ID.

#### `POST /api/v1/maintenance/requests`
Create maintenance request (requires write permission).

**Body:**
```json
{
  "title": "Repair conveyor belt",
  "description": "Conveyor belt is making unusual noise",
  "equipmentId": "equipment-id",
  "equipmentName": "Conveyor Belt #3",
  "priority": "high",
  "scheduledDate": "2024-01-20T10:00:00Z",
  "notes": "Urgent repair needed"
}
```

#### `GET /api/v1/maintenance/equipment`
Get all equipment.

#### `POST /api/v1/maintenance/equipment`
Create equipment record.

**Body:**
```json
{
  "name": "Conveyor Belt #3",
  "type": "Conveyor System",
  "serialNumber": "CB-2024-003",
  "location": "Production Floor A",
  "warrantyExpiry": "2025-12-31T00:00:00Z"
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `AUTH_REQUIRED` | Authentication token required |
| `INVALID_TOKEN` | Invalid or expired token |
| `PERMISSION_DENIED` | Insufficient permissions |
| `VALIDATION_ERROR` | Input validation failed |
| `NOT_FOUND` | Resource not found |
| `INTERNAL_ERROR` | Server error |

---

## Rate Limiting

Currently, no rate limiting is implemented. Consider implementing rate limiting for production use.

---

## Best Practices

1. **Always include Authorization header** for authenticated endpoints
2. **Handle errors gracefully** - check `success` field in response
3. **Use pagination** for list endpoints to avoid large responses
4. **Validate input** before sending requests
5. **Cache tokens** - Firebase ID tokens expire after 1 hour
6. **Use HTTPS** in production
7. **Implement retry logic** for failed requests

---

## Testing

Use the provided test script:

```bash
npm run test-api <email> <password>
```

Or use Postman with the `API_COLLECTION.json` file.

---

## Support

For issues or questions, refer to:
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture documentation
- [SETUP.md](./SETUP.md) - Setup guide
