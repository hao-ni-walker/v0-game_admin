'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import PageContainer from '@/components/layout/page-container';
import { PageHeader } from '@/components/table/page-header';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { usePermissions } from '@/hooks/use-permissions';
import { RefreshCw } from 'lucide-react';
import { CopyTradeAPI, type CopyTradeApplicationItem } from '@/service/request';
import { toast } from 'sonner';

const STATUS_OPTIONS = [
  { value: 'pending', label: '待审核' },
  { value: '', label: '全部' },
  { value: 'approved', label: '已通过' },
  { value: 'rejected', label: '已拒绝' },
];

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};
const STATUS_LABELS: Record<string, string> = { pending: '待审核', approved: '已通过', rejected: '已拒绝' };

function fmtTime(ts: number | null) {
  return ts ? new Date(ts * 1000).toLocaleString() : '—';
}
function fmtNum(v: number | null | undefined, digits = 2) {
  if (v === null || v === undefined) return '—';
  return v.toLocaleString(undefined, { maximumFractionDigits: digits });
}
function pct(v: number) {
  return `${(v * 100).toFixed(1)}%`;
}

export default function CopyTradeApplicationsPage() {
  const canWrite = usePermissions().hasPermission('copytrade:write');
  const [apps, setApps] = useState<CopyTradeApplicationItem[]>([]);
  const [pagination, setPagination] = useState<{ total: number; pages: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('pending');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Review dialog
  const [target, setTarget] = useState<CopyTradeApplicationItem | null>(null);
  const [decision, setDecision] = useState<'approved' | 'rejected'>('approved');
  const [commissionRate, setCommissionRate] = useState(0.08);
  const [maxFollowers, setMaxFollowers] = useState(500);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const totalPages = useMemo(() => Math.max(1, pagination?.pages ?? 1), [pagination]);

  const fetchApps = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await CopyTradeAPI.getApplications({ status: status || undefined, page, size: pageSize });
      if (res.success && res.data) {
        setApps(res.data.list ?? []);
        setPagination(res.data.pagination);
      } else {
        setError(res.message || '获取申请列表失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取申请列表失败');
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => { setPage(1); }, [status]);
  useEffect(() => { fetchApps(); }, [fetchApps]);

  const submitReview = async () => {
    if (!target) return;
    if (decision === 'rejected' && !reason.trim()) {
      toast.error('拒绝时需填写原因');
      return;
    }
    setSubmitting(true);
    try {
      const res = await CopyTradeAPI.reviewApplication(target.application_id, {
        decision, commission_rate: decision === 'approved' ? commissionRate : undefined,
        max_followers: decision === 'approved' ? maxFollowers : undefined, reason: reason || undefined,
      });
      if (res.success) {
        toast.success(decision === 'approved' ? '已通过，带单员已创建' : '已拒绝');
        setTarget(null);
        setReason('');
        fetchApps();
      } else {
        toast.error(res.message || '操作失败');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PermissionGuard permissions='copytrade:read'>
      <PageContainer>
        <PageHeader title='带单员申请审核' description='审核用户提交的带单员申请' />

        <Card className='mb-6'>
          <CardHeader><CardTitle>筛选</CardTitle></CardHeader>
          <CardContent>
            <div className='flex flex-wrap items-end gap-3'>
              <div className='flex flex-col gap-1'>
                <label className='text-muted-foreground text-xs'>状态</label>
                <select className='border-input h-9 rounded-md border bg-background px-2 text-sm' value={status} onChange={(e) => setStatus(e.target.value)}>
                  {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <Button variant='outline' onClick={fetchApps} disabled={loading}>
                <RefreshCw className='mr-2 h-4 w-4' />刷新
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>申请列表</CardTitle>
            <CardDescription>共 {pagination?.total ?? 0} 条</CardDescription>
          </CardHeader>
          <CardContent>
            {error && <div className='mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700'>{error}</div>}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>申请人</TableHead>
                  <TableHead>Telegram</TableHead>
                  <TableHead>简介</TableHead>
                  <TableHead>注册天数</TableHead>
                  <TableHead>累计充值</TableHead>
                  <TableHead>历史订单</TableHead>
                  <TableHead>胜率</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>申请时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apps.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className='text-muted-foreground h-32 text-center'>
                      {loading ? '加载中...' : '暂无申请'}
                    </TableCell>
                  </TableRow>
                ) : apps.map((a) => (
                  <TableRow key={a.application_id}>
                    <TableCell className='font-medium'>{a.display_name}</TableCell>
                    <TableCell className='text-muted-foreground text-sm'>{a.tg_username ?? '—'}</TableCell>
                    <TableCell className='max-w-[16rem] truncate text-sm'>{a.bio ?? '—'}</TableCell>
                    <TableCell>{a.user_stats.registered_days}</TableCell>
                    <TableCell>${fmtNum(a.user_stats.total_deposit)}</TableCell>
                    <TableCell>{a.user_stats.total_orders}</TableCell>
                    <TableCell>{pct(a.user_stats.win_rate)}</TableCell>
                    <TableCell>
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${STATUS_COLORS[a.status] ?? ''}`}>
                        {STATUS_LABELS[a.status] ?? a.status}
                      </span>
                    </TableCell>
                    <TableCell className='whitespace-nowrap text-sm'>{fmtTime(a.created_at)}</TableCell>
                    <TableCell>
                      {canWrite && a.status === 'pending' && (
                        <Button size='sm' onClick={() => { setTarget(a); setDecision('approved'); setCommissionRate(0.08); setMaxFollowers(500); setReason(''); }}>
                          审核
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {pagination && pagination.total > pageSize && (
              <div className='flex items-center justify-end gap-2 pt-4'>
                <Button variant='outline' size='sm' onClick={() => setPage((v) => Math.max(1, v - 1))} disabled={page <= 1 || loading}>上一页</Button>
                <span className='text-muted-foreground text-sm'>第 {page} / {totalPages} 页</span>
                <Button variant='outline' size='sm' onClick={() => setPage((v) => Math.min(totalPages, v + 1))} disabled={page >= totalPages || loading}>下一页</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </PageContainer>

      <Dialog open={Boolean(target)} onOpenChange={(o) => !o && setTarget(null)}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>审核申请</DialogTitle>
            <DialogDescription>{target?.display_name} · {target?.application_id}</DialogDescription>
          </DialogHeader>
          {target && (
            <div className='grid gap-3 text-sm'>
              <div className='grid grid-cols-3 gap-2'>
                <div><span className='text-muted-foreground'>注册天数</span><div className='font-semibold'>{target.user_stats.registered_days}</div></div>
                <div><span className='text-muted-foreground'>累计充值</span><div className='font-semibold'>${fmtNum(target.user_stats.total_deposit)}</div></div>
                <div><span className='text-muted-foreground'>历史订单</span><div className='font-semibold'>{target.user_stats.total_orders}</div></div>
                <div><span className='text-muted-foreground'>胜率</span><div className='font-semibold'>{pct(target.user_stats.win_rate)}</div></div>
              </div>
              {target.bio && <div className='rounded-md bg-muted p-2 text-xs'>{target.bio}</div>}
            </div>
          )}
          <div className='flex gap-2'>
            <Button variant={decision === 'approved' ? 'default' : 'outline'} className='flex-1' onClick={() => setDecision('approved')}>通过</Button>
            <Button variant={decision === 'rejected' ? 'destructive' : 'outline'} className='flex-1' onClick={() => setDecision('rejected')}>拒绝</Button>
          </div>
          {decision === 'approved' && (
            <div className='grid grid-cols-2 gap-2'>
              <div className='grid gap-1'>
                <Label htmlFor='crate'>佣金比例</Label>
                <Input id='crate' type='number' step='0.005' min={0.03} max={0.15} value={commissionRate} onChange={(e) => setCommissionRate(Number(e.target.value))} />
              </div>
              <div className='grid gap-1'>
                <Label htmlFor='mf'>最大跟随者</Label>
                <Input id='mf' type='number' min={1} value={maxFollowers} onChange={(e) => setMaxFollowers(Number(e.target.value))} />
              </div>
            </div>
          )}
          <div className='grid gap-1'>
            <Label htmlFor='rreason'>审核意见{decision === 'rejected' ? '（必填）' : ''}</Label>
            <Textarea id='rreason' rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setTarget(null)}>取消</Button>
            <Button variant={decision === 'rejected' ? 'destructive' : 'default'} onClick={submitReview} disabled={submitting}>
              确认{decision === 'approved' ? '通过' : '拒绝'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PermissionGuard>
  );
}
