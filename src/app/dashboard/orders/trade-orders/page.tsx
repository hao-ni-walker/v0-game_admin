'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import PageContainer from '@/components/layout/page-container';
import { PageHeader } from '@/components/table/page-header';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { PauseCircle, PlayCircle, RefreshCw, Receipt } from 'lucide-react';
import {
  TradeObservabilityAPI,
  type TradeOrderItem,
  type TradeOrdersResult,
} from '@/service/request';

const STATUS_OPTIONS = [
  { value: 'pending', label: '待结算' },
  { value: 'all', label: '全部状态' },
  { value: 'won', label: '盈利' },
  { value: 'lost', label: '亏损' },
  { value: 'refunded', label: '已退款' },
  { value: 'settling', label: '结算中' },
  { value: 'failed', label: '失败' },
];
const PERIODS = ['', '30s', '1m', '3m', '5m', '10m'] as const;
const ASSETS = ['', 'BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'TON/USDT', 'XRP/USDT', 'ADA/USDT'] as const;

function fmtTime(ts: number | null) {
  return ts ? new Date(ts * 1000).toLocaleString() : '—';
}

function fmtNumber(value: number | null | undefined, digits = 2) {
  if (value === null || value === undefined) return '—';
  return value.toLocaleString(undefined, { maximumFractionDigits: digits });
}

function statusLabel(status: string) {
  const found = STATUS_OPTIONS.find((item) => item.value === status);
  return found?.label ?? status;
}

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'pending') return 'secondary';
  if (status === 'won') return 'default';
  if (status === 'lost' || status === 'failed') return 'destructive';
  return 'outline';
}

function secondsLeft(expiresAt: number | null) {
  if (!expiresAt) return null;
  return Math.max(0, expiresAt - Math.floor(Date.now() / 1000));
}

