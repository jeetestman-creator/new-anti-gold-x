import { supabase } from './supabase';
import { subDays, format } from 'date-fns';

import type {
  Profile,
  Wallet,
  // Transaction,
  // Deposit,
  // Withdrawal,
  ContentPage,
  WalletBalances,
  ReferralStats,
  DashboardStats,
  NetworkType,
  TransactionStatus,
  DownlineSummaryItem,
  UserBadge,
  MonthlyReward
} from '@/types';

// Profile operations
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  return data;
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .maybeSingle();

  return { data, error };
}

export async function getProfileByReferralCode(code: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('referral_code', code)
    .maybeSingle();

  if (error) {
    console.error('Error fetching profile by referral code:', error);
    return null;
  }
  return data;
}

// Wallet operations
export async function getWalletBalances(userId: string): Promise<WalletBalances> {
  const { data, error } = await supabase
    .from('wallets')
    .select('wallet_type, balance')
    .eq('user_id', userId);

  if (error || !data) {
    console.error('Error fetching wallet balances:', error);
    return { deposit: 0, roi: 0, bonus: 0, withdrawal: 0, total: 0 };
  }

  const balances: WalletBalances = {
    deposit: 0,
    roi: 0,
    bonus: 0,
    withdrawal: 0,
    total: 0
  };

  data.forEach((wallet) => {
    const balance = Number(wallet.balance);
    balances[wallet.wallet_type as keyof Omit<WalletBalances, 'total'>] = balance;
    balances.total += balance;
  });

  return balances;
}

export async function getWallets(userId: string): Promise<Wallet[]> {
  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .order('wallet_type');

  if (error) {
    console.error('Error fetching wallets:', error);
    return [];
  }
  return data || [];
}

// Transaction operations
export async function getTransactions(userId: string, limit = 50) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
  return data || [];
}

export async function getAllTransactions(limit = 100) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*, profiles!transactions_user_id_fkey(username, email)')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching all transactions:', error);
    return [];
  }
  return data || [];
}

// Deposit operations
export async function createDeposit(
  userId: string,
  amount: number,
  network: NetworkType,
  transactionHash: string,
  couponId?: string,
  couponBonus: number = 0
) {
  const fee = amount * 0.05; // 5% fee
  const netAmount = amount - fee;

  // Create transaction record
  const { data: transaction, error: txError } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      transaction_type: 'deposit',
      amount,
      fee,
      net_amount: netAmount + couponBonus, // Final amount user gets
      status: 'pending',
      network,
      transaction_hash: transactionHash
    })
    .select()
    .single();

  if (txError || !transaction) {
    return { data: null, error: txError };
  }

  // Create deposit record
  const { data, error } = await supabase
    .from('deposits')
    .insert({
      transaction_id: transaction.id,
      user_id: userId,
      amount,
      fee,
      net_amount: netAmount + couponBonus,
      network,
      transaction_hash: transactionHash,
      status: 'pending',
      coupon_id: couponId || null,
      coupon_bonus: couponBonus
    })
    .select()
    .single();

  return { data, error };
}

export async function getDeposits(userId: string) {
  const { data, error } = await supabase
    .from('deposits')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching deposits:', error);
    return [];
  }
  return data || [];
}

export async function getAllDeposits(status?: TransactionStatus) {
  let query = supabase
    .from('deposits')
    .select('*, profiles!deposits_user_id_fkey(username, email)');

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all deposits:', error);
    return [];
  }
  return data || [];
}

export async function approveDeposit(depositId: string, adminId: string) {
  const { data, error } = await supabase.rpc('process_deposit_approval', {
    deposit_id_param: depositId,
    admin_id: adminId
  });

  return { data, error };
}

export async function rejectDeposit(depositId: string, adminNotes: string) {
  const { data: deposit, error: depositError } = await supabase
    .from('deposits')
    .select('transaction_id')
    .eq('id', depositId)
    .maybeSingle();

  if (depositError || !deposit) {
    return { data: null, error: depositError };
  }

  // Update deposit status
  await supabase
    .from('deposits')
    .update({ status: 'rejected' })
    .eq('id', depositId);

  // Update transaction status
  const { data, error } = await supabase
    .from('transactions')
    .update({ status: 'rejected', admin_notes: adminNotes })
    .eq('id', deposit.transaction_id)
    .select()
    .maybeSingle();

  return { data, error };
}

