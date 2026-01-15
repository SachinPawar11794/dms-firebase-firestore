# Password Reset Email Troubleshooting Guide

## Issue: Password Reset Email Not Received

If you're not receiving password reset emails, follow these troubleshooting steps:

## ⚠️ IMPORTANT: Domain Restrictions Clarification

**The email used to create your Firebase project (`dms@dhananjaygroup.com`) does NOT restrict password reset emails.**

Firebase sends password reset emails to ANY email address that has a user account, regardless of:
- The project owner's email
- The email used to create the project
- The user's email domain

**Authorized Domains** only control which domains can host your web app, NOT email delivery.

---

## Common Causes & Solutions

### 1. Check Email Address in Firebase Auth

**Problem:** The email address you're entering might be different from what's registered in Firebase Auth.

**Solution:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Navigate to **Authentication** → **Users**
3. Search for your user account
4. Verify the exact email address registered
5. Use that exact email address for password reset

### 2. Check Spam/Junk Folder

**Problem:** Password reset emails often go to spam/junk folders.

**Solution:**
- Check your spam/junk folder
- Check "Promotions" tab in Gmail
- Search for emails from `noreply@` or Firebase domain
- Add Firebase emails to your contacts/whitelist

### 3. Email Domain Restrictions (IMPORTANT CLARIFICATION)

**IMPORTANT:** The email address used to create your Firebase project (`dms@dhananjaygroup.com`) does NOT restrict which email addresses can receive password reset emails. Firebase sends password reset emails to ANY email address that has a user account, regardless of the project owner's email.

**Authorized Domains** in Firebase are for web app hosting (which domains can host your app), NOT for email delivery restrictions.

**However, check these settings:**

1. **Firebase Console → Authentication → Settings → Authorized domains**
   - These control which domains can host your web app
   - They do NOT restrict email delivery
   - Should include: `localhost`, your app domain, and Firebase domains

2. **Email Templates** (if customized):
   - Go to **Authentication** → **Templates** → **Password reset**
   - Check if there are any custom restrictions
   - Verify the action URL is correct

3. **Custom Code Restrictions:**
   - Check if your application code has custom domain filtering
   - Review `frontend/src/services/authService.ts` for any domain checks

### 4. User Account Status

**Problem:** The user account might be disabled or deleted.

**Solution:**
1. Go to Firebase Console → **Authentication** → **Users**
2. Find your user account
3. Check if account is **Enabled**
4. If disabled, enable it and try again

### 5. Firebase Email Delivery Issues

**Problem:** Firebase email service might be experiencing delays.

**Solution:**
- Wait 5-10 minutes and check again
- Try requesting password reset again
- Check Firebase Status: https://status.firebase.google.com/

### 6. Email Provider Blocking (Most Likely for Gmail)

**Problem:** Gmail and other email providers may block or filter Firebase emails, especially for personal accounts like `sachin11794@gmail.com`.

**Solution:**
- **Check Spam/Junk folder** - This is the #1 reason emails don't arrive
- **Check "Promotions" tab** in Gmail (very common!)
- **Search for "Firebase" or "password reset"** in Gmail
- **Add Firebase to contacts**: `noreply@[your-project].firebaseapp.com`
- **Check Gmail filters** - Settings → Filters and Blocked Addresses
- **Wait 5-10 minutes** - Gmail may delay delivery
- **Try requesting again** - Sometimes second attempt works
- **Check Gmail Activity**: Settings → Security → Recent security activity

**For Gmail specifically:**
- Gmail often filters Firebase emails to Promotions or Spam
- Personal Gmail accounts (`@gmail.com`) are more likely to filter than corporate accounts
- Check ALL tabs: Primary, Promotions, Updates, Social
- Corporate emails (`@dhananjaygroup.com`) are less likely to be filtered

## Verification Steps

### Step 1: Verify User Exists in Firebase Auth (CRITICAL)

**This is the #1 reason password reset emails don't arrive!**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication** → **Users**
4. Search for `sachin11794@gmail.com`
5. **Check:**
   - ✅ Does the user exist?
   - ✅ What is the EXACT email address stored? (check for typos)
   - ✅ Is the account **Enabled**?
   - ✅ Is the email **Verified**?
   - ✅ What is the **Provider**? (should be "password")

**If user doesn't exist:**
- Firebase will show "success" but won't actually send the email (for security)
- You need to create the user account first
- Use User Management page in web app or Firebase Console

**If email is different:**
- Use the exact email address stored in Firebase Auth
- Check for typos or different domain

### Step 2: Check Email Format
- Ensure email is in correct format: `user@domain.com`
- No extra spaces before/after email
- Check for typos

### Step 3: Test with Different Email
- Try with a different email address to see if issue is email-specific
- Try with a Gmail account (most reliable)

### Step 4: Check Firebase Console Logs
1. Go to Firebase Console → **Authentication** → **Users**
2. Click on your user
3. Check **Provider information** and **User metadata**
4. Verify email is verified (if email verification is required)

## Firebase Console Settings to Check

### 1. Email Templates
1. Go to **Authentication** → **Templates**
2. Check **Password reset** template
3. Verify email template is configured correctly

### 2. Authorized Domains
1. Go to **Authentication** → **Settings** → **Authorized domains**
2. Ensure your domain is listed
3. Add domain if missing

### 3. Email Action Handler
1. Go to **Authentication** → **Settings** → **Action URL**
2. Verify the action URL is correct: `https://your-domain.com/reset-password`

## Alternative Solutions

### Option 1: Reset Password via Firebase Console
1. Go to Firebase Console → **Authentication** → **Users**
2. Find the user
3. Click **Reset password** (if available)
4. Or manually set a new password

### Option 2: Create New User Account
If password reset continues to fail:
1. Create a new user account with the correct email
2. Or contact admin to reset password manually

### Option 3: Use Admin API
Admins can reset passwords using the backend API:
```bash
# Contact admin to reset password via API
```

## Debugging Information

When reporting issues, provide:
1. **Email address used** (mask sensitive parts)
2. **Time of request**
3. **Browser console errors** (if any)
4. **Email provider** (Gmail, Outlook, etc.)
5. **Whether email was received for other accounts**

## Common Error Messages

### "Invalid email address"
- Check email format
- Ensure no special characters or spaces

### "User not found"
- User account doesn't exist in Firebase Auth
- Check if email is correct
- User might have been deleted

### "Too many requests"
- Wait 15-30 minutes before trying again
- Firebase limits password reset requests

### "Network error"
- Check internet connection
- Try again later
- Check if Firebase is experiencing issues

## Prevention Tips

1. **Use Verified Email**: Ensure email is verified in Firebase Auth
2. **Whitelist Firebase**: Add Firebase emails to contacts/whitelist
3. **Check Spam Regularly**: Check spam folder periodically
4. **Use Reliable Email**: Use Gmail or other reliable email providers
5. **Keep Email Updated**: Update email address if it changes

## Contact Support

If none of the above solutions work:
1. Check Firebase Console for any error messages
2. Review Firebase Status page
3. Contact Firebase Support
4. Contact your system administrator

---

**Last Updated:** 2024
**Related Files:**
- `frontend/src/pages/ForgotPassword.tsx`
- `frontend/src/services/authService.ts`
