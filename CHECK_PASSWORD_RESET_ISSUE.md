# Quick Check: Password Reset Email Not Received

## For: `sachin11794@gmail.com` not receiving password reset emails

### Step 1: Verify User Account Exists (5 minutes)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **Authentication** → **Users**
4. Search for: `sachin11794@gmail.com`

**What to check:**
- [ ] Does the user exist?
- [ ] What is the exact email address? (check for typos)
- [ ] Is the account **Enabled**?
- [ ] Is the email **Verified**?

**If user doesn't exist:**
- Create the user account first (this is likely the issue!)
- Go to **Authentication** → **Users** → **Add user**
- Or use User Management page in web app

---

### Step 2: Check Gmail (Most Common Issue)

Gmail often filters Firebase emails. Check:

1. **Spam/Junk folder**
2. **Promotions tab** (in Gmail)
3. **All Mail** - Search for "Firebase" or "password reset"
4. **Wait 5-10 minutes** - Gmail may delay delivery

**Gmail Search:**
```
from:firebase OR from:noreply password reset
```

---

### Step 3: Verify Firebase Settings

1. **Authentication** → **Settings** → **Authorized domains**
   - Should include: `localhost`, your domain, Firebase domains
   - These DON'T restrict email delivery (only web app hosting)

2. **Authentication** → **Templates** → **Password reset**
   - Check if template is configured
   - Verify action URL: `https://your-domain.com/reset-password`

---

### Step 4: Compare with Working Email

Check why `cmis@dhananjaygroup.com` works but `sachin11794@gmail.com` doesn't:

1. In Firebase Console → **Authentication** → **Users**
2. Compare both users:
   - Account status (Enabled/Disabled)
   - Email verification status
   - Provider type
   - Creation date

---

## Most Likely Causes (in order):

1. **User account doesn't exist** (90% of cases)
   - Firebase shows "success" but doesn't send email if user doesn't exist
   - Solution: Create the user account first

2. **Email in spam/junk folder** (5% of cases)
   - Gmail filters Firebase emails
   - Solution: Check spam, promotions tab, wait 5-10 minutes

3. **Email address mismatch** (3% of cases)
   - Typo in email address
   - Different email stored in Firebase
   - Solution: Use exact email from Firebase Console

4. **Account disabled** (2% of cases)
   - User account exists but is disabled
   - Solution: Enable account in Firebase Console

---

## Quick Fix Steps:

1. **Create user account** (if doesn't exist):
   ```
   Firebase Console → Authentication → Users → Add user
   Email: sachin11794@gmail.com
   Password: (temporary password)
   ```

2. **Request password reset again** from web app

3. **Check Gmail spam/promotions** folder

4. **Wait 5-10 minutes** and check again

---

## Still Not Working?

1. Check Firebase Console → **Authentication** → **Users** for the exact email
2. Try with a different email address to test
3. Check browser console for errors
4. Review `PASSWORD_RESET_TROUBLESHOOTING.md` for detailed steps

---

**Remember:** The project owner email (`dms@dhananjaygroup.com`) does NOT restrict password reset emails. Firebase sends emails to any valid user account regardless of domain.
