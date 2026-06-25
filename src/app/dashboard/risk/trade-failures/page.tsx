'use client';

import { useCallback, useEffect, useState } from 'react';
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
import {
  Activity,
  AlertCircle,
  PauseCircle,
  PlayCircle,
  RefreshCw,
} from 'lucide-react';
import {
  TradeObservabilityAPI,
  type TradeFailureItem,
  type TradeFailuresResult,
} from '@/service/request';

const PERIODS = ['', '30s', '1m', '3m', '5m', '10m'] as const;
const ASSETS = ['', 'BTC', 'ETH', 'TON'] as const;

function formatTime(ts: number | null) {
  return ts ? new Date(ts * 1000).toLocaleString() : '—';
}

function formatAmount(amount: number | null) {
  if (amount === null || amount === undefined) return '—';
  return amount.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

function parseErrorCode(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const num = Number(trimmed);
  return Number.isFinite(num) ? num : undefined;
}

export default function TradeFailuresPage() {
  const [items, setItems] = useState<TradeFailureItem[]>([]);
  const [stats, setStats] = useState<TradeFailuresResult['stats'] | null>(null);
  const [pagination, setPagination] = useState<TradeFailuresResult['pagination'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [asset, setAsset] = useState('');
  const [period, setPeriod] = useState('');
  const [minutes, setMinutes] = useState(60);

  const fetchFailures = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await TradeObservabilityAPI.getFailures({
        email: email.trim() || undefined,
        error_code: parseErrorCode(errorCode),
        asset: asset || undefined,
        period: period || undefined,
        minutes,
        page: 1,
        size: 80,
      });
      if (res.success && res.data) {
        setItems(res.data.items ?? []);
        setStats(res.data.stats);
        setPagination(res.data.pagination);
      } else {
        setError(res.message || '获取交易失败记录失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取交易失败记录失败');
    } finally {
      setLoading(false);
    }
  }, [asset, email, errorCode, minutes, period]);

  useEffect(() => {
    fetchFailures();
    if (!autoRefresh) return;
    const interval = setInterval(fetchFailures, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchFailures]);

  return (
    <PermissionGuard permissions='risk:read'>
      <PageContainer>
        <PageHeader
          title='交易失败流'
          description='近实时查看下单失败、限额拒单、市场暂停等异常交易请求'
          action={{
            label: autoRefresh ? '暂停刷新' : '开启自动刷新',
            onClick: () => setAutoRefresh((v) => !v),
            icon: autoRefresh ? <PauseCircle className='mr-2 h-4 w-4' /> : <PlayCircle className='mr-2 h-4 w-4' />,
          }}
        />

        <div className='mb-6 grid gap-4 md:grid-cols-3'>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='flex items-center gap-2 text-sm font-medium'>
                <AlertCircle className='h-4 w-4 text-red-500' />
                最近失败数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats?.total_recent ?? '—'}</div>
              <p className='text-muted-foreground text-xs'>最近 {stats?.window_minutes ?? minutes} 分钟</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>当前页记录</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{items.length}</div>
              <p className='text-muted-foreground text-xs'>总匹配 {pagination?.total ?? '—'} 条</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='flex items-center gap-2 text-sm font-medium'>
                <Activity className='h-4 w-4 text-muted-foreground' />
                错误码分布
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex flex-wrap gap-2'>
                {(stats?.by_code ?? []).slice(0, 5).map((item) => (
                  <Badge key={item.error_code} variant='outline'>
                    {item.error_code}: {item.count}
                  </Badge>
                ))}
                {(stats?.by_code ?? []).length === 0 && (
                  <span className='text-muted-foreground text-sm'>暂无</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className='mb-6'>
          <CardHeader>
            <CardTitle>过滤条件</CardTitle>
            <CardDescription>自动刷新每 5 秒拉取一次，过滤条件变更后立即生效。</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='flex flex-wrap items-end gap-3'>
              <div className='flex flex-col gap-1'>
                <label className='text-muted-foreground text-xs'>用户邮箱</label>
                <Input className='w-56' value={email} onChange={(e) => setEmail(e.target.value)} placeholder='user@example.com' />
              </div>
              <div className='flex flex-col gap-1'>
                <label className='text-muted-foreground text-xs'>错误码</label>
                <Input className='w-32' value={errorCode} onChange={(e) => setErrorCode(e.target.value)} placeholder='10002' />
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
                <label className='text-muted-foreground text-xs'>统计窗口</label>
                <select className='border-input h-9 rounded-md border bg-background px-2 text-sm' value={minutes} onChange={(e) => setMinutes(Number(e.target.value))}>
                  <option value={15}>15 分钟</option>
                  <option value={60}>60 分钟</option>
                  <option value={240}>4 小时</option>
                  <option value={1440}>24 小时</option>
                </select>
              </div>
              <Button variant='outline' onClick={fetchFailures} disabled={loading}>
                <RefreshCw className='mr-2 h-4 w-4' />
                刷新
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>失败订单请求</CardTitle>
            <CardDescription>只记录被交易服务拒绝的下单请求，不包含已成功成交订单。</CardDescription>
          </CardHeader>
          <CardContent>
            {error && <div className='mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700'>{error}</div>}
            {items.length === 0 ? (
              <div className='text-muted-foreground flex h-28 items-center justify-center text-sm'>
                {loading ? '加载中...' : '暂无失败记录'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>时间</TableHead>
                    <TableHead>错误</TableHead>
                    <TableHead>用户</TableHead>
                    <TableHead>标的</TableHead>
                    <TableHead>方向</TableHead>
                    <TableHead>金额</TableHead>
                    <TableHead>Trace</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className='whitespace-nowrap text-sm'>{formatTime(item.created_at)}</TableCell>
                      <TableCell>
                        <div className='flex flex-col gap-1'>
                          <Badge variant='destructive' className='w-fit'>{item.error_code}</Badge>
                          <span className='max-w-xs truncate text-sm'>{item.error_message}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex flex-col text-sm'>
                          <span>{item.email ?? '—'}</span>
                          <span className='text-muted-foreground'>ID: {item.user_id ?? '—'}</span>
                        </div>
                      </TableCell>
                      <TableCell>{item.asset ?? '—'} / {item.period ?? '—'}</TableCell>
                      <TableCell>{item.direction ?? '—'}</TableCell>
                      <TableCell>{formatAmount(item.amount)}</TableCell>
                      <TableCell className='font-mono text-xs text-muted-foreground'>{item.trace_id ?? '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </PageContainer>
    </PermissionGuard>
  );
}
