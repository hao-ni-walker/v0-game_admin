'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle,
} from '@/components/ui/drawer';
import { Label } from '@/components/ui/label';
import PageContainer from '@/components/layout/page-container';
import { PageHeader } from '@/components/table/page-header';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { usePermissions } from '@/hooks/use-permissions';
import { RefreshCw, History, Snowflake } from 'lucide-react';
import {
  CopyTradeAPI,
  type CopyTradeLeaderItem,
  type CopyTradeTierHistoryItem,
  type LeaderTier,
  TIER_META,
  TIER_OPTIONS,
} from '@/service/request';
import { toast } from 'sonner';

const STATUS_OPTIONS = [
  { value: '', label: '全部状态' },
  { value: 'active', label: '活跃' },
  { value: 'suspended', label: '暂停' },
  { value: 'terminated', label: '已停用' },
  { value: 'pending', label: '待审核' },
  { value: 'rejected', label: '已拒绝' },
];

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  suspended: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  terminated: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  pending: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  rejected: 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};
const STATUS_LABELS: Record<string, string> = {
  active: '活跃', suspended: '暂停', terminated: '已停用', pending: '待审核', rejected: '已拒绝',
};

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

export default function CopyTradeLeadersPage() {
  const canWrite = usePermissions().hasPermission('copytrade:write');
  const [leaders, setLeaders] = useState<CopyTradeLeaderItem[]>([]);
  const [pagination, setPagination] = useState<{ total: number; pages: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Status action dialog
  const [statusTarget, setStatusTarget] = useState<CopyTradeLeaderItem | null>(null);
  const [statusAction, setStatusAction] = useState<'suspend' | 'activate' | 'terminate'>('suspend');
  const [statusReason, setStatusReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Commission dialog
  const [commTarget, setCommTarget] = useState<CopyTradeLeaderItem | null>(null);
  const [commRate, setCommRate] = useState(0.08);
  const [commReason, setCommReason] = useState('');

  // Tier manual-adjust dialog
  const [tierTarget, setTierTarget] = useState<CopyTradeLeaderItem | null>(null);
  const [tierNewTier, setTierNewTier] = useState<LeaderTier>('tier_bronze');
  const [tierReason, setTierReason] = useState('');

  // Tier history drawer
  const [historyTarget, setHistoryTarget] = useState<CopyTradeLeaderItem | null>(null);
  const [historyRows, setHistoryRows] = useState<CopyTradeTierHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Freeze-evaluation dialog
  const [freezeOpen, setFreezeOpen] = useState(false);
  const [freezeHours, setFreezeHours] = useState(24);
  const [freezeReason, setFreezeReason] = useState('');

  const totalPages = useMemo(() => Math.max(1, pagination?.pages ?? 1), [pagination]);

  const fetchLeaders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await CopyTradeAPI.getLeaders({
        status: status || undefined, keyword: keyword.trim() || undefined, page, size: pageSize,
      });
      if (res.success && res.data) {
        setLeaders(res.data.list ?? []);
        setPagination(res.data.pagination);
      } else {
        setError(res.message || '获取带单员列表失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取带单员列表失败');
    } finally {
      setLoading(false);
    }
  }, [keyword, page, status]);

  useEffect(() => { setPage(1); }, [keyword, status]);
  useEffect(() => { fetchLeaders(); }, [fetchLeaders]);

  const submitStatus = async () => {
    if (!statusTarget) return;
    setSubmitting(true);
    try {
      const res = await CopyTradeAPI.updateLeaderStatus(statusTarget.leader_id, {
        action: statusAction, reason: statusReason || undefined,
      });
      if (res.success) {
        toast.success('状态已更新');
        setStatusTarget(null);
        setStatusReason('');
        fetchLeaders();
      } else {
        toast.error(res.message || '操作失败');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const submitCommission = async () => {
    if (!commTarget) return;
    setSubmitting(true);
    try {
      const res = await CopyTradeAPI.updateLeaderCommission(commTarget.leader_id, {
        commission_rate: commRate, reason: commReason || undefined,
      });
      if (res.success) {
        toast.success('佣金比例已调整');
        setCommTarget(null);
        setCommReason('');
        fetchLeaders();
      } else {
        toast.error(res.message || '操作失败');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const submitTierAdjust = async () => {
    if (!tierTarget) return;
    if (tierNewTier === tierTarget.tier) {
      toast.error('该带单员已是此等级');
      return;
    }
    setSubmitting(true);
    try {
      const res = await CopyTradeAPI.adjustLeaderTier(tierTarget.leader_id, {
        new_tier: tierNewTier, reason: tierReason || undefined,
        override_conditions: true,
      });
      if (res.success) {
        toast.success('等级已调整');
        setTierTarget(null);
        setTierReason('');
        fetchLeaders();
      } else {
        toast.error(res.message || '操作失败');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const openHistory = async (leader: CopyTradeLeaderItem) => {
    setHistoryTarget(leader);
    setHistoryRows([]);
    setHistoryLoading(true);
    try {
      const res = await CopyTradeAPI.getLeaderTierHistory(leader.leader_id, { size: 50 });
      if (res.success && res.data) setHistoryRows(res.data.list ?? []);
    } catch {
      /* ignore */
    } finally {
      setHistoryLoading(false);
    }
  };

  const submitFreeze = async () => {
    setSubmitting(true);
    try {
      const res = await CopyTradeAPI.freezeTierEvaluation({
        freeze_hours: freezeHours, reason: freezeReason || undefined,
      });
      if (res.success) {
        toast.success(`等级评估已冻结 ${freezeHours} 小时`);
        setFreezeOpen(false);
        setFreezeReason('');
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
        <PageHeader title='带单员管理' description='管理带单员状态、佣金比例与战绩数据' />

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
              <div className='flex flex-col gap-1'>
                <label className='text-muted-foreground text-xs'>关键词</label>
                <Input className='w-64' value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder='昵称 / 带单员 ID' />
              </div>
              <Button variant='outline' onClick={fetchLeaders} disabled={loading}>
                <RefreshCw className='mr-2 h-4 w-4' />刷新
              </Button>
              {canWrite && (
                <Button variant='outline' onClick={() => { setFreezeHours(24); setFreezeReason(''); setFreezeOpen(true); }}>
                  <Snowflake className='mr-2 h-4 w-4' />冻结评估
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>带单员列表</CardTitle>
            <CardDescription>共 {pagination?.total ?? 0} 名带单员</CardDescription>
          </CardHeader>
          <CardContent>
            {error && <div className='mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700'>{error}</div>}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>带单员</TableHead>
                  <TableHead>用户ID</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>等级</TableHead>
                  <TableHead>佣金</TableHead>
                  <TableHead>跟随者</TableHead>
                  <TableHead>带单笔数</TableHead>
                  <TableHead>30日胜率</TableHead>
                  <TableHead>累计佣金</TableHead>
                  <TableHead>入驻时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className='text-muted-foreground h-32 text-center'>
                      {loading ? '加载中...' : '暂无带单员'}
                    </TableCell>
                  </TableRow>
                ) : leaders.map((l) => (
                  <TableRow key={l.leader_id}>
                    <TableCell className='font-medium'>{l.display_name}</TableCell>
                    <TableCell className='text-muted-foreground text-sm'>{l.user_id}</TableCell>
                    <TableCell>
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${STATUS_COLORS[l.status] ?? ''}`}>
                        {STATUS_LABELS[l.status] ?? l.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${(TIER_META[l.tier as LeaderTier]?.color) ?? ''}`}>
                        {TIER_META[l.tier as LeaderTier]?.badge} {TIER_META[l.tier as LeaderTier]?.label ?? l.tier}
                      </span>
                    </TableCell>
                    <TableCell>{pct(l.commission_rate)}</TableCell>
                    <TableCell>{l.followers_count}</TableCell>
                    <TableCell>{l.total_lead_orders}</TableCell>
                    <TableCell>{pct(l.win_rate_30d)}</TableCell>
                    <TableCell>${fmtNum(l.total_commission_earned)}</TableCell>
                    <TableCell className='whitespace-nowrap text-sm'>{fmtTime(l.joined_at)}</TableCell>
                    <TableCell>
                      <div className='flex flex-wrap gap-1'>
                        {canWrite && (
                          <>
                            <Button size='sm' variant='outline' onClick={() => { setCommTarget(l); setCommRate(l.commission_rate); }}>
                              调佣
                            </Button>
                            <Button size='sm' variant='outline' onClick={() => { setTierTarget(l); setTierNewTier(l.tier); setTierReason(''); }}>
                              调级
                            </Button>
                          </>
                        )}
                        <Button size='sm' variant='ghost' onClick={() => openHistory(l)}>
                          <History className='mr-1 h-3 w-3' />历史
                        </Button>
                        {canWrite && l.status === 'active' && (
                          <Button size='sm' variant='outline' onClick={() => { setStatusTarget(l); setStatusAction('suspend'); setStatusReason(''); }}>
                            暂停
                          </Button>
                        )}
                        {canWrite && l.status === 'suspended' && (
                          <Button size='sm' variant='outline' onClick={() => { setStatusTarget(l); setStatusAction('activate'); setStatusReason(''); }}>
                            恢复
                          </Button>
                        )}
                        {canWrite && l.status !== 'terminated' && (
                          <Button size='sm' variant='destructive' onClick={() => { setStatusTarget(l); setStatusAction('terminate'); setStatusReason(''); }}>
                            停用
                          </Button>
                        )}
                      </div>
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

      {/* Status dialog */}
      <Dialog open={Boolean(statusTarget)} onOpenChange={(o) => !o && setStatusTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{statusAction === 'suspend' ? '暂停带单员' : statusAction === 'activate' ? '恢复带单员' : '停用带单员'}</DialogTitle>
            <DialogDescription>
              {statusTarget?.display_name} ({statusTarget?.leader_id})
              {statusAction === 'terminate' && ' · 停用将自动解除所有跟随关系。'}
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-2'>
            <Label htmlFor='reason'>原因（可选）</Label>
            <Input id='reason' value={statusReason} onChange={(e) => setStatusReason(e.target.value)} placeholder='审核意见' />
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setStatusTarget(null)}>取消</Button>
            <Button onClick={submitStatus} disabled={submitting}>确认</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Commission dialog */}
      <Dialog open={Boolean(commTarget)} onOpenChange={(o) => !o && setCommTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>调整佣金比例</DialogTitle>
            <DialogDescription>{commTarget?.display_name} ({commTarget?.leader_id})</DialogDescription>
          </DialogHeader>
          <div className='grid gap-2'>
            <Label htmlFor='rate'>佣金比例（0.03 ~ 0.15）</Label>
            <Input id='rate' type='number' step='0.005' min={0.03} max={0.15} value={commRate} onChange={(e) => setCommRate(Number(e.target.value))} />
            <Label htmlFor='creason' className='mt-2'>原因（可选）</Label>
            <Input id='creason' value={commReason} onChange={(e) => setCommReason(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setCommTarget(null)}>取消</Button>
            <Button onClick={submitCommission} disabled={submitting}>确认</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tier manual-adjust dialog */}
      <Dialog open={Boolean(tierTarget)} onOpenChange={(o) => !o && setTierTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>手动调整等级</DialogTitle>
            <DialogDescription>
              {tierTarget?.display_name} ({tierTarget?.leader_id}) · 当前 {TIER_META[tierTarget?.tier as LeaderTier]?.label}
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-2'>
            <Label htmlFor='ntier'>新等级</Label>
            <select
              id='ntier'
              className='border-input h-9 rounded-md border bg-background px-2 text-sm'
              value={tierNewTier}
              onChange={(e) => setTierNewTier(e.target.value as LeaderTier)}
            >
              {TIER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <Label htmlFor='treason' className='mt-2'>原因（可选）</Label>
            <Input id='treason' value={tierReason} onChange={(e) => setTierReason(e.target.value)} placeholder='异常数据核查后手动调整' />
            <p className='text-muted-foreground text-xs'>调整后将覆盖自动评估，佣金比例与跟随者上限随新等级更新。</p>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setTierTarget(null)}>取消</Button>
            <Button onClick={submitTierAdjust} disabled={submitting}>确认</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tier history drawer */}
      <Drawer open={Boolean(historyTarget)} onOpenChange={(o) => !o && setHistoryTarget(null)}>
        <DrawerContent className='max-h-[85vh]'>
          <DrawerHeader>
            <DrawerTitle>等级变更历史</DrawerTitle>
            <DrawerDescription>
              {historyTarget?.display_name} ({historyTarget?.leader_id})
            </DrawerDescription>
          </DrawerHeader>
          <div className='overflow-auto px-4 pb-6'>
            {historyLoading ? (
              <p className='text-muted-foreground py-8 text-center text-sm'>加载中...</p>
            ) : historyRows.length === 0 ? (
              <p className='text-muted-foreground py-8 text-center text-sm'>暂无变更记录</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>时间</TableHead>
                    <TableHead>变更</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>原因</TableHead>
                    <TableHead>操作人</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyRows.map((h) => (
                    <TableRow key={h.id}>
                      <TableCell className='whitespace-nowrap text-sm'>{fmtTime(h.created_at)}</TableCell>
                      <TableCell className='text-sm'>
                        <span className='inline-flex items-center gap-1'>
                          {TIER_META[h.from_tier as LeaderTier]?.badge} {TIER_META[h.from_tier as LeaderTier]?.label}
                          <span className='text-muted-foreground'>→</span>
                          {TIER_META[h.to_tier as LeaderTier]?.badge} {TIER_META[h.to_tier as LeaderTier]?.label}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          h.change_type === 'upgrade' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : h.change_type === 'downgrade' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                        }`}>
                          {h.change_type === 'upgrade' ? '升级' : h.change_type === 'downgrade' ? '降级' : '手动'}
                        </span>
                      </TableCell>
                      <TableCell className='max-w-[14rem] truncate text-sm text-muted-foreground'>{h.reason ?? '—'}</TableCell>
                      <TableCell className='text-sm text-muted-foreground'>{h.operator_id ?? '系统'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DrawerContent>
      </Drawer>

      {/* Freeze-evaluation dialog */}
      <Dialog open={freezeOpen} onOpenChange={setFreezeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>冻结等级评估</DialogTitle>
            <DialogDescription>在指定小时内暂停所有带单员的自动升降级评估（如行情剧烈波动时）。</DialogDescription>
          </DialogHeader>
          <div className='grid gap-2'>
            <Label htmlFor='fhours'>冻结时长（小时，0~720）</Label>
            <Input id='fhours' type='number' min={0} max={720} value={freezeHours} onChange={(e) => setFreezeHours(Number(e.target.value))} />
            <Label htmlFor='freason' className='mt-2'>原因（可选）</Label>
            <Input id='freason' value={freezeReason} onChange={(e) => setFreezeReason(e.target.value)} placeholder='BTC 闪崩导致全平台回撤' />
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setFreezeOpen(false)}>取消</Button>
            <Button onClick={submitFreeze} disabled={submitting}>确认冻结</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PermissionGuard>
  );
}
