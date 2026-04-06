# 🔐 ADMIN CREDENTIALS & SETUP

## Quick Start - Admin Account Creation

### Step 1: Access Signup Page
Navigate to one of these URLs:
- **Admin Setup Guide**: `/admin-setup` (recommended - includes full instructions)
- **Direct Signup**: `/signup`

### Step 2: Register First Account

Use these **recommended credentials**:

```
📧 Email:    admin@goldxusdt.com
🔑 Password: GoldXUsdt@Admin2026!
```

**OR** use your own preferred credentials (any email and strong password)

### Step 3: Login
- Email verification is **disabled** - you can login immediately
- After signup, go to `/login` and enter your credentials
- You will be automatically logged in with **admin role**

### Step 4: Access Admin Panel
After login, you can access:
- **Admin Dashboard**: `/admin`
- **User Management**: `/admin/users`
- **Deposit Approvals**: `/admin/deposits`
- **Withdrawal Approvals**: `/admin/withdrawals`
- **KYC Verification**: `/admin/kyc`
- **Support Tickets**: `/admin/tickets`
- **Content Management**: `/admin/content`

---

## Important Notes

### 🎯 First User = Admin
- The **first user** to register automatically gets admin role
- This is configured in the database trigger `handle_new_user()`
- All subsequent users will have "user" role by default

### 🔒 Security Recommendations
1. **Change Password**: After first login, change the default password
2. **Strong Password**: Use at least 12 characters with mixed case, numbers, and symbols
3. **Secure Storage**: Store admin credentials securely
4. **Regular Updates**: Change password periodically

### 👥 Adding More Admins
1. Login as admin
2. Navigate to `/admin/users`
3. Find the user you want to promote
4. Click "Edit" and change role to "admin"
5. Save changes

### 🚫 Email Verification
- Email verification is currently **disabled**
- Users can login immediately after signup
- To enable email verification:
  - Contact Supabase support
  - Update `supabase_verification` settings
  - Modify signup flow to include verification step

---

## Testing Credentials

For development/testing purposes, you can also use:

```
📧 Email:    test@admin.com
🔑 Password: Test@123456
```

---

## Database Configuration

The admin role assignment is handled by:

```sql
-- Function: handle_new_user()
-- Trigger: on_auth_user_confirmed
-- Logic: IF user_count = 0 THEN role = 'admin' ELSE role = 'user'
```

To verify admin role in database:
```sql
SELECT id, email, username, role, created_at 
FROM profiles 
WHERE role = 'admin';
```

---

## Troubleshooting

### Issue: Not seeing admin options after login
**Solution**: 
1. Check if you're the first registered user
2. Query database to verify role: `SELECT role FROM profiles WHERE email = 'your@email.com'`
3. If role is 'user', manually update: `UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com'`

### Issue: Cannot access admin routes
**Solution**:
1. Ensure you're logged in
2. Check browser console for errors
3. Verify role in user dropdown menu
4. Try logging out and back in

### Issue: Forgot admin password
**Solution**:
1. Use "Forgot Password" link on login page
2. Or reset via Supabase dashboard
3. Or create new admin account (if no users exist yet)

---

## Admin Panel Features

### 📊 Dashboard
- Total users count
- Total deposits and withdrawals
- Pending approvals
- ROI and commission statistics

### 👥 User Management
- View all users
- Edit user details (email, phone, address)
- Change user roles
- Activate/deactivate accounts
- View user activity

### 💰 Deposit Management
- View all deposit requests
- Approve/reject deposits
- View transaction hashes
- Process referral commissions automatically

### 💸 Withdrawal Management
- View all withdrawal requests
- Approve/reject withdrawals
- Check cooling periods
- Process payments

### 📄 KYC Verification
- View submitted documents
- Approve/reject KYC
- Add rejection reasons
- Track verification status

### 🎫 Support Tickets
- View all tickets
- Respond to users
- Change ticket status
- Track resolution

### ✏️ Content Management
- Edit Terms & Conditions
- Edit Privacy Policy
- Update platform content

---

## Contact & Support

For platform issues or questions:
- **Support Page**: `/support`
- **Admin Setup Guide**: `/admin-setup`
- **Documentation**: `README.md` and `ADMIN_SETUP.md`

---

**Last Updated**: 2026-03-13
**Platform**: Gold X Usdt MLM Investment Platform
**Version**: 1.0.0
