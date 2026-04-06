import { CheckCircle, Copy, Loader2, Ticket, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useAnalytics } from '@/lib/analytics';
import { createDeposit, getPlatformSetting } from '@/db/api';
import { supabase } from '@/db/supabase';
import type { NetworkType, Coupon } from '@/types';

interface Tutorial {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  order_index: number;
}

export default function DepositPage() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const { trackDeposit, trackFunnelStep } = useAnalytics();
  const minDeposit = Number(settings.min_deposit || '100');

  useEffect(() => {
    trackFunnelStep('deposit_page_view', 3);
  }, []);

  const [amount, setAmount] = useState('');
  const [network, setNetwork] = useState<NetworkType>('BEP20');
  const [transactionHash, setTransactionHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [, setLoadingAddresses] = useState(true);
  const [copied, setCopied] = useState(false);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [totalDeposits, setTotalDeposits] = useState(0);
  const [depositFee, setDepositFee] = useState(0);
  
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [verifyingCoupon, setVerifyingCoupon] = useState(false);

  // Wallet addresses fetched from platform settings
  const [walletAddresses, setWalletAddresses] = useState({
    BEP20: '',
    TRC20: ''
  });

  useEffect(() => {
    loadWalletAddresses();
    loadTutorials();
    loadDepositSummary();
  }, [user]);

  const loadTutorials = async () => {
    try {
      const { data, error } = await supabase
        .from('tutorials')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true })
        .limit(6);

      if (error) throw error;
      setTutorials(data || []);
    } catch (error) {
      console.error('Failed to load tutorials:', error);
    }
  };

  const loadDepositSummary = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('deposits')
        .select('amount, fee')
        .eq('user_id', user.id)
        .eq('status', 'approved');

      if (error) throw error;

      const total = (data || []).reduce((sum: number, d: any) => sum + (d.amount || 0), 0);
      const fees = (data || []).reduce((sum: number, d: any) => sum + (d.fee || 0), 0);
      
      setTotalDeposits(total);
      setDepositFee(fees);
    } catch (error) {
      console.error('Failed to load deposit summary:', error);
    }
  };

  const loadWalletAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const bep20 = await getPlatformSetting('deposit_wallet_bep20');
      const trc20 = await getPlatformSetting('deposit_wallet_trc20');

      setWalletAddresses({
        BEP20: bep20 || 'NOT_CONFIGURED',
        TRC20: trc20 || 'NOT_CONFIGURED'
      });
    } catch (error) {
      console.error('Failed to load wallet addresses:', error);
      toast.error('Failed to load wallet addresses');
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleVerifyCoupon = async () => {
    if (!couponCode) return;
    setVerifyingCoupon(true);
    try {
      const { data, error } = await (supabase
        .from('coupons') as any)
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast.error('Invalid or inactive coupon code');
        setAppliedCoupon(null);
      } else {
        const couponData = data as Coupon;
        const isExpired = couponData.expiry_date && new Date(couponData.expiry_date) < new Date();
        const isLimitReached = couponData.used_count >= couponData.usage_limit;

        if (isExpired) {
          toast.error('This coupon has expired');
          setAppliedCoupon(null);
        } else if (isLimitReached) {
          toast.error('This coupon usage limit has been reached');
          setAppliedCoupon(null);
        } else {
          setAppliedCoupon(couponData);
          toast.success(`Coupon applied! ${couponData.percentage}% bonus.`);
        }
      }
    } catch (error) {
      console.error('Coupon verification failed:', error);
      toast.error('Failed to verify coupon');
    } finally {
      setVerifyingCoupon(false);
    }
  };

  const walletAddress = walletAddresses[network];
  const fee = Number(amount) * 0.05;
  const netAmount = Number(amount) - fee;
  const couponBonus = appliedCoupon ? (Number(amount) * appliedCoupon.percentage) / 100 : 0;
  const totalReceived = netAmount + couponBonus;

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    toast.success('Wallet address copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!walletAddress || walletAddress === 'NOT_CONFIGURED') {
      toast.error('Deposit wallet address not configured. Please contact admin.');
      return;
    }

    if (Number(amount) < minDeposit) {
      toast.error(`Minimum deposit is ${minDeposit} USDT`);
      return;
    }

    if (!transactionHash) {
      toast.error('Please enter transaction hash');
      return;
    }

    setLoading(true);
    try {
      const { error: depositError } = await createDeposit(
        user.id, 
        Number(amount), 
        network, 
        transactionHash,
        appliedCoupon?.id,
        couponBonus
      );
      
      if (depositError) {
        toast.error(depositError.message);
        return;
      }

      trackDeposit(Number(amount));
      trackFunnelStep('deposit_submitted', 4);
      toast.success('Deposit request submitted! Admin will verify manually.');

      setAmount('');
      setTransactionHash('');
      setCouponCode('');
      setAppliedCoupon(null);
    } catch (error) {
      toast.error('Failed to submit deposit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold v56-gradient-text">Deposit Funds</h1>
          <p className="text-muted-foreground">Add USDT to your account</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="v56-glass premium-border col-span-1 md:col-span-3">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              💰 Deposit Summary
            </CardTitle>
            <CardDescription>Your verified financial overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground uppercase font-bold tracking-tighter">Total Deposited</p>
                <p className="text-3xl font-bold text-primary">${totalDeposits.toFixed(2)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground uppercase font-bold tracking-tighter">Total Fees Paid</p>
                <p className="text-3xl font-bold text-destructive">${depositFee.toFixed(2)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground uppercase font-bold tracking-tighter">Net Invested</p>
                <p className="text-3xl font-bold text-green-500">${(totalDeposits - depositFee).toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="v56-glass premium-border col-span-1 lg:col-span-1">
          <CardHeader>
            <CardTitle>Wallet Address</CardTitle>
            <CardDescription>Select network and copy address</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Select Network</Label>
              <Select value={network} onValueChange={(v) => setNetwork(v as NetworkType)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BEP20">BEP-20 (BSC)</SelectItem>
                  <SelectItem value="TRC20">TRC-20 (TRON)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-center p-6 bg-accent/20 border border-primary/10 rounded-xl gold-shimmer">
              <div className="bg-white p-2 rounded-lg">
                <QRCodeSVG value={walletAddress} size={180} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Wallet Address</Label>
              <div className="flex gap-2">
                <Input value={walletAddress} readOnly className="font-mono text-xs bg-accent/30" />
                <Button size="icon" variant="outline" onClick={handleCopy} className="shrink-0 border-primary/20">
                  {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 space-y-3 text-xs">
              <p className="font-bold text-primary flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                IMPORTANT NOTES
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Minimum deposit: {minDeposit} USDT</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Standard Deposit fee: 5%</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Only send USDT on {network} network</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="v56-glass premium-border col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Confirm Deposit</CardTitle>
            <CardDescription>Submit your transaction details for verification</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (USDT)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min={minDeposit}
                    step="0.01"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    disabled={loading}
                    className="bg-accent/30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coupon">Coupon Code (Optional)</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Ticket className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="coupon"
                        placeholder="GOLD10"
                        className="pl-10 uppercase bg-accent/30"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        disabled={loading || verifyingCoupon || !!appliedCoupon}
                      />
                    </div>
                    {appliedCoupon ? (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        className="text-destructive" 
                        onClick={() => {
                          setAppliedCoupon(null);
                          setCouponCode('');
                        }}
                      >
                        Remove
                      </Button>
                    ) : (
                      <Button 
                        type="button" 
                        variant="secondary" 
                        onClick={handleVerifyCoupon}
                        disabled={!couponCode || verifyingCoupon || loading}
                      >
                        {verifyingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {amount && Number(amount) >= 100 && (
                <div className="p-6 bg-accent/40 rounded-xl border border-primary/10 space-y-4">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground border-b border-primary/10 pb-2">Investment Breakdown</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">Base Deposit:</span>
                      <span className="font-bold">${Number(amount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-destructive">
                      <span className="text-sm">Deposit Fee (5%):</span>
                      <span className="font-bold">-${fee.toFixed(2)}</span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex justify-between items-center text-green-500 animate-in fade-in slide-in-from-top-1">
                        <span className="text-sm">Coupon Bonus ({appliedCoupon.percentage}%):</span>
                        <span className="font-bold">+${couponBonus.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-primary/10 flex justify-between items-center">
                      <span className="font-bold text-lg">Total Credit:</span>
                      <span className="font-bold text-2xl text-primary  animate-in zoom-in-95">${totalReceived.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="txHash">Transaction Hash (TXID)</Label>
                <div className="relative">
                  <Check className="absolute right-3 top-2.5 h-4 w-4 text-green-500 opacity-0 transition-opacity" />
                  <Input
                    id="txHash"
                    placeholder="Enter transaction ID"
                    value={transactionHash}
                    onChange={(e) => setTransactionHash(e.target.value)}
                    required
                    disabled={loading}
                    className="bg-accent/30 font-mono text-sm"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                  Paste the 64-character hash provided by your wallet provider
                </p>
              </div>

              <Button type="submit" size="lg" className="w-full  h-12 text-lg font-bold" disabled={loading}>
                {loading ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> PROCESSING...</>
                ) : (
                  'SUBMIT DEPOSIT REQUEST'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {tutorials.length > 0 && (
        <Card className="v56-glass premium-border">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <Loader2 className="h-5 w-5 text-primary" />
              Learning Center
            </CardTitle>
            <CardDescription>Video guides to help you start your journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {tutorials.map((tutorial) => (
                <div
                  key={tutorial.id}
                  className="group relative space-y-3 p-2 rounded-xl border border-primary/10 hover:border-primary/40 transition-all cursor-pointer bg-accent/20 overflow-hidden"
                  onClick={() => tutorial.video_url && window.open(tutorial.video_url, '_blank')}
                >
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                    {tutorial.thumbnail_url ? (
                      <img src={tutorial.thumbnail_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <span className="text-3xl">📹</span>
                    )}
                  </div>
                  <div className="px-1 pb-1">
                    <h3 className="font-bold text-[11px] uppercase tracking-tighter leading-tight group-hover:text-primary transition-colors">{tutorial.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

const AlertCircle = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
);
