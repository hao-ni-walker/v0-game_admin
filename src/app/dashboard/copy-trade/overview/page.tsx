'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PageContainer from '@/components/layout/page-container';
import { PageHeader } from '@/components/table/page-header';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { RefreshCw } from 'lucide-react';
import { CopyTradeAPI, type CopyTradeOverview } from '@/service/request';

function fmtNum(v: number | null | undefined, digits = 2) {
  if (v === null || v === undefined) return '—';
  return v.toLocaleString(undefined, { maximumFractionDigits: digits });
}
function pct(v: number) {
  return `${(v * 100).toFixed(1)}%`;
}

export default function CopyTradeOverviewPage() {
  const [data, setData] = useState<CopyTradeOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await CopyTradeAPI.getOverview();
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.message || '获取数据总览失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据总览失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOverview(); }, [fetchOverview]);

  const todayCards = data ? [
    { label: '今日跟单笔数', value: String(data.today.copy_orders_count) },
    { label: '今日跟单金额', value: `$${fmtNum(data.today.copy_orders_volume)}` },
    { label: '跟单流水占比', value: pct(data.today.copy_volume_ratio) },
    { label: '活跃带单员', value: String(data.today.active_leaders) },
    { label: '活跃跟随者', value: String(data.today.active_followers) },
    { label: '今日佣金总额', value: `$${fmtNum(data.today.total_commission)}` },
  ] : [];
  const totalCards = data ? [
    { label: '带单员总数', value: String(data.total.leaders_count) },
    { label: '跟随者总数', value: String(data.total.followers_count) },
    { label: '累计跟单笔数', value: String(data.total.copy_orders_count) },
    { label: '累计佣金支付', value: `$${fmtNum(data.total.total_commission_paid)}` },
  ] : [];

  return (
    <PermissionGuard permissions='copytrade:read'>
      <PageContainer>
        <PageHeader
          title='跟单数据总览'
          description='跟单业务今日与累计指标'
          action={{ label: '刷新', onClick: fetchOverview, icon: <RefreshCw className='mr-2 h-4 w-4' /> }}
        />

        {error && <div className='mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700'>{error}</div>}

        <h3 className='mb-3 text-sm font-semibold text-muted-foreground'>今日</h3>
        <div className='mb-6 grid gap-4 md:grid-cols-3 lg:grid-cols-6'>
          {loading ? (
            <Card className='md:col-span-3 lg:col-span-6'><CardContent className='py-8 text-center text-muted-foreground'>加载中...</CardContent></Card>
          ) : (
            todayCards.map((c) => (
              <Card key={c.label}>
                <CardHeader className='pb-2'><CardTitle className='text-sm font-medium text-muted-foreground'>{c.label}</CardTitle></CardHeader>
                <CardContent><div className='text-2xl font-bold'>{c.value}</div></CardContent>
              </Card>
            ))
          )}
        </div>

        <h3 className='mb-3 text-sm font-semibold text-muted-foreground'>累计</h3>
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {!loading && totalCards.map((c) => (
            <Card key={c.label}>
              <CardHeader className='pb-2'><CardTitle className='text-sm font-medium text-muted-foreground'>{c.label}</CardTitle></CardHeader>
              <CardContent><div className='text-2xl font-bold'>{c.value}</div></CardContent>
            </Card>
          ))}
        </div>
      </PageContainer>
    </PermissionGuard>
  );
}
