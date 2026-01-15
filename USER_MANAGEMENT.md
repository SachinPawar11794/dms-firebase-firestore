# User Management Guide

Complete guide on how to add and manage users in the DMS system.

## Methods to Add Users

### Method 1: Firebase Console (Easiest - Manual)

**Step 1: Create User in Firebase Authentication**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `dhananjaygroup-dms`
3. Click **Authentication** → **Users** tab
4. Click **"Add user"** button
5. Enter:
   - **Email**: user@example.com
   - **Password**: (choose a secure password)
   - (Optional) Uncheck "Send email verification" for immediate access
6. Click **"Add user"**
7. **Copy the User UID** (you'll need this for Step 2)

**Step 2: Create User Document in Firestore**

1. In Firebase Console, go to **Firestore Database**
2. Click **"Start collection"** or use existing `users` collection
3. **Collection ID**: `users`
4. **Document ID**: Paste the User UID from Step 1
5. Add these fields:

| Field Name | Type | Value |
|------------|------|-------|
| `email` | string | user@example.com |
| `displayName` | string | User Full Name |
| `role` | string | employee (or manager, admin) |
| `modulePermissions` | map | (see below) |
| `createdAt` | timestamp | Current timestamp |
| `updatedAt` | timestamp | Current timestamp |
| `isActive` | boolean | true |

**For `modulePermissions` (map type):**
- Click "Add field" → Field name: `employeeTaskManager` → Type: array → Add: `read`, `write`
- Click "Add field" → Field name: `pms` → Type: array → Add: `read`
- Click "Add field" → Field name: `humanResource` → Type: array → Add: `read`
- Click "Add field" → Field name: `maintenance` → Type: array → Add: `read`

---

### Method 2: Using Script (Automated)

**Option A: Create Firestore Document Only (if Auth user exists)**

```powershell
npm run create-firestore-user <UID> <email> "<displayName>"
```

Example:
```powershell
npm run create-firestore-user abc123xyz user@example.com "John Doe"
```

**Option B: Create Both Auth User and Firestore Document**

```powershell
npm run create-firestore-user -- --create-auth <email> <password> "<displayName>"
```

Example:
```powershell
npm run create-firestore-user -- --create-auth user@example.com SecurePass123 "John Doe"
```

**Note:** This requires service account permissions. If it fails, use Method 1.

---

### Method 3: Using API (Programmatic)

**Step 1: Create Auth User via Firebase Admin SDK**

You can create a script or use the API if you have admin permissions.

**Step 2: Create User via API**

```bash
POST /api/v1/users
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "email": "user@example.com",
  "displayName": "John Doe",
  "role": "employee",
  "modulePermissions": {
    "employeeTaskManager": ["read", "write"],
    "pms": ["read"],
    "humanResource": ["read"],
    "maintenance": ["read"]
  }
}
```

---

### Method 4: Frontend User Management (Recommended for Production)

I can create a user management interface in the frontend. This would allow admins to:
- Add new users
- Edit user permissions
- Deactivate users
- View all users

Would you like me to create this?

---

## Default Permissions by Role

### Admin
```json
{
  "employeeTaskManager": ["read", "write", "delete", "admin"],
  "pms": ["read", "write", "delete", "admin"],
  "humanResource": ["read", "write", "delete", "admin"],
  "maintenance": ["read", "write", "delete", "admin"]
}
```

### Manager
```json
{
  "employeeTaskManager": ["read", "write"],
  "pms": ["read", "write"],
  "humanResource": ["read", "write"],
  "maintenance": ["read", "write"]
}
```

### Employee
```json
{
  "employeeTaskManager": ["read"],
  "pms": ["read"],
  "humanResource": ["read"],
  "maintenance": ["read"]
}
```

### Guest
```json
{
  "employeeTaskManager": [],
  "pms": [],
  "humanResource": [],
  "maintenance": []
}
```

---

## Quick Reference

### Add Employee User

1. **Firebase Console** → Authentication → Add user
2. Copy UID
3. **Firebase Console** → Firestore → `users` collection
4. Create document with UID
5. Set role: `employee`
6. Set permissions: read-only for all modules

### Add Manager User

Same as above, but:
- Set role: `manager`
- Set permissions: read + write for all modules

### Add Admin User

Same as above, but:
- Set role: `admin`
- Set permissions: full access (read, write, delete, admin)

---

## Bulk User Creation

For adding multiple users, you can:

1. **Create a script** that reads from a CSV/Excel file
2. **Use Firebase Admin SDK** to create users programmatically
3. **Use the API** with a batch script

Would you like me to create a bulk user creation script?

---

## User Management Best Practices

1. **Always create Auth user first**, then Firestore document
2. **Use strong passwords** (minimum 8 characters)
3. **Set appropriate permissions** based on role
4. **Verify user can login** after creation
5. **Document user roles** and permissions
6. **Regular audit** of user permissions
7. **Deactivate instead of delete** when removing access

---

## Troubleshooting

### User can't login
- Verify user exists in Firebase Authentication
- Check password is correct
- Ensure Email/Password auth is enabled

### Permission denied errors
- Check `modulePermissions` in Firestore
- Verify user role is set correctly
- Check Firestore security rules

### User not found errors
- Verify user document exists in Firestore
- Check document ID matches Auth UID
- Ensure `isActive` is set to `true`

---

## Next Steps

1. **Create user management UI** in frontend (recommended)
2. **Bulk import script** for multiple users
3. **User invitation system** with email
4. **Role templates** for quick setup

Let me know which method you prefer or if you'd like me to create a user management interface!
