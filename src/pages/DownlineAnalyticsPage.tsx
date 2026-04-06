import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  ChevronRight, 
  ShieldCheck, 
  BarChart3,
  Network
} from 'lucide-react';
import { getDownlineSummary } from '@/db/api';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { DownlineSummaryItem } from '@/types';

export default function DownlineAnalyticsPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DownlineSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDownline();
    }
  }, [user]);

  const loadDownline = async () => {
    try {
      const data = await getDownlineSummary(user!.id);
      setSummary(data);
    } catch (error) {
      console.error('Failed to load downline analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalMembers = summary.reduce((sum, item) => sum + item.member_count, 0);
  const totalActive = summary.reduce((sum, item) => sum + item.active_count, 0);
  const totalVolume = summary.reduce((sum, item) => sum + item.total_volume, 0);

  if (loading) {
    return (
      <div className="p-6 space-y-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 bg-muted rounded-2xl" />)}
        </div>
        <Skeleton className="h-96 w-full bg-muted rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-4xl font-black tracking-tight leading-tight">
          Network <span className="v56-gradient-text">Analytics</span>
        </h1>
        <p className="text-muted-foreground">Deep dive into your 15-tier referral organization.</p>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="v56-glass premium-border bg-primary/5">
          <CardHeader className="pb-2">
            <CardDescription className="uppercase tracking-[0.2em] font-black text-[10px]">Total Network Size</CardDescription>
            <CardTitle className="text-4xl font-black text-primary">{totalMembers.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
              <Users className="h-3 w-3" />
              Across all 15 levels
            </div>
          </CardContent>
        </Card>

        <Card className="v56-glass premium-border bg-green-500/5">
          <CardHeader className="pb-2">
            <CardDescription className="uppercase tracking-[0.2em] font-black text-[10px]">Active Members</CardDescription>
            <CardTitle className="text-4xl font-black text-green-500">{totalActive.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
              <ShieldCheck className="h-3 w-3" />
              KYC Approved Partners
            </div>
          </CardContent>
        </Card>

        <Card className="v56-glass premium-border bg-blue-500/5">
          <CardHeader className="pb-2">
            <CardDescription className="uppercase tracking-[0.2em] font-black text-[10px]">Network Volume</CardDescription>
            <CardTitle className="text-4xl font-black text-blue-400">${totalVolume.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
              <BarChart3 className="h-3 w-3" />
              Total USDT Deposited
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Level by Level Breakdown */}
      <Card className="v56-glass premium-border overflow-hidden">
        <CardHeader className="border-b border-white/5 pb-6">
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" />
            <CardTitle>15-Tier Breakdown</CardTitle>
          </div>
          <CardDescription>Performance distribution across your network levels</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-primary/5 text-primary border-b border-primary/10">
                <tr>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Level</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Members</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Active (KYC)</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Volume</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Contribution</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {summary.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      No network data found. Start building your team!
                    </td>
                  </tr>
                ) : (
                  summary.map((item) => (
                    <tr key={item.level} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary font-bold">
                          L{item.level}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-bold">{item.member_count.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-green-500">{item.active_count.toLocaleString()}</span>
                          <span className="text-[10px] text-muted-foreground">({Math.round((item.active_count / (item.member_count || 1)) * 100)}%)</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-blue-400">
                        ${item.total_volume.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary" 
                            style={{ width: `${(item.total_volume / (totalVolume || 1)) * 100}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-muted-foreground hover:text-primary transition-colors">
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
