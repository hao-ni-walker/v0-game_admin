'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import PageContainer from '@/components/layout/page-container';
import { PageHeader } from '@/components/table/page-header';
import { RiskControlAPI, type RiskExposure } from '@/service/api/risk-control';
import { MarketControlAPI, type RiskEventItem } from '@/service/request';
import {
  AlertTriangle,
  RefreshCw,
  ShieldAlert,
  TrendingDown,
  TrendingUp
} from 'lucide-react';

// PRD §3.3 风险敞口分级阈值
const EXPOSURE_LEVELS = {
  normal: { label: '正常', color: 'bg-green-100 text-green-800', threshold: '< $3,000' },
  warning: { label: '预警', color: 'bg-yellow-100 text-yellow-800', threshold: '$3,000 ~ $6,000' },
  high: { label: '高风险', color: 'bg-orange-100 text-orange-800', threshold: '$6,000 ~ $10,000' },
  extreme: { label: '极限', color: 'bg-red-100 text-red-800', threshold: '> $10,000' }
} as const;

const PERIODS = ['30s', '1m', '3m', '5m', '10m'] as const;

function formatTime(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleString('zh-CN', { hour12: false });
}

function leaderName(reason: string | null) {
  return reason?.match(/leader\s+\S+\s+\(([^)]+)\)/)?.[1] || '带单员';
}

function eventSummary(event: RiskEventItem) {
  const name = leaderName(event.reason);
  const rule = event.trigger_condition || event.trigger_value;
  const threshold = event.threshold || '';
  const roi = event.reason?.match(/"roi"\s*:\s*(-?\d+(?:\.\d+)?)/)?.[1];

  if (rule === 'F1-C') {
    const roiLabel = roi ? `${(Number(roi) * 100).toFixed(2)}%` : '不达标';
    return {
      title: `${name} 已暂停带单`,
      badge: '近 7 日收益不达标',
      description: `近 7 日累计收益率 ${roiLabel}${threshold ? `，触发条件：${threshold}` : '，为保护跟随用户已暂停新增带单。'}`
    };
  }
  if (rule === 'F1-B') {
    return {
      title: `${name} 已暂停带单`,
      badge: '24 小时亏损率过高',
      description: threshold || '为保护跟随用户，系统已暂停新增带单并等待审核。'
    };
  }
  if (rule === 'F1-A') {
    return {
      title: `${name} 已暂停带单`,
      badge: '连续亏损保护',
      description: threshold || '连续亏损达到风险阈值，系统已暂停新增带单。'
    };
  }
  return {
    title: `${name} 风控事件`,
    badge: rule || '系统保护',
    description: event.reason || '系统已记录该风控事件。'
  };
}

