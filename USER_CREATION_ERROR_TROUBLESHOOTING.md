# User Creation Error Troubleshooting

## Error: `POST http://localhost:3000/api/v1/users 500 (Internal Server Error)`

### Quick Checks

1. **Is the backend server running?**
   ```bash
   # Check if server is running on port 3000
   # Start server if not running:
   npm run dev
   # Or:
   npm start
   ```

2. **Check backend logs:**
   - Look at terminal where backend is running
   - Check `logs/error.log` file
   - Look for the actual error message

3. **Common Causes:**

   a. **Service Account Permissions** (Most Common)
      - Error: "Service account lacks permissions"
      - Solution: Grant permissions in Google Cloud Console
      - See: `FIX_SERVICE_ACCOUNT_PERMISSIONS.md`

   b. **Email Already Exists**
      - Error: "email-already-exists"
      - Solution: Use a different email or check Firebase Console

   c. **Missing Required Fields**
      - Error: Validation errors
      - Solution: Ensure all required fields are filled

   d. **Weak Password**
      - Error: "weak-password"
      - Solution: Use password with at least 8 characters

   e. **Invalid Email Format**
      - Error: "invalid-email"
      - Solution: Check email format

### Step-by-Step Debugging

#### Step 1: Check Browser Console
1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Look for detailed error message
4. Check **Network** tab → Find the failed request → Check **Response** tab

#### Step 2: Check Backend Logs
1. Look at terminal where backend is running
2. Find the error message
3. Check `logs/error.log`:
   ```bash
   # Windows PowerShell
   Get-Content logs\error.log -Tail 50
   
   # Or open the file directly
   ```

#### Step 3: Check Server Status
1. Verify backend is running: `http://localhost:3000/api/v1/users/me`
2. Should return current user or 401 (not 500)

#### Step 4: Test with Simple Request
Try creating a user with minimal data:
- Email: `test@example.com`
- Display Name: `Test User`
- Password: `Test1234!`
- Role: `employee`

### Common Error Messages & Solutions

#### "Service account lacks permissions"
**Solution:**
1. Go to [Google Cloud Console IAM](https://console.cloud.google.com/iam-admin/iam?project=dhananjaygroup-dms)
2. Find service account (ends with `@dhananjaygroup-dms.iam.gserviceaccount.com`)
3. Click **Edit** → **Add Role**
4. Add:
   - `Service Usage Consumer`
   - `Firebase Admin SDK Administrator Service Agent`
5. Wait 2-3 minutes
6. Try again

#### "User with this email already exists"
**Solution:**
1. Check Firebase Console → Authentication → Users
2. If user exists, use different email
3. Or delete existing user first

#### "Validation failed"
**Solution:**
- Check which field failed validation
- Ensure all required fields are filled:
  - Email (valid format)
  - Display Name (1-100 characters)
  - Password (at least 8 characters, for new users)
  - Role (admin, manager, employee, or guest)

#### "Failed to create user: Unknown error"
**Solution:**
1. Check backend logs for actual error
2. Verify Firebase service account key is valid
3. Check Firebase project settings
4. Verify network connectivity

### Testing the API Directly

You can test the API directly using curl or Postman:

```bash
# Replace with your actual auth token
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "email": "test@example.com",
    "displayName": "Test User",
    "password": "Test1234!",
    "role": "employee"
  }'
```

### Check Backend Code

If error persists, verify:
1. `src/services/auth.service.ts` - `createUserWithAuth` method
2. `src/controllers/user.controller.ts` - `createUser` method
3. `src/routes/user.routes.ts` - Route validation

### Next Steps

1. **Check the actual error message** from backend logs
2. **Share the error message** for further debugging
3. **Check if other API endpoints work** (e.g., GET /api/v1/users)

---

**Last Updated:** 2024
**Related Files:**
- `src/services/auth.service.ts`
- `src/controllers/user.controller.ts`
- `frontend/src/pages/Users.tsx`
- `FIX_SERVICE_ACCOUNT_PERMISSIONS.md`
