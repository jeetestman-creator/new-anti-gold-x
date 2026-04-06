# Quick Deployment Guide - Gold X Usdt Platform

## 🚀 Deploy in 5 Minutes

### Prerequisites
- Node.js 18+ installed
- Vercel or Netlify account
- Supabase project configured

---

## Option 1: Deploy to Vercel (Recommended)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login
```bash
vercel login
```

### Step 3: Deploy
```bash
cd /path/to/project
vercel
```

### Step 4: Add Environment Variables
```bash
vercel env add VITE_SUPABASE_URL production
# Paste: https://gkmvncioffmvzxhuaohv.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY production
# Paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0YnB0eXdseGhsZWFkZ2FiaXZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MjM4NjQsImV4cCI6MjA4ODk5OTg2NH0.NGN6s3utBiD1Xrin2rifVsWOH7GT6OXXqzG6SIYvOT0

vercel env add VITE_APP_NAME production
# Paste: Gold X Usdt

vercel env add VITE_APP_URL production
# Paste: https://your-domain.vercel.app
```

### Step 5: Deploy to Production
```bash
vercel --prod
```

### ✅ Done! Your app is live at: https://your-project.vercel.app

---

## Option 2: Deploy to Netlify

### Step 1: Install Netlify CLI
```bash
npm install -g netlify-cli
```

### Step 2: Login
```bash
netlify login
```

### Step 3: Initialize
```bash
cd /path/to/project
netlify init
```

### Step 4: Add Environment Variables
```bash
netlify env:set VITE_SUPABASE_URL "https://gkmvncioffmvzxhuaohv.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0YnB0eXdseGhsZWFkZ2FiaXZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MjM4NjQsImV4cCI6MjA4ODk5OTg2NH0.NGN6s3utBiD1Xrin2rifVsWOH7GT6OXXqzG6SIYvOT0"
netlify env:set VITE_APP_NAME "Gold X Usdt"
netlify env:set VITE_APP_URL "https://your-site.netlify.app"
```

### Step 5: Deploy
```bash
netlify deploy --prod
```

### ✅ Done! Your app is live at: https://your-site.netlify.app

---

## Option 3: Deploy via GitHub (No CLI)

### Vercel via GitHub

1. Push your code to GitHub
2. Go to https://vercel.com/new
3. Click "Import Project"
4. Select your repository
5. Configure:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Add environment variables (see above)
7. Click "Deploy"

### Netlify via GitHub

1. Push your code to GitHub
2. Go to https://app.netlify.com/start
3. Click "New site from Git"
4. Select your repository
5. Configure:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Add environment variables (see above)
7. Click "Deploy site"

---

## Post-Deployment Setup

### 1. Configure Custom Domain (Optional)

**Vercel:**
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records (see CUSTOM_DOMAIN_GUIDE.md)

**Netlify:**
1. Go to Domain settings
2. Add custom domain
3. Update DNS records (see CUSTOM_DOMAIN_GUIDE.md)

### 2. Set Up Supabase Cron Jobs

```sql
-- In Supabase SQL Editor

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

### 3. Create Admin User

```sql
-- In Supabase SQL Editor
UPDATE profiles
SET is_admin = true
WHERE email = 'your-admin-email@example.com';
```

### 4. Configure Platform Settings

```sql
-- Update USDT wallet addresses
UPDATE platform_settings
SET value = 'YOUR_BEP20_WALLET_ADDRESS'
WHERE key = 'usdt_wallet_bep20';

UPDATE platform_settings
SET value = 'YOUR_TRC20_WALLET_ADDRESS'
WHERE key = 'usdt_wallet_trc20';
```

---

## Verification Checklist

After deployment, verify:

- [ ] Homepage loads correctly
- [ ] Sign up flow works
- [ ] Login flow works
- [ ] Email verification works
- [ ] Deposit page displays wallet addresses
- [ ] Withdrawal page works
- [ ] Admin panel accessible (for admin users)
- [ ] Referral links work
- [ ] Support tickets can be created
- [ ] No console errors
- [ ] SSL certificate active (HTTPS)

---

## Troubleshooting

### Build Fails

**Error:** "Command not found: build"
**Solution:** Make sure you're using the updated package.json with proper build scripts

**Error:** "Module not found"
**Solution:** Run `npm install` before deploying

### Environment Variables Not Working

**Solution:** 
1. Verify variables are set in deployment platform
2. Redeploy after adding variables
3. Check variable names start with `VITE_`

### 404 on Page Refresh

**Solution:** Already fixed in vercel.json and netlify.toml

### Supabase Connection Error

**Solution:**
1. Verify VITE_SUPABASE_URL is correct
2. Verify VITE_SUPABASE_ANON_KEY is correct
3. Check Supabase project is not paused

---

## Support

For detailed documentation, see:
- **Backend Documentation:** BACKEND_SERVICE_DOCUMENTATION.md
- **Custom Domain Setup:** CUSTOM_DOMAIN_GUIDE.md
- **Troubleshooting:** DEPLOYMENT_TROUBLESHOOTING.md
- **Security Audit:** SECURITY_AUDIT_REPORT.md

---

## Next Steps

1. ✅ Deploy application
2. ✅ Configure custom domain
3. ✅ Set up monitoring
4. ✅ Create admin user
5. ✅ Configure platform settings
6. ✅ Test all features
7. ✅ Launch! 🎉

---

**Need Help?** Check the comprehensive documentation files or contact support.