// Withdrawal operations
export async function createWithdrawal(
  userId: string,
  amount: number,
  walletAddress: string,
  network: NetworkType,
  isReferralBonus: boolean
) {
  const fee = amount * 0.05; // 5% fee
  const netAmount = amount - fee;
  const coolingPeriod = isReferralBonus ? 30 : 2; // 30 days for referral bonus, 2 days for normal
  const coolingPeriodEnd = new Date();
  coolingPeriodEnd.setDate(coolingPeriodEnd.getDate() + coolingPeriod);

  // Create transaction record
  const { data: transaction, error: txError } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      transaction_type: 'withdrawal',
      amount,
      fee,
      net_amount: netAmount,
      status: 'pending',
      network,
      wallet_address: walletAddress
    })
    .select()
    .single();

  if (txError || !transaction) {
    return { data: null, error: txError };
  }

  // Deduct balance from wallet
  const sourceWallet = isReferralBonus ? 'bonus' : 'roi';
  const { error: walletError } = await supabase.rpc('deduct_wallet_balance', {
    p_user_id: userId,
    p_wallet_type: sourceWallet,
    p_amount: amount
  });

  if (walletError) {
    // Cleanup transaction on failure
    await supabase.from('transactions').delete().eq('id', transaction.id);
    return { data: null, error: walletError };
  }

  // Create withdrawal record
  const { data, error } = await supabase
    .from('withdrawals')
    .insert({
      transaction_id: transaction.id,
      user_id: userId,
      amount,
      fee,
      net_amount: netAmount,
      wallet_address: walletAddress,
      network,
      status: 'pending',
      cooling_period_end: coolingPeriodEnd.toISOString(),
      is_referral_bonus: isReferralBonus
    })
    .select()
    .single();

  if (error) {
    // Refund wallet if withdrawal record creation fails
    await supabase.rpc('add_wallet_balance', {
      p_user_id: userId,
      p_wallet_type: sourceWallet,
      p_amount: amount
    });
    await supabase.from('transactions').delete().eq('id', transaction.id);
    return { error };
  }

  return { data, error };
}

export async function getLeaderboard(limit = 5) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, username, referral_level_15_enabled, referral_level_14_enabled, referral_level_13_enabled, referral_level_12_enabled, referral_level_11_enabled, referral_level_10_enabled, referral_level_9_enabled, referral_level_8_enabled, referral_level_7_enabled, referral_level_6_enabled, referral_level_5_enabled')
    .order('referral_level_15_enabled', { ascending: false })
    .order('referral_level_14_enabled', { ascending: false })
    .order('referral_level_13_enabled', { ascending: false })
    .order('referral_level_12_enabled', { ascending: false })
    .order('referral_level_11_enabled', { ascending: false })
    .order('referral_level_10_enabled', { ascending: false })
    .order('referral_level_9_enabled', { ascending: false })
    .order('referral_level_8_enabled', { ascending: false })
    .order('referral_level_7_enabled', { ascending: false })
    .order('referral_level_6_enabled', { ascending: false })
    .order('referral_level_5_enabled', { ascending: false })
    .limit(limit);

  if (error) throw error;
  
  return (data || []).map(profile => {
    let levels = 4;
    for (let i = 15; i >= 5; i--) {
      if ((profile as any)[`referral_level_${i}_enabled`]) {
        levels = i;
        break;
      }
    }
    return {
      id: profile.id,
      name: profile.full_name || profile.username || 'Anonymous',
      levels_unlocked: levels
    };
  });
}

export async function getWithdrawals(userId: string) {
  const { data, error } = await supabase
    .from('withdrawals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching withdrawals:', error);
    return [];
  }
  return data || [];
}

export async function getAllWithdrawals(status?: TransactionStatus) {
  let query = supabase
    .from('withdrawals')
    .select('*, profiles!withdrawals_user_id_fkey(username, email)');

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all withdrawals:', error);
    return [];
  }
  return data || [];
}

export async function approveWithdrawal(withdrawalId: string, adminId: string) {
  const { data, error } = await supabase.rpc('process_withdrawal_approval', {
    withdrawal_id_param: withdrawalId,
    admin_id: adminId
  });

  return { data, error };
}

