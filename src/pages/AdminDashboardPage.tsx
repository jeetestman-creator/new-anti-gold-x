import { Clock, DollarSign, TrendingUp, Users, Ticket, History } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/db/supabase';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalFees: 0,
    activeCoupons: 0,
    nonKycUsers: 0,
    completeKycUsers: 0,
    pendingDeposits: 0,
    pendingWithdrawals: 0,
    pendingKYC: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [users, deposits, withdrawals, pendingDep, pendingWith, pendingKYC, nonKyc, completeKyc, coupons] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('deposits').select('amount, fee').eq('status', 'approved'),
        supabase.from('withdrawals').select('amount, fee').eq('status', 'approved'),
        supabase.from('deposits').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('withdrawals').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('kyc_status', 'pending'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('kyc_status', 'not_submitted'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('kyc_status', 'approved'),
        supabase.from('coupons').select('id', { count: 'exact', head: true }).eq('is_active', true)
      ]);

      const totalDeposits = (deposits.data as any)?.reduce((sum: number, d: any) => sum + Number(d.amount), 0) || 0;
      const totalWithdrawals = (withdrawals.data as any)?.reduce((sum: number, w: any) => sum + Number(w.amount), 0) || 0;
      const depositFees = (deposits.data as any)?.reduce((sum: number, d: any) => sum + Number(d.fee || 0), 0) || 0;
      const withdrawalFees = (withdrawals.data as any)?.reduce((sum: number, w: any) => sum + Number(w.fee || 0), 0) || 0;
      const totalFees = depositFees + withdrawalFees;

      setStats({
        totalUsers: users.count || 0,
        totalDeposits,
        totalWithdrawals,
        totalFees,
        activeCoupons: coupons.count || 0,
        nonKycUsers: nonKyc.count || 0,
        completeKycUsers: completeKyc.count || 0,
        pendingDeposits: pendingDep.count || 0,
        pendingWithdrawals: pendingWith.count || 0,
        pendingKYC: pendingKYC.count || 0
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold v56-gradient-text">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card 
          className="v56-glass premium-border cursor-pointer hover:border-primary transition-colors"
          onClick={() => navigate('/admin/users')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card 
          className="v56-glass premium-border cursor-pointer hover:border-green-500 transition-colors"
          onClick={() => navigate('/admin/deposits')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.totalDeposits.toFixed(2)} USDT</div>
          </CardContent>
        </Card>

        <Card 
          className="v56-glass premium-border cursor-pointer hover:border-orange-500 transition-colors"
          onClick={() => navigate('/admin/withdrawals')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Withdrawals</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats.totalWithdrawals.toFixed(2)} USDT</div>
          </CardContent>
        </Card>

        <Card 
          className="v56-glass premium-border cursor-pointer hover:border-yellow-500 transition-colors"
          onClick={() => navigate('/admin/deposits')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Deposits</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats.pendingDeposits}</div>
          </CardContent>
        </Card>

        <Card 
          className="v56-glass premium-border cursor-pointer hover:border-primary transition-colors"
          onClick={() => navigate('/admin/audit-logs')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Audit Logs</CardTitle>
            <History className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">System Activity</div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Track all admin changes</p>
          </CardContent>
        </Card>

        <Card 
          className="v56-glass premium-border cursor-pointer hover:border-yellow-500 transition-colors"
          onClick={() => navigate('/admin/withdrawals')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Withdrawals</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats.pendingWithdrawals}</div>
          </CardContent>
        </Card>

        <Card 
          className="v56-glass premium-border cursor-pointer hover:border-yellow-500 transition-colors"
          onClick={() => navigate('/admin/users?kyc=pending')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending KYC</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats.pendingKYC}</div>
          </CardContent>
        </Card>

        <Card 
          className="v56-glass premium-border cursor-pointer hover:border-green-500 transition-colors"
          onClick={() => navigate('/admin/transactions')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fees Collected</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">${stats.totalFees.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Deposit + Withdrawal Fees</p>
          </CardContent>
        </Card>

        <Card 
          className="v56-glass premium-border cursor-pointer hover:border-orange-500 transition-colors"
          onClick={() => navigate('/admin/users?kyc=not_submitted')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Non-KYC Users</CardTitle>
            <Users className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats.nonKycUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">Not Submitted KYC</p>
          </CardContent>
        </Card>

        <Card 
          className="v56-glass premium-border cursor-pointer hover:border-green-500 transition-colors"
          onClick={() => navigate('/admin/users?kyc=approved')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Complete KYC Users</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.completeKycUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">KYC Approved</p>
          </CardContent>
        </Card>

        <Card 
          className="v56-glass premium-border cursor-pointer hover:border-primary transition-colors"
          onClick={() => navigate('/admin/coupons')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Coupons</CardTitle>
            <Ticket className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.activeCoupons}</div>
            <p className="text-xs text-muted-foreground mt-1">Available Offers</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
