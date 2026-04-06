import { Bell, Search, Trash2, Calendar, User, TrendingUp, DollarSign, ShieldCheck, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { supabase } from '@/db/supabase';

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*, profiles!notifications_user_id_fkey(email, full_name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('notifications').delete().eq('id', id);
      if (error) throw error;
      setNotifications(notifications.filter(n => n.id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'withdrawal': return <DollarSign className="h-4 w-4 text-orange-500" />;
      case 'kyc': return <ShieldCheck className="h-4 w-4 text-blue-500" />;
      case 'ticket': return <MessageSquare className="h-4 w-4 text-primary" />;
      default: return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const filteredNotifications = notifications.filter(n =>
    n.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold v56-gradient-text">System Notifications</h1>
        <p className="text-muted-foreground">Monitor system events and user activities</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search notifications..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card className="v56-glass premium-border">
        <CardHeader>
          <CardTitle>Activities Log ({filteredNotifications.length})</CardTitle>
          <CardDescription>Real-time updates from all platform events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-12">Loading events...</div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No activities found.</div>
            ) : (
              filteredNotifications.map((n) => (
                <div key={n.id} className="p-4 border border-primary/10 rounded-lg hover:border-primary/30 transition-all bg-accent/30 flex items-start gap-4">
                  <div className="mt-1 p-2 bg-background rounded-full">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-sm">{n.title}</p>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(n.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{n.message}</p>
                    {n.profiles && (
                      <p className="text-[10px] text-primary mt-2 flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {n.profiles.email} ({n.profiles.full_name || 'No Name'})
                      </p>
                    )}
                  </div>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(n.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