export default function RiskMonitoringPage() {
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [exposures, setExposures] = useState<RiskExposure[]>([]);
  const [pendingOrders, setPendingOrders] = useState<number | null>(null);
  const [fLayerEvents, setFLayerEvents] = useState<RiskEventItem[]>([]);
  const [fLayerTotal, setFLayerTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchRiskData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const startTime = Math.floor(Date.now() / 1000) - 24 * 60 * 60;
      const [exposureRes, fLayerRes] = await Promise.all([
        RiskControlAPI.getExposure(),
        MarketControlAPI.getEvents({ type: 'f_layer', start_time: startTime, page: 1, size: 5 })
      ]);

      if (exposureRes.success && exposureRes.data) {
        setExposures(exposureRes.data.exposures ?? []);
        setPendingOrders(exposureRes.data.pendingOrders ?? 0);
      } else {
        setError(exposureRes.message || '获取实时风险敞口失败');
      }

      if (fLayerRes.success && fLayerRes.data) {
        setFLayerEvents(fLayerRes.data.items ?? []);
        setFLayerTotal(fLayerRes.data.pagination?.total ?? 0);
      }
    } catch (error) {
      console.error('获取风险敞口数据失败:', error);
      setError('获取实时风险敞口失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRiskData();
    if (!autoRefresh) return;
    // PRD §2.1 自动刷新间隔 5 秒
    const interval = setInterval(fetchRiskData, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchRiskData]);

  return (
    <PageContainer>
      <PageHeader
        title='实时风险监控'
        description='查看当前未结算订单敞口，以及最近 24 小时带单员风险保护事件'
        action={{
          label: autoRefresh ? '暂停刷新' : '开启自动刷新',
          onClick: () => setAutoRefresh(!autoRefresh),
          icon: <RefreshCw className='mr-2 h-4 w-4' />
        }}
      />

      {/* 风险敞口分级阈值说明 */}
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle className='text-base'>风险敞口分级阈值</CardTitle>
          <CardDescription>系统根据净敞口范围自动分级</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
            {Object.entries(EXPOSURE_LEVELS).map(([key, val]) => (
              <div key={key} className='flex items-center gap-2'>
                <Badge className={val.color}>{val.label}</Badge>
                <span className='text-muted-foreground text-sm'>
                  {val.threshold}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className='mb-6 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700'>
          {error}
        </div>
      )}

      {/* 各周期风险敞口卡片 */}
      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-5'>
        {PERIODS.map((period) => {
          const exposure = exposures.find((e) => e.period === period);
          return (
            <Card key={period}>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  {period} 周期
                </CardTitle>
                <ShieldAlert className='text-muted-foreground h-4 w-4' />
              </CardHeader>
              <CardContent>
                {exposure ? (
                  <>
                    <div className='flex items-center gap-2'>
                      <Badge className={EXPOSURE_LEVELS[exposure.level].color}>
                        {EXPOSURE_LEVELS[exposure.level].label}
                      </Badge>
                    </div>
                    <div className='mt-2 space-y-1 text-sm'>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>净敞口</span>
                        <span className='font-medium'>
                          ${exposure.netExposure.toLocaleString()}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='flex items-center gap-1 text-muted-foreground'>
                          <TrendingUp className='h-3 w-3' /> 多头
                        </span>
                        <span>${exposure.longExposure.toLocaleString()}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='flex items-center gap-1 text-muted-foreground'>
                          <TrendingDown className='h-3 w-3' /> 空头
                        </span>
                        <span>${exposure.shortExposure.toLocaleString()}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>最大损失</span>
                        <span className='font-medium text-red-600'>
                          ${exposure.maxLoss.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className='flex h-20 items-center justify-center text-muted-foreground'>
                    {loading ? '加载中...' : '当前无未结算订单'}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className='mt-6'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-base'>
            <AlertTriangle className='h-4 w-4 text-amber-600' />
            带单员风险保护
          </CardTitle>
          <CardDescription>
            最近 24 小时自动触发的带单员风控事件。暂停带单不影响历史记录，需运营审核后恢复。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='mb-4 flex items-center gap-2 text-sm'>
            <Badge variant={fLayerTotal > 0 ? 'secondary' : 'outline'}>
              最近 24 小时 {fLayerTotal} 条
            </Badge>
            {fLayerTotal === 0 && <span className='text-muted-foreground'>当前没有新的带单员风险保护事件</span>}
          </div>
          {fLayerEvents.length > 0 && (
            <div className='space-y-3'>
              {fLayerEvents.map((event) => {
                const summary = eventSummary(event);
                return (
                  <div key={event.event_id} className='rounded-lg border p-3'>
                    <div className='flex flex-wrap items-center justify-between gap-2'>
                      <div className='flex items-center gap-2'>
                        <ShieldAlert className='h-4 w-4 text-amber-600' />
                        <span className='font-medium'>{summary.title}</span>
                        <Badge variant='outline'>{summary.badge}</Badge>
                      </div>
                      <span className='text-muted-foreground text-xs'>{formatTime(event.created_at)}</span>
                    </div>
                    <p className='text-muted-foreground mt-2 text-sm'>{summary.description}</p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 实时风控指标 */}
      <div className='mt-6 grid gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>总净风险敞口</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              ${exposures.reduce((sum, e) => sum + e.netExposure, 0).toLocaleString()}
            </div>
            <p className='text-muted-foreground text-xs'>所有周期净敞口之和</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>最大赔付压力</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              ${exposures.reduce((sum, e) => sum + e.maxLoss, 0).toLocaleString()}
            </div>
            <p className='text-muted-foreground text-xs'>所有未结算订单最大赔付</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>待结算订单数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {pendingOrders !== null ? pendingOrders.toLocaleString() : '—'}
            </div>
            <p className='text-muted-foreground text-xs'>所有未到期订单总数；为 0 表示当前无实时敞口</p>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