export async function getDownlineSummary(userId: string): Promise<DownlineSummaryItem[]> {
  const { data, error } = await supabase.rpc('get_downline_summary', { target_user_id: userId });
  if (error) throw error;
  return data || [];
}

export async function getUserBadges(userId: string): Promise<UserBadge[]> {
  const { data, error } = await supabase
    .from('user_badges')
    .select('*, badge:badges(*)')
    .eq('user_id', userId);
  if (error) throw error;
  return data || [];
}

export async function getMonthlyRewards(userId: string): Promise<MonthlyReward[]> {
  const { data, error } = await supabase
    .from('monthly_rewards')
    .select('*')
    .eq('user_id', userId)
    .order('distributed_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function updateCompoundingPreference(userId: string, isEnabled: boolean) {
  const { error } = await supabase
    .from('profiles')
    .update({ is_compounding_enabled: isEnabled })
    .eq('id', userId);
  if (error) throw error;
}

export async function triggerCompoundingROI() {
  const { error } = await supabase.rpc('process_compounding_roi');
  if (error) throw error;
}

export async function triggerMonthlyRewards() {
  const { error } = await supabase.rpc('process_monthly_rewards');
  if (error) throw error;
}

export async function rejectWithdrawal(withdrawalId: string, adminNotes: string) {
  const { data: withdrawal, error: withdrawalError } = await supabase
    .from('withdrawals')
    .select('transaction_id')
    .eq('id', withdrawalId)
    .maybeSingle();

  if (withdrawalError || !withdrawal) {
    return { data: null, error: withdrawalError };
  }

  // Update withdrawal status
  await supabase
    .from('withdrawals')
    .update({ status: 'rejected' })
    .eq('id', withdrawalId);

  // Update transaction status
  const { data, error } = await supabase
    .from('transactions')
    .update({ status: 'rejected', admin_notes: adminNotes })
    .eq('id', withdrawal.transaction_id)
    .select()
    .maybeSingle();

  return { data, error };
}

// Referral operations
export async function getReferralCommissions(userId: string) {
  const { data, error } = await supabase
    .from('referral_commissions')
    .select('*, profiles!referral_commissions_referred_user_id_fkey(username, email)')
    .eq('referrer_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching referral commissions:', error);
    return [];
  }
  return data || [];
}

export async function getReferralStats(userId: string): Promise<ReferralStats> {
  const { data, error } = await supabase
    .from('referral_commissions')
    .select('level, commission_amount, is_locked')
    .eq('referrer_id', userId);

  if (error || !data) {
    console.error('Error fetching referral stats:', error);
    return {
      totalReferrals: 0,
      level1Count: 0,
      level2Count: 0,
      level3Count: 0,
      level4Count: 0,
      totalEarnings: 0,
      lockedEarnings: 0,
      availableEarnings: 0
    };
  }

  const stats: ReferralStats = {
    totalReferrals: data.length,
    level1Count: data.filter(c => c.level === 1).length,
    level2Count: data.filter(c => c.level === 2).length,
    level3Count: data.filter(c => c.level === 3).length,
    level4Count: data.filter(c => c.level === 4).length,
    level5Count: data.filter(c => c.level === 5).length,
    level6Count: data.filter(c => c.level === 6).length,
    level7Count: data.filter(c => c.level === 7).length,
    level8Count: data.filter(c => c.level === 8).length,
    level9Count: data.filter(c => c.level === 9).length,
    level10Count: data.filter(c => c.level === 10).length,
    level11Count: data.filter(c => c.level === 11).length,
    level12Count: data.filter(c => c.level === 12).length,
    level13Count: data.filter(c => c.level === 13).length,
    level14Count: data.filter(c => c.level === 14).length,
    level15Count: data.filter(c => c.level === 15).length,
    totalEarnings: data.reduce((sum, c) => sum + Number(c.commission_amount), 0),
    lockedEarnings: data.filter(c => c.is_locked).reduce((sum, c) => sum + Number(c.commission_amount), 0),
    availableEarnings: data.filter(c => !c.is_locked).reduce((sum, c) => sum + Number(c.commission_amount), 0)
  };

  return stats;
}

// ROI operations
export async function getROIRecords(userId: string) {
  const { data, error } = await supabase
    .from('roi_records')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching ROI records:', error);
    return [];
  }
  return data || [];
}

