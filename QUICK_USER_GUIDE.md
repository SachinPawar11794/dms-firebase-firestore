# Quick User Management Guide

## Adding a New User (5 Minutes)

### Step 1: Create Auth User (2 minutes)

1. Go to: https://console.firebase.google.com/
2. Select project → **Authentication** → **Users**
3. Click **"Add user"**
4. Enter:
   - Email: `user@example.com`
   - Password: `SecurePass123` (or generate strong password)
5. Click **"Add user"**
6. **Copy the User UID** (important!)

### Step 2: Create Firestore Document (1 minute)

**Option A: Using Script (Fastest)**
```powershell
npm run create-firestore-user <paste-UID-here> user@example.com "User Name"
```

**Option B: Manual in Firebase Console**
- Firestore Database → `users` collection
- Add document with UID as document ID
- Add fields: email, displayName, role, modulePermissions, etc.

### Step 3: Set Permissions (2 minutes)

1. Open frontend: http://localhost:5173/users
2. Find your user
3. Click **Shield icon** (permissions)
4. Adjust permissions per module
5. Click **Save** for each module

**Done!** User can now login.

---

## Permission Quick Reference

| Role | Permissions |
|------|-------------|
| **Employee** | Read only (all modules) |
| **Manager** | Read + Write (all modules) |
| **Admin** | Full access (all modules) |
| **Guest** | No access |

---

## Common Tasks

### Change User Role
- Frontend → Users → Edit → Change role → Update

### Adjust Permissions
- Frontend → Users → Shield icon → Check/uncheck → Save

### Deactivate User
- Frontend → Users → UserX icon → Confirm

### Activate User
- Frontend → Users → UserCheck icon → Confirm

---

## Troubleshooting

**Can't login?**
- Check user exists in Firebase Authentication
- Verify password is correct

**Permission denied?**
- Check permissions in Users page
- Verify role is correct

**User not showing?**
- Verify Firestore document exists
- Check `isActive` is `true`

---

**That's it! Follow these steps for all new users.**
