# User Management Help Guide

## Table of Contents
1. [Login & Authentication](#login--authentication)
2. [Password Management](#password-management)
3. [User Management (Admin Only)](#user-management-admin-only)
4. [Permissions & Roles](#permissions--roles)
5. [Troubleshooting](#troubleshooting)

---

## Login & Authentication

### How to Login

1. **Go to the Login Page**
   - Open your web browser
   - Navigate to the DMS System login page
   - URL: `https://your-domain.com/login` (or `http://localhost:5173/login` for local development)

2. **Enter Your Credentials**
   - **Email**: Enter your registered email address
   - **Password**: Enter your password
   - Click **"Login"** button

3. **Access Your Dashboard**
   - After successful login, you'll be redirected to your dashboard
   - You'll see modules based on your assigned permissions

### Login Requirements

- ✅ Valid email address registered in the system
- ✅ Correct password
- ✅ Active user account (not deactivated)
- ✅ Email/Password authentication enabled

---

## Password Management

### Forgot Your Password?

If you've forgotten your password, follow these steps:

1. **Request Password Reset**
   - On the login page, click **"Forgot password?"** link (located below the password field)
   - Enter your registered email address
   - Click **"Send Reset Link"**

2. **Check Your Email**
   - You'll receive an email with a password reset link
   - **Note**: The email may take a few minutes to arrive
   - Check your spam/junk folder if you don't see it

3. **Reset Your Password**
   - Click the reset link in the email
   - Enter your new password (minimum 8 characters)
   - Confirm your new password
   - Click **"Reset Password"**

4. **Login with New Password**
   - After successful reset, you'll be redirected to the login page
   - Login with your email and new password

### Password Requirements

- ✅ Minimum 8 characters
- ✅ Use a combination of letters, numbers, and symbols for better security
- ✅ Don't use common passwords or personal information

### Password Reset Link Expiration

- ⏰ Reset links expire after **1 hour**
- If your link expires, request a new password reset
- Each reset link can only be used once

### Common Password Issues

**Problem**: "I didn't receive the reset email"
- ✅ Check your spam/junk folder
- ✅ Verify you entered the correct email address
- ✅ Wait a few minutes and try again
- ✅ Contact your administrator if the issue persists

**Problem**: "Reset link expired"
- ✅ Request a new password reset
- ✅ Use the link within 1 hour of receiving it

**Problem**: "Invalid reset code"
- ✅ Make sure you clicked the link from the most recent email
- ✅ Request a new password reset if needed

---

## User Management (Admin Only)

> **Note**: User Management features are only available to users with **Admin** role.

### Accessing User Management

1. **Login as Admin**
   - Login with an admin account
   - You'll see **"User Management"** in the sidebar navigation

2. **Navigate to Users Page**
   - Click **"User Management"** from the sidebar
   - You'll see a list of all users in the system

### Creating a New User

1. **Click "Add User" Button**
   - Located at the top right of the Users page
   - Click the **"Add User"** button

2. **Fill in User Details**
   - **Email**: User's email address (must be unique)
   - **Display Name**: User's full name
   - **Password**: Set initial password (minimum 8 characters)
   - **Confirm Password**: Re-enter the password
   - **Role**: Select from dropdown:
     - **Admin**: Full system access
     - **Manager**: Read and write access to all modules
     - **Employee**: Read-only access
     - **Guest**: No access

3. **Create User**
   - Click **"Create User"** button
   - User will be created immediately
   - They can login right away with their email and password

### Editing User Information

1. **Find the User**
   - Scroll through the user list or use search
   - Locate the user you want to edit

2. **Click Edit Icon**
   - Click the **Edit** icon (pencil) next to the user
   - Edit form will appear

3. **Update Information**
   - **Display Name**: Can be changed
   - **Email**: Cannot be changed (for security)
   - **Role**: Can be changed (permissions will update automatically)
   - **Active Status**: Toggle to activate/deactivate user

4. **Save Changes**
   - Click **"Update User"** button
   - Changes are saved immediately

### Managing User Permissions

1. **Open Permissions Manager**
   - Find the user in the list
   - Click the **Shield** icon (permissions) next to the user

2. **Set Permissions by Module**
   - You'll see 4 modules:
     - **Employee Task Manager**
     - **Production Management System (PMS)**
     - **Human Resource**
     - **Maintenance**

3. **Select Permissions**
   - For each module, you can grant:
     - ✅ **Read**: View data
     - ✅ **Write**: Create and edit data
     - ✅ **Delete**: Delete data
     - ✅ **Admin**: Full administrative access

4. **Quick Setup Options**
   - Click **"Set Default for [role]"** to quickly apply role-based permissions
   - Or manually select permissions for each module

5. **Save Permissions**
   - Click **"Save"** button for each module after making changes
   - Permissions are applied immediately

### Activating/Deactivating Users

**To Deactivate a User:**
1. Find the user in the list
2. Click the **UserX** icon (deactivate)
3. User will be deactivated and cannot login

**To Activate a User:**
1. Find the inactive user
2. Click the **UserCheck** icon (activate)
3. User can login again

**Note**: Deactivated users cannot login but their data is preserved.

### Deleting Users

> **Warning**: Deleting a user is permanent and cannot be undone. Consider deactivating instead.

1. **Find the User**
   - Locate the user you want to delete

2. **Click Delete Icon**
   - Click the **Delete** icon (trash) next to the user
   - Confirm the deletion

3. **Confirm Deletion**
   - A confirmation dialog will appear
   - Type the user's name or click "Confirm"
   - User will be permanently deleted

**Best Practice**: Deactivate users instead of deleting to preserve data history.

---

## Permissions & Roles

### Role Overview

#### Admin
- ✅ Full access to all modules
- ✅ Can create, edit, and delete users
- ✅ Can manage all permissions
- ✅ Access to User Management page
- ✅ All CRUD operations (Create, Read, Update, Delete)

#### Manager
- ✅ Read and write access to all modules
- ✅ Can create and edit records
- ✅ Cannot delete records
- ✅ Cannot access User Management
- ✅ Cannot manage other users

#### Employee
- ✅ Read-only access to all modules
- ✅ Can view data
- ✅ Cannot create, edit, or delete records
- ✅ Cannot access User Management

#### Guest
- ❌ No access to any modules
- ❌ Cannot view any data
- ❌ Cannot access User Management

### Permission Levels

**Read Permission:**
- View data and records
- Cannot make changes
- Basic access level

**Write Permission:**
- Create new records
- Edit existing records
- Cannot delete records

**Delete Permission:**
- Delete records
- Requires write permission
- Use with caution

**Admin Permission:**
- Full administrative control
- Can manage module settings
- Highest permission level

### Default Permissions by Role

| Role | Employee Task Manager | PMS | Human Resource | Maintenance |
|------|----------------------|-----|----------------|-------------|
| **Admin** | Read, Write, Delete, Admin | Read, Write, Delete, Admin | Read, Write, Delete, Admin | Read, Write, Delete, Admin |
| **Manager** | Read, Write | Read, Write | Read, Write | Read, Write |
| **Employee** | Read | Read | Read | Read |
| **Guest** | None | None | None | None |

### Custom Permissions

Admins can set custom permissions for individual users:
- Mix and match permissions per module
- Grant specific access levels
- Override default role permissions

**Example**: An Employee can be given Write access to Tasks module only.

---

## Troubleshooting

### Login Issues

**Problem**: "Invalid email or password"
- ✅ Verify you're using the correct email address
- ✅ Check if Caps Lock is on
- ✅ Ensure password is entered correctly
- ✅ Try resetting your password if forgotten

**Problem**: "User account not found"
- ✅ Verify your account exists in the system
- ✅ Contact your administrator to check your account status
- ✅ Ensure you're using the correct email address

**Problem**: "Account has been deactivated"
- ✅ Contact your administrator
- ✅ Your account needs to be reactivated
- ✅ Only admins can activate accounts

### Permission Issues

**Problem**: "You don't have permission to access this page"
- ✅ Your role may not have access to this feature
- ✅ Contact your administrator to request access
- ✅ Check if your permissions were recently changed

**Problem**: "Cannot create/edit/delete records"
- ✅ Check your role and permissions
- ✅ Verify you have Write permission for the module
- ✅ Contact your administrator if you need additional permissions

### User Management Issues (Admin)

**Problem**: "Cannot create user - email already exists"
- ✅ User with this email already exists
- ✅ Check if user is deactivated and reactivate instead
- ✅ Use a different email address

**Problem**: "Service account lacks permissions"
- ✅ This is a system configuration issue
- ✅ Contact your system administrator
- ✅ Check Firebase service account permissions

**Problem**: "User created but cannot login"
- ✅ Verify user was created in Firebase Authentication
- ✅ Check if user account is active
- ✅ Ensure password was set correctly
- ✅ Verify email/password authentication is enabled

### Password Reset Issues

**Problem**: "Didn't receive password reset email"
- ✅ Check spam/junk folder
- ✅ Verify email address is correct
- ✅ Wait a few minutes and try again
- ✅ Request a new reset link

**Problem**: "Reset link expired"
- ✅ Reset links expire after 1 hour
- ✅ Request a new password reset
- ✅ Use the link immediately after receiving it

**Problem**: "Invalid reset code"
- ✅ Make sure you're using the most recent reset link
- ✅ Each link can only be used once
- ✅ Request a new password reset

### General Issues

**Problem**: "Page not loading"
- ✅ Check your internet connection
- ✅ Refresh the page (F5 or Ctrl+R)
- ✅ Clear browser cache
- ✅ Try a different browser

**Problem**: "Session expired"
- ✅ Login again
- ✅ Sessions expire after inactivity
- ✅ Use "Remember me" if available

**Problem**: "Mobile view issues"
- ✅ Use the hamburger menu (☰) to access navigation
- ✅ Swipe left/right to navigate
- ✅ Ensure you're using a modern browser

---

## Quick Reference

### For Users

| Task | Steps |
|------|-------|
| **Login** | Email + Password → Click Login |
| **Reset Password** | Login page → "Forgot password?" → Enter email → Check email → Reset |
| **View Data** | Login → Navigate to module → View records |
| **Logout** | Click Logout button in sidebar |

### For Admins

| Task | Steps |
|------|-------|
| **Create User** | Users page → Add User → Fill form → Create |
| **Edit User** | Users page → Edit icon → Update → Save |
| **Set Permissions** | Users page → Shield icon → Select permissions → Save |
| **Deactivate User** | Users page → UserX icon → Confirm |
| **Activate User** | Users page → UserCheck icon → Confirm |
| **Delete User** | Users page → Delete icon → Confirm |

---

## Support

### Need Help?

If you encounter issues not covered in this guide:

1. **Check This Documentation** - Review relevant sections
2. **Contact Your Administrator** - For account and permission issues
3. **System Administrator** - For technical issues

### Contact Information

- **System Admin Email**: [Your admin email]
- **Support Portal**: [Your support URL]
- **Documentation**: [Your docs URL]

---

## Security Best Practices

### For All Users

- ✅ Use strong, unique passwords
- ✅ Never share your login credentials
- ✅ Logout when finished
- ✅ Report suspicious activity immediately
- ✅ Keep your password secure

### For Admins

- ✅ Regularly review user access
- ✅ Deactivate unused accounts
- ✅ Set appropriate permissions
- ✅ Monitor user activity
- ✅ Follow principle of least privilege

---

**Last Updated**: [Current Date]
**Version**: 1.0
