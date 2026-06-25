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
import { ShieldAlert, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';

// PRD §3.3 风险敞口分级阈值
const EXPOSURE_LEVELS = {
  normal: { label: '正常', color: 'bg-green-100 text-green-800', threshold: '< $3,000' },
  warning: { label: '预警', color: 'bg-yellow-100 text-yellow-800', threshold: '$3,000 ~ $6,000' },
  high: { label: '高风险', color: 'bg-orange-100 text-orange-800', threshold: '$6,000 ~ $10,000' },
  extreme: { label: '极限', color: 'bg-red-100 text-red-800', threshold: '> $10,000' }
} as const;

export default function RiskMonitoringPage() {
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [exposures, setExposures] = useState<RiskExposure[]>([]);
  const [pendingOrders, setPendingOrders] = useState<number | null>(null);

  const fetchRiskData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await RiskControlAPI.getExposure();
      if (res.success && res.data) {
        setExposures(res.data.exposures ?? []);
        setPendingOrders(res.data.pendingOrders ?? 0);
      }
    } catch (error) {
      console.error('获取风险敞口数据失败:', error);
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
        description='监控各周期净风险敞口，异常时自动或手动干预'
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

      {/* 各周期风险敞口卡片 */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {(['30s', '1m', '3m', '5m', '10m'] as const).map((period) => {
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
                    {loading ? '加载中...' : '暂无数据'}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 实时风控指标 */}
      <div className='mt-6 grid gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>总净风险敞口</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              ${exposures.reduce((sum, e) => sum + e.netExposure, 0).toLocaleString() || '—'}
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
              ${exposures.reduce((sum, e) => sum + e.maxLoss, 0).toLocaleString() || '—'}
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
            <p className='text-muted-foreground text-xs'>所有未到期订单总数</p>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
