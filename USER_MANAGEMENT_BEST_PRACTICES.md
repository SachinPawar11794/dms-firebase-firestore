# User Management - Best Practices Process

This document outlines the recommended process for adding and managing users in the DMS system following enterprise best practices.

## Overview

The user creation process involves two steps:
1. **Firebase Authentication** - Creates the user account for login
2. **Firestore Document** - Stores user profile, role, and permissions

---

## Recommended Process: Two-Step User Creation

### Step 1: Create User in Firebase Authentication

**Purpose:** Establish user identity and enable login capability

**Steps:**

1. **Go to Firebase Console**
   - Navigate to: https://console.firebase.google.com/
   - Select project: `dhananjaygroup-dms`
   - Click **Authentication** → **Users** tab

2. **Add New User**
   - Click **"Add user"** button
   - Enter:
     - **Email**: user@example.com (must be unique)
     - **Password**: Generate a strong password (minimum 8 characters, mix of letters, numbers, symbols)
     - **Email verification**: Uncheck for immediate access (or check to require email verification)

3. **Save User**
   - Click **"Add user"**
   - **IMPORTANT:** Copy the **User UID** (long string like `abc123xyz...`)
   - Keep this UID safe - you'll need it for Step 2

**Best Practices:**
- ✅ Use strong, unique passwords
- ✅ Document user email and UID for reference
- ✅ Consider requiring email verification for security
- ✅ Set password expiration policies if needed

---

### Step 2: Create User Document in Firestore

**Purpose:** Store user profile, role, and module permissions

**Method A: Using Script (Recommended for Efficiency)**

```powershell
npm run create-firestore-user <UID> <email> "<displayName>"
```

**Example:**
```powershell
npm run create-firestore-user QwjBZE3i1PbLKDdyETeQs94m6rl2 john@example.com "John Doe"
```

**What it does:**
- Creates user document in Firestore `users` collection
- Sets default permissions based on role (you can change role in the script or update later)
- Adds timestamps and active status

**Method B: Using Firebase Console (Manual)**

1. Go to **Firestore Database** in Firebase Console
2. Navigate to `users` collection
3. Click **"Add document"**
4. **Document ID:** Paste the User UID from Step 1
5. Add fields:

| Field | Type | Value |
|-------|------|-------|
| `email` | string | user@example.com |
| `displayName` | string | User Full Name |
| `role` | string | employee (or manager, admin, guest) |
| `modulePermissions` | map | (see permission templates below) |
| `createdAt` | timestamp | Current timestamp |
| `updatedAt` | timestamp | Current timestamp |
| `isActive` | boolean | true |

---

## Role-Based Permission Templates

### Employee (Standard User)
```json
{
  "employeeTaskManager": ["read"],
  "pms": ["read"],
  "humanResource": ["read"],
  "maintenance": ["read"]
}
```
**Use Case:** Regular employees who need to view data but not modify

### Manager (Supervisor)
```json
{
  "employeeTaskManager": ["read", "write"],
  "pms": ["read", "write"],
  "humanResource": ["read", "write"],
  "maintenance": ["read", "write"]
}
```
**Use Case:** Team leads who need to create and update records

### Admin (Full Access)
```json
{
  "employeeTaskManager": ["read", "write", "delete", "admin"],
  "pms": ["read", "write", "delete", "admin"],
  "humanResource": ["read", "write", "delete", "admin"],
  "maintenance": ["read", "write", "delete", "admin"]
}
```
**Use Case:** System administrators with full control

### Guest (Limited Access)
```json
{
  "employeeTaskManager": [],
  "pms": [],
  "humanResource": [],
  "maintenance": []
}
```
**Use Case:** Temporary or external users with no module access

---

## Complete User Creation Workflow

### For New Employee

1. **Gather Information**
   - Full name
   - Email address
   - Department
   - Job title
   - Required access level (role)

2. **Create in Firebase Auth**
   - Go to Firebase Console → Authentication
   - Add user with email and temporary password
   - Copy User UID

3. **Create Firestore Document**
   - Run script: `npm run create-firestore-user <UID> <email> "<name>"`
   - Or create manually in Firestore Console

