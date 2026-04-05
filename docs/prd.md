# Requirements Document

## 1. Application Overview

### 1.1 Application Name

Gold X Usdt

### 1.2 Application Description

A Multi-Level Marketing (MLM) platform focused on Gold USDT investments, featuring automated ROI distribution, 15-level referral commission tracking with performance-based unlocking, wallet management, secure payment processing, coupon code system for promotional offers, an investment and return calculator with interactive animated charts (ROI growth over time and referral commission breakdown via Recharts), referral level calculator, a Team Growth Simulator in the user dashboard for projecting network earnings across all 15 referral levels (4 basic + 11 performance-based) with compounding ROI toggle and multi-year projection graphs, PDF export and share via email for simulation results, a Network Leaders leaderboard on the dashboard displaying top members ranked by unlocked referral levels, a Unified Wealth-Building Projection Dashboard accessible from the Earnings Analysis page (not the main dashboard) synchronizing the personal investment calculator with the Team Growth Simulator, a comprehensive administrative control panel for managing user performance metrics and ROI configuration, advanced Admin Settings (SEO, branding, analytics, site configuration), SMTP credential management with real-time backend propagation, TRC-20/BEP-20 auto-confirmation API configuration, professionally designed transactional email templates for signup OTP verification and password reset, calculator results export as PDF and share via email, a post-development code audit and quality assurance process, full deployment configuration for Netlify, Vercel, and other compatible platforms, a Supabase-native backend using PostgreSQL as the primary database, a full backend document service outputting all data, functions, tables, SQL definitions, and export values exclusively in CSV file format, an automated backend compounding ROI service that calculates and credits compounding ROI to user wallets based on reinvestment settings, a Downline Analytics page providing deep-dive insights into all 15 referral levels, a ROI Analytics Dashboard for users to track historical earnings growth with interactive line charts, a visual zoomable referral tree diagram in the user dashboard, a comprehensive admin audit log tracking all changes to referral commission rates and platform settings with timestamps, Sentry error-tracking integration for real-time client-side authentication failure capture, Google Analytics 4 event tracking for ROI distribution events and a GA4 conversion funnel from landing page to successful deposit, a per-user and per-period ROI adjustment feature allowing admins to override the platform ROI rate for specific users or date ranges, a user-group and investment-period ROI adjustment feature allowing admins to define ROI rate overrides for named user groups or specific investment periods, a Per-User Default ROI Settings feature allowing admins to apply centralized Referral Commission Structure defaults to individual users from the ROI Information section of the user edit page, an interactive Investment Pitch component on the landing page using luxury styling to walk users through the platform value proposition with scroll-driven reveal-bottom entrance animations and an integrated real-time ROI projection calculator using the user's custom settings for personalized wealth modeling, a Global Impact step within the Investment Pitch featuring a real-time counter of total platform payouts and active investor locations, and a set of custom-themed gold 3D icons replacing standard Lucide icons in key dashboard cards. The platform uses Node.js as the backend runtime. Email delivery is handled via Hostinger SMTP service (configurable). All branding is neutral and configurable via the admin panel. All pages and settings are fully responsive and optimized for all devices. The platform implements a comprehensive, hardened security posture including system-wide vulnerability auditing, advanced firewall configuration, network segmentation, continuous monitoring, and structured security improvement procedures.

### 1.3 Mission and Vision

**Mission**: To provide a secure, transparent, and user-friendly investment platform that empowers individuals to grow their wealth through Gold USDT investments and referral opportunities.

**Vision**: To become the leading MLM platform in the cryptocurrency investment space, fostering financial independence and building a global community of successful investors.

### 1.4 Core Functionality