export default function TradeOrdersPage() {
  const [orders, setOrders] = useState<TradeOrderItem[]>([]);
  const [stats, setStats] = useState<TradeOrdersResult['stats'] | null>(null);
  const [pagination, setPagination] = useState<TradeOrdersResult['pagination'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('pending');
  const [email, setEmail] = useState('');
  const [asset, setAsset] = useState('');
  const [period, setPeriod] = useState('');
  const [direction, setDirection] = useState<'' | 'UP' | 'DOWN'>('');
  const [orderId, setOrderId] = useState('');
  const [page, setPage] = useState(1);

  const pageSize = 50;
  const totalPages = useMemo(() => Math.max(1, Math.ceil((pagination?.total ?? 0) / pageSize)), [pagination]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const parsedOrderId = orderId.trim() ? Number(orderId.trim()) : undefined;
      const res = await TradeObservabilityAPI.getOrders({
        status,
        email: email.trim() || undefined,
        asset: asset || undefined,
        period: period || undefined,
        direction: direction || undefined,
        order_id: Number.isFinite(parsedOrderId) ? parsedOrderId : undefined,
        page,
        size: pageSize,
      });
      if (res.success && res.data) {
        setOrders(res.data.items ?? []);
        setStats(res.data.stats);
        setPagination(res.data.pagination);
      } else {
        setError(res.message || '获取交易订单失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取交易订单失败');
    } finally {
      setLoading(false);
    }
  }, [asset, direction, email, orderId, page, period, status]);

  useEffect(() => {
    setPage(1);
  }, [asset, direction, email, orderId, period, status]);

  useEffect(() => {
    fetchOrders();
    if (!autoRefresh) return;
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchOrders]);

  return (
    <PermissionGuard permissions='risk:read'>
      <PageContainer>
        <PageHeader
          title='订单管理'
          description='实时查看用户单笔交易订单，默认展示待结算订单'
          action={{
            label: autoRefresh ? '暂停刷新' : '开启自动刷新',
            onClick: () => setAutoRefresh((value) => !value),
            icon: autoRefresh ? <PauseCircle className='mr-2 h-4 w-4' /> : <PlayCircle className='mr-2 h-4 w-4' />,
          }}
        />

        <div className='mb-6 grid gap-4 md:grid-cols-4'>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='flex items-center gap-2 text-sm font-medium'>
                <Receipt className='h-4 w-4 text-muted-foreground' />
                当前匹配订单
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats?.total ?? '—'}</div>
              <p className='text-muted-foreground text-xs'>当前筛选条件</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>匹配金额</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{fmtNumber(stats?.total_amount, 2)}</div>
              <p className='text-muted-foreground text-xs'>USDT 下单额</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>待结算金额</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{fmtNumber(stats?.pending_amount, 2)}</div>
              <p className='text-muted-foreground text-xs'>当前筛选下 pending 金额</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>状态分布</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex flex-wrap gap-2'>
                {(stats?.by_status ?? []).map((item) => (
                  <Badge key={item.status} variant={statusVariant(item.status)}>
                    {statusLabel(item.status)} {item.count}
                  </Badge>
                ))}
                {(stats?.by_status ?? []).length === 0 && (
                  <span className='text-muted-foreground text-sm'>暂无</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className='mb-6'>
          <CardHeader>
            <CardTitle>筛选</CardTitle>
            <CardDescription>默认每 5 秒刷新一次；状态默认为待结算。</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='flex flex-wrap items-end gap-3'>
              <div className='flex flex-col gap-1'>
                <label className='text-muted-foreground text-xs'>状态</label>
                <select className='border-input h-9 rounded-md border bg-background px-2 text-sm' value={status} onChange={(e) => setStatus(e.target.value)}>
                  {STATUS_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </div>
              <div className='flex flex-col gap-1'>
                <label className='text-muted-foreground text-xs'>用户</label>
                <Input className='w-56' value={email} onChange={(e) => setEmail(e.target.value)} placeholder='邮箱/昵称' />
              </div>
              <div className='flex flex-col gap-1'>
                <label className='text-muted-foreground text-xs'>订单ID</label>
                <Input className='w-32' value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder='338' />
              </div>
              <div className='flex flex-col gap-1'>
                <label className='text-muted-foreground text-xs'>币种</label>
                <select className='border-input h-9 rounded-md border bg-background px-2 text-sm' value={asset} onChange={(e) => setAsset(e.target.value)}>
                  {ASSETS.map((item) => <option key={item || 'all'} value={item}>{item || '全部'}</option>)}
                </select>
              </div>
              <div className='flex flex-col gap-1'>
                <label className='text-muted-foreground text-xs'>周期</label>
                <select className='border-input h-9 rounded-md border bg-background px-2 text-sm' value={period} onChange={(e) => setPeriod(e.target.value)}>
                  {PERIODS.map((item) => <option key={item || 'all'} value={item}>{item || '全部'}</option>)}
                </select>
              </div>
              <div className='flex flex-col gap-1'>
                <label className='text-muted-foreground text-xs'>方向</label>
                <select className='border-input h-9 rounded-md border bg-background px-2 text-sm' value={direction} onChange={(e) => setDirection(e.target.value as '' | 'UP' | 'DOWN')}>
                  <option value=''>全部</option>
                  <option value='UP'>UP</option>
                  <option value='DOWN'>DOWN</option>
                </select>
              </div>
              <Button variant='outline' onClick={fetchOrders} disabled={loading}>
                <RefreshCw className='mr-2 h-4 w-4' />
                刷新
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>交易订单</CardTitle>
            <CardDescription>单笔用户下单明细，按下单时间倒序。</CardDescription>
          </CardHeader>
          <CardContent>
            {error && <div className='mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700'>{error}</div>}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>订单</TableHead>
                  <TableHead>用户</TableHead>
                  <TableHead>币种/周期</TableHead>
                  <TableHead>方向</TableHead>
                  <TableHead>金额</TableHead>
                  <TableHead>收益率</TableHead>
                  <TableHead>开仓/收盘</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>下单时间</TableHead>
                  <TableHead>到期</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className='text-muted-foreground h-32 text-center'>
                      {loading ? '加载中...' : '暂无订单'}
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => {
                    const left = secondsLeft(order.expires_at);
                    return (
                      <TableRow key={order.id}>
                        <TableCell className='font-medium'>#{order.id}</TableCell>
                        <TableCell>
                          <div className='flex flex-col text-sm'>
                            <span>{order.email ?? order.display_name ?? '—'}</span>
                            <span className='text-muted-foreground'>ID: {order.user_id}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex flex-col text-sm'>
                            <span>{order.asset}</span>
                            <span className='text-muted-foreground'>{order.period}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={order.direction === 'UP' ? 'default' : 'outline'}>{order.direction}</Badge>
                        </TableCell>
                        <TableCell>{fmtNumber(order.amount, 2)}</TableCell>
                        <TableCell>{fmtNumber(order.odds_at_creation, 2)}%</TableCell>
                        <TableCell>
                          <div className='flex flex-col font-mono text-xs'>
                            <span>{fmtNumber(order.entry_price, 6)}</span>
                            <span className='text-muted-foreground'>{order.exit_price ? fmtNumber(order.exit_price, 6) : '—'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(order.status)}>{statusLabel(order.status)}</Badge>
                          {order.result && <div className='text-muted-foreground mt-1 text-xs'>{order.result}</div>}
                        </TableCell>
                        <TableCell className='whitespace-nowrap text-sm'>{fmtTime(order.opened_at)}</TableCell>
                        <TableCell className='whitespace-nowrap text-sm'>
                          <div>{fmtTime(order.expires_at)}</div>
                          {order.status === 'pending' && left !== null && (
                            <div className='text-muted-foreground text-xs'>剩余 {left}s</div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>

            {pagination && pagination.total > pageSize && (
              <div className='flex items-center justify-end gap-2 pt-4'>
                <Button variant='outline' size='sm' onClick={() => setPage((v) => Math.max(1, v - 1))} disabled={page <= 1 || loading}>
                  上一页
                </Button>
                <span className='text-muted-foreground text-sm'>第 {page} / {totalPages} 页</span>
                <Button variant='outline' size='sm' onClick={() => setPage((v) => Math.min(totalPages, v + 1))} disabled={page >= totalPages || loading}>
                  下一页
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </PageContainer>
    </PermissionGuard>
  );
}
