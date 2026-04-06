import { AlertCircle, ArrowUpFromLine, Clock, Power } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { createWithdrawal, getWalletBalances, getProfile } from '@/db/api';
import { supabase } from '@/db/supabase';
import type { WalletBalances, NetworkType } from '@/types';

export default function WithdrawalPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [balances, setBalances] = useState<WalletBalances | null>(null);
  const [autoWithdrawal, setAutoWithdrawal] = useState(false);
  const [withdrawalWalletAddress, setWithdrawalWalletAddress] = useState('');
  const [nextAutoWithdrawalDate, setNextAutoWithdrawalDate] = useState('');
  const [savingAutoWithdrawal, setSavingAutoWithdrawal] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    wallet_type: 'roi' as 'deposit' | 'roi' | 'bonus',
    wallet_address: '',
    network: 'BEP20' as 'BEP20' | 'TRC20'
  });

  useEffect(() => {
    loadBalances();
    loadAutoWithdrawalSettings();
  }, [user]);

  const loadAutoWithdrawalSettings = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('auto_withdrawal_enabled, withdrawal_wallet_address, next_auto_withdrawal_date')
      .eq('id', user.id)
      .maybeSingle();
    
    if (data) {
      setAutoWithdrawal((data as any).auto_withdrawal_enabled || false);
      setWithdrawalWalletAddress((data as any).withdrawal_wallet_address || '');
      setNextAutoWithdrawalDate((data as any).next_auto_withdrawal_date || '');
    }
  };

  const loadBalances = async () => {
    if (!user) return;
    const data = await getWalletBalances(user.id);
    if (data) setBalances(data);
  };

  const getAvailableBalance = () => {
    if (!balances) return 0;
    switch (formData.wallet_type) {
      case 'deposit':
        return balances.deposit;
      case 'roi':
        return balances.roi;
      case 'bonus':
        return balances.bonus;
      default:
        return 0;
    }
  };

  const getCoolingPeriod = () => {
    return formData.wallet_type === 'bonus' ? '30 days' : '48 hours';
  };

  const calculateNextWithdrawalDate = () => {
    const now = new Date();
    const currentDay = now.getDate();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // If current date is before 20th, next payout is 20th of current month
    // If current date is on or after 20th, next payout is 20th of next month
    if (currentDay < 20) {
      return new Date(currentYear, currentMonth, 20).toISOString().split('T')[0];
    } else {
      return new Date(currentYear, currentMonth + 1, 20).toISOString().split('T')[0];
    }
  };

  const handleAutoWithdrawalToggle = async (enabled: boolean) => {
    if (!user) return;
    
    if (enabled && !withdrawalWalletAddress) {
      toast.error('Please enter a wallet address first');
      return;
    }

    setSavingAutoWithdrawal(true);
    try {
      const nextDate = enabled ? calculateNextWithdrawalDate() : null;
      
      const updateData: Record<string, any> = {
        auto_withdrawal_enabled: enabled,
        next_auto_withdrawal_date: nextDate
      };

      const { error } = await supabase
        .from('profiles')
        // @ts-ignore - Supabase type issue with dynamic updates
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;

      setAutoWithdrawal(enabled);
      if (nextDate) setNextAutoWithdrawalDate(nextDate);
      toast.success(enabled ? 'Auto-withdrawal enabled' : 'Auto-withdrawal disabled');
    } catch (error) {
      console.error('Failed to update auto-withdrawal:', error);
      toast.error('Failed to update auto-withdrawal setting');
    } finally {
      setSavingAutoWithdrawal(false);
    }
  };

  const handleSaveWalletAddress = async () => {
    if (!user) return;
    
    if (!withdrawalWalletAddress) {
      toast.error('Please enter a wallet address');
      return;
    }

    setSavingAutoWithdrawal(true);
    try {
      const updateData: Record<string, any> = {
        withdrawal_wallet_address: withdrawalWalletAddress
      };

      const { error } = await supabase
        .from('profiles')
        // @ts-ignore - Supabase type issue with dynamic updates
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Wallet address saved successfully');
    } catch (error) {
      console.error('Failed to save wallet address:', error);
      toast.error('Failed to save wallet address');
    } finally {
      setSavingAutoWithdrawal(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Check KYC status before allowing withdrawal
    if (!user) return;

    setLoading(true);
    try {
      // First check KYC status
      const profile = await getProfile(user.id);
      
      if (!profile || profile.kyc_status !== 'approved') {
        toast.error('KYC verification is required before withdrawal. Please complete KYC verification in your profile.');
        setLoading(false);
        return;
      }

      const amount = parseFloat(formData.amount);
      const minWithdrawal = 50;
      const availableBalance = getAvailableBalance();

      if (amount < minWithdrawal) {
        toast.error(`Minimum withdrawal amount is ${minWithdrawal} USDT`);
        setLoading(false);
        return;
      }

      if (amount > availableBalance) {
        toast.error('Insufficient balance');
        setLoading(false);
        return;
      }

      if (!formData.wallet_address) {
        toast.error('Please enter your wallet address');
        setLoading(false);
        return;
      }

      const isReferralBonus = formData.wallet_type === 'bonus';
      const { error } = await createWithdrawal(
        user.id,
        amount,
        formData.wallet_address,
        formData.network as NetworkType,
        isReferralBonus
      );

      if (error) throw error;

      toast.success('Withdrawal request submitted successfully');
      setFormData({
        amount: '',
        wallet_type: 'roi',
        wallet_address: '',
        network: 'BEP20'
      });
      loadBalances();
    } catch (error) {
      toast.error('Failed to submit withdrawal request');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calculateFee = () => {
    const amount = parseFloat(formData.amount) || 0;
    return (amount * 0.05).toFixed(2);
  };

  const calculateNetAmount = () => {
    const amount = parseFloat(formData.amount) || 0;
    return (amount * 0.95).toFixed(2);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold v56-gradient-text">Withdraw Funds</h1>
        <p className="text-muted-foreground">Request a withdrawal from your wallets</p>
      </div>

      <Alert className="border-primary/20 bg-primary/5">
        <Clock className="h-4 w-4 text-primary" />
        <AlertTitle>Withdrawal Processing Time</AlertTitle>
        <AlertDescription>
          Normal withdrawals: 48-hour cooling period | Referral bonus: 30-day lock period
        </AlertDescription>
      </Alert>

      {/* Auto-Withdrawal Settings Card */}
      <Card className="v56-glass premium-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Power className="h-5 w-5 text-primary" />
            <CardTitle>Auto-Withdrawal Settings</CardTitle>
          </div>
          <CardDescription>
            Enable automatic withdrawals on the 20th of each month
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div className="space-y-1">
              <p className="font-medium">Enable Auto-Withdrawal</p>
              <p className="text-sm text-muted-foreground">
                Automatically withdraw ROI balance on the 20th of each month
              </p>
            </div>
            <Switch
              checked={autoWithdrawal}
              onCheckedChange={handleAutoWithdrawalToggle}
              disabled={savingAutoWithdrawal || !withdrawalWalletAddress}
            />
          </div>

          {autoWithdrawal && nextAutoWithdrawalDate && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertTitle>Next Auto-Withdrawal</AlertTitle>
              <AlertDescription>
                Scheduled for: {new Date(nextAutoWithdrawalDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="withdrawal_wallet">Withdrawal Wallet Address</Label>
            <div className="flex gap-2">
              <Input
                id="withdrawal_wallet"
                value={withdrawalWalletAddress}
                onChange={(e) => setWithdrawalWalletAddress(e.target.value)}
                placeholder="Enter your USDT wallet address"
                className="flex-1"
              />
              <Button 
                onClick={handleSaveWalletAddress}
                disabled={savingAutoWithdrawal || !withdrawalWalletAddress}
              >
                {savingAutoWithdrawal ? 'Saving...' : 'Save'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              This address will be used for automatic withdrawals
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="v56-glass premium-border">
          <CardHeader>
            <CardTitle className="text-sm">ROI Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{balances?.roi.toFixed(2) || '0.00'} USDT</p>
            <p className="text-xs text-muted-foreground mt-1">Available for withdrawal</p>
          </CardContent>
        </Card>

        <Card className="v56-glass premium-border">
          <CardHeader>
            <CardTitle className="text-sm">Bonus Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{balances?.bonus.toFixed(2) || '0.00'} USDT</p>
            <p className="text-xs text-muted-foreground mt-1">30-day lock period</p>
          </CardContent>
        </Card>

        <Card className="v56-glass premium-border">
          <CardHeader>
            <CardTitle className="text-sm">Deposit Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{balances?.deposit.toFixed(2) || '0.00'} USDT</p>
            <p className="text-xs text-muted-foreground mt-1">Investment balance</p>
          </CardContent>
        </Card>
      </div>

      <Card className="v56-glass premium-border">
        <CardHeader>
          <CardTitle>Withdrawal Request</CardTitle>
          <CardDescription>Fill in the details to request a withdrawal</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wallet_type">Select Wallet</Label>
              <Select
                value={formData.wallet_type}
                onValueChange={(value: 'deposit' | 'roi' | 'bonus') =>
                  setFormData({ ...formData, wallet_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="roi">ROI Wallet (48h cooling)</SelectItem>
                  <SelectItem value="bonus">Bonus Wallet (30d lock)</SelectItem>
                  <SelectItem value="deposit">Deposit Wallet</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Available: {getAvailableBalance().toFixed(2)} USDT | Cooling: {getCoolingPeriod()}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Withdrawal Amount (USDT)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="50"
                placeholder="Minimum 50 USDT"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="network">Network</Label>
              <Select
                value={formData.network}
                onValueChange={(value: 'BEP20' | 'TRC20') =>
                  setFormData({ ...formData, network: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BEP20">BEP-20 (Binance Smart Chain)</SelectItem>
                  <SelectItem value="TRC20">TRC-20 (Tron)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="wallet_address">Your USDT Wallet Address</Label>
              <Input
                id="wallet_address"
                type="text"
                placeholder="Enter your wallet address"
                value={formData.wallet_address}
                onChange={(e) => setFormData({ ...formData, wallet_address: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground">
                Make sure the address matches the selected network
              </p>
            </div>

            <div className="p-4 rounded-lg bg-accent/50 border border-primary/10 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Withdrawal Amount:</span>
                <span className="font-medium">{formData.amount || '0.00'} USDT</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fee (5%):</span>
                <span className="font-medium text-destructive">-{calculateFee()} USDT</span>
              </div>
              <div className="flex justify-between text-base font-semibold pt-2 border-t border-border">
                <span>You will receive:</span>
                <span className="text-primary">{calculateNetAmount()} USDT</span>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                All withdrawal requests require admin approval. Processing time: {getCoolingPeriod()}
              </AlertDescription>
            </Alert>

            <Button type="submit" className="w-full " size="lg" disabled={loading}>
              <ArrowUpFromLine className="mr-2 h-5 w-5" />
              {loading ? 'Submitting...' : 'Submit Withdrawal Request'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
