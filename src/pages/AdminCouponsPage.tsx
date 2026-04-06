import { Plus, Trash, Ticket, Calendar, Percent, Hash, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { supabase } from '@/db/supabase';
import type { Coupon } from '@/types';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    percentage: 0,
    description: '',
    usage_limit: 100,
    expiry_date: '',
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase
        .from('coupons') as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      console.error('Failed to load coupons:', error);
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async () => {
    if (!newCoupon.code || newCoupon.percentage <= 0) {
      toast.error('Please provide a code and percentage');
      return;
    }

    try {
      const { error } = await (supabase.from('coupons') as any).insert({
        code: newCoupon.code.toUpperCase(),
        percentage: newCoupon.percentage,
        description: newCoupon.description,
        usage_limit: newCoupon.usage_limit,
        expiry_date: newCoupon.expiry_date || null,
      });

      if (error) throw error;

      toast.success('Coupon created successfully');
      setCreateDialogOpen(false);
      setNewCoupon({ code: '', percentage: 0, description: '', usage_limit: 100, expiry_date: '' });
      loadCoupons();
    } catch (error: any) {
      console.error('Failed to create coupon:', error);
      toast.error(error.message || 'Failed to create coupon');
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    try {
      const { error } = await (supabase.from('coupons') as any).delete().eq('id', id);
      if (error) throw error;

      toast.success('Coupon deleted');
      loadCoupons();
    } catch (error) {
      console.error('Failed to delete coupon:', error);
      toast.error('Failed to delete coupon');
    }
  };

  const toggleCouponStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await (supabase
        .from('coupons') as any)
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      loadCoupons();
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold v56-gradient-text">Coupon Management</h1>
          <p className="text-muted-foreground">Create and manage deposit offers</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className=" gap-2">
              <Plus className="h-4 w-4" />
              Create Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Coupon</DialogTitle>
              <DialogDescription>
                Add a new offer for users to use during deposit.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="code">Coupon Code</Label>
                <Input
                  id="code"
                  placeholder="e.g. GOLD10"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="percentage">Bonus Percentage (%)</Label>
                <div className="relative">
                  <Percent className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="percentage"
                    type="number"
                    className="pl-10"
                    placeholder="10"
                    value={newCoupon.percentage}
                    onChange={(e) => setNewCoupon({ ...newCoupon, percentage: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="limit">Usage Limit</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="limit"
                    type="number"
                    className="pl-10"
                    value={newCoupon.usage_limit}
                    onChange={(e) => setNewCoupon({ ...newCoupon, usage_limit: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expiry">Expiry Date (Optional)</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="expiry"
                    type="datetime-local"
                    className="pl-10"
                    value={newCoupon.expiry_date}
                    onChange={(e) => setNewCoupon({ ...newCoupon, expiry_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="desc">Description</Label>
                <Input
                  id="desc"
                  placeholder="e.g. 10% bonus on first deposit"
                  value={newCoupon.description}
                  onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateCoupon} className=" w-full">Create Coupon</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p>Loading coupons...</p>
        ) : coupons.length === 0 ? (
          <Card className="col-span-full py-12 text-center text-muted-foreground">
            <Ticket className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No coupons found. Create your first offer!</p>
          </Card>
        ) : (
          coupons.map((coupon) => {
            const isExpired = coupon.expiry_date && new Date(coupon.expiry_date) < new Date();
            const isLimitReached = coupon.used_count >= coupon.usage_limit;
            
            return (
              <Card key={coupon.id} className="v56-glass premium-border relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    onClick={() => handleDeleteCoupon(coupon.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Ticket className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-bold text-lg tracking-wider text-primary">{coupon.code}</span>
                  </div>
                  <CardTitle className="text-2xl font-bold">{coupon.percentage}% Bonus</CardTitle>
                  <CardDescription>{coupon.description || 'Deposit offer'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-accent/50 text-sm">
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-xs uppercase font-bold tracking-tighter">Usage</p>
                      <p className="font-mono">{coupon.used_count} / {coupon.usage_limit}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-muted-foreground text-xs uppercase font-bold tracking-tighter">Expiry</p>
                      <p className={isExpired ? 'text-destructive font-bold' : 'font-mono'}>
                        {coupon.expiry_date ? new Date(coupon.expiry_date).toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                  </div>

                  { (isExpired || isLimitReached) && (
                    <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 p-2 rounded border border-destructive/20">
                      <AlertCircle className="h-3 w-3" />
                      <span>{isExpired ? 'Expired' : 'Usage limit reached'}</span>
                    </div>
                  ) }

                  <div className="flex items-center justify-between pt-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase ${coupon.is_active ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                      {coupon.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => toggleCouponStatus(coupon.id, coupon.is_active)}
                    >
                      {coupon.is_active ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
