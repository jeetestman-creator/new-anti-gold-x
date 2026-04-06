import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { getAdminAuditLogs } from '@/db/api';
import { History, Search, FileJson } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const data = await getAdminAuditLogs();
      setLogs(data);
    } catch (error) {
      console.error('Failed to load logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.admin?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.admin?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold v56-gradient-text">Admin Audit Logs</h1>
          <p className="text-muted-foreground">Historical tracking of all administrative changes</p>
        </div>
      </div>

      <Card className="v56-glass premium-border">
        <CardHeader>
          <div className="flex items-center gap-2 mb-4">
            <History className="h-5 w-5 text-primary" />
            <CardTitle>System Activity</CardTitle>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by action or admin..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 v56-glass-input"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">Loading logs...</TableCell>
                </TableRow>
              ) : filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">No audit logs found</TableCell>
                </TableRow>
              ) : filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm:ss')}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{log.admin?.full_name || 'System'}</span>
                      <span className="text-xs text-muted-foreground">{log.admin?.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary">
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                      {log.target_table}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 px-2">
                          <FileJson className="h-4 w-4 mr-2" />
                          View Change
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Audit Log Details</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Previous State</h4>
                              <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-96">
                                {JSON.stringify(log.old_value, null, 2)}
                              </pre>
                            </div>
                            <div className="space-y-2">
                              <h4 className="text-sm font-bold text-primary uppercase tracking-widest">New State</h4>
                              <pre className="text-xs bg-primary/5 p-4 rounded-lg overflow-auto border border-primary/10 max-h-96">
                                {JSON.stringify(log.new_value, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