// Support ticket operations
export async function createSupportTicket(
  userId: string,
  subject: string,
  message: string,
  priority = 'normal'
) {
  const { data, error } = await supabase
    .from('support_tickets')
    .insert({
      user_id: userId,
      subject,
      message,
      priority,
      status: 'open'
    })
    .select()
    .single();

  return { data, error };
}

export async function getSupportTickets(userId: string) {
  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching support tickets:', error);
    return [];
  }
  return data || [];
}

export async function getAllSupportTickets() {
  const { data, error } = await supabase
    .from('support_tickets')
    .select('*, profiles!support_tickets_user_id_fkey(username, email)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all support tickets:', error);
    return [];
  }
  return data || [];
}

export async function getTicketReplies(ticketId: string) {
  const { data, error } = await supabase
    .from('ticket_replies')
    .select('*, profiles!ticket_replies_user_id_fkey(username, email)')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching ticket replies:', error);
    return [];
  }
  return data || [];
}

export async function createTicketReply(
  ticketId: string,
  userId: string,
  message: string,
  isAdmin: boolean
) {
  const { data, error } = await supabase
    .from('ticket_replies')
    .insert({
      ticket_id: ticketId,
      user_id: userId,
      message,
      is_admin: isAdmin
    })
    .select()
    .single();

  return { data, error };
}

export async function updateTicketStatus(ticketId: string, status: string) {
  const { data, error } = await supabase
    .from('support_tickets')
    .update({ status })
    .eq('id', ticketId)
    .select()
    .maybeSingle();

  return { data, error };
}

// Content page operations
export async function getContentPage(slug: string): Promise<ContentPage | null> {
  const { data, error } = await supabase
    .from('content_pages')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('Error fetching content page:', error);
    return null;
  }
  return data;
}

export async function updateContentPage(slug: string, title: string, content: string, userId: string) {
  const { data, error } = await supabase
    .from('content_pages')
    .update({ title, content, updated_by: userId })
    .eq('slug', slug)
    .select()
    .maybeSingle();

  return { data, error };
}

// Platform settings operations
export async function getPlatformSetting(key: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('platform_settings')
    .select('setting_value')
    .eq('setting_key', key)
    .maybeSingle();

  if (error) {
    console.error('Error fetching platform setting:', error);
    return null;
  }
  return data?.setting_value || null;
}

export async function getAllPlatformSettings() {
  const { data, error } = await supabase
    .from('platform_settings')
    .select('*')
    .order('setting_key');

  if (error) {
    console.error('Error fetching platform settings:', error);
    return [];
  }
  return data || [];
}

export async function updatePlatformSetting(key: string, value: string, userId: string) {
  const { data, error } = await supabase
    .from('platform_settings')
    // @ts-ignore - Supabase type inference issue
    .update({ 
      setting_value: value,
      updated_at: new Date().toISOString(),
      updated_by: userId
    })
    .eq('setting_key', key)
    .select()
    .maybeSingle();

  return { data, error };
}

// Activity log operations
export async function createActivityLog(
  userId: string,
  action: string,
  description?: string,
  metadata?: Record<string, unknown>
) {
  const { data, error } = await supabase
    .from('activity_logs')
    .insert({
      user_id: userId,
      action,
      description,
      metadata
    });

  return { data, error };
}

export async function getActivityLogs(userId: string, limit = 50) {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching activity logs:', error);
    return [];
  }
  return data || [];
}

// Admin operations

// Landing Page operations
export async function getLandingPageSettings() {
  const { data, error } = await supabase
    .from('landing_page_settings')
    .select('*');

  if (error) {
    console.error('Error fetching landing page settings:', error);
    return [];
  }
  return data || [];
}

export async function updateLandingPageSection(sectionName: string, content: any) {
  const { data, error } = await supabase
    .from('landing_page_settings')
    .update({ content, updated_at: new Date().toISOString() })
    .eq('section_name', sectionName)
    .select()
    .maybeSingle();

  return { data, error };
}

export async function getAllUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all users:', error);
    return [];
  }
  return data || [];
}

export async function updateUserRole(userId: string, role: 'user' | 'admin') {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)
    .select()
    .maybeSingle();

  return { data, error };
}

