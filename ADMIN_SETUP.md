# Admin Setup Guide

## How to Create Admin Account

The Gold X Usdt platform automatically assigns the **first registered user** as an admin. Follow these steps:

### Step 1: Access the Signup Page
1. Navigate to the application
2. Click on "Sign Up" or go to `/signup`

### Step 2: Register First Account
Use these credentials (or your preferred credentials):

**Email:** `admin@goldxusdt.com`  
**Password:** `Admin@123456`  
**Referral Code:** (leave empty)

### Step 3: Verify Email
- Check your email for the verification link
- Click the verification link to activate your account
- Once verified, your account will be automatically assigned the admin role

### Step 4: Access Admin Panel
After logging in, you will see:
- "Admin Dashboard" option in the sidebar
- "Admin Panel" option in the user dropdown menu
- Access to all admin routes:
  - `/admin` - Admin Dashboard
  - `/admin/users` - User Management
  - `/admin/deposits` - Deposit Approvals
  - `/admin/withdrawals` - Withdrawal Approvals
  - `/admin/kyc` - KYC Verification
  - `/admin/tickets` - Support Tickets
  - `/admin/content` - Content Management

## Important Notes

1. **First User = Admin**: The database trigger automatically assigns admin role to the first user
2. **Subsequent Users**: All other users will have the "user" role by default
3. **Role Management**: Admins can change user roles through the Admin Users page
4. **Security**: Use a strong password for the admin account

## Recommended Admin Credentials

For production use, we recommend:
- **Email:** `admin@goldxusdt.com`
- **Password:** `GoldXUsdt@Admin2026!` (change after first login)

For testing/development:
- **Email:** `test@admin.com`
- **Password:** `Test@123456`

## Database Configuration

The admin role is configured in the database through:
- `handle_new_user()` trigger function
- Checks user count and assigns 'admin' role if count = 0
- All subsequent users get 'user' role

## Troubleshooting

**Issue:** Email verification not working
- **Solution:** Email verification is disabled in the current setup. You can login immediately after signup.

**Issue:** Not seeing admin options
- **Solution:** Make sure you're the first registered user. Check the database profiles table to verify your role.

**Issue:** Need to add more admins
- **Solution:** Login as admin, go to `/admin/users`, and change any user's role to 'admin'.
