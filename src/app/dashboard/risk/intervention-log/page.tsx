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
import { PauseCircle, PlayCircle, RefreshCw, ScrollText } from 'lucide-react';
import { MarketControlAPI, type RiskEventItem, type RiskEventsResult } from '@/service/request';

const PERIODS = ['', '1m', '3m', '5m', '10m'] as const;
const EVENT_TYPES = ['', 'manual_zero', 'manual_restore', 'direction_close', 'direction_restore'] as const;

function formatTime(ts: number | null) {
  return ts ? new Date(ts * 1000).toLocaleString() : '—';
}

function operatorLabel(operator: string | null | undefined) {
  if (!operator) return '—';
  return operator === 'system' ? 'system' : operator;
}

export default function InterventionLogPage() {
  const [events, setEvents] = useState<RiskEventItem[]>([]);
  const [pagination, setPagination] = useState<RiskEventsResult['pagination'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState('');
  const [period, setPeriod] = useState('');

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await MarketControlAPI.getEvents({
        type: type || undefined,
        period: period || undefined,
        page: 1,
        size: 80,
      });
      if (res.success && res.data) {
        setEvents(res.data.items ?? []);
        setPagination(res.data.pagination);
      } else {
        setError(res.message || '获取干预日志失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取干预日志失败');
    } finally {
      setLoading(false);
    }
  }, [period, type]);

  useEffect(() => {
    fetchEvents();
    if (!autoRefresh) return;
    const interval = setInterval(fetchEvents, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchEvents]);

  const systemEvents = events.filter((item) => item.operator === 'system').length;
  const manualEvents = events.length - systemEvents;

  return (
    <PermissionGuard permissions='risk:read'>
      <PageContainer>
        <PageHeader
          title='干预日志流'
          description='查看系统和人工风控干预，包括赔率清零/恢复、方向关闭/恢复'
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
                <ScrollText className='h-4 w-4 text-muted-foreground' />
                匹配事件总数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{pagination?.total ?? '—'}</div>
              <p className='text-muted-foreground text-xs'>当前页 {events.length} 条</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>人工干预</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{manualEvents}</div>
              <p className='text-muted-foreground text-xs'>当前页统计</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>系统干预</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{systemEvents}</div>
              <p className='text-muted-foreground text-xs'>operator = system</p>
            </CardContent>
          </Card>
        </div>

        <Card className='mb-6'>
          <CardHeader>
            <CardTitle>过滤条件</CardTitle>
            <CardDescription>自动刷新每 5 秒拉取一次风险事件。</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='flex flex-wrap items-end gap-3'>
              <div className='flex flex-col gap-1'>
                <label className='text-muted-foreground text-xs'>事件类型</label>
                <select className='border-input h-9 rounded-md border bg-background px-2 text-sm' value={type} onChange={(e) => setType(e.target.value)}>
                  {EVENT_TYPES.map((item) => <option key={item || 'all'} value={item}>{item || '全部'}</option>)}
                </select>
              </div>
              <div className='flex flex-col gap-1'>
                <label className='text-muted-foreground text-xs'>周期</label>
                <select className='border-input h-9 rounded-md border bg-background px-2 text-sm' value={period} onChange={(e) => setPeriod(e.target.value)}>
                  {PERIODS.map((item) => <option key={item || 'all'} value={item}>{item || '全部'}</option>)}
                </select>
              </div>
              <Button variant='outline' onClick={fetchEvents} disabled={loading}>
                <RefreshCw className='mr-2 h-4 w-4' />
                刷新
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>干预事件</CardTitle>
            <CardDescription>按创建时间倒序展示，适合联调时观察系统干预和人工操作。</CardDescription>
          </CardHeader>
          <CardContent>
            {error && <div className='mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700'>{error}</div>}
            {events.length === 0 ? (
              <div className='text-muted-foreground flex h-28 items-center justify-center text-sm'>
                {loading ? '加载中...' : '暂无干预事件'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>时间</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>周期</TableHead>
                    <TableHead>操作人</TableHead>
                    <TableHead>触发条件</TableHead>
                    <TableHead>原因</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((item) => (
                    <TableRow key={item.event_id}>
                      <TableCell className='whitespace-nowrap text-sm'>{formatTime(item.created_at)}</TableCell>
                      <TableCell>
                        <Badge variant={item.operator === 'system' ? 'secondary' : 'outline'}>{item.type}</Badge>
                      </TableCell>
                      <TableCell>{item.period ?? '—'}</TableCell>
                      <TableCell>{operatorLabel(item.operator)}</TableCell>
                      <TableCell className='text-sm text-muted-foreground'>
                        {item.trigger_condition ?? '—'}
                        {item.trigger_value ? ` / ${item.trigger_value}` : ''}
                        {item.threshold ? ` / threshold ${item.threshold}` : ''}
                      </TableCell>
                      <TableCell className='max-w-md truncate text-sm'>{item.reason ?? '—'}</TableCell>
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