// Admin Audit Logs
export async function getAdminAuditLogs(limit = 100) {
  const { data, error } = await supabase
    .from('admin_audit_logs')
    .select(`
      *,
      admin:admin_id (
        email,
        full_name
      )
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

// ROI Analytics
export async function getROIAnalytics(userId: string, days = 30) {
  const startDate = subDays(new Date(), days).toISOString();
  
  const { data, error } = await supabase
    .from('transactions')
    .select('amount, transaction_type, created_at')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .in('transaction_type', ['ROI', 'REFERRAL_BONUS'])
    .gte('created_at', startDate)
    .order('created_at', { ascending: true });

  if (error) throw error;
  
  // Group by date
  const groupedData: Record<string, { date: string, roi: number, bonus: number, total: number }> = {};
  
  // Initialize days
  for (let i = 0; i <= days; i++) {
    const d = subDays(new Date(), days - i);
    const dateStr = format(d, 'MMM dd');
    groupedData[dateStr] = { date: dateStr, roi: 0, bonus: 0, total: 0 };
  }

  (data || []).forEach(tx => {
    const dateStr = format(new Date(tx.created_at), 'MMM dd');
    if (groupedData[dateStr]) {
      const amount = Number(tx.amount);
      if (tx.transaction_type === 'ROI') {
        groupedData[dateStr].roi += amount;
      } else {
        groupedData[dateStr].bonus += amount;
      }
      groupedData[dateStr].total += amount;
    }
  });

  return Object.values(groupedData);
}

// Referral Tree
export async function getReferralTree(userId: string) {
  const { data, error } = await supabase.rpc('get_referral_tree', { root_user_id: userId });
  
  if (error) {
    console.error('Error fetching referral tree:', error);
    return { name: 'You', children: [] };
  }

  const list = (data || []) as any[];
  const idToNode: Record<string, any> = {};
  
  list.forEach(item => {
    idToNode[item.id] = { ...item, children: [] };
  });

  let rootNode = null;
  list.forEach(item => {
    const node = idToNode[item.id];
    if (item.referrer_id && idToNode[item.referrer_id]) {
      idToNode[item.referrer_id].children.push(node);
    } else if (item.id === userId) {
      rootNode = node;
    }
  });

  return rootNode || idToNode[userId] || { name: 'You', children: [] };
}

export async function updateUserStatus(userId: string, isActive: boolean) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ is_active: isActive })
    .eq('id', userId)
    .select()
    .maybeSingle();

  return { data, error };
}

export async function updateKYCStatus(
  userId: string,
  status: 'approved' | 'rejected',
  rejectionReason?: string
) {
  const updates: Partial<Profile> = { kyc_status: status };
  if (status === 'rejected' && rejectionReason) {
    updates.kyc_rejection_reason = rejectionReason;
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .maybeSingle();

  return { data, error };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  // Get total users
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  // Get deposit stats
  const { data: deposits } = await supabase
    .from('deposits')
    .select('amount, status');

  const totalDeposits = deposits?.filter(d => d.status === 'approved').reduce((sum, d) => sum + Number(d.amount), 0) || 0;
  const pendingDeposits = deposits?.filter(d => d.status === 'pending').length || 0;

  // Get withdrawal stats
  const { data: withdrawals } = await supabase
    .from('withdrawals')
    .select('amount, status');

  const totalWithdrawals = withdrawals?.filter(w => w.status === 'completed').reduce((sum, w) => sum + Number(w.amount), 0) || 0;
  const pendingWithdrawals = withdrawals?.filter(w => w.status === 'pending').length || 0;

  // Get ROI stats
  const { data: roiRecords } = await supabase
    .from('roi_records')
    .select('roi_amount');

  const totalROIPaid = roiRecords?.reduce((sum, r) => sum + Number(r.roi_amount), 0) || 0;

  // Get commission stats
  const { data: commissions } = await supabase
    .from('referral_commissions')
    .select('commission_amount');

  const totalCommissionsPaid = commissions?.reduce((sum, c) => sum + Number(c.commission_amount), 0) || 0;

  return {
    totalUsers: totalUsers || 0,
    totalDeposits,
    totalWithdrawals,
    pendingDeposits,
    pendingWithdrawals,
    totalROIPaid,
    totalCommissionsPaid
  };
}
