// User and Profile types
export type UserRole = 'user' | 'admin';
export type KYCStatus = 'not_submitted' | 'pending' | 'approved' | 'rejected';

export interface Profile {
  id: string;
  email: string | null;
  username: string | null;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  city?: string | null;
  country?: string | null;
  postal_code?: string | null;
  role: UserRole;
  referrer_id: string | null;
  referral_code: string;
  kyc_status: KYCStatus;
  kyc_document_url: string | null;
  kyc_rejection_reason: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  auto_withdrawal_enabled?: boolean;
  next_auto_withdrawal_date?: string | null;
  last_roi_credit_at?: string | null;
  withdrawal_wallet_address?: string | null;
  performance_usdt?: number;
  performance_score?: number;
  performance_contribution?: number;
  manual_level_1_count?: number;
  performance_ranking?: string;
  referral_system_status?: string;
  referral_levels_overrides?: Record<string, number>;
  referral_level_targets?: Record<string, number>;
  referral_level_1_enabled?: boolean;
  referral_level_2_enabled?: boolean;
  referral_level_3_enabled?: boolean;
  referral_level_4_enabled?: boolean;
  referral_level_5_enabled?: boolean;
  referral_level_6_enabled?: boolean;
  referral_level_7_enabled?: boolean;
  referral_level_8_enabled?: boolean;
  referral_level_9_enabled?: boolean;
  referral_level_10_enabled?: boolean;
  referral_level_11_enabled?: boolean;
  referral_level_12_enabled?: boolean;
  referral_level_13_enabled?: boolean;
  referral_level_14_enabled?: boolean;
  referral_level_15_enabled?: boolean;
  is_compounding_enabled?: boolean;
  custom_roi_percentage?: number | null;
  target_usdt?: number;
  user_group?: string;
}

export interface DownlineSummaryItem {
  level: number;
  member_count: number;
  active_count: number;
  total_volume: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  criteria_type: string;
  criteria_value: number;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  awarded_at: string;
  badge?: Badge;
}

export interface MonthlyReward {
  id: string;
  user_id: string;
  amount: number;
  reward_type: string;
  period_start: string;
  period_end: string;
  distributed_at: string;
}

// Wallet types
export type WalletType = 'deposit' | 'roi' | 'bonus' | 'withdrawal';

export interface Wallet {
  id: string;
  user_id: string;
  wallet_type: WalletType;
  balance: number;
  created_at: string;
  updated_at: string;
}

// Transaction types
export type TransactionType = 'deposit' | 'withdrawal' | 'roi_credit' | 'referral_commission' | 'deposit_fee' | 'withdrawal_fee';
export type TransactionStatus = 'pending' | 'approved' | 'rejected' | 'completed';
export type NetworkType = 'BEP20' | 'TRC20';

export interface Transaction {
  id: string;
  user_id: string;
  transaction_type: TransactionType;
  amount: number;
  fee: number;
  net_amount: number;
  status: TransactionStatus;
  network: NetworkType | null;
  wallet_address: string | null;
  transaction_hash: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
  approved_by: string | null;
}

// Deposit types
export interface Deposit {
  id: string;
  transaction_id: string;
  user_id: string;
  amount: number;
  fee: number;
  net_amount: number;
  network: NetworkType;
  transaction_hash: string;
  status: TransactionStatus;
  created_at: string;
  approved_at: string | null;
}

// Withdrawal types
export interface Withdrawal {
  id: string;
  transaction_id: string;
  user_id: string;
  amount: number;
  fee: number;
  net_amount: number;
  wallet_address: string;
  network: NetworkType;
  status: TransactionStatus;
  cooling_period_end: string;
  is_referral_bonus: boolean;
  created_at: string;
  approved_at: string | null;
  completed_at: string | null;
}

// Referral commission types
export interface ReferralCommission {
  id: string;
  referrer_id: string;
  referred_user_id: string;
  deposit_id: string;
  level: number;
  commission_rate: number;
  commission_amount: number;
  locked_until: string;
  is_locked: boolean;
  created_at: string;
}

// ROI record types
export interface ROIRecord {
  id: string;
  user_id: string;
  deposit_id: string;
  roi_amount: number;
  roi_percentage: number;
  month_number: number;
  created_at: string;
}

// Support ticket types
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: TicketStatus;
  priority: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
  admin_reply?: string | null;
  admin_replied_at?: string | null;
}

export interface TicketReply {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  is_admin: boolean;
  created_at: string;
}

// Content page types
export interface ContentPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

// Activity log types
export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  description: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// Dashboard stats types
export interface DashboardStats {
  totalUsers: number;
  totalDeposits: number;
  totalWithdrawals: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  totalROIPaid: number;
  totalCommissionsPaid: number;
}

// Referral stats types
export interface ReferralStats {
  totalReferrals: number;
  level1Count: number;
  level2Count: number;
  level3Count: number;
  level4Count: number;
  level5Count?: number;
  level6Count?: number;
  level7Count?: number;
  level8Count?: number;
  level9Count?: number;
  level10Count?: number;
  level11Count?: number;
  level12Count?: number;
  level13Count?: number;
  level14Count?: number;
  level15Count?: number;
  totalEarnings: number;
  lockedEarnings: number;
  availableEarnings: number;
}

// Wallet balances type
export interface WalletBalances {
  deposit: number;
  roi: number;
  bonus: number;
  withdrawal: number;
  total: number;
}


// Coupon types
export interface Coupon {
  id: string;
  code: string;
  percentage: number;
  description: string | null;
  is_active: boolean;
  expiry_date: string | null;
  usage_limit: number;
  used_count: number;
  created_at: string;
  updated_at: string;
}
