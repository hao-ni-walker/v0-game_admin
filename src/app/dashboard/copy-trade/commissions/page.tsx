'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import PageContainer from '@/components/layout/page-container';
import { PageHeader } from '@/components/table/page-header';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { RefreshCw } from 'lucide-react';
import { CopyTradeAPI, type CopyTradeCommissionItem } from '@/service/request';

const STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'frozen', label: '冻结中' },
  { value: 'available', label: '可提取' },
  { value: 'withdrawn', label: '已提取' },
];
const STATUS_COLORS: Record<string, string> = {
  frozen: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  available: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  withdrawn: 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};
const STATUS_LABELS: Record<string, string> = { frozen: '冻结中', available: '可提取', withdrawn: '已提取' };

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

export default function CopyTradeCommissionsPage() {
  const [items, setItems] = useState<CopyTradeCommissionItem[]>([]);
  const [pagination, setPagination] = useState<{ total: number; pages: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leaderId, setLeaderId] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const totalPages = useMemo(() => Math.max(1, pagination?.pages ?? 1), [pagination]);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await CopyTradeAPI.getCommissions({
        leader_id: leaderId.trim() || undefined, status: status || undefined, page, size: pageSize,
      });
      if (res.success && res.data) {
        setItems(res.data.list ?? []);
        setPagination(res.data.pagination);
      } else {
        setError(res.message || '获取佣金记录失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取佣金记录失败');
    } finally {
      setLoading(false);
    }
  }, [leaderId, page, status]);

  useEffect(() => { setPage(1); }, [leaderId, status]);
  useEffect(() => { fetchItems(); }, [fetchItems]);

  return (
    <PermissionGuard permissions='copytrade:read'>
      <PageContainer>
        <PageHeader title='佣金结算' description='查看带单员佣金记录（仅亏损订单产生佣金，T+1 解冻）' />

        <Card className='mb-6'>
          <CardHeader><CardTitle>筛选</CardTitle></CardHeader>
          <CardContent>
            <div className='flex flex-wrap items-end gap-3'>
              <div className='flex flex-col gap-1'>
                <label className='text-muted-foreground text-xs'>带单员 ID</label>
                <Input className='w-56' value={leaderId} onChange={(e) => setLeaderId(e.target.value)} placeholder='ldr_XXXXX' />
              </div>
              <div className='flex flex-col gap-1'>
                <label className='text-muted-foreground text-xs'>状态</label>
                <select className='border-input h-9 rounded-md border bg-background px-2 text-sm' value={status} onChange={(e) => setStatus(e.target.value)}>
                  {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <Button variant='outline' onClick={fetchItems} disabled={loading}>
                <RefreshCw className='mr-2 h-4 w-4' />刷新
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>佣金记录</CardTitle>
            <CardDescription>共 {pagination?.total ?? 0} 条</CardDescription>
          </CardHeader>
          <CardContent>
            {error && <div className='mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700'>{error}</div>}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>佣金ID</TableHead>
                  <TableHead>带单员</TableHead>
                  <TableHead>跟随者</TableHead>
                  <TableHead>跟单订单</TableHead>
                  <TableHead>订单金额</TableHead>
                  <TableHead>结果</TableHead>
                  <TableHead>佣金率</TableHead>
                  <TableHead>佣金金额</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>产生时间</TableHead>
                  <TableHead>解冻时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className='text-muted-foreground h-32 text-center'>
                      {loading ? '加载中...' : '暂无记录'}
                    </TableCell>
                  </TableRow>
                ) : items.map((c) => (
                  <TableRow key={c.commission_id}>
                    <TableCell className='font-mono text-xs'>{c.commission_id}</TableCell>
                    <TableCell>{c.leader_name ?? c.leader_id}</TableCell>
                    <TableCell className='text-muted-foreground text-sm'>{c.follower_id}</TableCell>
                    <TableCell className='text-muted-foreground text-sm'>#{c.follower_order_id}</TableCell>
                    <TableCell>${fmtNum(c.order_amount)}</TableCell>
                    <TableCell>{c.order_result}</TableCell>
                    <TableCell>{pct(c.commission_rate)}</TableCell>
                    <TableCell className='font-semibold'>${fmtNum(c.commission_amount)}</TableCell>
                    <TableCell>
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${STATUS_COLORS[c.status] ?? ''}`}>
                        {STATUS_LABELS[c.status] ?? c.status}
                      </span>
                    </TableCell>
                    <TableCell className='whitespace-nowrap text-sm'>{fmtTime(c.created_at)}</TableCell>
                    <TableCell className='whitespace-nowrap text-sm'>{fmtTime(c.available_at)}</TableCell>
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
    </PermissionGuard>
  );
}
