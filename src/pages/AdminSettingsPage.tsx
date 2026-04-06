import { Activity, Anchor, BarChart3, DollarSign, Globe, Image, Loader2, Mail, Palette, Save, Search, Terminal, Users, Wallet, Zap, TrendingUp, Shield, Lock, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { triggerCompoundingROI } from '@/db/api';
import { useAnalytics } from '@/lib/analytics';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/db/supabase';
import { AssetUploader } from '@/components/admin/AssetUploader';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testRecipient, setTestRecipient] = useState('');
  const [roiAdjustments, setRoiAdjustments] = useState<any[]>([]);
  const [newAdjustment, setNewAdjustment] = useState({
    name: '',
    percentage: '',
    start_date: '',
    end_date: '',
    is_active: true,
    target_type: 'all',
    target_value: ''
  });
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const { trackROIPayout } = useAnalytics();
  const [settings, setSettings] = useState({
    // Platform Core
    platform_wallet_bep20: '',
    platform_wallet_trc20: '',
    min_deposit: '100',
    min_withdrawal: '50',
    deposit_fee: '5',
    withdrawal_fee: '5',
    monthly_roi: '10',
    daily_roi_percentage: '0.33',
    target_usdt: '1000',
    is_referral_default: 'true',
    level1_commission: '8',
    level2_commission: '4',
    level3_commission: '2',
    level4_commission: '1',
    // ... Levels 5-15 (will map dynamically)
    global_auto_withdrawal_enabled: 'false',
    
    // External APIs
    bscscan_api_key: '',
    tronscan_api_key: '',
    
    // Branding & Assets
    site_title: 'Gold X Usdt',
    site_tagline: 'The Gold Standard of Digital Wealth',
    logo_header_url: '',
    logo_footer_url: '',
    favicon_url: '',
    primary_color: '#D4AF37',
    secondary_color: '#1A1A1A',
    accent_color: '#FFD700',
    font_family: 'Inter',
    
    // SEO & Meta
    seo_description: '',
    seo_keywords: '',
    og_title: '',
    og_description: '',
    og_image: '',
    twitter_card: 'summary_large_image',
    robots_txt: '',
    
    // Contact & Social
    contact_email: '',
    contact_phone: '',
    contact_address: '',
    social_facebook: '',
    social_twitter: '',
    social_instagram: '',
    social_telegram: '',
    
    // Analytics & Scripts
    ga_measurement_id: '',
    analytics_code: '',
    header_scripts: '',
    footer_scripts: '',
    
    // Hostinger SMTP (Updated)
    smtp_user: '',
    smtp_pass: '',
    smtp_host: 'smtp.hostinger.com',
    smtp_port: '465',
    
    // Help Links
    youtube_deposit_help: '',
    youtube_kyc_help: '',
    youtube_withdrawal_help: '',

    // Security & Firewall
    firewall_geo_blocking_enabled: 'false',
    firewall_geo_blacklist: '[]',
    firewall_rate_limiting_enabled: 'true',
    firewall_rate_limit_max_requests: '100',
    firewall_rate_limit_window_seconds: '60',
    firewall_maintenance_mode: 'false',

    // Blockchain API auto-confirmation
    blockchain_api_trc20_key: '',
    blockchain_api_bep20_key: '',
    blockchain_trc20_wallet: '',
    blockchain_bep20_wallet: '',
    // Levels 5-15 (will map dynamically)
    ...Array.from({ length: 11 }, (_, i) => ({ 
      [`level${i + 5}_commission`]: ['0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1.0', '4.0'][i],
      [`level${i + 5}_target`]: ['10000', '25000', '50000', '75000', '100000', '150000', '200000', '300000', '400000', '500000', '1000000'][i]
    })).reduce((acc, curr) => ({ ...acc, ...curr }), {})
  });

  useEffect(() => {
    loadSettings();
    loadAdjustments();
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const { data } = await supabase.from('profiles').select('id, full_name, email').limit(100);
    if (data) setAllUsers(data);
  };

  const loadAdjustments = async () => {
    const { data } = await (supabase
      .from('roi_adjustments') as any)
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setRoiAdjustments(data);
  };

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value');

      if (error) throw error;

      const settingsObj: any = { ...settings };
      (data || []).forEach((setting: any) => {
        if (setting.key in settingsObj || setting.key.startsWith('level')) {
          settingsObj[setting.key] = setting.value;
        }
      });
      setSettings(settingsObj);
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error('Failed to load settings');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value: value ? value.toString() : ''
      }));

      const { error } = await supabase
        .from('settings')
        .upsert(updates as any, { onConflict: 'key' });

      if (error) throw error;

      toast.success('Settings saved successfully');
      
      // Update CSS variables for live preview
      if (settings.primary_color) {
        document.documentElement.style.setProperty('--primary', settings.primary_color);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testRecipient) {
      toast.error('Please enter a recipient email for testing');
      return;
    }

    setTestingEmail(true);
    try {
      const { error } = await supabase.functions.invoke('test-email', {
        body: { email: testRecipient }
      });

      if (error) {
        const errorMsg = await error?.context?.text();
        throw new Error(errorMsg || error.message);
      }

      toast.success('Test email sent successfully! Please check your inbox.');
    } catch (error: any) {
      console.error('Failed to send test email:', error);
      toast.error(`SMTP Test Failed: ${error.message}`);
    } finally {
      setTestingEmail(false);
    }
  };

  const updateSetting = (key: string, value: string) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      
      // Auto-calculate daily ROI if monthly ROI changes
      if (key === 'monthly_roi' && !isNaN(Number(value))) {
        newSettings.daily_roi_percentage = (Number(value) / 30).toFixed(2);
      }
      
      return newSettings;
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold v56-gradient-text">Platform Settings</h1>
          <p className="text-muted-foreground">Manage global configuration, branding, and SEO</p>
        </div>
        <Button onClick={handleSave} disabled={loading} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : 'Save All Changes'}
        </Button>
      </div>
      <Tabs defaultValue="platform" className="w-full">
        <TabsList className="grid w-full grid-cols-4 md:grid-cols-8 lg:w-[1200px]">
          <TabsTrigger value="platform">Platform Core</TabsTrigger>
          <TabsTrigger value="blockchain">Blockchain API</TabsTrigger>
          <TabsTrigger value="branding">Branding & Assets</TabsTrigger>
          <TabsTrigger value="roi-adjustments">ROI Adjustments</TabsTrigger>
          <TabsTrigger value="seo">SEO & Analytics</TabsTrigger>
          <TabsTrigger value="content">Content & Contact</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Platform Core Tab */}
        <TabsContent value="platform" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Wallet Addresses */}
            <Card className="v56-glass premium-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  <CardTitle>Crypto Wallets</CardTitle>
                </div>
                <CardDescription>Deposit receiving addresses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>BEP-20 Wallet Address</Label>
                  <Textarea
                    value={settings.platform_wallet_bep20}
                    onChange={(e) => updateSetting('platform_wallet_bep20', e.target.value)}
                    rows={2}
                    className="font-mono text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <Label>TRC-20 Wallet Address</Label>
                  <Textarea
                    value={settings.platform_wallet_trc20}
                    onChange={(e) => updateSetting('platform_wallet_trc20', e.target.value)}
                    rows={2}
                    className="font-mono text-xs"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Transaction Limits */}
            <Card className="v56-glass premium-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <CardTitle>Financial Limits</CardTitle>
                </div>
                <CardDescription>Minimums and fees</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Min Deposit (USDT)</Label>
                    <Input
                      type="number"
                      value={settings.min_deposit}
                      onChange={(e) => updateSetting('min_deposit', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Min Withdrawal (USDT)</Label>
                    <Input
                      type="number"
                      value={settings.min_withdrawal}
                      onChange={(e) => updateSetting('min_withdrawal', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Deposit Fee (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={settings.deposit_fee}
                      onChange={(e) => updateSetting('deposit_fee', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Withdrawal Fee (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={settings.withdrawal_fee}
                      onChange={(e) => updateSetting('withdrawal_fee', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ROI Settings */}
            <Card className="v56-glass premium-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <CardTitle>ROI Configuration</CardTitle>
                </div>
                <CardDescription>Investment returns settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Monthly ROI (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={settings.monthly_roi}
                      disabled={settings.is_referral_default === 'true'}
                      onChange={(e) => {
                        const monthly = e.target.value;
                        const daily = (parseFloat(monthly) / 30).toFixed(4);
                        updateSetting('monthly_roi', monthly);
                        updateSetting('daily_roi_percentage', daily);
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Daily ROI (%) [Auto]</Label>
                    <Input
                      type="number"
                      value={settings.daily_roi_percentage}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Target USDT (Projection)</Label>
                    <Input
                      type="number"
                      value={(settings as any).target_usdt}
                      disabled={settings.is_referral_default === 'true'}
                      onChange={(e) => updateSetting('target_usdt', e.target.value)}
                      placeholder="Enter target USDT for projections"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Email Server (Hostinger SMTP) Configuration */}
            <Card className="v56-glass premium-border gold-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  <CardTitle>Email Server (Hostinger SMTP) Configuration</CardTitle>
                </div>
                <CardDescription>Securely configure your Hostinger SMTP authentication details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp_user">SMTP Username</Label>
                    <Input
                      id="smtp_user"
                      placeholder="info@yourdomain.com"
                      value={settings.smtp_user}
                      onChange={(e) => updateSetting('smtp_user', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp_pass">SMTP Password</Label>
                    <Input
                      id="smtp_pass"
                      type="password"
                      placeholder="••••••••"
                      value={settings.smtp_pass}
                      onChange={(e) => updateSetting('smtp_pass', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtp_host">SMTP Host</Label>
                      <Input
                        id="smtp_host"
                        placeholder="smtp.hostinger.com"
                        value={settings.smtp_host}
                        onChange={(e) => updateSetting('smtp_host', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp_port">SMTP Port</Label>
                      <Select
                        value={settings.smtp_port}
                        onValueChange={(val) => updateSetting('smtp_port', val)}
                      >
                        <SelectTrigger id="smtp_port">
                          <SelectValue placeholder="Port" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="465">465 (SSL)</SelectItem>
                          <SelectItem value="587">587 (TLS)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 space-y-4">
                  <Label className="text-xs font-semibold">Verify Connection</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Test recipient email"
                      value={testRecipient}
                      onChange={(e) => setTestRecipient(e.target.value)}
                      className="text-xs h-9"
                    />
                    <Button
                      onClick={handleTestEmail}
                      disabled={testingEmail}
                      variant="secondary"
                      size="sm"
                      className=" whitespace-nowrap"
                    >
                      {testingEmail ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Mail className="h-4 w-4 mr-2" />
                      )}
                      Test
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Referral Commission */}
          <Card className="v56-glass premium-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <CardTitle>Referral Commission Structure</CardTitle>
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                <Label htmlFor="default-commission" className="text-xs font-bold uppercase tracking-widest cursor-pointer">Default (5.2.2)</Label>
                <Switch 
                  id="default-commission"
                  checked={settings.is_referral_default === 'true'}
                  onCheckedChange={(checked) => {
                    const isDefault = checked ? 'true' : 'false';
                    const newSettings = { ...settings, is_referral_default: isDefault };
                    
                    if (checked) {
                      // Apply default values
                      newSettings.monthly_roi = '10';
                      newSettings.daily_roi_percentage = '0.33';
                      (newSettings as any).target_usdt = '1000';
                      newSettings.level1_commission = '8';
                      newSettings.level2_commission = '4';
                      newSettings.level3_commission = '2';
                      newSettings.level4_commission = '1';
                      
                      const levelDefaults = [
                        { comm: '0.1', target: '10000' }, // L5
                        { comm: '0.2', target: '25000' }, // L6
                        { comm: '0.3', target: '50000' }, // L7
                        { comm: '0.4', target: '75000' }, // L8
                        { comm: '0.5', target: '100000' }, // L9
                        { comm: '0.6', target: '150000' }, // L10
                        { comm: '0.7', target: '200000' }, // L11
                        { comm: '0.8', target: '300000' }, // L12
                        { comm: '0.9', target: '400000' }, // L13
                        { comm: '1.0', target: '500000' }, // L14
                        { comm: '4.0', target: '1000000' } // L15
                      ];

                      for (let i = 0; i < 11; i++) {
                        const levelNum = i + 5;
                        (newSettings as any)[`level${levelNum}_commission`] = levelDefaults[i].comm;
                        (newSettings as any)[`level${levelNum}_target`] = levelDefaults[i].target;
                      }
                    }
                    setSettings(newSettings);
                  }}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((level) => (
                  <div key={level} className="space-y-2 p-3 rounded-lg border border-white/5 bg-white/5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-primary">Level {level} (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={(settings as any)[`level${level}_commission`]}
                      onChange={(e) => updateSetting(`level${level}_commission`, e.target.value)}
                      disabled={settings.is_referral_default === 'true'}
                      className="h-8 text-sm"
                    />
                  </div>
                ))}
              </div>

              <div className="h-px bg-white/5" />
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Premium Unlocks (L5-L15)</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 11 }, (_, i) => i + 5).map((level) => (
                  <div key={level} className="grid grid-cols-2 gap-3 p-3 rounded-lg border border-white/5 bg-white/5">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider">Level {level} (%)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={(settings as any)[`level${level}_commission`]}
                        onChange={(e) => updateSetting(`level${level}_commission`, e.target.value)}
                        disabled={settings.is_referral_default === 'true'}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider">L{level} Target (USDT)</Label>
                      <Input
                        type="number"
                        value={(settings as any)[`level${level}_target`]}
                        onChange={(e) => updateSetting(`level${level}_target`, e.target.value)}
                        disabled={settings.is_referral_default === 'true'}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Blockchain API Tab */}
        <TabsContent value="blockchain" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* TRC-20 (Tron) API */}
            <Card className="v56-glass premium-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-primary" />
                  <CardTitle>TRC-20 API Configuration</CardTitle>
                </div>
                <CardDescription>TronScan or Tatum API for auto-confirmation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Tron API Key</Label>
                  <Input
                    type="password"
                    value={settings.blockchain_api_trc20_key}
                    onChange={(e) => updateSetting('blockchain_api_trc20_key', e.target.value)}
                    placeholder="Enter TronScan/Tatum API Key"
                  />
                </div>
                <div className="space-y-2">
                  <Label>System TRC-20 Wallet</Label>
                  <Input
                    value={settings.blockchain_trc20_wallet}
                    onChange={(e) => updateSetting('blockchain_trc20_wallet', e.target.value)}
                    placeholder="T..."
                  />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Address to monitor for incoming TRC-20 transfers</p>
                </div>
              </CardContent>
            </Card>

            {/* BEP-20 (BSC) API */}
            <Card className="v56-glass premium-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-primary" />
                  <CardTitle>BEP-20 API Configuration</CardTitle>
                </div>
                <CardDescription>BscScan or Moralis API for auto-confirmation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>BSC API Key</Label>
                  <Input
                    type="password"
                    value={settings.blockchain_api_bep20_key}
                    onChange={(e) => updateSetting('blockchain_api_bep20_key', e.target.value)}
                    placeholder="Enter BscScan/Moralis API Key"
                  />
                </div>
                <div className="space-y-2">
                  <Label>System BEP-20 Wallet</Label>
                  <Input
                    value={settings.blockchain_bep20_wallet}
                    onChange={(e) => updateSetting('blockchain_bep20_wallet', e.target.value)}
                    placeholder="0x..."
                  />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Address to monitor for incoming BEP-20 transfers</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Branding & Assets Tab */}
        <TabsContent value="branding" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="v56-glass premium-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Image className="h-5 w-5 text-primary" />
                  <CardTitle>Logos & Assets</CardTitle>
                </div>
                <CardDescription>Upload site branding assets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <AssetUploader
                  label="Header Logo"
                  value={settings.logo_header_url}
                  onUpload={(url) => updateSetting('logo_header_url', url)}
                  onRemove={() => updateSetting('logo_header_url', '')}
                  bucket="public_assets"
                  description="Recommended: 200x50px PNG/SVG"
                />
                <AssetUploader
                  label="Footer Logo"
                  value={settings.logo_footer_url}
                  onUpload={(url) => updateSetting('logo_footer_url', url)}
                  onRemove={() => updateSetting('logo_footer_url', '')}
                  bucket="public_assets"
                  description="Recommended: White version, 200x50px"
                />
                <AssetUploader
                  label="Favicon"
                  value={settings.favicon_url}
                  onUpload={(url) => updateSetting('favicon_url', url)}
                  onRemove={() => updateSetting('favicon_url', '')}
                  bucket="public_assets"
                  description="Recommended: 32x32px ICO/PNG"
                />
              </CardContent>
            </Card>

            <Card className="v56-glass premium-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  <CardTitle>Theme & Colors</CardTitle>
                </div>
                <CardDescription>Customize platform appearance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={settings.primary_color}
                      onChange={(e) => updateSetting('primary_color', e.target.value)}
                      className="w-12 p-1 h-9"
                    />
                    <Input
                      value={settings.primary_color}
                      onChange={(e) => updateSetting('primary_color', e.target.value)}
                      className="font-mono uppercase"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={settings.secondary_color}
                      onChange={(e) => updateSetting('secondary_color', e.target.value)}
                      className="w-12 p-1 h-9"
                    />
                    <Input
                      value={settings.secondary_color}
                      onChange={(e) => updateSetting('secondary_color', e.target.value)}
                      className="font-mono uppercase"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Accent Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={settings.accent_color}
                      onChange={(e) => updateSetting('accent_color', e.target.value)}
                      className="w-12 p-1 h-9"
                    />
                    <Input
                      value={settings.accent_color}
                      onChange={(e) => updateSetting('accent_color', e.target.value)}
                      className="font-mono uppercase"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Font Family</Label>
                  <Select 
                    value={settings.font_family} 
                    onValueChange={(val) => updateSetting('font_family', val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select font" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter (Default)</SelectItem>
                      <SelectItem value="Roboto">Roboto</SelectItem>
                      <SelectItem value="Open Sans">Open Sans</SelectItem>
                      <SelectItem value="Lato">Lato</SelectItem>
                      <SelectItem value="Montserrat">Montserrat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* SEO & Analytics Tab */}
        <TabsContent value="roi-adjustments" className="space-y-6 mt-6">
          <Card className="v56-glass premium-border overflow-hidden">
            <CardHeader className="premium-gradient text-white">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Global ROI Period Adjustments
              </CardTitle>
              <CardDescription className="text-white/80">
                Adjust the monthly ROI percentage for everyone during specific periods (e.g., promotions, events).
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Add New Adjustment */}
              <div className="p-4 rounded-lg bg-muted/30 border border-border/50 space-y-4">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Create New ROI Adjustment
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <Label>Campaign Name</Label>
                    <Input 
                      placeholder="e.g. Summer Promo"
                      value={newAdjustment.name}
                      onChange={(e) => setNewAdjustment({...newAdjustment, name: e.target.value})}
                      className="v56-glass-input h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Monthly ROI %</Label>
                    <Input 
                      type="number"
                      placeholder="e.g. 15"
                      value={newAdjustment.percentage}
                      onChange={(e) => setNewAdjustment({...newAdjustment, percentage: e.target.value})}
                      className="v56-glass-input h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Start Date</Label>
                    <Input 
                      type="date"
                      value={newAdjustment.start_date}
                      onChange={(e) => setNewAdjustment({...newAdjustment, start_date: e.target.value})}
                      className="v56-glass-input h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>End Date</Label>
                    <Input 
                      type="date"
                      value={newAdjustment.end_date}
                      onChange={(e) => setNewAdjustment({...newAdjustment, end_date: e.target.value})}
                      className="v56-glass-input h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Target Type</Label>
                    <Select 
                      value={newAdjustment.target_type} 
                      onValueChange={(val) => setNewAdjustment({...newAdjustment, target_type: val, target_value: ''})}
                    >
                      <SelectTrigger className="v56-glass-input h-9">
                        <SelectValue placeholder="All Users" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="group">Specific Group</SelectItem>
                        <SelectItem value="user">Specific User</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {newAdjustment.target_type === 'group' && (
                    <div className="space-y-1">
                      <Label>Group Name</Label>
                      <Input 
                        placeholder="e.g. VIP"
                        value={newAdjustment.target_value}
                        onChange={(e) => setNewAdjustment({...newAdjustment, target_value: e.target.value})}
                        className="v56-glass-input h-9"
                      />
                    </div>
                  )}
                  {newAdjustment.target_type === 'user' && (
                    <div className="space-y-1">
                      <Label>Select User</Label>
                      <Select 
                        value={newAdjustment.target_value} 
                        onValueChange={(val) => setNewAdjustment({...newAdjustment, target_value: val})}
                      >
                        <SelectTrigger className="v56-glass-input h-9">
                          <SelectValue placeholder="Select User" />
                        </SelectTrigger>
                        <SelectContent>
                          {allUsers.map(u => (
                            <SelectItem key={u.id} value={u.id}>{u.full_name || u.email}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <Button 
                  onClick={async () => {
                    if (!newAdjustment.name || !newAdjustment.percentage || !newAdjustment.start_date || !newAdjustment.end_date) {
                      toast.error('Please fill all fields');
                      return;
                    }
                    if (newAdjustment.target_type !== 'all' && !newAdjustment.target_value) {
                      toast.error(`Please specify the ${newAdjustment.target_type}`);
                      return;
                    }

                    const { error } = await (supabase
                      .from('roi_adjustments') as any)
                      .insert({
                        name: newAdjustment.name,
                        percentage: parseFloat(newAdjustment.percentage),
                        start_date: new Date(newAdjustment.start_date).toISOString(),
                        end_date: new Date(newAdjustment.end_date).toISOString(),
                        target_type: newAdjustment.target_type,
                        target_value: newAdjustment.target_value,
                        is_active: true
                      });
                    
                    if (error) {
                      toast.error(`Error: ${error.message}`);
                    } else {
                      toast.success('Adjustment created');
                      setNewAdjustment({ 
                        name: '', 
                        percentage: '', 
                        start_date: '', 
                        end_date: '', 
                        is_active: true,
                        target_type: 'all',
                        target_value: ''
                      });
                      loadAdjustments();
                    }
                  }}
                  className="premium-gradient text-white w-full md:w-auto"
                >
                  Save Adjustment
                </Button>
              </div>

              {/* List existing adjustments */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Active & Past Adjustments</h3>
                {roiAdjustments.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm py-8">No adjustments configured.</p>
                ) : (
                  <div className="border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-3">Name</th>
                          <th className="text-left p-3">Target</th>
                          <th className="text-left p-3">ROI %</th>
                          <th className="text-left p-3">Period</th>
                          <th className="text-left p-3">Status</th>
                          <th className="text-right p-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {roiAdjustments.map((adj) => {
                          const isActive = new Date() >= new Date(adj.start_date) && new Date() <= new Date(adj.end_date) && adj.is_active;
                          return (
                            <tr key={adj.id} className={isActive ? "bg-primary/5" : ""}>
                              <td className="p-3 font-medium">
                                <div>{adj.name}</div>
                                {adj.target_type === 'user' && (
                                  <div className="text-[10px] text-muted-foreground">
                                    User ID: {adj.target_value?.substring(0, 8)}...
                                  </div>
                                )}
                              </td>
                              <td className="p-3 text-[10px]">
                                <Badge variant="outline" className="h-4 px-1 text-[8px] uppercase">
                                  {adj.target_type}
                                </Badge>
                                {adj.target_type !== 'all' && (
                                  <span className="ml-1 text-muted-foreground">{adj.target_value}</span>
                                )}
                              </td>
                              <td className="p-3">{adj.percentage}%</td>
                              <td className="p-3 text-[10px]">
                                {new Date(adj.start_date).toLocaleDateString()} - {new Date(adj.end_date).toLocaleDateString()}
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <Switch 
                                    checked={adj.is_active}
                                    onCheckedChange={async (val: boolean) => {
                                      await (supabase.from('roi_adjustments') as any).update({ is_active: val }).eq('id', adj.id);
                                      loadAdjustments();
                                    }}
                                  />
                                  {isActive && <Badge className="bg-green-500 text-[10px] h-4 text-white">ACTIVE NOW</Badge>}
                                </div>
                              </td>
                              <td className="p-3 text-right">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-destructive h-7 px-2"
                                  onClick={async () => {
                                    await (supabase.from('roi_adjustments') as any).delete().eq('id', adj.id);
                                    loadAdjustments();
                                  }}
                                >
                                  Delete
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="v56-glass premium-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" />
                  <CardTitle>Global SEO Settings</CardTitle>
                </div>
                <CardDescription>Meta tags and search engine optimization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Site Title</Label>
                  <Input
                    value={settings.site_title}
                    onChange={(e) => updateSetting('site_title', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Site Tagline</Label>
                  <Input
                    value={settings.site_tagline}
                    onChange={(e) => updateSetting('site_tagline', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Meta Description</Label>
                  <Textarea
                    value={settings.seo_description}
                    onChange={(e) => updateSetting('seo_description', e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Keywords (comma separated)</Label>
                  <Textarea
                    value={settings.seo_keywords}
                    onChange={(e) => updateSetting('seo_keywords', e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Robots.txt Content</Label>
                  <Textarea
                    value={settings.robots_txt}
                    onChange={(e) => updateSetting('robots_txt', e.target.value)}
                    rows={4}
                    className="font-mono text-xs"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="v56-glass premium-border">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    <CardTitle>Open Graph & Social</CardTitle>
                  </div>
                  <CardDescription>Social media preview settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>OG Title</Label>
                    <Input
                      value={settings.og_title}
                      onChange={(e) => updateSetting('og_title', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>OG Description</Label>
                    <Textarea
                      value={settings.og_description}
                      onChange={(e) => updateSetting('og_description', e.target.value)}
                      rows={2}
                    />
                  </div>
                  <AssetUploader
                    label="OG Image (Social Share Image)"
                    value={settings.og_image}
                    onUpload={(url) => updateSetting('og_image', url)}
                    onRemove={() => updateSetting('og_image', '')}
                    bucket="public_assets"
                    description="Recommended: 1200x630px JPG"
                  />
                </CardContent>
              </Card>

              <Card className="v56-glass premium-border">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <CardTitle>Analytics & Scripts</CardTitle>
                  </div>
                  <CardDescription>Inject custom code and tracking</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>GA4 Measurement ID</Label>
                      <Input
                        placeholder="G-XXXXXXXXXX"
                        value={settings.ga_measurement_id}
                        onChange={(e) => updateSetting('ga_measurement_id', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Analytics Code (GA4, etc.)</Label>
                    <Textarea
                      value={settings.analytics_code}
                      onChange={(e) => updateSetting('analytics_code', e.target.value)}
                      rows={3}
                      className="font-mono text-xs"
                      placeholder="<script>...</script>"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Header Scripts</Label>
                    <Textarea
                      value={settings.header_scripts}
                      onChange={(e) => updateSetting('header_scripts', e.target.value)}
                      rows={3}
                      className="font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Footer Scripts</Label>
                    <Textarea
                      value={settings.footer_scripts}
                      onChange={(e) => updateSetting('footer_scripts', e.target.value)}
                      rows={3}
                      className="font-mono text-xs"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Content & Contact Tab */}
        <TabsContent value="content" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="v56-glass premium-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  <CardTitle>Contact Information</CardTitle>
                </div>
                <CardDescription>Publicly displayed contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Contact Email</Label>
                  <Input
                    type="email"
                    value={settings.contact_email}
                    onChange={(e) => updateSetting('contact_email', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Phone</Label>
                  <Input
                    value={settings.contact_phone}
                    onChange={(e) => updateSetting('contact_phone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Textarea
                    value={settings.contact_address}
                    onChange={(e) => updateSetting('contact_address', e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="v56-glass premium-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  <CardTitle>Social Media Links</CardTitle>
                </div>
                <CardDescription>Connect with your community</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Facebook URL</Label>
                  <Input
                    value={settings.social_facebook}
                    onChange={(e) => updateSetting('social_facebook', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Twitter/X URL</Label>
                  <Input
                    value={settings.social_twitter}
                    onChange={(e) => updateSetting('social_twitter', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Instagram URL</Label>
                  <Input
                    value={settings.social_instagram}
                    onChange={(e) => updateSetting('social_instagram', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telegram Channel</Label>
                  <Input
                    value={settings.social_telegram}
                    onChange={(e) => updateSetting('social_telegram', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="v56-glass premium-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Anchor className="h-5 w-5 text-primary" />
                  <CardTitle>Help Resources</CardTitle>
                </div>
                <CardDescription>YouTube video links for tutorials</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Deposit Help Video URL</Label>
                  <Input
                    value={settings.youtube_deposit_help}
                    onChange={(e) => updateSetting('youtube_deposit_help', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>KYC Help Video URL</Label>
                  <Input
                    value={settings.youtube_kyc_help}
                    onChange={(e) => updateSetting('youtube_kyc_help', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Withdrawal Help Video URL</Label>
                  <Input
                    value={settings.youtube_withdrawal_help}
                    onChange={(e) => updateSetting('youtube_withdrawal_help', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System Operations Tab */}
        <TabsContent value="operations" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="v56-glass premium-border border-primary/20 bg-primary/5">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <CardTitle>Financial Engine</CardTitle>
                </div>
                <CardDescription>Manually trigger automated financial processes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
                  <h4 className="font-bold text-sm">Compounding ROI Distribution</h4>
                  <p className="text-xs text-muted-foreground">
                    Credits daily ROI to all active accounts. Handles compounding logic based on user preferences.
                  </p>
                  <Button 
                    onClick={async () => {
                      try {
                        await triggerCompoundingROI();
                        trackROIPayout(0);
                        toast.success('Compounding ROI processed successfully');
                      } catch (e) {
                        toast.error('Failed to process ROI');
                      }
                    }}
                    className="w-full h-12 rounded-xl font-bold"
                  >
                    Run ROI Distribution
                  </Button>
                </div>

              </CardContent>
            </Card>

            <Card className="v56-glass premium-border border-red-500/20 bg-red-500/5">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-red-500" />
                  <CardTitle>System Maintenance</CardTitle>
                </div>
                <CardDescription>Critical system-wide maintenance actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
                  <h4 className="font-bold text-sm text-red-400">Clear Activity Logs</h4>
                  <p className="text-xs text-muted-foreground">
                    Archive or clear activity logs older than 90 days to maintain performance.
                  </p>
                  <Button variant="destructive" className="w-full h-12 rounded-xl opacity-50 cursor-not-allowed">
                    Archive Old Logs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security & Firewall Tab */}
        <TabsContent value="security" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="v56-glass premium-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle>Global Firewall Configuration</CardTitle>
                </div>
                <CardDescription>Advanced access control and security hardening</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-xl bg-primary/5">
                  <div className="space-y-0.5">
                    <Label className="text-base font-bold text-red-500 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Maintenance Mode
                    </Label>
                    <p className="text-sm text-muted-foreground">When active, only admins can access the platform</p>
                  </div>
                  <Switch
                    checked={settings.firewall_maintenance_mode === 'true'}
                    onCheckedChange={(checked) => updateSetting('firewall_maintenance_mode', checked.toString())}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base font-bold">Geo-Blocking (WAF)</Label>
                      <p className="text-sm text-muted-foreground">Block traffic from high-risk countries</p>
                    </div>
                    <Switch
                      checked={settings.firewall_geo_blocking_enabled === 'true'}
                      onCheckedChange={(checked) => updateSetting('firewall_geo_blocking_enabled', checked.toString())}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Blacklisted Country Codes (JSON Array)</Label>
                    <Input
                      placeholder='["CN", "RU", "IR"]'
                      value={settings.firewall_geo_blacklist}
                      onChange={(e) => updateSetting('firewall_geo_blacklist', e.target.value)}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base font-bold">Rate Limiting (IPS)</Label>
                      <p className="text-sm text-muted-foreground">Prevent DDoS and brute force attacks</p>
                    </div>
                    <Switch
                      checked={settings.firewall_rate_limiting_enabled === 'true'}
                      onCheckedChange={(checked) => updateSetting('firewall_rate_limiting_enabled', checked.toString())}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Max Requests</Label>
                      <Input
                        type="number"
                        value={settings.firewall_rate_limit_max_requests}
                        onChange={(e) => updateSetting('firewall_rate_limit_max_requests', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Window (Seconds)</Label>
                      <Input
                        type="number"
                        value={settings.firewall_rate_limit_window_seconds}
                        onChange={(e) => updateSetting('firewall_rate_limit_window_seconds', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="v56-glass premium-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <CardTitle>Audit & Monitoring</CardTitle>
                </div>
                <CardDescription>Continuous security review and logging</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-xl bg-primary/5 space-y-2">
                  <h4 className="font-bold flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Data Protection Status
                  </h4>
                  <ul className="text-sm space-y-1 text-muted-foreground list-disc list-inside">
                    <li>Row Level Security (RLS) is active on all tables</li>
                    <li>Sensitive columns are protected via strict SELECT policies</li>
                    <li>Encryption-at-rest provided by Supabase (AES-256)</li>
                    <li>SSL/TLS 1.3 enforced for all network traffic</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>


      </Tabs>
    </div>
  );
}