4. **Set Permissions**
   - Go to frontend: http://localhost:5173/users
   - Find the user
   - Click Shield icon to manage permissions
   - Adjust permissions per module as needed
   - Save changes

5. **Verify Access**
   - User should be able to login
   - Test permissions by accessing different modules
   - Verify user can only access permitted modules

6. **Send Credentials**
   - Send email with:
     - Login URL
     - Email address
     - Temporary password
     - Instructions to change password (if applicable)

---

## Permission Management Best Practices

### Principle of Least Privilege
- Start with minimum required permissions
- Grant additional access only when needed
- Regularly review and audit permissions

### Module-Specific Access
- Not all users need all modules
- HR staff may only need Human Resource module
- Production staff may only need PMS module
- Grant access only to relevant modules

### Permission Levels
- **Read**: View data only
- **Write**: Create and update data
- **Delete**: Remove data
- **Admin**: Full control including user management

### Regular Audits
- Review user permissions quarterly
- Remove access for inactive users
- Update permissions when roles change
- Document permission changes

---

## User Management Checklist

### When Adding a New User

- [ ] Verify email is unique and valid
- [ ] Create strong password (or use password generator)
- [ ] Create user in Firebase Authentication
- [ ] Copy and save User UID
- [ ] Create Firestore document with correct role
- [ ] Set appropriate module permissions
- [ ] Verify user can login
- [ ] Test permissions in each module
- [ ] Document user in your records
- [ ] Send credentials securely

### When Updating User

- [ ] Verify change request is authorized
- [ ] Update Firestore document
- [ ] Adjust permissions if role changed
- [ ] Notify user of changes
- [ ] Verify changes work correctly
- [ ] Update documentation

### When Deactivating User

- [ ] Set `isActive` to `false` in Firestore
- [ ] Do NOT delete Firestore document (preserve history)
- [ ] Optionally disable Firebase Auth account
- [ ] Document reason for deactivation
- [ ] Archive user data if required

---

## Security Best Practices

### Password Policy
- Minimum 8 characters
- Mix of uppercase, lowercase, numbers, symbols
- No common passwords
- Require password change on first login (if possible)
- Implement password expiration (if needed)

### Access Control
- Never share user accounts
- One account per person
- Use role-based permissions
- Regular access reviews
- Immediate deactivation for terminated employees

### Audit Trail
- Log all permission changes
- Track user creation/deletion
- Monitor failed login attempts
- Review access logs regularly

---

## Troubleshooting

### User Can't Login
1. Verify user exists in Firebase Authentication
2. Check password is correct
3. Verify Email/Password auth is enabled
4. Check if account is disabled

### Permission Denied Errors
1. Check `modulePermissions` in Firestore
2. Verify user role is correct
3. Check Firestore security rules
4. Ensure user has required permission level

### User Not Found
1. Verify Firestore document exists
2. Check document ID matches Auth UID
3. Verify `isActive` is `true`
4. Check user wasn't deleted

---

## Quick Reference Commands

### Create User (Two Steps)

**Step 1:** Create in Firebase Console (manual)
**Step 2:** Create Firestore document
```powershell
npm run create-firestore-user <UID> <email> "<displayName>"
```

### Update User Permissions (via Frontend)
1. Go to http://localhost:5173/users
2. Click Shield icon next to user
3. Adjust permissions
4. Click Save for each module

### Update User Role (via Frontend)
1. Go to http://localhost:5173/users
2. Click Edit icon
3. Change role
4. Click Update User

---

## Recommended Workflow Summary

```
1. Gather user information
   ↓
2. Create in Firebase Authentication
   ↓
3. Copy User UID
   ↓
4. Create Firestore document (script or manual)
   ↓
5. Set permissions via frontend UI
   ↓
6. Verify user can login and access modules
   ↓
7. Send credentials to user
   ↓
8. Document in your records
```

---

## Future Enhancements

Consider implementing:
- User invitation system with email
- Self-service password reset
- Bulk user import from CSV
- Automated role assignment based on department
- User activity logging
- Permission request workflow

---

## Support

For issues:
- Check `USER_MANAGEMENT.md` for detailed instructions
- Review Firebase Console for user status
- Verify Firestore document structure
- Test permissions in frontend UI

---

**Follow this process for all user management operations to ensure security, consistency, and proper access control.**
