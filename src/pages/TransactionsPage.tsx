import { ArrowDownCircle, ArrowUpCircle, Clock, DollarSign, Filter, TrendingUp, ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/db/supabase';

export default function UserTransactionsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    if (user) {
      loadTransactions();
      
      const channel = supabase
        .channel(`public:transactions:user_id=eq.${user.id}`)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'transactions', 
          filter: `user_id=eq.${user.id}` 
        }, () => {
          loadTransactions();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, typeFilter]);

  const loadTransactions = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let query = supabase.from('transactions').select('*').eq('user_id', user.id);
      
      if (typeFilter !== 'all') {
        query = query.eq('transaction_type', typeFilter);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <ArrowDownCircle className="h-4 w-4 text-green-500" />;
      case 'withdrawal': return <ArrowUpCircle className="h-4 w-4 text-orange-500" />;
      case 'roi_credit': return <TrendingUp className="h-4 w-4 text-primary" />;
      case 'referral_bonus': return <DollarSign className="h-4 w-4 text-blue-500" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold v56-gradient-text">Transaction History</h1>
          <p className="text-muted-foreground">View all your wallet activities</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Transaction Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Transactions</SelectItem>
            <SelectItem value="deposit">Deposits</SelectItem>
            <SelectItem value="withdrawal">Withdrawals</SelectItem>
            <SelectItem value="roi_credit">ROI Credits</SelectItem>
            <SelectItem value="referral_bonus">Referral Bonus</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="v56-glass premium-border">
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading transactions...</div>
            ) : transactions.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No transactions found.</div>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="p-4 flex justify-between items-center hover:bg-accent/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-background rounded-full">
                      {getIcon(tx.transaction_type)}
                    </div>
                    <div>
                      <p className="font-semibold capitalize text-sm">{(tx.transaction_type || '').replace('_', ' ')}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(tx.created_at).toLocaleString()}</p>
                      {tx.admin_notes && <p className="text-[10px] text-primary mt-1">{tx.admin_notes}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      tx.transaction_type === 'deposit' || tx.transaction_type === 'roi_credit' || tx.transaction_type === 'referral_bonus'
                        ? 'text-green-500' 
                        : 'text-orange-500'
                    }`}>
                      {tx.transaction_type === 'deposit' || tx.transaction_type === 'roi_credit' || tx.transaction_type === 'referral_bonus' ? '+' : '-'}
                      {Number(tx.amount || 0).toFixed(2)} USDT
                    </p>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      tx.status === 'completed' || tx.status === 'approved' ? 'bg-green-500/20 text-green-500' :
                      tx.status === 'rejected' || tx.status === 'failed' ? 'bg-red-500/20 text-red-500' :
                      'bg-yellow-500/20 text-yellow-500'
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
