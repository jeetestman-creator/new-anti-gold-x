# Custom Domain Setup Guide - Gold X Usdt Platform

## Table of Contents
1. [Overview](#overview)
2. [Vercel Custom Domain](#vercel-custom-domain)
3. [Netlify Custom Domain](#netlify-custom-domain)
4. [DNS Configuration](#dns-configuration)
5. [SSL/HTTPS Setup](#sslhttps-setup)
6. [Supabase Custom Domain](#supabase-custom-domain)
7. [Email Domain Setup](#email-domain-setup)
8. [Troubleshooting](#troubleshooting)

---

## Overview

This guide will help you set up a custom domain for your Gold X Usdt MLM platform. You'll need:

- A registered domain name (e.g., goldxusdt.com)
- Access to your domain registrar's DNS settings
- Your deployment platform account (Vercel, Netlify, etc.)

**Recommended Domain Registrars:**
- Namecheap
- GoDaddy
- Google Domains
- Cloudflare Registrar

---

## Vercel Custom Domain

### Step 1: Add Domain in Vercel Dashboard

1. Go to your Vercel project dashboard
2. Click on **Settings** → **Domains**
3. Enter your domain name (e.g., `goldxusdt.com`)
4. Click **Add**

### Step 2: Configure DNS Records

Vercel will provide you with DNS records to add. You'll need to add one of the following:

**Option A: Using A Records (Recommended)**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600
```

**Option B: Using CNAME Record**
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
TTL: 3600
```

### Step 3: Add www Subdomain

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

### Step 4: Verify Domain

1. Wait 24-48 hours for DNS propagation (usually faster)
2. Vercel will automatically verify and issue SSL certificate
3. Check status in Vercel dashboard

### Step 5: Set Primary Domain

1. In Vercel dashboard, go to **Settings** → **Domains**
2. Click on the three dots next to your domain
3. Select **Set as Primary Domain**
4. This will redirect all other domains to your primary domain

### Step 6: Update Environment Variables

Update your environment variables to use the new domain:

```bash
vercel env add VITE_APP_URL production
# Enter: https://goldxusdt.com
```

---

## Netlify Custom Domain

### Step 1: Add Domain in Netlify Dashboard

1. Go to your Netlify site dashboard
2. Click on **Domain settings**
3. Click **Add custom domain**
4. Enter your domain name (e.g., `goldxusdt.com`)
5. Click **Verify**

### Step 2: Configure DNS Records

**Option A: Using Netlify DNS (Recommended)**

1. Click **Set up Netlify DNS**
2. Netlify will provide nameservers (e.g., `dns1.p01.nsone.net`)
3. Go to your domain registrar
4. Update nameservers to Netlify's nameservers
5. Wait for DNS propagation (24-48 hours)

**Option B: Using External DNS**

Add these records to your domain registrar:

```
Type: A
Name: @
Value: 75.2.60.5
TTL: 3600
```

```
Type: CNAME
Name: www
Value: your-site-name.netlify.app
TTL: 3600
```

### Step 3: Enable HTTPS

1. In Netlify dashboard, go to **Domain settings**
2. Scroll to **HTTPS** section
3. Click **Verify DNS configuration**
4. Click **Provision certificate**
5. Wait for SSL certificate to be issued (usually 1-2 minutes)

### Step 4: Force HTTPS

1. In **HTTPS** section, enable **Force HTTPS**
2. This will redirect all HTTP traffic to HTTPS

### Step 5: Update Environment Variables

```bash
netlify env:set VITE_APP_URL "https://goldxusdt.com"
```

---

## DNS Configuration

### Understanding DNS Records

**A Record:**
- Points domain to an IP address
- Used for root domain (e.g., goldxusdt.com)
- Example: `goldxusdt.com → 76.76.21.21`

**CNAME Record:**
- Points domain to another domain
- Used for subdomains (e.g., www.goldxusdt.com)
- Example: `www.goldxusdt.com → cname.vercel-dns.com`

**MX Record:**
- Routes email to mail servers
- Required for custom email addresses
- Example: `goldxusdt.com → mail.goldxusdt.com`

**TXT Record:**
- Stores text information
- Used for domain verification and SPF records
- Example: `v=spf1 include:_spf.google.com ~all`

### Common DNS Providers

#### Namecheap

1. Log in to Namecheap
2. Go to **Domain List** → Select your domain
3. Click **Manage** → **Advanced DNS**
4. Add records as specified by your hosting provider

#### GoDaddy

1. Log in to GoDaddy
2. Go to **My Products** → **Domains**
3. Click on your domain → **DNS**
4. Add records as specified

#### Cloudflare

1. Log in to Cloudflare
2. Select your domain
3. Go to **DNS** tab
4. Add records as specified
5. **Important:** Set proxy status to "DNS only" (gray cloud) for initial setup

#### Google Domains

1. Log in to Google Domains
2. Select your domain
3. Go to **DNS** → **Custom records**
4. Add records as specified

### DNS Propagation

**What is DNS Propagation?**
- Time it takes for DNS changes to spread across the internet
- Usually 1-24 hours, can take up to 48 hours
- Varies by location and DNS provider

**Check DNS Propagation:**
- Use https://dnschecker.org
- Enter your domain name
- Select record type (A, CNAME, etc.)
- Check propagation status worldwide

---

## SSL/HTTPS Setup

### Automatic SSL (Recommended)

Both Vercel and Netlify provide automatic SSL certificates via Let's Encrypt:

**Vercel:**
- Automatically issues SSL certificate after domain verification
- Auto-renews every 90 days
- No configuration required

**Netlify:**
- Click "Provision certificate" in domain settings
- Auto-renews every 90 days
- No configuration required

### Manual SSL Setup (Advanced)

If you need to use a custom SSL certificate:

**Step 1: Obtain SSL Certificate**

Option A: Let's Encrypt (Free)
```bash
# Install certbot
sudo apt-get install certbot

# Generate certificate
sudo certbot certonly --standalone -d goldxusdt.com -d www.goldxusdt.com
```

Option B: Purchase from SSL Provider
- Namecheap SSL
- DigiCert
- Comodo

**Step 2: Upload Certificate**

For custom servers (Nginx):
```nginx
server {
    listen 443 ssl http2;
    server_name goldxusdt.com www.goldxusdt.com;

    ssl_certificate /etc/letsencrypt/live/goldxusdt.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/goldxusdt.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Your app configuration
    root /var/www/goldxusdt/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name goldxusdt.com www.goldxusdt.com;
    return 301 https://$server_name$request_uri;
}
```

**Step 3: Test SSL Configuration**
- Use https://www.ssllabs.com/ssltest/
- Aim for A+ rating

---

## Supabase Custom Domain

### Option 1: Using Supabase Default Domain

Your Supabase project URL:
```
https://gkmvncioffmvzxhuaohv.supabase.co
```

This is sufficient for most use cases and requires no additional setup.

### Option 2: Custom Domain for Supabase (Pro Plan)

If you have Supabase Pro plan, you can use a custom domain:

**Step 1: Configure Custom Domain in Supabase**

1. Go to Supabase Dashboard → Project Settings
2. Click on **Custom Domains**
3. Enter your subdomain (e.g., `api.goldxusdt.com`)
4. Click **Add domain**

**Step 2: Add DNS Records**

Add CNAME record to your DNS:
```
Type: CNAME
Name: api
Value: gkmvncioffmvzxhuaohv.supabase.co
TTL: 3600
```

**Step 3: Update Frontend Configuration**

Update your `.env` file:
```env
VITE_SUPABASE_URL=https://api.goldxusdt.com
VITE_SUPABASE_ANON_KEY=your_anon_key
```

Redeploy your application with new environment variables.

---

## Email Domain Setup

### Setting Up Custom Email (e.g., support@goldxusdt.com)

#### Option 1: Google Workspace (Recommended)

**Step 1: Sign Up for Google Workspace**
- Go to https://workspace.google.com
- Choose a plan (Business Starter: $6/user/month)
- Enter your domain name

**Step 2: Verify Domain Ownership**

Add TXT record to your DNS:
```
Type: TXT
Name: @
Value: google-site-verification=xxxxxxxxxxxxx
TTL: 3600
```

**Step 3: Configure MX Records**

Add these MX records:
```
Priority: 1
Host: @
Value: ASPMX.L.GOOGLE.COM
TTL: 3600

Priority: 5
Host: @
Value: ALT1.ASPMX.L.GOOGLE.COM
TTL: 3600

Priority: 5
Host: @
Value: ALT2.ASPMX.L.GOOGLE.COM
TTL: 3600

Priority: 10
Host: @
Value: ALT3.ASPMX.L.GOOGLE.COM
TTL: 3600

Priority: 10
Host: @
Value: ALT4.ASPMX.L.GOOGLE.COM
TTL: 3600
```

**Step 4: Configure SPF Record**

Add TXT record:
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.google.com ~all
TTL: 3600
```

**Step 5: Configure DKIM**

1. In Google Workspace Admin, go to **Apps** → **Google Workspace** → **Gmail**
2. Click **Authenticate email**
3. Click **Generate new record**
4. Copy the DKIM record and add to your DNS:

```
Type: TXT
Name: google._domainkey
Value: v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...
TTL: 3600
```

**Step 6: Configure DMARC**

Add TXT record:
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@goldxusdt.com
TTL: 3600
```

#### Option 2: Zoho Mail (Free for up to 5 users)

**Step 1: Sign Up**
- Go to https://www.zoho.com/mail/
- Sign up for free plan

**Step 2: Add MX Records**

```
Priority: 10
Host: @
Value: mx.zoho.com
TTL: 3600

Priority: 20
Host: @
Value: mx2.zoho.com
TTL: 3600
```

**Step 3: Verify Domain**

Add TXT record:
```
Type: TXT
Name: @
Value: zoho-verification=xxxxxxxxxx
TTL: 3600
```

**Step 4: Configure SPF**

```
Type: TXT
Name: @
Value: v=spf1 include:zoho.com ~all
TTL: 3600
```

#### Option 3: SendGrid (For Transactional Emails)

**Step 1: Sign Up for SendGrid**
- Go to https://sendgrid.com
- Sign up for free plan (100 emails/day)

**Step 2: Domain Authentication**

1. In SendGrid dashboard, go to **Settings** → **Sender Authentication**
2. Click **Authenticate Your Domain**
3. Enter your domain name
4. SendGrid will provide DNS records

**Step 3: Add DNS Records**

Add the CNAME records provided by SendGrid:
```
Type: CNAME
Name: em1234
Value: u1234567.wl123.sendgrid.net
TTL: 3600

Type: CNAME
Name: s1._domainkey
Value: s1.domainkey.u1234567.wl123.sendgrid.net
TTL: 3600

Type: CNAME
Name: s2._domainkey
Value: s2.domainkey.u1234567.wl123.sendgrid.net
TTL: 3600
```

**Step 4: Update Edge Functions**

Update Supabase secrets to use SendGrid:
```bash
supabase secrets set SENDGRID_API_KEY=your_api_key
supabase secrets set SENDGRID_FROM_EMAIL=noreply@goldxusdt.com
```

Update Edge Functions to use SendGrid API instead of Zoho Mail.

---

## Troubleshooting

### Domain Not Working

**Issue:** Domain shows "DNS_PROBE_FINISHED_NXDOMAIN"

**Solution:**
1. Check DNS records are correctly configured
2. Wait for DNS propagation (up to 48 hours)
3. Clear browser cache and DNS cache:
   ```bash
   # Windows
   ipconfig /flushdns
   
   # Mac
   sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
   
   # Linux
   sudo systemd-resolve --flush-caches
   ```
4. Use incognito/private browsing mode

### SSL Certificate Not Issued

**Issue:** "Your connection is not private" error

**Solution:**
1. Verify DNS records are correct
2. Wait for DNS propagation
3. In Vercel/Netlify, try removing and re-adding the domain
4. Check that you're not using Cloudflare proxy (orange cloud)
5. Contact support if issue persists

### www vs non-www

**Issue:** www.goldxusdt.com works but goldxusdt.com doesn't (or vice versa)

**Solution:**
1. Ensure both A record (@) and CNAME record (www) are configured
2. Set primary domain in hosting dashboard
3. Enable automatic redirects

### Email Not Sending

**Issue:** Emails from custom domain not being delivered

**Solution:**
1. Verify MX records are correct
2. Check SPF record is configured
3. Configure DKIM authentication
4. Add DMARC policy
5. Check spam folder
6. Use mail-tester.com to test email deliverability

### Slow DNS Propagation

**Issue:** DNS changes taking too long to propagate

**Solution:**
1. Lower TTL values before making changes (e.g., 300 seconds)
2. Use Cloudflare for faster propagation
3. Check propagation status: https://dnschecker.org
4. Wait up to 48 hours for full global propagation

### Mixed Content Warnings

**Issue:** "Mixed content" warnings after enabling HTTPS

**Solution:**
1. Ensure all resources (images, scripts, CSS) use HTTPS
2. Update hardcoded HTTP URLs to HTTPS
3. Use protocol-relative URLs: `//example.com/image.jpg`
4. Enable "Force HTTPS" in hosting dashboard

---

## Best Practices

### 1. Use Cloudflare (Optional but Recommended)

**Benefits:**
- Free SSL certificate
- DDoS protection
- CDN for faster loading
- Analytics
- Firewall rules

**Setup:**
1. Sign up at https://cloudflare.com
2. Add your domain
3. Update nameservers at your registrar
4. Configure SSL/TLS mode to "Full (strict)"
5. Enable "Always Use HTTPS"

### 2. Configure Redirects

**Redirect www to non-www (or vice versa):**

In Vercel:
```json
// vercel.json
{
  "redirects": [
    {
      "source": "https://www.goldxusdt.com/:path*",
      "destination": "https://goldxusdt.com/:path*",
      "permanent": true
    }
  ]
}
```

In Netlify:
```toml
# netlify.toml
[[redirects]]
  from = "https://www.goldxusdt.com/*"
  to = "https://goldxusdt.com/:splat"
  status = 301
  force = true
```

### 3. Monitor Domain Health

**Tools:**
- https://www.ssllabs.com/ssltest/ - SSL configuration
- https://dnschecker.org - DNS propagation
- https://mail-tester.com - Email deliverability
- https://www.whatsmydns.net - Global DNS lookup

### 4. Set Up Domain Monitoring

Use services like:
- UptimeRobot (free)
- Pingdom
- StatusCake

Configure alerts for:
- Website downtime
- SSL certificate expiration
- DNS issues

---

## Quick Reference

### Vercel DNS Records
```
Type: A, Name: @, Value: 76.76.21.21
Type: CNAME, Name: www, Value: cname.vercel-dns.com
```

### Netlify DNS Records
```
Type: A, Name: @, Value: 75.2.60.5
Type: CNAME, Name: www, Value: your-site.netlify.app
```

### Google Workspace MX Records
```
Priority: 1, Value: ASPMX.L.GOOGLE.COM
Priority: 5, Value: ALT1.ASPMX.L.GOOGLE.COM
Priority: 5, Value: ALT2.ASPMX.L.GOOGLE.COM
Priority: 10, Value: ALT3.ASPMX.L.GOOGLE.COM
Priority: 10, Value: ALT4.ASPMX.L.GOOGLE.COM
```

### SPF Record
```
Type: TXT, Name: @, Value: v=spf1 include:_spf.google.com ~all
```

### DMARC Record
```
Type: TXT, Name: _dmarc, Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@goldxusdt.com
```

---

## Support

For additional help:
- Vercel Documentation: https://vercel.com/docs/concepts/projects/custom-domains
- Netlify Documentation: https://docs.netlify.com/domains-https/custom-domains/
- Cloudflare Documentation: https://developers.cloudflare.com/dns/

---

**Document Version:** 1.0  
**Last Updated:** 2026-03-13  
**Maintained By:** Gold X Usdt Development Team
