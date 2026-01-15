# User Addition Checklist - Step by Step

Follow this checklist every time you add a new user to ensure consistency and security.

## Pre-Creation

- [ ] **Gather User Information**
  - [ ] Full name
  - [ ] Email address (verify it's unique)
  - [ ] Department/Team
  - [ ] Job title
  - [ ] Required access level (Employee/Manager/Admin)
  - [ ] Which modules they need access to

- [ ] **Verify Prerequisites**
  - [ ] Email is not already in use
  - [ ] User understands they'll receive login credentials
  - [ ] Appropriate role and permissions determined

---

## Step 1: Create Firebase Authentication User

- [ ] **Navigate to Firebase Console**
  - [ ] Go to: https://console.firebase.google.com/
  - [ ] Select project: `dhananjaygroup-dms`
  - [ ] Click **Authentication** in left sidebar
  - [ ] Click **Users** tab

- [ ] **Add User**
  - [ ] Click **"Add user"** button
  - [ ] Enter email address
  - [ ] Generate or enter secure password (min 8 chars, mixed case, numbers, symbols)
  - [ ] Uncheck "Send email verification" (for immediate access) OR check it (for security)
  - [ ] Click **"Add user"**

- [ ] **Copy User UID**
  - [ ] User UID is displayed (long string)
  - [ ] **Copy this UID** - you'll need it for Step 2
  - [ ] Save UID temporarily (notepad, etc.)

---

## Step 2: Create Firestore User Document

### Option A: Using Script (Recommended - Fastest)

- [ ] **Open Terminal**
  - [ ] Navigate to project directory: `D:\DMS FIREBASE FIRESTORE`
  - [ ] Run command:
    ```powershell
    npm run create-firestore-user <UID> <email> "<displayName>"
    ```
  - [ ] Replace:
    - `<UID>` with the User UID from Step 1
    - `<email>` with user's email
    - `"<displayName>"` with user's full name
  - [ ] Example:
    ```powershell
    npm run create-firestore-user QwjBZE3i1PbLKDdyETeQs94m6rl2 john@example.com "John Doe"
    ```
  - [ ] Verify success message appears

### Option B: Using Firebase Console (Manual)

- [ ] **Navigate to Firestore**
  - [ ] Go to **Firestore Database** in Firebase Console
  - [ ] Click on `users` collection (or create it if doesn't exist)

- [ ] **Create Document**
  - [ ] Click **"Add document"** or **"Start collection"**
  - [ ] **Document ID:** Paste the User UID from Step 1
  - [ ] Click **"Save"**

- [ ] **Add Fields**
  - [ ] Click **"Add field"** for each:
    - `email` (string): user@example.com
    - `displayName` (string): User Full Name
    - `role` (string): employee (or manager, admin, guest)
    - `modulePermissions` (map): (see below)
    - `createdAt` (timestamp): Click and select current time
    - `updatedAt` (timestamp): Click and select current time
    - `isActive` (boolean): true

- [ ] **Add Module Permissions (map type)**
  - [ ] Click **"Add field"** → Field name: `employeeTaskManager` → Type: **array**
    - [ ] Add items: `read` (and `write` if manager/admin)
  - [ ] Repeat for: `pms`, `humanResource`, `maintenance`
  - [ ] Click **"Save"**

---

## Step 3: Set Permissions (via Frontend UI)

- [ ] **Open Frontend Application**
  - [ ] Go to: http://localhost:5173/users
  - [ ] Login if not already logged in

- [ ] **Find the User**
  - [ ] Locate the newly created user in the list
  - [ ] Verify user appears with correct email and name

- [ ] **Manage Permissions**
  - [ ] Click **Shield icon** (🔒) next to the user
  - [ ] Review current permissions
  - [ ] Adjust permissions per module as needed:
    - [ ] Employee Task Manager: Check appropriate boxes
    - [ ] PMS: Check appropriate boxes
    - [ ] Human Resource: Check appropriate boxes
    - [ ] Maintenance: Check appropriate boxes
  - [ ] Click **"Save"** for each module after making changes
  - [ ] Close permission manager

---

## Step 4: Verify User Access

- [ ] **Test Login**
  - [ ] Logout from admin account
  - [ ] Login with new user credentials
  - [ ] Verify login is successful

- [ ] **Test Permissions**
  - [ ] Access each module user should have access to
  - [ ] Verify user can see appropriate data
  - [ ] Verify user cannot access restricted modules
  - [ ] Test create/update/delete if user has write permissions

- [ ] **Verify Dashboard**
  - [ ] Check dashboard loads correctly
  - [ ] Verify statistics show appropriate data
  - [ ] Check navigation shows only permitted modules

---

## Step 5: Documentation & Communication

- [ ] **Document User**
  - [ ] Record in your user management system/spreadsheet:
    - [ ] User name
    - [ ] Email
    - [ ] Role
    - [ ] Date created
    - [ ] Permissions granted
    - [ ] User UID (for reference)

- [ ] **Send Credentials**
  - [ ] Prepare email with:
    - [ ] Login URL: http://localhost:5173 (or production URL)
    - [ ] Email address
    - [ ] Temporary password
    - [ ] Instructions to change password (if applicable)
    - [ ] Welcome message
  - [ ] Send via secure method (encrypted email, password manager, etc.)
  - [ ] **NEVER** send password in plain text email

- [ ] **Follow-up**
  - [ ] Confirm user received credentials
  - [ ] Verify user can login successfully
  - [ ] Address any access issues
  - [ ] Provide training if needed

---

## Quick Reference: Permission Templates

### Employee
- Read only for all modules

### Manager  
- Read + Write for all modules

### Admin
- Full access (Read, Write, Delete, Admin) for all modules

### Custom
- Set specific permissions per module as needed

---

## Troubleshooting Checklist

If user can't login:
- [ ] Verify user exists in Firebase Authentication
- [ ] Check password is correct
- [ ] Verify Email/Password auth is enabled
- [ ] Check if account is disabled

If permission errors:
- [ ] Check `modulePermissions` in Firestore
- [ ] Verify user role is correct
- [ ] Review permissions in frontend UI
- [ ] Check Firestore security rules

If user not found:
- [ ] Verify Firestore document exists
- [ ] Check document ID matches Auth UID
- [ ] Verify `isActive` is `true`
- [ ] Check user wasn't accidentally deleted

---

## Best Practices Reminders

✅ **Security**
- Use strong passwords
- Never share accounts
- One account per person
- Regular permission audits

✅ **Process**
- Always follow this checklist
- Document all changes
- Verify after creation
- Communicate with user

✅ **Maintenance**
- Review permissions quarterly
- Deactivate inactive users
- Update when roles change
- Keep audit trail

---

## Time Estimate

- **Step 1 (Auth):** 2 minutes
- **Step 2 (Firestore):** 1-2 minutes (script) or 5 minutes (manual)
- **Step 3 (Permissions):** 2-3 minutes
- **Step 4 (Verification):** 3-5 minutes
- **Step 5 (Documentation):** 2-3 minutes

**Total:** ~10-15 minutes per user

---

**Print this checklist and use it for every new user to ensure consistency and security!**
