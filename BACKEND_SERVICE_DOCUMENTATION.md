# Backend Service Documentation - Gold X Usdt MLM Platform

## Table of Contents
1. [Database Schema](#database-schema)
2. [Edge Functions](#edge-functions)
3. [RLS Policies](#rls-policies)
4. [Secrets & Environment Variables](#secrets--environment-variables)
5. [User Management](#user-management)
6. [Deployment Guide](#deployment-guide)

---

## Database Schema

### 1. `profiles` Table
Stores user profile information and wallet balances.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  country_code TEXT DEFAULT '+1',
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  postal_code TEXT,
  
  -- Wallet Balances
  deposit_balance DECIMAL(20, 2) DEFAULT 0,
  roi_balance DECIMAL(20, 2) DEFAULT 0,
  bonus_balance DECIMAL(20, 2) DEFAULT 0,
  withdrawal_balance DECIMAL(20, 2) DEFAULT 0,
  
  -- Investment Tracking
  total_invested DECIMAL(20, 2) DEFAULT 0,
  total_withdrawn DECIMAL(20, 2) DEFAULT 0,
  total_roi_earned DECIMAL(20, 2) DEFAULT 0,
  total_referral_earned DECIMAL(20, 2) DEFAULT 0,
  last_roi_credit_at TIMESTAMPTZ,
  
  -- Referral System
  referral_code TEXT UNIQUE NOT NULL,
  referred_by UUID REFERENCES profiles(id),
  referral_level INTEGER DEFAULT 0,
  
  -- Performance Tracking
  performance_level TEXT DEFAULT 'bronze',
  performance_points INTEGER DEFAULT 0,
  active_referrals INTEGER DEFAULT 0,
  coupon_count INTEGER DEFAULT 0,
  
  -- KYC
  kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'approved', 'rejected')),
  kyc_document_url TEXT,
  kyc_submitted_at TIMESTAMPTZ,
  kyc_verified_at TIMESTAMPTZ,
  
  -- Account Status
  is_active BOOLEAN DEFAULT true,
  is_admin BOOLEAN DEFAULT false,
  email_verified BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Fields:**
- `deposit_balance`: Available funds for investment
- `roi_balance`: Accumulated ROI earnings (10% monthly)
- `bonus_balance`: Referral commission earnings (locked for 30 days)
- `withdrawal_balance`: Funds ready for withdrawal
- `referral_code`: Unique code for referring new users
- `referred_by`: UUID of the user who referred this user
- `performance_level`: bronze/silver/gold/platinum based on referrals
- `coupon_count`: Number of active investment coupons

---

### 2. `transactions` Table
Records all financial transactions.

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Transaction Details
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'roi', 'referral_bonus', 'transfer')),
  amount DECIMAL(20, 2) NOT NULL,
  fee DECIMAL(20, 2) DEFAULT 0,
  net_amount DECIMAL(20, 2) NOT NULL,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processing', 'completed')),
  
  -- Payment Details
  transaction_hash TEXT,
  wallet_address TEXT,
  network TEXT CHECK (network IN ('BEP-20', 'TRC-20')),
  
  -- Referral Details (for referral_bonus type)
  referred_user_id UUID REFERENCES profiles(id),
  referral_level INTEGER,
  
  -- Admin Actions
  admin_notes TEXT,
  processed_by UUID REFERENCES profiles(id),
  processed_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Transaction Types:**
- `deposit`: User deposits USDT (5% fee)
- `withdrawal`: User withdraws funds (5% fee, 48h cooling period)
- `roi`: Monthly ROI credit (10% of invested amount)
- `referral_bonus`: Commission from referrals (8%/4%/2%/1% for levels 1-4)
- `transfer`: Internal wallet transfers

---

### 3. `referrals` Table
Tracks referral relationships and commission structure.

```sql
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 4),
  commission_rate DECIMAL(5, 2) NOT NULL,
  total_earned DECIMAL(20, 2) DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(referrer_id, referred_id)
);
```

**Commission Structure:**
- Level 1: 8%
- Level 2: 4%
- Level 3: 2%
- Level 4: 1%

---

### 4. `notifications` Table
Stores user notifications.

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 5. `support_tickets` Table
Customer support ticket system.

```sql
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  admin_reply TEXT,
  replied_at TIMESTAMPTZ,
  replied_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 6. `platform_settings` Table
Global platform configuration.

```sql
CREATE TABLE platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Settings:**
- `min_deposit`: Minimum deposit amount (default: 100)
- `min_withdrawal`: Minimum withdrawal amount
- `deposit_fee_percentage`: Deposit fee (default: 5)
- `withdrawal_fee_percentage`: Withdrawal fee (default: 5)
- `roi_percentage`: Monthly ROI rate (default: 10)
- `withdrawal_cooling_period_hours`: Normal withdrawal lock (default: 48)
- `referral_bonus_lock_days`: Referral bonus lock period (default: 30)
- `level_1_commission`: Level 1 referral rate (default: 8)
- `level_2_commission`: Level 2 referral rate (default: 4)
- `level_3_commission`: Level 3 referral rate (default: 2)
- `level_4_commission`: Level 4 referral rate (default: 1)
- `usdt_wallet_bep20`: Platform BEP-20 wallet address
- `usdt_wallet_trc20`: Platform TRC-20 wallet address

---

### 7. `coupons` Table
Investment coupons for users.

```sql
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(20, 2) NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired')),
  expires_at TIMESTAMPTZ,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 8. `landing_page_settings` Table
Landing page content management.

```sql
CREATE TABLE landing_page_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT UNIQUE NOT NULL,
  content JSONB NOT NULL,
  is_visible BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Sections:**
- `hero`: Hero section content
- `features`: Platform features
- `investment_plans`: Investment plan details
- `testimonials`: User testimonials
- `faq`: Frequently asked questions
- `footer`: Footer content

---

### 9. `otp_verifications` Table
OTP verification for authentication.

```sql
CREATE TABLE otp_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  otp TEXT NOT NULL,
  purpose TEXT NOT NULL CHECK (purpose IN ('signup', 'login', 'password_reset')),
  verified BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 10. `pending_signups` Table
Temporary storage for unverified signups.

```sql
CREATE TABLE pending_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  referral_code TEXT,
  verification_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 11. Storage Buckets

#### `kyc-documents`
Stores KYC verification documents (ID cards, passports, etc.)

**Configuration:**
- Public: false
- File size limit: 5MB
- Allowed MIME types: image/*, application/pdf

**RLS Policies:**
- Users can upload their own documents
- Users can view their own documents
- Admins can view all documents

---

## Edge Functions

### 1. `send-otp`
Sends OTP verification code via email.

**Endpoint:** `POST /functions/v1/send-otp`

**Request Body:**
```json
{
  "email": "user@example.com",
  "purpose": "signup" // or "login", "password_reset"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

**Secrets Required:**
- `ZOHO_API_KEY`
- `ZOHO_SMTP_HOST`
- `ZOHO_FROM_EMAIL`

---

### 2. `verify-otp`
Verifies OTP code.

**Endpoint:** `POST /functions/v1/verify-otp`

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "purpose": "signup"
}
```

**Response:**
```json
{
  "success": true,
  "verified": true
}
```

---

### 3. `create-user`
Creates a new user account after OTP verification.

**Endpoint:** `POST /functions/v1/create-user`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "full_name": "John Doe",
  "referral_code": "ABC123" // optional
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

---

### 6. `reset-password-otp`
Initiates password reset with OTP.

**Endpoint:** `POST /functions/v1/reset-password-otp`

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "new_password": "newpassword"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

### 8. `verify-transaction`
Verifies blockchain transaction hash for deposits.

**Endpoint:** `POST /functions/v1/verify-transaction`

**Request Body:**
```json
{
  "transaction_hash": "0x...",
  "network": "BEP-20",
  "amount": 100
}
```

**Response:**
```json
{
  "success": true,
  "verified": true,
  "amount": 100
}
```

---

### 9. `monthly-interest-credit`
Automated function to credit monthly ROI (10%) to users.

**Trigger:** Scheduled (runs daily via cron)

**Functionality:**
- Calculates 10% monthly ROI for all active investments
- Credits ROI to `roi_balance`
- Creates transaction records
- Sends email notifications

**Cron Schedule:** `0 0 * * *` (daily at midnight UTC)

---

### 10. `process-auto-withdrawals`
Processes approved withdrawals automatically.

**Trigger:** Scheduled (runs hourly via cron)

**Functionality:**
- Checks for approved withdrawal requests
- Verifies cooling period (48 hours for normal, 30 days for referral bonus)
- Transfers funds to `withdrawal_balance`
- Updates transaction status
- Sends email notifications

**Cron Schedule:** `0 * * * *` (every hour)

---

### 11. `delete-user`
Admin function to delete user account.

**Endpoint:** `POST /functions/v1/delete-user`

**Request Body:**
```json
{
  "user_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Authorization:** Admin only

---

### `profiles` Table Policies

1. **Users can view their own profile**
```sql
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);
```

2. **Users can update their own profile**
```sql
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);
```

3. **Admins can view all profiles**
```sql
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);
```

4. **Admins can update all profiles**
```sql
CREATE POLICY "Admins can update all profiles"
ON profiles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);
```

---

### `transactions` Table Policies

1. **Users can view their own transactions**
```sql
CREATE POLICY "Users can view own transactions"
ON transactions FOR SELECT
USING (auth.uid() = user_id);
```

2. **Users can create deposit/withdrawal requests**
```sql
CREATE POLICY "Users can create transactions"
ON transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

3. **Admins can view all transactions**
```sql
CREATE POLICY "Admins can view all transactions"
ON transactions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);
```

4. **Admins can update transactions**
```sql
CREATE POLICY "Admins can update transactions"
ON transactions FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);
```

---

### `referrals` Table Policies

1. **Users can view their own referrals**
```sql
CREATE POLICY "Users can view own referrals"
ON referrals FOR SELECT
USING (auth.uid() = referrer_id OR auth.uid() = referred_id);
```

2. **Admins can view all referrals**
```sql
CREATE POLICY "Admins can view all referrals"
ON referrals FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);
```

---

### `notifications` Table Policies

1. **Users can view their own notifications**
```sql
CREATE POLICY "Users can view own notifications"
ON notifications FOR SELECT
USING (auth.uid() = user_id);
```

2. **Users can update their own notifications**
```sql
CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
USING (auth.uid() = user_id);
```

### Enabling Google OAuth

To enable Google login, you must configure it in your Supabase Dashboard:

1. Go to **Authentication** > **Providers**.
2. Find **Google** and toggle it **ON**.
3. You will need to provide a **Client ID** and **Client Secret** from the [Google Cloud Console](https://console.cloud.google.com/).
4. Add the **Redirect URL** provided by Supabase to your Google Cloud Project's "Authorized redirect URIs".

If Google is not enabled, users will receive a message suggesting they use Email/Password instead.

3. **Admins can create notifications**
```sql
CREATE POLICY "Admins can create notifications"
ON notifications FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);
```

---

### `support_tickets` Table Policies

1. **Anyone can create tickets**
```sql
CREATE POLICY "Anyone can create tickets"
ON support_tickets FOR INSERT
WITH CHECK (true);
```

2. **Users can view their own tickets**
```sql
CREATE POLICY "Users can view own tickets"
ON support_tickets FOR SELECT
USING (auth.uid() = user_id OR email = auth.email());
```

3. **Admins can view all tickets**
```sql
CREATE POLICY "Admins can view all tickets"
ON support_tickets FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);
```

4. **Admins can update tickets**
```sql
CREATE POLICY "Admins can update tickets"
ON support_tickets FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);
```

---

### `platform_settings` Table Policies

1. **Anyone can read settings**
```sql
CREATE POLICY "Anyone can read settings"
ON platform_settings FOR SELECT
USING (true);
```

2. **Admins can update settings**
```sql
CREATE POLICY "Admins can update settings"
ON platform_settings FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);
```

---

## Secrets & Environment Variables

### Supabase Secrets (Edge Functions)

These secrets are required for Edge Functions to work properly:

1. **ZOHO_API_KEY**
   - Description: API key for Zoho Mail email service
   - Used by: send-otp, send-auth-link, monthly-interest-credit, process-auto-withdrawals
   - How to set: `supabase secrets set ZOHO_API_KEY=your_api_key`

2. **ZOHO_SMTP_HOST**
   - Description: SMTP host for Zoho Mail email service
   - Used by: All email-sending functions
   - How to set: `supabase secrets set ZOHO_SMTP_HOST=smtp.zoho.com`

3. **ZOHO_FROM_EMAIL**
   - Description: Sender email address
   - Used by: All email-sending functions
   - How to set: `supabase secrets set ZOHO_FROM_EMAIL=noreply@goldxusdt.com`

### Frontend Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://gkmvncioffmvzxhuaohv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0YnB0eXdseGhsZWFkZ2FiaXZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MjM4NjQsImV4cCI6MjA4ODk5OTg2NH0.NGN6s3utBiD1Xrin2rifVsWOH7GT6OXXqzG6SIYvOT0

# Application Configuration
VITE_APP_NAME=Gold X Usdt
VITE_APP_URL=https://your-domain.com
```

### Vercel Environment Variables

In Vercel dashboard, add these environment variables:

1. Go to Project Settings → Environment Variables
2. Add the following:
   - `VITE_SUPABASE_URL`: https://gkmvncioffmvzxhuaohv.supabase.co
   - `VITE_SUPABASE_ANON_KEY`: [your anon key]
   - `VITE_APP_NAME`: Gold X Usdt
   - `VITE_APP_URL`: https://your-domain.vercel.app

### Netlify Environment Variables

In Netlify dashboard:

1. Go to Site Settings → Environment Variables
2. Add the same variables as Vercel

---

## User Management

### Creating Admin User

1. **Via Supabase Dashboard:**
   ```sql
   -- Update existing user to admin
   UPDATE profiles
   SET is_admin = true
   WHERE email = 'admin@goldxusdt.com';
   ```

2. **Via SQL Editor:**
   ```sql
   -- Create admin user
   INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
   VALUES ('admin@goldxusdt.com', crypt('admin_password', gen_salt('bf')), NOW());
   
   -- Set admin flag
   UPDATE profiles
   SET is_admin = true
   WHERE email = 'admin@goldxusdt.com';
   ```

### User Roles

1. **Regular User:**
   - Can view own profile and transactions
   - Can make deposits and withdrawals
   - Can refer other users
   - Can submit support tickets

2. **Admin User:**
   - All regular user permissions
   - Can view all users and transactions
   - Can approve/reject deposits and withdrawals
   - Can manage platform settings
   - Can manage KYC verifications
   - Can reply to support tickets
   - Can edit landing page content

### User Operations

#### Activate/Deactivate User
```sql
-- Deactivate user
UPDATE profiles
SET is_active = false
WHERE id = 'user_uuid';

-- Activate user
UPDATE profiles
SET is_active = true
WHERE id = 'user_uuid';
```

#### Reset User Password (Admin)
```sql
-- Generate password reset token
SELECT auth.generate_password_reset_token('user@example.com');
```

#### View User Referral Tree
```sql
-- Get all referrals for a user
WITH RECURSIVE referral_tree AS (
  SELECT id, email, referred_by, 1 as level
  FROM profiles
  WHERE id = 'user_uuid'
  
  UNION ALL
  
  SELECT p.id, p.email, p.referred_by, rt.level + 1
  FROM profiles p
  INNER JOIN referral_tree rt ON p.referred_by = rt.id
  WHERE rt.level < 4
)
SELECT * FROM referral_tree;
```

#### Calculate User ROI
```sql
-- Get total ROI for a user
SELECT 
  user_id,
  SUM(amount) as total_roi
FROM transactions
WHERE user_id = 'user_uuid'
  AND type = 'roi'
  AND status = 'completed'
GROUP BY user_id;
```

---

## Deployment Guide

### Prerequisites

1. **Supabase Project:**
   - Project ID: gtbptywlxhleadgabivi
   - Anon Key: [provided in requirements]
   - Service Role Key: [from Supabase dashboard]

2. **Email Service:**
   - Zoho Mail API credentials
   - SMTP configuration

3. **USDT Wallet Addresses:**
   - BEP-20 wallet address
   - TRC-20 wallet address

### Deployment Steps

#### 1. Vercel Deployment

**Step 1: Install Vercel CLI**
```bash
npm install -g vercel
```

**Step 2: Login to Vercel**
```bash
vercel login
```

**Step 3: Deploy**
```bash
cd /path/to/project
vercel
```

**Step 4: Set Environment Variables**
```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_APP_NAME
vercel env add VITE_APP_URL
```

**Step 5: Deploy to Production**
```bash
vercel --prod
```

#### 2. Netlify Deployment

**Step 1: Install Netlify CLI**
```bash
npm install -g netlify-cli
```

**Step 2: Login to Netlify**
```bash
netlify login
```

**Step 3: Initialize Site**
```bash
cd /path/to/project
netlify init
```

**Step 4: Set Environment Variables**
```bash
netlify env:set VITE_SUPABASE_URL "https://gkmvncioffmvzxhuaohv.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "your_anon_key"
netlify env:set VITE_APP_NAME "Gold X Usdt"
netlify env:set VITE_APP_URL "https://your-site.netlify.app"
```

**Step 5: Deploy**
```bash
netlify deploy --prod
```

#### 3. GitHub Pages Deployment

**Step 1: Install gh-pages**
```bash
npm install --save-dev gh-pages
```

**Step 2: Update package.json**
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  },
  "homepage": "https://yourusername.github.io/repo-name"
}
```

**Step 3: Deploy**
```bash
npm run deploy
```

#### 4. Custom Server Deployment

**Step 1: Build the Project**
```bash
npm run build
```

**Step 2: Configure Web Server (Nginx)**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/goldxusdt/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Step 3: Upload Files**
```bash
scp -r dist/* user@server:/var/www/goldxusdt/
```

**Step 4: Restart Web Server**
```bash
sudo systemctl restart nginx
```

### Supabase Edge Functions Deployment

**Step 1: Install Supabase CLI**
```bash
npm install -g supabase
```

**Step 2: Login to Supabase**
```bash
supabase login
```

**Step 3: Link Project**
```bash
supabase link --project-ref gtbptywlxhleadgabivi
```

**Step 4: Set Secrets**
```bash
supabase secrets set ZOHO_API_KEY=your_api_key
supabase secrets set ZOHO_SMTP_HOST=smtp.zoho.com
supabase secrets set ZOHO_FROM_EMAIL=noreply@goldxusdt.com
```

**Step 5: Deploy Functions**
```bash
supabase functions deploy send-otp
supabase functions deploy verify-otp
supabase functions deploy create-user
supabase functions deploy reset-password-otp
supabase functions deploy verify-transaction
supabase functions deploy monthly-interest-credit
supabase functions deploy process-auto-withdrawals
supabase functions deploy delete-user
```

**Step 6: Set Up Cron Jobs**

In Supabase Dashboard → Database → Extensions → Enable pg_cron

```sql
-- Daily ROI credit at midnight UTC
SELECT cron.schedule(
  'daily-roi-credit',
  '0 0 * * *',
  $$
  SELECT net.http_post(
    url := 'https://gkmvncioffmvzxhuaohv.supabase.co/functions/v1/monthly-interest-credit',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  ) AS request_id;
  $$
);

-- Hourly auto-withdrawal processing
SELECT cron.schedule(
  'process-auto-withdrawals',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://gkmvncioffmvzxhuaohv.supabase.co/functions/v1/process-auto-withdrawals',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  ) AS request_id;
  $$
);
```

### Database Migration

**Step 1: Export Current Schema**
```bash
supabase db dump --schema public > schema.sql
```

**Step 2: Apply to New Project**
```bash
supabase db push
```

### Backup Strategy

**Step 1: Automated Backups**
- Enable Point-in-Time Recovery in Supabase Dashboard
- Set backup retention period (7-30 days)

**Step 2: Manual Backups**
```bash
# Backup database
supabase db dump > backup_$(date +%Y%m%d).sql

# Backup storage
supabase storage download --bucket kyc-documents --path ./backups/
```

---

## Monitoring & Maintenance

### Health Checks

1. **Database Health:**
```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

2. **Edge Function Logs:**
```bash
supabase functions logs send-otp
supabase functions logs monthly-interest-credit
```

3. **Transaction Monitoring:**
```sql
-- Check pending transactions
SELECT type, status, COUNT(*)
FROM transactions
WHERE status = 'pending'
GROUP BY type, status;

-- Check failed transactions
SELECT *
FROM transactions
WHERE status = 'rejected'
  AND created_at > NOW() - INTERVAL '24 hours';
```

### Performance Optimization

1. **Database Indexes:**
```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
```

2. **Query Optimization:**
```sql
-- Use materialized views for complex queries
CREATE MATERIALIZED VIEW user_stats AS
SELECT 
  p.id,
  p.email,
  p.total_invested,
  p.total_withdrawn,
  COUNT(DISTINCT r.referred_id) as total_referrals,
  SUM(CASE WHEN t.type = 'roi' THEN t.amount ELSE 0 END) as total_roi
FROM profiles p
LEFT JOIN referrals r ON p.id = r.referrer_id
LEFT JOIN transactions t ON p.id = t.user_id
GROUP BY p.id, p.email, p.total_invested, p.total_withdrawn;

-- Refresh periodically
REFRESH MATERIALIZED VIEW user_stats;
```

### Security Audits

1. **Check RLS Policies:**
```sql
-- List all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';
```

2. **Check Admin Users:**
```sql
-- List all admin users
SELECT id, email, is_admin, is_active, created_at
FROM profiles
WHERE is_admin = true;
```

3. **Check Suspicious Activity:**
```sql
-- Large transactions
SELECT *
FROM transactions
WHERE amount > 10000
  AND created_at > NOW() - INTERVAL '24 hours';

-- Multiple failed login attempts
SELECT email, COUNT(*)
FROM auth.audit_log_entries
WHERE action = 'login'
  AND created_at > NOW() - INTERVAL '1 hour'
GROUP BY email
HAVING COUNT(*) > 5;
```

---

## Troubleshooting

### Common Issues

1. **Email Not Sending:**
   - Check Zoho Mail API credentials
   - Verify SMTP configuration
   - Check Edge Function logs: `supabase functions logs send-otp`

2. **ROI Not Crediting:**
   - Check cron job status
   - Verify `monthly-interest-credit` function logs
   - Check `last_roi_credit_at` in profiles table

3. **Withdrawal Not Processing:**
   - Verify cooling period (48 hours)
   - Check admin approval status
   - Check `process-auto-withdrawals` function logs

4. **Referral Commission Not Credited:**
   - Verify referral relationship in `referrals` table
   - Check deposit approval status
   - Verify commission rates in `platform_settings`

5. **Build Errors:**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Clear build cache: `rm -rf dist .vite`
   - Check TypeScript errors: `npm run type-check`

### Support

For technical support:
- Email: support@goldxusdt.com
- Documentation: https://docs.goldxusdt.com
- GitHub Issues: https://github.com/goldxusdt/platform/issues

---

## Appendix

### Useful SQL Queries

**Get User Balance Summary:**
```sql
SELECT 
  id,
  email,
  deposit_balance,
  roi_balance,
  bonus_balance,
  withdrawal_balance,
  (deposit_balance + roi_balance + bonus_balance + withdrawal_balance) as total_balance
FROM profiles
WHERE id = 'user_uuid';
```

**Get Referral Tree:**
```sql
WITH RECURSIVE referral_tree AS (
  SELECT 
    id, 
    email, 
    referred_by, 
    1 as level,
    ARRAY[id] as path
  FROM profiles
  WHERE id = 'user_uuid'
  
  UNION ALL
  
  SELECT 
    p.id, 
    p.email, 
    p.referred_by, 
    rt.level + 1,
    rt.path || p.id
  FROM profiles p
  INNER JOIN referral_tree rt ON p.referred_by = rt.id
  WHERE rt.level < 4
    AND NOT p.id = ANY(rt.path)
)
SELECT 
  level,
  email,
  id
FROM referral_tree
ORDER BY level, email;
```

**Get Transaction History:**
```sql
SELECT 
  t.id,
  t.type,
  t.amount,
  t.fee,
  t.net_amount,
  t.status,
  t.created_at,
  p.email as user_email
FROM transactions t
JOIN profiles p ON t.user_id = p.id
WHERE t.user_id = 'user_uuid'
ORDER BY t.created_at DESC
LIMIT 50;
```

**Get Platform Statistics:**
```sql
SELECT 
  COUNT(DISTINCT id) as total_users,
  COUNT(DISTINCT CASE WHEN is_active THEN id END) as active_users,
  SUM(total_invested) as total_invested,
  SUM(total_withdrawn) as total_withdrawn,
  SUM(deposit_balance + roi_balance + bonus_balance) as total_balance
FROM profiles;
```

---

**Document Version:** 1.0  
**Last Updated:** 2026-03-13  
**Maintained By:** Gold X Usdt Development Team
