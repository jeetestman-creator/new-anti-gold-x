-- Gold X Usdt Primary Database Schema
-- Paste directly into Supabase SQL Editor

-- 1. Profiles (Main user tracking object)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    phone_number TEXT,
    country TEXT,
    state TEXT,
    city TEXT,
    pincode TEXT,
    referred_by_user_id UUID NULLABLE REFERENCES profiles(id) ON DELETE SET NULL,
    role TEXT NOT NULL DEFAULT 'user',
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMPTZ NULLABLE,
    terms_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    terms_accepted_at TIMESTAMPTZ NULLABLE,
    kyc_status TEXT NOT NULL DEFAULT 'pending',
    auto_withdrawal_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    auto_withdrawal_wallet_address TEXT NULLABLE,
    cumulative_direct_referral_deposits NUMERIC(20,8) NOT NULL DEFAULT 0,
    compounding_roi_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    compounding_roi_reinvestment_percentage NUMERIC(5,2) NOT NULL DEFAULT 100,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Transactions
CREATE TABLE transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    amount NUMERIC(20,8) NOT NULL,
    fee NUMERIC(20,8) NOT NULL DEFAULT 0,
    net_amount NUMERIC(20,8) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    transaction_hash TEXT NULLABLE,
    network TEXT NULLABLE,
    coupon_code_id BIGINT NULLABLE,
    notes TEXT NULLABLE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Wallets
CREATE TABLE wallets (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    deposit_balance NUMERIC(20,8) NOT NULL DEFAULT 0,
    roi_balance NUMERIC(20,8) NOT NULL DEFAULT 0,
    bonus_balance NUMERIC(20,8) NOT NULL DEFAULT 0,
    withdrawal_balance NUMERIC(20,8) NOT NULL DEFAULT 0,
    total_fees_paid NUMERIC(20,8) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Note: In a production environment, extend the definitions further ensuring RLS overrides are present.
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

-- Ex: Adding RLS Policy:
CREATE POLICY "Users can only see their own profiles" ON profiles
    FOR SELECT USING (auth.uid() = id);
