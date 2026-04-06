import { Edit, Search, Download, UserPlus, Trash2, Filter, FileText, Trash, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/db/supabase';
import { exportToCSV } from '@/lib/csv-export';

export default function AdminUsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const kycFilter = searchParams.get('kyc') || 'all';
  
  const [users, setUsers] = useState<any[]>([]);
  const [, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [kycDocsDialogOpen, setKycDocsDialogOpen] = useState(false);
  const [userDocs, setUserDocs] = useState<any[]>([]);
  const [globalSettings, setGlobalSettings] = useState<any>({});
  
  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    role: 'user',
    user_group: 'standard',
    is_active: true,
    monthly_roi_percentage: 10,
    target_usdt: 1000,
    referral_levels_overrides: {} as any,
    referral_level_targets: {} as any,
    deposit_balance: 0,
    roi_balance: 0,
    bonus_balance: 0,
    withdrawal_balance: 0,
    referral_level_1_enabled: true,
    referral_level_2_enabled: true,
    referral_level_3_enabled: true,
    referral_level_4_enabled: true,
    referral_level_5_enabled: false,
    referral_level_6_enabled: false,
    referral_level_7_enabled: false,
    referral_level_8_enabled: false,
    referral_level_9_enabled: false,
    referral_level_10_enabled: false,
    referral_level_11_enabled: false,
    referral_level_12_enabled: false,
    referral_level_13_enabled: false,
    referral_level_14_enabled: false,
    referral_level_15_enabled: false,
  });

  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'user' as 'user' | 'admin'
  });

  useEffect(() => {
    loadUsers();
    loadGlobalSettings();
  }, [kycFilter]);

  const loadGlobalSettings = async () => {
    const { data } = await supabase.from('settings').select('*');
    if (data) {
      const settingsObj: any = {};
      (data as any[]).forEach(s => settingsObj[s.key] = s.value);
      setGlobalSettings(settingsObj);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      let query = supabase.from('profiles').select('*');
      
      if (kycFilter !== 'all') {
        query = query.eq('kyc_status', kycFilter);
      }
      
      const { data: usersData, error: usersError } = await query.order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Load all wallets
      const { data: walletsData } = await supabase
        .from('wallets')
        .select('user_id, wallet_type, balance');

      // Load deposit and withdrawal fees for each user
      const { data: depositsData } = await supabase
        .from('deposits')
        .select('user_id, fee')
        .eq('status', 'approved');

      const { data: withdrawalsData } = await supabase
        .from('withdrawals')
        .select('user_id, fee')
        .eq('status', 'approved');

      // Load referral stats
      const { data: referralStatsData } = await supabase
        .from('user_referral_level_stats')
        .select('*')
        .in('user_id', (usersData || []).map((u: any) => u.id));

      const combinedData = (usersData || []).map((user: any) => {
        const userWallets = (walletsData as any[] || []).filter((w: any) => w.user_id === user.id);
        const balances = {
          deposit: userWallets.find((w: any) => w.wallet_type === 'deposit')?.balance || 0,
          roi: userWallets.find((w: any) => w.wallet_type === 'roi')?.balance || 0,
          bonus: userWallets.find((w: any) => w.wallet_type === 'bonus')?.balance || 0,
          withdrawal: userWallets.find((w: any) => w.wallet_type === 'withdrawal')?.balance || 0
        };

        const feesPaid = [
          ...(depositsData as any[] || []).filter((d: any) => d.user_id === user.id).map((d: any) => Number(d.fee || 0)),
          ...(withdrawalsData as any[] || []).filter((w: any) => w.user_id === user.id).map((w: any) => Number(w.fee || 0))
        ].reduce((sum: number, f: number) => sum + f, 0);

        const referralStats = (referralStatsData || []).filter((s: any) => s.user_id === user.id);

        return {
          ...user,
          ...balances,
          total_fees_paid: feesPaid,
          referral_stats: referralStats
        };
      });

      setUsers(combinedData);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (user: any) => {
    setSelectedUser(user);
    setEditForm({
      full_name: user.full_name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      city: user.city || '',
      state: user.state || '',
      country: user.country || '',
      postal_code: user.postal_code || '',
      role: user.role,
      user_group: user.user_group || 'standard',
      is_active: user.is_active,
      monthly_roi_percentage: Number(user.monthly_roi_percentage || 10),
      target_usdt: Number(user.target_usdt || 1000),
      referral_levels_overrides: user.referral_levels_overrides || {},
      referral_level_targets: user.referral_level_targets || {},
      deposit_balance: Number(user.deposit),
      roi_balance: Number(user.roi),
      bonus_balance: Number(user.bonus),
      withdrawal_balance: Number(user.withdrawal),
      referral_level_1_enabled: user.referral_level_1_enabled !== false,
      referral_level_2_enabled: user.referral_level_2_enabled !== false,
      referral_level_3_enabled: user.referral_level_3_enabled !== false,
      referral_level_4_enabled: user.referral_level_4_enabled !== false,
      referral_level_5_enabled: !!user.referral_level_5_enabled,
      referral_level_6_enabled: !!user.referral_level_6_enabled,
      referral_level_7_enabled: !!user.referral_level_7_enabled,
      referral_level_8_enabled: !!user.referral_level_8_enabled,
      referral_level_9_enabled: !!user.referral_level_9_enabled,
      referral_level_10_enabled: !!user.referral_level_10_enabled,
      referral_level_11_enabled: !!user.referral_level_11_enabled,
      referral_level_12_enabled: !!user.referral_level_12_enabled,
      referral_level_13_enabled: !!user.referral_level_13_enabled,
      referral_level_14_enabled: !!user.referral_level_14_enabled,
      referral_level_15_enabled: !!user.referral_level_15_enabled,
    } as any);
    setEditDialogOpen(true);
  };

  const applyDefaults = () => {
    const updatedOverrides = { ...editForm.referral_levels_overrides };
    const updatedTargets = { ...editForm.referral_level_targets };
    
    // Populate missing levels based on globalSettings
    for (let i = 1; i <= 15; i++) {
      const key = `level${i}_commission`;
      if (globalSettings[key]) {
        updatedOverrides[key] = Number(globalSettings[key]);
      }
      
      const targetKey = `level${i}_target`;
      if (globalSettings[targetKey]) {
        updatedTargets[targetKey] = Number(globalSettings[targetKey]);
      }
    }

    setEditForm({
      ...editForm,
      monthly_roi_percentage: Number(globalSettings.monthly_roi || 10),
      target_usdt: Number(globalSettings.target_usdt || 1000),
      referral_levels_overrides: updatedOverrides,
      referral_level_targets: updatedTargets
    });
    
    toast.success('Platform default values applied to form');
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    try {
      // 1. Update Profile
      const { error: profileError } = await (supabase
        .from('profiles') as any)
        .update({
          full_name: editForm.full_name,
          email: editForm.email,
          phone: editForm.phone,
          address: editForm.address,
          city: editForm.city,
          state: editForm.state,
          country: editForm.country,
          postal_code: editForm.postal_code,
          role: editForm.role as any,
          user_group: editForm.user_group,
          is_active: editForm.is_active,
          monthly_roi_percentage: editForm.monthly_roi_percentage,
          target_usdt: editForm.target_usdt,
          referral_levels_overrides: editForm.referral_levels_overrides,
          referral_level_targets: editForm.referral_level_targets,
          referral_level_1_enabled: editForm.referral_level_1_enabled,
          referral_level_2_enabled: editForm.referral_level_2_enabled,
          referral_level_3_enabled: editForm.referral_level_3_enabled,
          referral_level_4_enabled: editForm.referral_level_4_enabled,
          referral_level_5_enabled: editForm.referral_level_5_enabled,
          referral_level_6_enabled: editForm.referral_level_6_enabled,
          referral_level_7_enabled: editForm.referral_level_7_enabled,
          referral_level_8_enabled: editForm.referral_level_8_enabled,
          referral_level_9_enabled: editForm.referral_level_9_enabled,
          referral_level_10_enabled: editForm.referral_level_10_enabled,
          referral_level_11_enabled: editForm.referral_level_11_enabled,
          referral_level_12_enabled: editForm.referral_level_12_enabled,
          referral_level_13_enabled: editForm.referral_level_13_enabled,
          referral_level_14_enabled: editForm.referral_level_14_enabled,
          referral_level_15_enabled: editForm.referral_level_15_enabled,
        } as any)
        .eq('id', selectedUser.id);

      if (profileError) throw profileError;

      // 2. Update Wallets
      const walletUpdates = [
        { type: 'deposit', balance: editForm.deposit_balance },
        { type: 'roi', balance: editForm.roi_balance },
        { type: 'bonus', balance: editForm.bonus_balance },
        { type: 'withdrawal', balance: editForm.withdrawal_balance }
      ];

      for (const w of walletUpdates) {
        await (supabase
          .from('wallets') as any)
          .update({ balance: w.balance })
          .eq('user_id', selectedUser.id)
          .eq('wallet_type', w.type);
      }

      toast.success('User updated successfully');
      setEditDialogOpen(false);
      loadUsers();
    } catch (error) {
      console.error('Update failed:', error);
      toast.error('Failed to update user');
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.full_name) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('create-user', {
        body: newUser
      });

      if (error) {
        const errorText = await error.context.text();
        throw new Error(errorText || error.message);
      }

      toast.success('User created successfully');
      setCreateDialogOpen(false);
      setNewUser({ email: '', password: '', full_name: '', role: 'user' });
      loadUsers();
    } catch (error: any) {
      console.error('Creation failed:', error);
      toast.error(error.message || 'Failed to create user');
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      const { error } = await supabase.functions.invoke('delete-user', {
        body: { user_id: id }
      });
      if (error) throw error;
      toast.success('User deleted');
      loadUsers();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const loadDocs = async (userId: string) => {
    const { data } = await supabase
      .from('kyc_documents')
      .select('*')
      .eq('user_id', userId);
    setUserDocs(data || []);
  };

  const handleOpenDocs = (user: any) => {
    setSelectedUser(user);
    loadDocs(user.id);
    setKycDocsDialogOpen(true);
  };

  const handleDeleteDoc = async (docId: string) => {
    const { error } = await supabase.from('kyc_documents').delete().eq('id', docId);
    if (error) toast.error('Failed to delete document');
    else {
      toast.success('Document deleted');
      loadDocs(selectedUser.id);
    }
  };

  const handleUpdateKycStatus = async (status: string) => {
    const { error } = await (supabase
      .from('profiles') as any)
      .update({ kyc_status: status as any })
      .eq('id', selectedUser.id);
    
    if (error) toast.error('Failed to update status');
    else {
      toast.success(`KYC status updated to ${status}`);
      loadUsers();
    }
  };

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold v56-gradient-text">User Management</h1>
          <p className="text-muted-foreground">Manage accounts and segments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportToCSV(users, 'users_export')} className="gap-2">
            <Download className="h-4 w-4" />
            Export Excel
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)} className=" gap-2">
            <UserPlus className="h-4 w-4" />
            Create User
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={kycFilter} onValueChange={(v) => setSearchParams({ kyc: v })}>
          <SelectTrigger className="w-full md:w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="KYC Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All KYC Status</SelectItem>
            <SelectItem value="not_submitted">Not Submitted</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="v56-glass premium-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-accent/50">
                <tr>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">KYC Status</th>
                  <th className="px-6 py-3 text-right">Balances (USDT)</th>
                  <th className="px-6 py-3 text-right">Total Fees</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-accent/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold">{user.full_name || 'No Name'}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold ${
                        user.kyc_status === 'approved' ? 'bg-green-500/20 text-green-500' :
                        user.kyc_status === 'rejected' ? 'bg-red-500/20 text-red-500' :
                        user.kyc_status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                        'bg-gray-500/20 text-gray-500'
                      }`}>
                        {user.kyc_status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-xs">
                        <span className="text-muted-foreground">Dep:</span> {Number(user.deposit || 0).toFixed(2)} | 
                        <span className="text-muted-foreground"> ROI:</span> {Number(user.roi || 0).toFixed(2)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        Bonus: {Number(user.bonus || 0).toFixed(2)} | With: {Number(user.withdrawal || 0).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-green-500 font-bold">
                      {Number(user.total_fees_paid || 0).toFixed(2)} USDT
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="icon" variant="ghost" onClick={() => handleOpenEdit(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleOpenDocs(user)}>
                          <FileText className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User?</AlertDialogTitle>
                              <AlertDialogDescription>Permanent action. This removes all user data.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteUser(user.id)} className="bg-red-500">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User: {selectedUser?.email}</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="wallets">Wallets</TabsTrigger>
              <TabsTrigger value="roi">ROI Info</TabsTrigger>
              <TabsTrigger value="performance">Levels & Perf</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={editForm.full_name} onChange={e => setEditForm({...editForm, full_name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <div className="space-y-2">
                  <Label>City</Label>
                  <Input value={editForm.city} onChange={e => setEditForm({...editForm, city: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input value={editForm.state} onChange={e => setEditForm({...editForm, state: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input value={editForm.country} onChange={e => setEditForm({...editForm, country: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Postal Code</Label>
                  <Input value={editForm.postal_code} onChange={e => setEditForm({...editForm, postal_code: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>User Group</Label>
                  <Input value={editForm.user_group} onChange={e => setEditForm({...editForm, user_group: e.target.value})} placeholder="e.g. VIP, standard" />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="wallets" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Deposit Balance</Label>
                  <Input type="number" value={editForm.deposit_balance} onChange={e => setEditForm({...editForm, deposit_balance: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label>ROI Balance</Label>
                  <Input type="number" value={editForm.roi_balance} onChange={e => setEditForm({...editForm, roi_balance: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label>Bonus Balance</Label>
                  <Input type="number" value={editForm.bonus_balance} onChange={e => setEditForm({...editForm, bonus_balance: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label>Withdrawal Balance</Label>
                  <Input type="number" value={editForm.withdrawal_balance} onChange={e => setEditForm({...editForm, withdrawal_balance: Number(e.target.value)})} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="roi" className="space-y-6 pt-4">
              <div className="flex justify-between items-center bg-primary/5 p-4 rounded-xl border border-primary/10 mb-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-sm uppercase tracking-wider">Default Configuration</h4>
                  <p className="text-xs text-muted-foreground">Apply standard platform defaults from settings.</p>
                </div>
                <Button variant="outline" size="sm" onClick={applyDefaults} className="gold-border hover:bg-primary/10">
                  <Zap className="h-4 w-4 mr-2 text-primary" />
                  Apply Default Settings
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-bold">Individual Monthly ROI (%)</Label>
                  <Input type="number" step="0.1" value={editForm.monthly_roi_percentage} onChange={e => setEditForm({...editForm, monthly_roi_percentage: Number(e.target.value)})} />
                  <p className="text-[10px] text-muted-foreground italic">Overrides platform default for this specific user.</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold">Target USDT (Wealth Projection)</Label>
                  <Input type="number" value={editForm.target_usdt} onChange={e => setEditForm({...editForm, target_usdt: Number(e.target.value)})} />
                  <p className="text-[10px] text-muted-foreground italic">Target amount used in this user's wealth projection hub.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-px bg-white/5 flex-1" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Individual Level Commission Overrides</span>
                  <div className="h-px bg-white/5 flex-1" />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {Array.from({ length: 15 }, (_, i) => i + 1).map((lvl) => {
                    const key = `level${lvl}_commission`;
                    const isOverridden = editForm.referral_levels_overrides[key] !== undefined;
                    return (
                      <div key={lvl} className={`space-y-1 p-2 rounded-lg border ${isOverridden ? 'bg-primary/5 border-primary/20' : 'bg-white/5 border-white/5'}`}>
                        <div className="flex justify-between items-center mb-1">
                          <Label className="text-[10px] font-bold">Level {lvl}</Label>
                          {isOverridden && <span className="text-[8px] bg-primary text-primary-foreground px-1 rounded-sm">Override</span>}
                        </div>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder={globalSettings[key] || '0'}
                          value={editForm.referral_levels_overrides[key] ?? ''}
                          onChange={(e) => {
                            const val = e.target.value === '' ? undefined : Number(e.target.value);
                            const updatedOverrides = { ...editForm.referral_levels_overrides };
                            if (val === undefined) {
                              delete updatedOverrides[key];
                            } else {
                              updatedOverrides[key] = val;
                            }
                            setEditForm({ ...editForm, referral_levels_overrides: updatedOverrides });
                          }}
                          className="h-7 text-xs"
                        />
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-center text-muted-foreground opacity-60 mt-2 italic">
                  Empty fields will inherit values from the platform-wide configuration.
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <div className="h-px bg-white/5 flex-1" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Individual Level Unlock Targets (USDT)</span>
                  <div className="h-px bg-white/5 flex-1" />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {Array.from({ length: 11 }, (_, i) => i + 5).map((lvl) => {
                    const key = `level${lvl}_target`;
                    const defaultTarget = [0,0,0,0,10000, 25000, 50000, 100000, 200000, 400000, 800000, 1600000, 3200000, 6400000, 12800000][lvl-1];
                    return (
                      <div key={lvl} className={`space-y-1 p-2 rounded-lg border ${editForm.referral_level_targets[key] !== undefined ? 'bg-primary/5 border-primary/20' : 'bg-white/5 border-white/5'}`}>
                        <div className="flex justify-between items-center mb-1">
                          <Label className="text-[10px] font-bold">L{lvl} Target</Label>
                        </div>
                        <Input
                          type="number"
                          placeholder={defaultTarget.toString()}
                          value={editForm.referral_level_targets[key] ?? ''}
                          onChange={(e) => {
                            const val = e.target.value === '' ? undefined : Number(e.target.value);
                            const updatedTargets = { ...editForm.referral_level_targets };
                            if (val === undefined) {
                              delete updatedTargets[key];
                            } else {
                              updatedTargets[key] = val;
                            }
                            setEditForm({ ...editForm, referral_level_targets: updatedTargets });
                          }}
                          className="h-7 text-xs"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4 pt-4">
               <div className="p-4 bg-accent/20 rounded-lg">
                  <Label className="text-primary font-bold">Direct Referral Performance: {selectedUser?.performance_usdt || 0} USDT</Label>
               </div>
               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(lvl => (
                    <div key={lvl} className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id={`lvl-${lvl}`} 
                        checked={(editForm as any)[`referral_level_${lvl}_enabled`]}
                        onChange={e => setEditForm({...editForm, [`referral_level_${lvl}_enabled`]: e.target.checked})}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <Label htmlFor={`lvl-${lvl}`} className="text-sm">Enable Level {lvl}</Label>
                    </div>
                  ))}
               </div>
            </TabsContent>
          </Tabs>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateUser} className="">Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={newUser.full_name} onChange={e => setNewUser({...newUser, full_name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
            </div>
            <Button onClick={handleCreateUser} className="w-full ">Create User</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* KYC Docs Dialog */}
      <Dialog open={kycDocsDialogOpen} onOpenChange={setKycDocsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>KYC Documents: {selectedUser?.email}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-accent/30 p-4 rounded-lg">
              <span className="font-bold">Current Status: {selectedUser?.kyc_status.toUpperCase()}</span>
              <div className="flex gap-2">
                 <Button size="sm" onClick={() => handleUpdateKycStatus('approved')}>Approve</Button>
                 <Button size="sm" variant="destructive" onClick={() => handleUpdateKycStatus('rejected')}>Reject</Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {userDocs.length === 0 ? (
                <p className="text-center text-muted-foreground py-10">No documents found.</p>
              ) : userDocs.map(doc => (
                <div key={doc.id} className="flex justify-between items-center p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-semibold">{doc.document_type}</p>
                      <a href={doc.file_url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">View File</a>
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => handleDeleteDoc(doc.id)} className="text-red-500">
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