- User registration with email OTP verification (6-digit OTP sent to registered email; account activated upon correct OTP entry)
- **Terms & Conditions acceptance checkbox on signup page (required before account creation)**
- Login with email/password; Google login supported via OSS Google login (Client ID: 114556910729-mc08hn04hjpturvo53bllpad3ephj54c.apps.googleusercontent.com)
- Admin authentication with OTP verification (signup and login)
- Investment management (deposit/withdrawal)
- Coupon code system for deposit discounts
- Daily ROI calculation and distribution: automatically derived from the effective ROI rate applicable to each user using the formula Daily ROI = (User's Qualified Investment Balance * (Effective Monthly ROI Rate / 100)) / [Number of Days in the Month], credited automatically 24 hours after deposit time; the effective rate is determined by the following priority order: (1) active per-user override rate if one exists for the current period, (2) active user-group ROI rate if the user belongs to a group with an active override for the current period, (3) active investment-period ROI rate if the current date falls within a defined investment period override, (4) the platform-wide Monthly ROI Rate
- Automated monthly ROI display with admin-configurable percentage
- **Admin-configurable minimum deposit amount that reflects in real time on the user-facing deposit page important note content**
- Multi-level referral commission system with 15 levels (4 basic levels + 11 performance-based levels)
- **Admin-editable commission percentages for all 15 referral levels (levels 1-15) in Platform Settings, with correct routing fix for levels 5-15**
- **Admin-editable unlock target USDT values for performance levels 5-15 in Platform Settings; each performance level (5-15) has a dedicated USDT target input field; when the admin changes a level's unlock target, the updated value is immediately reflected in the corresponding per-user USDT target field for all users whose user_roi_default_settings record references that level, subject to the synchronization rules defined in Section 4.12.3 and Section 4.12.23**
- **Default Commission Values Button in Platform Settings Referral Commission Structure**: A clearly visible Default button is present in the admin Platform Settings Referral Commission Structure section; clicking this button resets all 15 referral level commission percentages and unlock targets to the default values defined in Section 5.2; a secondary confirmation prompt is displayed before applying the reset; once the Default button is clicked and confirmed, the admin can freely edit any commission percentage or unlock target field; if any field is missing from the current configuration it is automatically added and populated with the default value from Section 5.2 before the admin proceeds to edit
- **Referral Commission Synchronization Fix**: The Admin Referral Commission Structure (managed in Platform Settings) and the Commission Architecture route must be fully synchronized at all times. Any update made to commission percentages or unlock targets via the admin Platform Settings referral configuration must be immediately propagated to the Commission Architecture route, the user-facing referral level income page, the Investment and Return Calculator rates endpoint (GET /api/calculator/rates), the 15-level referral bonus section on the landing page, and all calculator and simulator widgets. The root cause of any desynchronization must be identified and resolved so that a single source of truth (the Supabase system_settings or referral_settings table) drives all commission displays across the entire application.
- Performance-based referral level unlocking system with cumulative direct referral deposit targets
- Referral attribution preserved across all login methods (Google, Email/Password)
- Wallet system with multiple balance types including auto-withdrawal wallet address
- Admin panel for user and transaction management
- KYC document upload and verification (compulsory for withdrawal)
- Real-time notifications and activity tracking
- Support ticket system with FAQ section
- TRC-20 and BEP-20 automatic transaction confirmation
- **Per-User and Per-Period ROI Adjustment**: admin can override the platform Monthly ROI Rate for a specific user for a defined date range; the override takes precedence over the global rate during the specified period; full audit logging of all adjustments
- **User-Group and Investment-Period ROI Adjustment**: admin can define named user groups, assign users to groups, and set a group-level ROI rate override for a defined date range; admin can also define investment-period ROI rate overrides that apply to all users whose deposits fall within a specified investment period; full audit logging of all group and period adjustments (see Section 4.12.22)
- **Per-User Default ROI Settings (Apply Default Settings)**: admin can apply centralized Referral Commission Structure default values to an individual user's ROI Information fields from the user edit page; missing fields are dynamically added and populated; post-application manual editing is supported (see Section 4.12.23)
- **ROI Analytics Dashboard**: dedicated user-facing page providing historical earnings growth tracking with interactive line charts (see Section 4.14)
- **Visual Zoomable Referral Tree Diagram**: interactive, zoomable referral tree diagram embedded in the user dashboard for visualizing the user's 15-level network (see Section 4.3.5)
- **Comprehensive Admin Audit Log for Commission and Settings Changes**: all changes to referral commission rates and platform settings are tracked with timestamps, admin identity, previous value, and new value in the admin audit log (see Section 4.12.21)
- **Investment and Return Calculator (Wealth Projection Hub)**: dedicated standalone page accessible from user side navigation with back button, redesigned with a simple, unique, step-by-step card-based style, visible text colours throughout in both light and dark themes, interactive animated Recharts visualizations, real-time ROI return calculator, referral level commission calculator with manual value entry per level and results displayed in real time, a dedicated manual level input field, PDF export, and share via email functionality; **all input fields start at 0 (empty/zero state) and results, charts, and output values are hidden until the user has entered values in the relevant fields; once the user enters values, results and charts render and update in real time**
- **Team Growth Simulator**: interactive dashboard widget projecting network earnings based on user-defined recruitment scenarios across all 15 referral levels, with compounding ROI toggle, compounding interest options, multi-year projection graphs using the luxury chart system, PDF export, and share simulation results via email
- **Network Leaders Leaderboard**: dashboard widget displaying top members ranked by the number of referral levels unlocked
- **Unified Wealth-Building Projection Dashboard**: accessible from the Earnings Analysis page (not the main user dashboard); synchronized view combining the personal investment calculator outputs and Team Growth Simulator outputs into a single consolidated projection panel with fully customisable, user-friendly calculation fields that are easy to understand; **all input fields in the Unified Wealth-Building Projection Dashboard start at 0 (empty/zero state); all 15 referral level edit fields are individually visible and directly editable; results, charts, and output values are hidden until the user has entered values; once values are entered, results and charts render and update in real time**
- **Automated Compounding ROI Service**: backend service that calculates and credits compounding ROI to user wallets based on individual reinvestment settings
- **Downline Analytics Page**: deep-dive analytics page covering all 15 referral levels with active member counts and volume contributions
- **Full backend document service: all data exports, function definitions, table schemas, SQL editor outputs, and values output exclusively in CSV file format**
- **15-level referral bonus section displayed prominently on the landing page**
- **Interactive Investment Pitch component on the landing page** using luxury styling with scroll-driven reveal-bottom entrance animations and an integrated real-time ROI projection calculator using the user's custom settings for personalized wealth modeling; includes a Global Impact step featuring a real-time counter of total platform payouts and active investor locations (see Section 4.1.1)
- **Custom-themed gold 3D icons in key dashboard cards** replacing standard Lucide icons (see Section 4.3.6)
- **Back button on the user Transaction page**
- **Back button on the Earnings Analytics page**
- **Back button on the Investment and Return Calculator (Wealth Projection Hub) page**
- **Back button on the Unified Wealth-Building Projection Dashboard (Earnings Analysis page)**
- **Style guide enforced across all pages and components**: all interactive elements, typography, spacing, colour tokens, button states, form inputs, and card layouts must strictly follow the platform style guide; the style guide must be implemented as a shared design token and component system applied consistently across every page, widget, and modal in the application
- Auto withdrawal toggle feature with wallet address entry and admin management
- Global auto withdrawal control by admin
- Total fee tracking in admin dashboard
- Non-KYC and completed KYC user statistics in admin dashboard
- User transaction history page
- Admin landing page editor for full landing page content management
- Legal policy content management (KYC Policy and Refund Policy) via admin panel
- User deletion with fund rescission, referral target recalculation, and audit logging
- Admin direct referral performance management with editable metrics and audit logging
- ROI Settings module with Monthly ROI Rate configuration, automated daily calculation engine, calculation run logs, and manual recalculation tool
- Admin Settings module with SEO optimization, branding and assets management, site configuration, analytics injection, and related options
- **SMTP Credential Management module within Admin Settings**
- **TRC-20/BEP-20 API Configuration module within Platform Settings**
- **Professionally designed HTML email templates for signup OTP verification and password reset**
- **Sentry error-tracking service integrated for real-time capture and analysis of client-side authentication failures**
- **GA4 conversion funnel report tracking users from landing page visit through registration, deposit initiation, and successful deposit completion**
- **Google Analytics event tracking for ROI distribution events**
- Post-development comprehensive code audit and quality assurance
- **Full deployment configuration for Netlify, Vercel, and other compatible hosting platforms**
- **All pages and settings fully responsive and optimized for all devices**
- All branding elements are neutral placeholders configurable via Admin Settings
- **Scroll-driven animations for low-end mobile devices use a simplified fallback reveal for better performance** (see Section 8.1)
- **Comprehensive Security Hardening**: system-wide vulnerability audit, advanced firewall configuration, network segmentation, continuous monitoring framework, and structured security improvement procedures (see Section 22)

---

## 2. Technical Integration

### 2.1 Backend Configuration

- **Primary backend runtime**: Node.js
- **Primary database**: Supabase (PostgreSQL)
- All application data is stored in the Supabase PostgreSQL database via the Supabase client SDK and/or direct PostgreSQL connection from the Node.js backend using the service role key
- RESTful API layer built with Node.js handles all business logic
- Node.js handles authentication, session management, OTP generation and delivery, password reset link delivery, ROI scheduling, referral commission processing, compounding ROI crediting, per-user ROI adjustment enforcement, user-group ROI adjustment enforcement, investment-period ROI adjustment enforcement, per-user default ROI settings application, and all data operations
- Supabase stores all user data, transactions, wallet balances, referral structures, KYC records, coupon codes, support tickets, notifications, system settings, landing page content, legal policy content, referral performance overrides, ROI settings, daily ROI calculation logs, admin settings (SEO, branding, site configuration), SMTP credentials, TRC-20/BEP-20 API configuration, compounding ROI reinvestment settings, per-user ROI adjustment records, user-group ROI adjustment records, investment-period ROI adjustment records, ROI analytics snapshots, referral tree structure data, per-user default ROI settings records, and global impact statistics
- Supabase Row Level Security (RLS) is enabled on all tables
- Supabase Storage is used for KYC documents and platform assets
- Supabase Realtime is enabled for notifications, transactions, and wallets tables
- **No backend service dependency on medo.dev; all backend services are self-contained within the Node.js application and Supabase**

### 2.2 Comprehensive Audit, Remediation, and Productionization

#### 2.2.1 Code Review and Error Resolution

- Review all source code files (`*.js`, `*.ts`) across the entire codebase
- Identify and fix all syntax errors, runtime errors, and logical bugs
- Ensure code follows best practices for security, performance, and maintainability
- Remove all unused variables, dead code, orphaned routes, unused packages, debug/console logs, and obsolete configuration
- Remove all demo-only functions, API endpoints, and UI components that are not part of the core application logic
- Remove all demo data, placeholder text, and sample user accounts
- Clear any seed databases or caches containing non-essential data

#### 2.2.2 Database and Schema Audit

- Review all SQL migration scripts and Supabase schema definitions
- Validate all table structures, relationships (foreign keys), indexes, and constraints as defined in Section 2.6
- Identify and rectify any missing tables, columns, or incorrect data types
- Ensure all database connections and queries are secure and efficient
- Verify Supabase RLS is correctly enforced on all tables
- Confirm all migration scripts are idempotent

#### 2.2.3 Edge Functions and Serverless Audit

- Review all Node.js backend service functions and API route handlers
- Verify correct handling of requests, responses, environment variables, and dependencies
- Resolve any deployment or execution issues across all supported platforms (Netlify, Vercel, Railway, Render, Heroku, DigitalOcean, VPS)

#### 2.2.4 Dependency Audit

- Review `package.json` and all dependency manifests
- Verify all required libraries and packages are present and correctly versioned
- Remove any unused or demo-only dependencies
- Confirm no Excel/XLSX generation libraries are present
- Confirm no references to medo.dev remain in any dependency, configuration, or documentation file

#### 2.2.5 Branding Removal and Content Purge

- Permanently remove all instances of medo.dev marks, text, or references from the entire codebase, configuration files, environment variable templates, and documentation
- Remove all demo/template logos, watermarks, and favicons; replace with neutral admin-configurable placeholders
- Remove all placeholder branding and links to demo sites
- Remove all Juvlon-related code and credentials; verify absence

#### 2.2.6 Real-Time Implementation Verification

- Configure and verify all real-time data flows:
  - Supabase Realtime for notifications, transactions, and wallets tables
  - Daily ROI countdown timer real-time updates
  - Minimum deposit value real-time propagation to user deposit page
  - Commission structure changes real-time propagation to all application routes
  - **Unlock target USDT changes real-time propagation to all per-user USDT target fields and all application routes**
  - SMTP credential updates real-time Nodemailer transport re-initialization
  - Blockchain API configuration real-time reload on admin update
  - Leaderboard auto-refresh at configured interval
  - Recharts visualizations real-time update on input change
  - Unified Wealth-Building Projection Dashboard bidirectional input synchronization

#### 2.2.7 Final Deliverable

- A summary report of all identified and resolved issues
- A list of all major changes and architectural decisions made
- The complete, cleaned, and production-ready codebase
- `DEPLOYMENT.md` at project root covering prerequisites, step-by-step deployment guides, complete environment variable reference, Supabase setup, post-deployment verification checklist, troubleshooting, SSL/TLS setup, and credential rotation procedures

### 2.3 Supabase Migration Requirements

#### 2.3.1 Migration Scope

- All existing database schemas previously defined for MySQL must be recreated in Supabase PostgreSQL using the schema defined in Section 2.6
- All existing application data must be migrated to the new Supabase database with full data integrity verification post-migration
- All API routes, environment variables, connection strings, and SDK calls must be updated to reference the Supabase project URL and API keys
- All authentication, real-time, and storage functionalities must be correctly integrated with Supabase services
- All code, configuration files, and dependencies related to MySQL must be completely removed

#### 2.3.2 Environment Variables (Supabase)

```
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SUPABASE_DB_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxx.supabase.co:5432/postgres
GOOGLE_CLIENT_ID=114556910729-mc08hn04hjpturvo53bllpad3ephj54c.apps.googleusercontent.com
GA_MEASUREMENT_ID=your_google_analytics_measurement_id_here
GA_CLIENT_ID=your_google_analytics_oauth_client_id_here
GA_CLIENT_SECRET=your_google_analytics_oauth_client_secret_here
GA_REFRESH_TOKEN=your_google_analytics_oauth_refresh_token_here
SENTRY_DSN=your_sentry_dsn_here
SENTRY_ENVIRONMENT=production
```

#### 2.3.3 Supabase Client Initialization

- Backend client initialized at `src/config/supabaseClient.js` using the service role key
- Frontend client initialized using the anon key only
- Service role key is never exposed in frontend code or public repositories
- **Google provider must be enabled in the Supabase Authentication dashboard under Providers**

### 2.4 Email Service Configuration (SMTP)

- **Email Service Provider**: Hostinger (configurable via Admin Settings SMTP Credential Management)
- **Previous Provider (decommissioned)**: Zoho Mail and Juvlon — all old SMTP configurations and API keys must be deactivated and removed from the codebase, environment variable templates, and Supabase settings
- **Default SMTP Configuration (Hostinger)**:
  - **SMTP Host**: `smtp.hostinger.com`
  - **SMTP Port**: `465` (SSL/TLS) or `587` (STARTTLS)
  - **Security/Encryption**: SSL/TLS on port 465 (recommended) or STARTTLS on port 587
  - **Authentication**: Required; username is the full Hostinger email address (e.g., `info@yourdomain.com`) and its corresponding password
- **Alternative SMTP Providers**: The SMTP Credential Management module in Admin Settings supports any standard SMTP provider (e.g., Google Workspace, Microsoft 365/Outlook, Amazon SES). Admin can enter custom SMTP host, port, username, and password at runtime.
- All email sending logic in the Node.js backend must reference the SMTP configuration stored in Supabase via the SMTP Credential Management module exclusively; no SMTP credentials are hardcoded in source files
- After updating SMTP configuration via Admin Settings, new credentials must be immediately propagated to the backend mailing system (Nodemailer transport re-initialized) without requiring a server restart
- **SMTP Nodemailer Transport Fix**: Resolve the bufio partial-read error by ensuring the Nodemailer SMTP transport is initialized with explicit `socketTimeout`, `greetingTimeout`, and `connectionTimeout` values
  - For port 465 (SSL/TLS): use `secure: true`
  - For port 587 (STARTTLS): use `secure: false` with `requireTLS: true`
- **OTP Email Fix**: The signup OTP email must deliver the actual rendered 6-digit OTP code to the recipient's inbox
- **Test Connection / Verify Connection**: The SMTP Credential Management panel in Admin Settings must include a Test Connection (or Send Test Mail) button that sends a test email to a configurable recipient address using the currently saved SMTP credentials and reports success or the exact error message returned by the SMTP server
- **DNS Prerequisites for Reliable Delivery**: The deployment documentation (`DEPLOYMENT.md`) must include a section on DNS configuration requirements for the configured mail domain, covering MX records, SPF record, and DKIM record setup. Incorrect DNS configuration is a common cause of delivery failures and must be documented as a troubleshooting step.
- **Hostinger SMTP Setup Guide**: `DEPLOYMENT.md` must include a dedicated sub-section titled Hostinger SMTP Configuration covering:
  - Step-by-step instructions for logging in to Hostinger hPanel
  - How to navigate to Email > SMTP Accounts or SMTP Services
  - How to remove any old or existing SMTP server settings and third-party mail service integrations
  - How to create a new SMTP account using Hostinger's default SMTP (smtp.hostinger.com, port 465 SSL or port 587 STARTTLS)
  - How to use the Admin Settings SMTP Credential Management panel to enter and save the new credentials
  - How to use the Test Connection button to verify the configuration
  - Troubleshooting steps: credential verification, port/encryption mismatch, firewall/security module checks in hPanel, DNS record verification (MX, SPF, DKIM), and how to interpret common error messages (Authentication Failed, Connection Refused)
  - Guidance on using alternative SMTP providers (Google Workspace, Microsoft 365, Amazon SES) as a fallback if Hostinger SMTP is unavailable

### 2.5 Payment Confirmation

- TRC-20 automatic transaction confirmation
- BEP-20 (BSC) automatic transaction confirmation
- Transaction hash verification and auto-approval

### 2.6 TRC-20 / BEP-20 API Configuration

- TRC-20 and BEP-20 API credentials and endpoint URLs are stored in Supabase via Node.js backend
- Admin can view and update TRC-20 and BEP-20 API settings from the Platform Settings section of the admin panel
- Configuration fields for TRC-20:
  - API Provider Name (text input)
  - API Base URL (text input)
  - API Key (masked input, stored encrypted at rest)
  - Wallet Address to monitor (text input)
  - Confirmation threshold (number of block confirmations required)
  - Enable/Disable toggle for TRC-20 auto-confirmation
- Configuration fields for BEP-20 (BSC):
  - API Provider Name (text input)
  - API Base URL (text input)
  - API Key (masked input, stored encrypted at rest)
  - Wallet Address to monitor (text input)
  - Confirmation threshold (number of block confirmations required)
  - Enable/Disable toggle for BEP-20 auto-confirmation
- Save button for each network section to persist changes
- Test Connection button for each network to verify API reachability and key validity
- On save, the Node.js backend immediately reloads the active API configuration without requiring a server restart
- API keys are never returned in plain text via any GET response
- **Deposit Auto-Confirmation Fetch Logic**:
  - When a user submits a deposit with a transaction hash, the backend queries the relevant blockchain API using stored credentials
  - The backend fetches transaction details: sender address, recipient address, amount (in USDT), transaction status, and confirmation count
  - If recipient address matches the platform wallet address, amount matches declared deposit amount (within acceptable tolerance), and confirmation count meets or exceeds configured threshold, the deposit is automatically approved
  - If any condition is not met, the deposit remains in pending state for manual admin review
  - All auto-confirmation attempts are logged with transaction hash, network, fetched details, match result, and timestamp
- **API Endpoints for TRC/BEP API Configuration**:
  - GET /api/admin/blockchain-api-settings
  - PUT /api/admin/blockchain-api-settings/trc20
  - PUT /api/admin/blockchain-api-settings/bep20
  - POST /api/admin/blockchain-api-settings/trc20/test
  - POST /api/admin/blockchain-api-settings/bep20/test

**Database Schema — blockchain_api_settings table (Supabase PostgreSQL)**:
- id (SERIAL PRIMARY KEY)
- network (VARCHAR(10), NOT NULL): TRC20 or BEP20
- provider_name (VARCHAR(255), NULLABLE)
- api_base_url (VARCHAR(500), NOT NULL)
- api_key_encrypted (TEXT, NOT NULL): AES-256 encrypted API key
- wallet_address (VARCHAR(255), NOT NULL)
- confirmation_threshold (INT, NOT NULL, DEFAULT 1)
- is_enabled (BOOLEAN, DEFAULT TRUE)
- updated_by_admin_id (UUID, NULLABLE)
- updated_at (TIMESTAMPTZ, DEFAULT NOW())
- created_at (TIMESTAMPTZ, DEFAULT NOW())

### 2.7 Supabase Database Schema

All tables are created in Supabase PostgreSQL. RLS is enabled on all tables.

**profiles table**
- id (UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE)
- email (TEXT NOT NULL UNIQUE)
- full_name (TEXT)
- phone_number (TEXT)
- country (TEXT)
- state (TEXT)
- city (TEXT)
- pincode (TEXT)
- referred_by_user_id (UUID NULLABLE REFERENCES profiles(id) ON DELETE SET NULL)
- role (TEXT NOT NULL DEFAULT 'user')
- is_deleted (BOOLEAN NOT NULL DEFAULT FALSE)
- deleted_at (TIMESTAMPTZ NULLABLE)
- terms_accepted (BOOLEAN NOT NULL DEFAULT FALSE)
- terms_accepted_at (TIMESTAMPTZ NULLABLE)
- kyc_status (TEXT NOT NULL DEFAULT 'pending')
- auto_withdrawal_enabled (BOOLEAN NOT NULL DEFAULT FALSE)
- auto_withdrawal_wallet_address (TEXT NULLABLE)
- cumulative_direct_referral_deposits (NUMERIC(20,8) NOT NULL DEFAULT 0)
- compounding_roi_enabled (BOOLEAN NOT NULL DEFAULT FALSE)
- compounding_roi_reinvestment_percentage (NUMERIC(5,2) NOT NULL DEFAULT 100)
- created_at (TIMESTAMPTZ NOT NULL DEFAULT NOW())
- updated_at (TIMESTAMPTZ NOT NULL DEFAULT NOW())

**transactions table**
- id (BIGSERIAL PRIMARY KEY)
- user_id (UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE)
- type (TEXT NOT NULL)
- amount (NUMERIC(20,8) NOT NULL)
- fee (NUMERIC(20,8) NOT NULL DEFAULT 0)
- net_amount (NUMERIC(20,8) NOT NULL)
- status (TEXT NOT NULL DEFAULT 'pending')
- transaction_hash (TEXT NULLABLE)
- network (TEXT NULLABLE)
- coupon_code_id (BIGINT NULLABLE)
- notes (TEXT NULLABLE)
- created_at (TIMESTAMPTZ NOT NULL DEFAULT NOW())
- updated_at (TIMESTAMPTZ NOT NULL DEFAULT NOW())

**wallets table**
- id (BIGSERIAL PRIMARY KEY)
- user_id (UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE)
- deposit_balance (NUMERIC(20,8) NOT NULL DEFAULT 0)
- roi_balance (NUMERIC(20,8) NOT NULL DEFAULT 0)
- bonus_balance (NUMERIC(20,8) NOT NULL DEFAULT 0)
- withdrawal_balance (NUMERIC(20,8) NOT NULL DEFAULT 0)
- total_fees_paid (NUMERIC(20,8) NOT NULL DEFAULT 0)
- created_at (TIMESTAMPTZ NOT NULL DEFAULT NOW())
- updated_at (TIMESTAMPTZ NOT NULL DEFAULT NOW())

**referral_structure table**
- id (BIGSERIAL PRIMARY KEY)
- user_id (UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE)
- referrer_id (UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE)
- level (INT NOT NULL)
- created_at (TIMESTAMPTZ NOT NULL DEFAULT NOW())

**kyc_records table**
- id (BIGSERIAL PRIMARY KEY)
- user_id (UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE)
- document_type (TEXT NOT NULL)
- document_url (TEXT NOT NULL)
- status (TEXT NOT NULL DEFAULT 'pending')
- reviewed_by_admin_id (UUID NULLABLE)
- reviewed_at (TIMESTAMPTZ NULLABLE)
- rejection_reason (TEXT NULLABLE)
- created_at (TIMESTAMPTZ NOT NULL DEFAULT NOW())
- updated_at (TIMESTAMPTZ NOT NULL DEFAULT NOW())

**coupon_codes table**
- id (BIGSERIAL PRIMARY KEY)
- code (TEXT NOT NULL UNIQUE)
- discount_percentage (NUMERIC(5,2) NOT NULL)
- valid_from (TIMESTAMPTZ NOT NULL)
- valid_until (TIMESTAMPTZ NOT NULL)
- usage_limit (INT NOT NULL DEFAULT 1)
- usage_count (INT NOT NULL DEFAULT 0)
- is_active (BOOLEAN NOT NULL DEFAULT TRUE)
- created_by_admin_id (UUID NULLABLE)
- created_at (TIMESTAMPTZ NOT NULL DEFAULT NOW())
- updated_at (TIMESTAMPTZ NOT NULL DEFAULT NOW())

**support_tickets table**
- id (BIGSERIAL PRIMARY KEY)
- user_id (UUID NULLABLE REFERENCES profiles(id) ON DELETE SET NULL)
- subject (TEXT NOT NULL)
- message (TEXT NOT NULL)
- status (TEXT NOT NULL DEFAULT 'open')
- priority (TEXT NOT NULL DEFAULT 'normal')
- admin_response (TEXT NULLABLE)
- responded_by_admin_id (UUID NULLABLE)
- responded_at (TIMESTAMPTZ NULLABLE)
- created_at (TIMESTAMPTZ NOT NULL DEFAULT NOW())
- updated_at (TIMESTAMPTZ NOT NULL DEFAULT NOW())

**notifications table**
- id (BIGSERIAL PRIMARY KEY)
- user_id (UUID NULLABLE REFERENCES profiles(id) ON DELETE CASCADE)
- type (TEXT NOT NULL)
- title (TEXT NOT NULL)
- message (TEXT NOT NULL)
- is_read (BOOLEAN NOT NULL DEFAULT FALSE)
- created_at (TIMESTAMPTZ NOT NULL DEFAULT NOW())

**system_settings table**
- id (BIGSERIAL PRIMARY KEY)
- setting_key (TEXT NOT NULL UNIQUE)
- setting_value (TEXT NOT NULL)
- updated_by_admin_id (UUID NULLABLE)
- updated_at (TIMESTAMPTZ NOT NULL DEFAULT NOW())

**landing_page_content table**
- id (BIGSERIAL PRIMARY KEY)
- section_key (TEXT NOT NULL UNIQUE)
- content_json (JSONB NOT NULL)
- updated_by_admin_id (UUID NULLABLE)
- updated_at (TIMESTAMPTZ NOT NULL DEFAULT NOW())

**legal_policy_content table**
- id (BIGSERIAL PRIMARY KEY)
- policy_type (TEXT NOT NULL UNIQUE)
- content (TEXT NOT NULL)
- version (INT NOT NULL DEFAULT 1)
- updated_by_admin_id (UUID NULLABLE)
- updated_at (TIMESTAMPTZ NOT NULL DEFAULT NOW())

**referral_performance table**
- id (BIGSERIAL PRIMARY KEY)
- user_id (UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE)
- direct_referral_count_override (INT NULLABLE)
- performance_score_override (NUMERIC NULLABLE)
- contribution_value_override (NUMERIC NULLABLE)
- last_modified_by_admin_id (UUID NULLABLE)
- last_modified_at (TIMESTAMPTZ NULLABLE)
- created_at (TIMESTAMPTZ NOT NULL DEFAULT NOW())
- updated_at (TIMESTAMPTZ NOT NULL DEFAULT NOW())

**roi_settings table**
- id (BIGSERIAL PRIMARY KEY)
- monthly_roi_rate (NUMERIC(8,4) NOT NULL)
- updated_by_admin_id (UUID NULLABLE)
- updated_at (TIMESTAMPTZ NOT NULL DEFAULT NOW())

**daily_roi_logs table**
- id (BIGSERIAL PRIMARY KEY)
- run_date (DATE NOT NULL)
- status (TEXT NOT NULL DEFAULT 'pending')
- total_users_processed (INT NOT NULL DEFAULT 0)
- total_roi_distributed (NUMERIC(20,8) NOT NULL DEFAULT 0)
- error_message (TEXT NULLABLE)
- started_at (TIMESTAMPTZ NOT NULL DEFAULT NOW())
- completed_at (TIMESTAMPTZ NULLABLE)

**admin_settings table**
- id (BIGSERIAL PRIMARY KEY)
- setting_key (TEXT NOT NULL UNIQUE)
- setting_value (TEXT NOT NULL)
- updated_by_admin_id (UUID NULLABLE)
- updated_at (TIMESTAMPTZ NOT NULL DEFAULT NOW())

**blockchain_api_settings table**: as defined in Section 2.6

**admin_audit_log table**
- id (BIGSERIAL PRIMARY KEY)
- action_type (TEXT NOT NULL)
- admin_user_id (UUID NOT NULL)
- target_user_id (UUID NULLABLE)
- field_name (TEXT NULLABLE)
- previous_value (TEXT NULLABLE)
- new_value (TEXT NULLABLE)
- correction_reason (TEXT NULLABLE)
- is_immutable (BOOLEAN NOT NULL DEFAULT TRUE)
- created_at (TIMESTAMPTZ NOT NULL DEFAULT NOW())

**compounding_roi_logs table**
- id (BIGSERIAL PRIMARY KEY)
- user_id (UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE)
- run_date (DATE NOT NULL)
- principal_before (NUMERIC(20,8) NOT NULL)
- roi_earned (NUMERIC(20,8) NOT NULL)
- reinvested_amount (NUMERIC(20,8) NOT NULL)
- principal_after (NUMERIC(20,8) NOT NULL)
- status (TEXT NOT NULL DEFAULT 'completed')
- error_message (TEXT NULLABLE)
- created_at (TIMESTAMPTZ NOT NULL DEFAULT NOW())

**user_roi_adjustments table**
- id (BIGSERIAL PRIMARY KEY)
- user_id (UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE)
- override_monthly_roi_rate (NUMERIC(8,4) NOT NULL)
- period_start_date (DATE NOT NULL)
- period_end_date (DATE NOT NULL)
- reason (TEXT NULLABLE)
- is_active (BOOLEAN NOT NULL DEFAULT TRUE)
- created_by_admin_id (UUID NOT NULL)
- created_at (TIMESTAMPTZ NOT NULL DEFAULT NOW())
- updated_at (TIMESTAMPTZ NOT NULL DEFAULT NOW())

**roi_analytics_snapshots table**
- id (BIGSERIAL PRIMARY KEY)
- user_id (UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE)
- snapshot_date (DATE NOT NULL)
- daily_roi_earned (NUMERIC(20,8) NOT NULL DEFAULT 0)
- cumulative_roi_earned (NUMERIC(20,8) NOT NULL DEFAULT 0)
- deposit_balance_at_snapshot (NUMERIC(20,8) NOT NULL DEFAULT 0)
- effective_roi_rate (NUMERIC(8,4) NOT NULL)
- created_at (TIMESTAMPTZ NOT NULL DEFAULT NOW())
- UNIQUE(user_id, snapshot_date)

**roi_user_groups table**
- id (BIGSERIAL PRIMARY KEY)
- group_name (TEXT NOT NULL UNIQUE)
- description (TEXT NULLABLE)
- created_by_admin_id (UUID NOT NULL)
- created_at (TIMESTAMPTZ NOT NULL DEFAULT NOW())
- updated_at (TIMESTAMPTZ NOT NULL DEFAULT NOW())

**roi_user_group_members table**
- id (BIGSERIAL PRIMARY KEY)
- group_id (BIGINT NOT NULL REFERENCES roi_user_groups(id) ON DELETE CASCADE)
- user_id (UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE)
- added_by_admin_id (UUID NOT NULL)
- added_at (TIMESTAMPTZ NOT NULL DEFAULT NOW())
- UNIQUE(group_id, user_id)

**roi_group_adjustments table**
- id (BIGSERIAL PRIMARY KEY)
- group_id (BIGINT NOT NULL REFERENCES roi_user_groups(id) ON DELETE CASCADE)
- override_monthly_roi_rate (NUMERIC(8,4) NOT NULL)
- period_start_date (DATE NOT NULL)
- period_end_date (DATE NOT NULL)
- reason (TEXT NULLABLE)
- is_active (BOOLEAN NOT NULL DEFAULT TRUE)
- created_by_admin_id (UUID NOT NULL)
- created_at (TIMESTAMPTZ NOT NULL DEFAULT NOW())
- updated_at (TIMESTAMPTZ NOT NULL DEFAULT NOW())

**roi_investment_period_adjustments table**
- id (BIGSERIAL PRIMARY KEY)
- period_name (TEXT NOT NULL)
- override_monthly_roi_rate (NUMERIC(8,4) NOT NULL)
- period_start_date (DATE NOT NULL)
- period_end_date (DATE NOT NULL)
- description (TEXT NULLABLE)
- is_active (BOOLEAN NOT NULL DEFAULT TRUE)
- created_by_admin_id (UUID NOT NULL)
- created_at (TIMESTAMPTZ NOT NULL DEFAULT NOW())
- updated_at (TIMESTAMPTZ NOT NULL DEFAULT NOW())

**user_roi_default_settings table**
- id (BIGSERIAL PRIMARY KEY)
- user_id (UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE)
- level_1_commission_rate (NUMERIC(8,4) NULLABLE)
- level_2_commission_rate (NUMERIC(8,4) NULLABLE)
- level_3_commission_rate (NUMERIC(8,4) NULLABLE)
- level_4_commission_rate (NUMERIC(8,4) NULLABLE)
- level_5_commission_rate (NUMERIC(8,4) NULLABLE)
- level_5_target_usdt (NUMERIC(20,8) NULLABLE DEFAULT 10000)
- level_6_commission_rate (NUMERIC(8,4) NULLABLE)
- level_6_target_usdt (NUMERIC(20,8) NULLABLE DEFAULT 25000)
- level_7_commission_rate (NUMERIC(8,4) NULLABLE)
- level_7_target_usdt (NUMERIC(20,8) NULLABLE DEFAULT 50000)
- level_8_commission_rate (NUMERIC(8,4) NULLABLE)
- level_8_target_usdt (NUMERIC(20,8) NULLABLE DEFAULT 75000)
- level_9_commission_rate (NUMERIC(8,4) NULLABLE)
- level_9_target_usdt (NUMERIC(20,8) NULLABLE DEFAULT 100000)
- level_10_commission_rate (NUMERIC(8,4) NULLABLE)
- level_10_target_usdt (NUMERIC(20,8) NULLABLE DEFAULT 150000)
- level_11_commission_rate (NUMERIC(8,4) NULLABLE)
- level_11_target_usdt (NUMERIC(20,8) NULLABLE DEFAULT 200000)
- level_12_commission_rate (NUMERIC(8,4) NULLABLE)
- level_12_target_usdt (NUMERIC(20,8) NULLABLE DEFAULT 300000)
- level_13_commission_rate (NUMERIC(8,4) NULLABLE)
- level_13_target_usdt (NUMERIC(20,8) NULLABLE DEFAULT 400000)
- level_14_commission_rate (NUMERIC(8,4) NULLABLE)
- level_14_target_usdt (NUMERIC(20,8) NULLABLE DEFAULT 500000)
- level_15_commission_rate (NUMERIC(8,4) NULLABLE)
- level_15_target_usdt (NUMERIC(20,8) NULLABLE DEFAULT 1000000)
- defaults_applied_at (TIMESTAMPTZ NULLABLE)
- applied_by_admin_id (UUID NULLABLE)
- is_customized (BOOLEAN NOT NULL DEFAULT FALSE)
- created_at (TIMESTAMPTZ NOT NULL DEFAULT NOW())
- updated_at (TIMESTAMPTZ NOT NULL DEFAULT NOW())

**global_impact_stats table**
- id (BIGSERIAL PRIMARY KEY)
- total_payouts_usdt (NUMERIC(20,8) NOT NULL DEFAULT 0)
- active_investor_locations_count (INT NOT NULL DEFAULT 0)
- last_updated_at (TIMESTAMPTZ NOT NULL DEFAULT NOW())

**security_audit_log table** *(new)*
- id (BIGSERIAL PRIMARY KEY)
- audit_type (TEXT NOT NULL): e.g., VULNERABILITY_SCAN, FIREWALL_RULE_CHANGE, DEPENDENCY_AUDIT, PENETRATION_TEST
- severity (TEXT NOT NULL): CRITICAL, HIGH, MEDIUM, LOW, INFO
- finding_summary (TEXT NOT NULL)
- remediation_action (TEXT NULLABLE)
- status (TEXT NOT NULL DEFAULT 'open'): open, in_progress, resolved, accepted_risk
- resolved_by_admin_id (UUID NULLABLE)
- resolved_at (TIMESTAMPTZ NULLABLE)
- created_at (TIMESTAMPTZ NOT NULL DEFAULT NOW())
- updated_at (TIMESTAMPTZ NOT NULL DEFAULT NOW())

**firewall_rules table** *(new)*
- id (BIGSERIAL PRIMARY KEY)
- rule_name (TEXT NOT NULL UNIQUE)
- rule_type (TEXT NOT NULL): INBOUND, OUTBOUND
- protocol (TEXT NOT NULL): TCP, UDP, ICMP, ANY
- source_ip_cidr (TEXT NULLABLE)
- destination_ip_cidr (TEXT NULLABLE)
- port_range (TEXT NULLABLE)
- action (TEXT NOT NULL): ALLOW, DENY
- zone (TEXT NULLABLE): DMZ, INTERNAL, GUEST, PUBLIC
- is_active (BOOLEAN NOT NULL DEFAULT TRUE)
- priority (INT NOT NULL)
- description (TEXT NULLABLE)
- created_by_admin_id (UUID NULLABLE)
- created_at (TIMESTAMPTZ NOT NULL DEFAULT NOW())
- updated_at (TIMESTAMPTZ NOT NULL DEFAULT NOW())

**security_monitoring_alerts table** *(new)*
- id (BIGSERIAL PRIMARY KEY)
- alert_type (TEXT NOT NULL): e.g., PORT_SCAN, BLOCKED_ATTACK, GEO_BLOCK, RATE_LIMIT_EXCEEDED, AUTH_FAILURE_SPIKE
- source_ip (TEXT NULLABLE)
- details (JSONB NULLABLE)
- severity (TEXT NOT NULL): CRITICAL, HIGH, MEDIUM, LOW
- is_acknowledged (BOOLEAN NOT NULL DEFAULT FALSE)
- acknowledged_by_admin_id (UUID NULLABLE)
- acknowledged_at (TIMESTAMPTZ NULLABLE)
- created_at (TIMESTAMPTZ NOT NULL DEFAULT NOW())

### 2.8 Deployment Configuration

The application must include complete, production-ready deployment configuration files and scripts for hosting on Netlify, Vercel, and other compatible platforms.

#### 2.8.1 General Deployment Requirements

- All sensitive credentials must be managed exclusively via environment variables; no hardcoded secrets in source code
- A comprehensive `.env.example` file must be provided listing all required environment variables with descriptions and placeholder values
- All deployment configurations must support environment-specific settings (development, staging, production)
- CORS configuration must be correctly set for each deployment target's domain
- All deployment platforms must serve the application over HTTPS only
- Static frontend assets must be built and served from the appropriate CDN or edge network
- Health check endpoint (GET /api/health) must be implemented and referenced in deployment configurations

#### 2.8.2 Deployment Pipeline Error Resolution

- Examine build and deployment logs from GitHub Actions, Vercel, and Netlify
- Compile a complete list of all errors and warnings
- Categorize and diagnose each error
- Implement fixes for each identified issue and test builds locally after each significant change
- Push corrections to the repository and trigger new deployments on all platforms
- Confirm successful builds and deploys without errors

#### 2.8.3 Netlify Deployment

- **netlify.toml** configuration file at project root
- **Environment Variables**: All required environment variables documented for Netlify dashboard entry

#### 2.8.4 Vercel Deployment

- **vercel.json** configuration file at project root
- **Environment Variables**: All required environment variables documented for Vercel dashboard

#### 2.8.5 Other Platform Deployment Configurations

**Railway**: `railway.toml` configuration file

**Render**: `render.yaml` Blueprint configuration file

**Heroku**: `Procfile`, `package.json` engines field, `app.json`

**DigitalOcean App Platform**: `.do/app.yaml` specification file

**VPS / Self-Hosted**: `Dockerfile`, `docker-compose.yml`, `ecosystem.config.js` (PM2), `nginx.conf`

#### 2.8.6 Database Migration and Seeding for Deployment

- Database migration scripts must be included and runnable as a pre-deployment or post-deployment step
- Initial admin seed script provided for fresh deployments
- Migration scripts must be idempotent

#### 2.8.7 CI/CD Pipeline

- **GitHub Actions** workflow file (`.github/workflows/deploy.yml`)

#### 2.8.8 Deployment Audit and Fix

- Audit all existing deployment-related files and fix all deployment errors

#### 2.8.9 Deployment Documentation

- A `DEPLOYMENT.md` file at the project root covering prerequisites, step-by-step deployment guides, complete environment variable reference, Supabase setup, post-deployment verification checklist, troubleshooting, SSL/TLS setup, and credential rotation procedures
- **Hostinger SMTP Configuration sub-section** (see Section 2.4 for full specification)

---

## 3. Branding and Proprietary Mark Removal

### 3.1 Overview

All hardcoded branding, proprietary marks, and third-party attributions must be removed from the entire codebase and replaced with neutral, configurable placeholders.

### 3.2 Audit and Removal Scope

- Conduct a comprehensive audit of the entire codebase and assets directory
- Remove or replace all identified brand names, logos, trademarks, watermarks, and copyright notices
- Update `manifest.json`, HTML title tags, and meta tags to use generic or admin-configurable values
- Remove any brand-specific color themes or styling that is not configurable via Admin Settings
- **Zero references to medo.dev remain in the codebase, configuration files, environment variable templates, and documentation**
- **All Juvlon-related code and credentials fully removed and verified absent**
- **All Zoho Mail SMTP hardcoded references removed; SMTP provider is now fully runtime-configurable via Admin Settings**

### 3.3 Admin-Configurable Branding

- All branding elements (application name, logo, favicon, color scheme, typography) are exclusively managed via the Admin Settings module
- No branding values are hardcoded anywhere in the source code
- On first deployment, all branding fields display neutral placeholder values until configured by the admin

---

## 4. Page Structure

### 4.1 Home Page (Landing)

- Investment plan information
- Platform features and benefits
- **15-level referral bonus section**: a dedicated, prominently featured section on the landing page clearly presenting all 15 referral levels, their commission rates, and (for performance levels 5-15) their unlock targets; the section is visually prominent in the landing page layout; content is visually structured for easy comprehension using a table, card grid, or tiered layout that clearly distinguishes basic levels (1-4) from performance levels (5-15); the platform's gold accent colour highlights key values; commission rates and unlock targets are loaded dynamically from the backend (GET /api/calculator/rates); content heading, description text, and supplementary copy are editable via the admin Landing Page Editor; the section is fully responsive
- **Interactive Investment Pitch component** (see Section 4.1.1)
- Testimonials section
- Sign-up call-to-action
- Footer with Privacy Policy, Terms & Conditions, KYC Policy, Refund Policy, and Contact links
- Professional, modern UI design with enhanced visual appeal
- No admin setup option displayed
- All content sections fully editable via admin Landing Page Editor
- KYC Policy and Refund Policy pages dynamically populated from admin-managed content
- Site title, tagline, meta tags, Open Graph tags, and analytics code injected dynamically from Admin Settings
- Fully responsive and optimized for all devices
- **Scroll-Driven reveal-bottom Animations**: all major landing page sections (hero/banner, investment plan, platform features, 15-level referral bonus, Investment Pitch, testimonials, call-to-action) implement scroll-driven entrance animations using the `reveal-bottom` keyframes; each section animates upward from a translated-down starting position and fades in as it enters the viewport, triggered via Intersection Observer; animations are staggered per section to create a fluid, sequential reveal effect as the user scrolls down the page; no looping or distracting motion; animations respect the `prefers-reduced-motion` media query and are disabled for users who have opted out of motion; **on low-end mobile devices a simplified fallback reveal is used for better performance** (see Section 8.1)

#### 4.1.1 Interactive Investment Pitch Component

*(Unchanged from previously approved requirements document.)*

#### 4.1.2 Real-Time ROI Projection Calculator (Investment Pitch Step 5)

*(Unchanged from previously approved requirements document.)*

#### 4.1.3 Global Impact Step (Investment Pitch Step 6)

*(Unchanged from previously approved requirements document.)*

### 4.2 Authentication Pages

*(Unchanged from previously approved requirements document.)*

### 4.3 User Dashboard

*(Unchanged from previously approved requirements document.)*

### 4.4 Deposit Page

*(Unchanged from previously approved requirements document.)*

### 4.5 Withdrawal Page

*(Unchanged from previously approved requirements document.)*

### 4.6 Referral Level Income Page

*(Unchanged from previously approved requirements document.)*

### 4.7 Profile Page

*(Unchanged from previously approved requirements document.)*

### 4.8 User Transaction Page

*(Unchanged from previously approved requirements document.)*

### 4.9 Support Center

*(Unchanged from previously approved requirements document.)*

### 4.10 Investment and Return Calculator Page (Wealth Projection Hub)

*(Unchanged from previously approved requirements document.)*

### 4.11 Downline Analytics Page

*(Unchanged from previously approved requirements document.)*

### 4.12 Admin Panel

#### 4.12.1 — 4.12.18

*(Unchanged from previously approved requirements document.)*

#### 4.12.19 Admin Settings

- **Access Control**: Accessible only to authorized admin users
- **SEO Optimization Module**: Site title, meta description, Open Graph tags, robots.txt, XML sitemap
- **Branding & Assets Management**: Logo upload, favicon upload, color scheme, typography; all values stored in Supabase and applied dynamically; no hardcoded branding
- **SMTP Credential Management**:
  - Secure runtime update of SMTP credentials for any standard SMTP provider (default: Hostinger)
  - Fields: SMTP Host, SMTP Port, Encryption (SSL/TLS or STARTTLS), Username (full email address), Password (masked input, stored AES-256 encrypted at rest)
  - Immediate Nodemailer transport re-initialization upon save, without requiring a server restart
  - **Test Connection / Send Test Mail button**: sends a test email to a configurable recipient address using the currently saved credentials; displays success confirmation or the exact SMTP error message returned by the server
  - Connection status display (last successful test timestamp and result)
  - bufio partial-read error fix: Nodemailer transport initialized with explicit `socketTimeout`, `greetingTimeout`, and `connectionTimeout` values; `secure: true` for port 465; `secure: false` with `requireTLS: true` for port 587
  - SMTP password never returned in plain text via any GET response
- **Additional Site Configuration Options**: Contact email, announcement bar, analytics code injection
- **Save & Apply**: Changes persisted to Supabase and applied immediately
- Professional admin UI design with tabbed layout; fully responsive

#### 4.12.20 — 4.12.23

*(Unchanged from previously approved requirements document.)*

#### 4.12.24 Security Management Panel *(new)*

- **Access Control**: Accessible only to authorized admin users
- **Security Audit Dashboard**:
  - Displays a summary of the most recent security audit findings categorized by severity (Critical, High, Medium, Low, Info)
  - Each finding entry shows: audit type, severity badge, finding summary, remediation action taken, current status, and resolved timestamp
  - Admin can update the status of each finding (open, in_progress, resolved, accepted_risk)
  - All status changes are logged in admin_audit_log with action_type SECURITY_AUDIT_STATUS_CHANGE
  - Export audit findings as CSV
- **Firewall Rules Management**:
  - Tabular view of all active and inactive firewall rules with columns: rule name, type (inbound/outbound), protocol, source, destination, port range, action (allow/deny), zone, priority, status
  - Add, edit, and delete firewall rules; all changes logged in admin_audit_log with action_type FIREWALL_RULE_CHANGE
  - Toggle individual rules active/inactive without deletion
  - Rules are ordered by priority; admin can reorder rules via drag-and-drop or priority input
  - Default-deny policy indicator displayed prominently; admin cannot delete the default-deny base rules
- **Security Monitoring Alerts**:
  - Real-time feed of security monitoring alerts (port scans, blocked attacks, geo-block events, rate limit breaches, authentication failure spikes)
  - Each alert shows: alert type, source IP (masked for display), severity, timestamp, and acknowledgement status
  - Admin can acknowledge alerts individually or in bulk
  - Filter alerts by type, severity, and date range
  - Automated alert notification sent to admin email when a Critical or High severity alert is triggered
- **Scheduled Review Reminders**:
  - Admin can configure a weekly and monthly security review schedule
  - System sends an automated reminder email to the admin at the configured schedule
  - Last review date and next scheduled review date displayed in the panel
- Professional admin UI design with tabbed layout; fully responsive

### 4.13 Additional Pages

*(Unchanged from previously approved requirements document.)*

### 4.14 Earnings Analysis Page (ROI Analytics Dashboard + Unified Wealth-Building Projection Dashboard)

*(Unchanged from previously approved requirements document.)*

---

## 5. Investment Plan Details

*(Unchanged from previously approved requirements document.)*

---

## 6. Wallet System

*(Unchanged from previously approved requirements document.)*

---

## 7. Features & Functionality

### 7.1 User Features

*(Unchanged from previously approved requirements document, except all references to Zoho Mail SMTP are replaced with the configured SMTP service.)*

### 7.2 Admin Features

*(Unchanged from previously approved requirements document.)*

### 7.3 Security Features

- Rate limiting
- CAPTCHA integration
- Secure authentication flow
- **Terms & Conditions acceptance enforced client-side and server-side**
- Email OTP verification for new user registration (6-digit, time-bound, delivered via configured SMTP service)
- Secure time-bound email link for password reset (delivered via configured SMTP service)
- Email OTP verification for admin login and signup via configured SMTP service
- Activity logging
- Secondary confirmation (admin password re-entry) for financially impactful actions and all Per-User Default ROI Settings mutating actions
- Role-based access control
- SQL injection prevention
- XSS prevention
- Input sanitization and validation
- Secure file upload handling via Supabase Storage
- **SMTP password stored AES-256 encrypted at rest in Supabase; never returned in plain text via any GET response**
- Blockchain API keys stored encrypted at rest; never returned in plain text
- **Google Analytics OAuth credentials stored encrypted at rest; never returned in plain text via any GET response**
- All credential management operations over HTTPS only
- OTP tokens and password reset link tokens stored securely with expiry enforcement; tokens invalidated after single use
- Supabase RLS enforced on all tables; service role key used only in Node.js backend
- Leaderboard API endpoint rate-limited and returns only display-safe masked member identifiers
- Compounding ROI service processes only users who have explicitly opted in
- Downline analytics endpoints accessible only to authenticated users; member data returned in masked format
- ROI analytics endpoints accessible only to authenticated users
- Referral tree endpoints accessible only to authenticated users; member data returned in masked format
- **Sentry DSN stored as environment variable; never hardcoded in source files**
- Per-user ROI adjustment endpoints protected by admin authentication middleware; all mutating actions require secondary confirmation and are immutably logged
- User-group and investment-period ROI adjustment endpoints protected by admin authentication middleware; all mutating actions require secondary confirmation and are immutably logged
- Per-User Default ROI Settings endpoints protected by admin authentication middleware; all mutating actions require secondary confirmation and are immutably logged
- Audit log export endpoint protected by admin authentication middleware
- Real-Time ROI Projection Calculator in Investment Pitch component performs all calculations client-side; no user input data is submitted to the backend during calculation; the calculator endpoint GET /api/calculator/rates is publicly accessible and rate-limited
- GET /api/platform/global-impact is publicly accessible and rate-limited; returns only aggregated non-personal statistics
- Platform Settings unlock target propagation to per-user records is performed exclusively by the Node.js backend using the service role key; no client-side write access to user_roi_default_settings records
- **Comprehensive security hardening as defined in Section 22**

### 7.4 Automated Features

*(Unchanged from previously approved requirements document, except all references to Zoho Mail SMTP are replaced with the configured SMTP service.)*

### 7.5 Automated Compounding ROI Service

*(Unchanged from previously approved requirements document.)*

---

## 8. Design Requirements

*(Unchanged from previously approved requirements document.)*

---

## 9. Email Interfaces

### 9.1 Email Service

- **Provider**: Configurable via Admin Settings SMTP Credential Management (default: Hostinger)
- **Default SMTP Host**: smtp.hostinger.com
- **Default SMTP Port**: 465 (SSL/TLS, recommended) or 587 (STARTTLS)
- **Security/Encryption**: SSL/TLS (port 465) or STARTTLS (port 587)
- **Authentication**: Required; username is the full email address
- All outbound emails routed through the SMTP provider configured in Admin Settings
- Old Zoho Mail and Juvlon SMTP credentials and API keys must be deactivated and removed
- SMTP credentials manageable at runtime via Admin Settings without server restart
- **Test Connection / Send Test Mail functionality available in Admin Settings SMTP Credential Management panel**

### 9.2 Email Templates

*(Unchanged from previously approved requirements document.)*

### 9.3 Email Notifications

*(Unchanged from previously approved requirements document.)*

---

## 10. Admin Credentials

*(Unchanged from previously approved requirements document.)*

---

## 11. Withdrawal Rules

*(Unchanged from previously approved requirements document.)*

---

## 12. Contact Page Requirements

*(Unchanged from previously approved requirements document.)*

---

## 13. Data Export Requirements

*(Unchanged from previously approved requirements document.)*

---

## 14. Tutorial Requirements

*(Unchanged from previously approved requirements document.)*

---

## 15. Performance-Based Referral System

*(Unchanged from previously approved requirements document.)*

---

## 16. Coupon Code System

*(Unchanged from previously approved requirements document.)*

---

## 17. Landing Page Editor

*(Unchanged from previously approved requirements document.)*

---

## 18. Legal Policy Management

*(Unchanged from previously approved requirements document.)*

---

## 19. Critical Bug Fixes and Enhancements

### 19.1 — 19.81

*(Unchanged from previously approved requirements document.)*

### 19.82 SMTP Provider Migration to Hostinger

*(Unchanged from previously approved requirements document.)*

---

## 20. Acceptance Criteria

*(All acceptance criteria from the previously approved requirements document remain unchanged, with the following additions:)*

- **All Zoho Mail SMTP hardcoded references removed from the entire codebase, environment variable templates, and Supabase settings; SMTP provider is fully runtime-configurable via Admin Settings**
- **All Juvlon-related code and credentials fully removed and verified absent**
- **SMTP Credential Management panel in Admin Settings supports configurable SMTP Host, Port, Encryption, Username, and Password fields; default values pre-populate with Hostinger SMTP settings (smtp.hostinger.com, port 465, SSL/TLS) on fresh deployment**
- **Test Connection / Send Test Mail button present in Admin Settings SMTP Credential Management panel; successfully sends a test email using the currently saved credentials; displays exact SMTP error message on failure**
- **Saving new SMTP credentials immediately re-initializes the Nodemailer transport without requiring a server restart**
- **Signup OTP email delivers the actual rendered 6-digit OTP code to the recipient inbox when using Hostinger SMTP**
- **Password reset email delivers the correct reset link to the recipient inbox when using Hostinger SMTP**
- **`.env.example` updated with generic SMTP environment variable names (SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, SMTP_FROM)**
- **`DEPLOYMENT.md` includes a dedicated Hostinger SMTP Configuration sub-section covering hPanel navigation, old configuration removal, new SMTP account creation, Admin Settings panel usage, Test Connection verification, DNS record requirements (MX, SPF, DKIM), and troubleshooting steps for common errors (Authentication Failed, Connection Refused)**
- **SMTP test action logged in admin_audit_log with action_type SMTP_TEST**
- **System-wide security audit completed; all Critical and High severity findings resolved and documented in the security audit report**
- **All identified vulnerabilities, misconfigurations, and outdated dependencies classified, documented, and remediated per Section 22.1**
- **Advanced firewall configuration implemented with default-deny inbound and outbound policy, DPI, IPS signatures, geo-blocking, rate limiting, time-based rules, and network zone segmentation per Section 22.2**
- **All overly permissive, redundant, and obsolete firewall rules removed; remaining ruleset documented**
- **Continuous security monitoring framework established with automated alerting for Critical and High severity events per Section 22.3**
- **Weekly and monthly security review schedule configured and operational**
- **Security audit findings, firewall rule changes, and monitoring alert acknowledgements all logged in admin_audit_log and security_audit_log**
- **Security Management Panel accessible in Admin Panel and fully functional**
- **All other acceptance criteria from the previously approved requirements document remain in effect**

---

## 21. Out of Scope

*(Unchanged from previously approved requirements document.)*

---

## 22. Security Hardening

### 22.1 Comprehensive Security Audit and Remediation

#### 22.1.1 System-Wide Vulnerability Scan

- Initiate a thorough system-wide security scan covering all application layers: frontend, Node.js backend, Supabase database configuration, deployment infrastructure, and third-party integrations
- Scan scope includes:
  - All Node.js dependencies (npm audit, Snyk or equivalent)
  - All frontend dependencies
  - Supabase RLS policy correctness
  - API endpoint authorization enforcement
  - Authentication and session management logic
  - Input validation and sanitization coverage
  - Cryptographic implementation correctness (key storage, encryption at rest, TLS in transit)
  - Secrets management (environment variables, no hardcoded credentials)
  - File upload handling security
  - CORS configuration correctness
  - HTTP security headers (Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security, Referrer-Policy, Permissions-Policy)
  - Outdated software components and libraries
  - Misconfigured cloud or hosting platform settings

#### 22.1.2 Classification and Documentation of Findings

- All identified vulnerabilities, misconfigurations, and outdated components are classified by severity: Critical, High, Medium, Low, Info
- Each finding is documented with:
  - Finding ID
  - Severity level
  - Affected component or file path
  - Description of the vulnerability or misconfiguration
  - Potential impact
  - Recommended remediation action
- All findings are stored in the security_audit_log table in Supabase
- A human-readable security audit findings report is generated and included in the final deliverable

#### 22.1.3 Immediate Remediation of Critical and High Findings

- All Critical and High severity findings identified during the audit are addressed and resolved before the application is considered production-ready
- Remediation actions include but are not limited to:
  - Patching or upgrading vulnerable dependencies to the latest secure versions
  - Correcting misconfigured Supabase RLS policies
  - Enforcing missing authorization checks on API endpoints
  - Replacing weak or incorrect cryptographic implementations
  - Removing hardcoded secrets and migrating to environment variable management
  - Adding missing HTTP security headers to all responses
  - Correcting CORS misconfigurations
  - Fixing insecure file upload handling
  - Resolving authentication bypass or session fixation vulnerabilities
- Each remediation action is documented with the specific corrective steps taken and the resulting status change in security_audit_log

#### 22.1.4 Security Audit Summary Report

- A final security audit summary report is produced as part of the post-development deliverable
- Report contents:
  - Executive summary of overall security posture
  - Total findings by severity category
  - List of all resolved findings with remediation details
  - List of any accepted-risk findings with justification
  - Recommendations for ongoing security maintenance
- Report is included in `DEPLOYMENT.md` as a dedicated Security Audit section or as a separate `SECURITY_AUDIT_REPORT.md` file at the project root

### 22.2 Advanced Firewall Configuration

#### 22.2.1 Default-Deny Policy

- The foundational firewall policy is default-deny for both inbound and outbound traffic
- Only explicitly required traffic flows are permitted via allowlist rules
- Default-deny base rules are immutable and cannot be deleted via the admin Security Management Panel; they can only be supplemented by additional allow rules
- All traffic not matching an explicit allow rule is silently dropped and logged

#### 22.2.2 Ruleset Review and Cleanup

- All existing firewall rules are reviewed
- Overly permissive rules (e.g., allow all inbound on any port) are removed or replaced with scoped rules
- Redundant rules (duplicate or shadowed rules) are removed
- Obsolete rules (referencing decommissioned services or IP ranges) are removed
- The cleaned ruleset is documented in the security audit summary report

#### 22.2.3 Required Allow Rules (Minimum Necessary Traffic)

- Inbound HTTPS (TCP 443) from any source to the application server: ALLOW
- Inbound HTTP (TCP 80) from any source to the application server for redirect to HTTPS only: ALLOW
- Inbound SSH (TCP 22) from admin-defined trusted IP CIDR ranges only: ALLOW (all other sources: DENY)
- Outbound HTTPS (TCP 443) from application server to Supabase endpoints: ALLOW
- Outbound SMTP (TCP 465 and TCP 587) from application server to configured SMTP host: ALLOW
- Outbound HTTPS (TCP 443) from application server to blockchain API endpoints (TRC-20 and BEP-20 providers): ALLOW
- Outbound HTTPS (TCP 443) from application server to Sentry DSN endpoint: ALLOW
- Outbound HTTPS (TCP 443) from application server to Google Analytics endpoints: ALLOW
- All other inbound and outbound traffic: DENY (default-deny)

#### 22.2.4 Deep Packet Inspection (DPI)

- DPI is enabled at the application layer to inspect HTTP/HTTPS traffic for known attack patterns
- DPI rules target:
  - SQL injection payloads in request parameters, headers, and body
  - XSS payloads in request parameters and body
  - Path traversal and directory traversal attempts
  - Command injection patterns
  - Malformed or oversized HTTP headers
- DPI findings are logged as security monitoring alerts in security_monitoring_alerts with alert_type DPI_VIOLATION
- DPI is implemented at the Node.js middleware layer (e.g., via a WAF middleware or equivalent) and/or at the hosting platform's edge network where supported

#### 22.2.5 Intrusion Prevention System (IPS)

- IPS signatures and rules are enabled to detect and block known attack patterns and exploit attempts in real time
- IPS rule categories include:
  - Web application attacks (OWASP Top 10)
  - Brute-force and credential stuffing attempts
  - Automated scanner and bot fingerprints
  - Known malicious IP reputation feeds
- IPS block events are logged as security monitoring alerts in security_monitoring_alerts with alert_type IPS_BLOCK
- IPS is implemented at the Node.js middleware layer and/or at the hosting platform's edge network or WAF where supported

#### 22.2.6 Geo-Blocking

- Geo-blocking rules are configurable by the admin via the Security Management Panel
- Admin can define a list of blocked countries or regions; inbound traffic originating from blocked locations is denied at the edge
- Geo-block events are logged as security monitoring alerts in security_monitoring_alerts with alert_type GEO_BLOCK
- Default geo-block list is empty on fresh deployment; admin configures as required
- Geo-blocking is implemented at the hosting platform's edge network (e.g., Cloudflare, Vercel Edge, Netlify Edge) where supported; fallback implementation at the Node.js middleware layer using IP geolocation lookup

#### 22.2.7 Rate Limiting and Throttling

- Rate limiting is applied at the API layer for all endpoints, with stricter limits on authentication and sensitive endpoints:
  - POST /api/auth/login: maximum 10 requests per minute per IP
  - POST /api/auth/signup: maximum 5 requests per minute per IP
  - POST /api/auth/otp/verify: maximum 5 requests per minute per IP
  - POST /api/auth/password-reset/request: maximum 3 requests per minute per IP
  - GET /api/calculator/rates: maximum 60 requests per minute per IP
  - GET /api/platform/global-impact: maximum 60 requests per minute per IP
  - All other authenticated API endpoints: maximum 120 requests per minute per authenticated user
  - All other unauthenticated API endpoints: maximum 30 requests per minute per IP
- Rate limit breach events are logged as security monitoring alerts in security_monitoring_alerts with alert_type RATE_LIMIT_EXCEEDED
- Rate limiting is implemented using a Node.js rate-limiting middleware (e.g., express-rate-limit with a Redis or in-memory store)
- DDoS mitigation throttling rules are applied at the hosting platform's edge network where supported

#### 22.2.8 Time-Based Access Control Rules

- Admin can define time-based firewall rules via the Security Management Panel specifying allowed access windows (e.g., admin panel accessible only during defined hours)
- Time-based rules are stored in the firewall_rules table with an additional time_window field (JSONB, nullable) specifying allowed days and hours in UTC
- The Node.js middleware enforces time-based rules by evaluating the current UTC time against the rule's time_window on each request
- Time-based rule violations are logged as security monitoring alerts with alert_type TIME_RULE_VIOLATION

#### 22.2.9 Network Zone Segmentation

- The application network is logically segmented into the following zones:
  - **PUBLIC zone**: landing page, public API endpoints (GET /api/calculator/rates, GET /api/platform/global-impact), and static assets; accessible from any source
  - **DMZ zone**: authentication endpoints, OTP verification, password reset; accessible from any source but subject to strict rate limiting and IPS rules
  - **INTERNAL zone**: authenticated user API endpoints; accessible only to requests bearing valid authenticated session tokens
  - **ADMIN zone**: admin panel API endpoints and admin settings; accessible only to requests bearing valid admin session tokens; additionally restricted to admin-defined trusted IP CIDR ranges where configured
- Zone assignments are enforced at the Node.js middleware layer via route-level middleware guards
- Lateral movement between zones is prevented by ensuring that a compromised session in one zone cannot access resources in a higher-privilege zone without re-authentication
- Zone segmentation is documented in `DEPLOYMENT.md`

### 22.3 Continuous Monitoring and Improvement Framework

#### 22.3.1 Firewall Log and Security Alert Review Schedule

- A structured review schedule is established:
  - **Weekly review**: admin reviews all security monitoring alerts from the past 7 days; acknowledges resolved alerts; escalates unresolved Critical and High alerts
  - **Monthly review**: admin reviews firewall rule effectiveness; removes or updates rules that are no longer relevant; reviews the security audit log for any new findings; updates the security posture summary
- Review schedule is configurable by the admin via the Security Management Panel (see Section 4.12.24)
- Automated reminder emails are sent to the admin at the configured weekly and monthly intervals using the configured SMTP service

#### 22.3.2 Automated Alerting for Suspicious Activities

- Automated alerts are triggered and delivered to the admin via email for the following event types:
  - **Critical or High severity IPS block event**: immediate alert
  - **Authentication failure spike**: more than 20 failed login attempts from a single IP within 5 minutes; immediate alert
  - **Port scan detection**: more than 10 distinct port probe attempts from a single IP within 1 minute; immediate alert
  - **Geo-block event from a new country**: first occurrence of a geo-block from a previously unseen country; daily digest alert
  - **Rate limit exceeded on authentication endpoints**: more than 3 rate-limit breaches from a single IP within 10 minutes; immediate alert
  - **Admin panel access from an unrecognized IP**: if admin IP restriction is configured, any access attempt from outside the trusted CIDR range; immediate alert
- All automated alert emails use the configured SMTP service
- Alert email content includes: alert type, severity, source IP (masked), timestamp, and a link to the Security Management Panel
- Alert delivery failures are logged in admin_audit_log with action_type SECURITY_ALERT_DELIVERY_FAILURE

#### 22.3.3 Ongoing Security Maintenance Recommendations

- The following ongoing security maintenance tasks are documented in `DEPLOYMENT.md` under a dedicated Security Maintenance section:
  - Run `npm audit` and review dependency vulnerability reports on a monthly basis; apply patches promptly for Critical and High severity CVEs
  - Review and rotate all API keys, SMTP credentials, and Supabase service role keys on a quarterly basis; use the credential rotation procedures documented in `DEPLOYMENT.md`
  - Review Supabase RLS policies after any schema change to ensure no unintended access is introduced
  - Review and update geo-blocking rules and IPS signatures monthly
  - Review admin_audit_log for anomalous admin activity monthly
  - Conduct a full security audit (repeating the process in Section 22.1) on a semi-annual basis
  - Monitor Sentry for authentication failure trends and investigate spikes promptly
  - Verify HTTP security headers are correctly set after any deployment configuration change

#### 22.3.4 Security Review Plan

- A structured security review plan is documented in `DEPLOYMENT.md` covering:
  - **Immediate post-deployment**: verify all HTTP security headers, confirm RLS policies are active, confirm default-deny firewall policy is in effect, run a post-deployment vulnerability scan
  - **30-day review**: review first month of security monitoring alerts; assess rate limiting thresholds; adjust geo-blocking rules based on observed traffic
  - **Quarterly review**: rotate credentials; review and update IPS signatures; re-run dependency audit; review admin audit log for anomalies
  - **Semi-annual review**: full security audit repeating Section 22.1 process; update security audit summary report; review and update firewall ruleset

---

## 23. Acceptance Criteria Addendum for Security Hardening

- System-wide security audit completed; all Critical and High severity findings resolved and documented in the security audit summary report
- All identified vulnerabilities classified by severity (Critical, High, Medium, Low, Info) and stored in security_audit_log
- Security audit summary report delivered as `SECURITY_AUDIT_REPORT.md` or as a dedicated section in `DEPLOYMENT.md`
- Default-deny inbound and outbound firewall policy implemented and verified
- All overly permissive, redundant, and obsolete firewall rules removed; cleaned ruleset documented
- DPI enabled at the application layer targeting SQL injection, XSS, path traversal, and command injection patterns
- IPS signatures and rules active for OWASP Top 10 attack categories, brute-force attempts, and known malicious IP patterns
- Geo-blocking configurable via Security Management Panel; geo-block events logged in security_monitoring_alerts
- Rate limiting applied to all API endpoints with stricter limits on authentication endpoints; rate limit breach events logged
- Time-based access control rules configurable and enforced at the middleware layer
- Network zone segmentation (PUBLIC, DMZ, INTERNAL, ADMIN) implemented and enforced via route-level middleware
- Security Management Panel accessible in Admin Panel with audit dashboard, firewall rules management, and monitoring alerts feed
- Automated alert emails delivered to admin for Critical/High IPS blocks, authentication failure spikes, port scan detections, and rate limit breaches on authentication endpoints
- Weekly and monthly security review schedule configurable; automated reminder emails functional
- Ongoing security maintenance recommendations and structured security review plan documented in `DEPLOYMENT.md`
- All firewall rule changes and security alert acknowledgements logged in admin_audit_log
- security_audit_log, firewall_rules, and security_monitoring_alerts tables created in Supabase with RLS enabled
