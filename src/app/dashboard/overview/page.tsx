'use client';

import React, { useEffect, useState, useCallback } from 'react';
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
import { useAuth } from '@/hooks/use-auth';
import { DashboardAPI } from '@/service/request';
import {
  ShieldAlert,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Users,
  Landmark,
  Clock,
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
  AlertTriangle,
  Activity
} from 'lucide-react';
import { PageHeader } from '@/components/table/page-header';
import { DashboardSkeleton } from '@/components/ui/dashboard-skeleton';

// PRD §2.1 实时核心指标
interface DashboardMetrics {
  netRiskExposure: number; // 平台实时净风险敞口
  todayVolume: number; // 当日总流水
  todayProfit: number; // 当日平台盈利
  onlineUsers: number; // 在线用户数
  pendingOrders: number; // 待结算订单数
  fundPoolBalance: number; // 资金池余额
}

// PRD §2.2 风险预警
interface RiskAlert {
  type: 'red' | 'orange' | 'yellow' | 'blue';
  message: string;
  timestamp: string;
}

// PRD §2.3 实时订单流
interface OrderFlowItem {
  id: string;
  userId: string; // 脱敏
  direction: 'up' | 'down'; // 买涨/买跌
  period: string; // 周期
  amount: number; // 金额
  time: string; // 时间
}

export default function DashboardOverview() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [orderFlow, setOrderFlow] = useState<OrderFlowItem[]>([]);

  const user = {
    username: '游客',
    email: '未登录',
    avatar: '/avatars/default.jpg',
    ...session?.user
  };

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [metricsRes, streamRes] = await Promise.all([
        DashboardAPI.getMetrics(),
        DashboardAPI.getOrderStream(20),
      ]);
      if (metricsRes.success && metricsRes.data) {
        setMetrics(metricsRes.data);
      }
      setAlerts(metricsRes.alerts || []);
      if (streamRes.success && streamRes.data) {
        setOrderFlow(streamRes.data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    if (!autoRefresh) return;
    // PRD §2.1 自动刷新间隔 5 秒
    const interval = setInterval(fetchDashboardData, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchDashboardData]);

  if (loading && !metrics) {
    return (
      <PageContainer scrollable={false}>
        <DashboardSkeleton />
      </PageContainer>
    );
  }

  function renderMoney(value: number | null | undefined) {
    if (value === null || value === undefined) return '—';
    return `$${value.toLocaleString()}`;
  }

  function renderCount(value: number | null | undefined) {
    if (value === null || value === undefined) return '—';
    return value.toLocaleString();
  }

  // PRD §2.1 核心指标卡片
  const coreMetrics = [
    {
      title: '净风险敞口',
      value: renderMoney(metrics?.netRiskExposure),
      icon: ShieldAlert,
      description: '买涨 − 买跌总金额',
      variant: (metrics?.netRiskExposure ?? 0) > 6000 ? 'destructive' : 'default'
    },
    {
      title: '当日总流水',
      value: renderMoney(metrics?.todayVolume),
      icon: DollarSign,
      description: '所有已下单金额之和'
    },
    {
      title: '当日平台盈利',
      value: renderMoney(metrics?.todayProfit),
      icon: metrics?.todayProfit && metrics.todayProfit >= 0 ? TrendingUp : TrendingDown,
      description: '已结算订单平台净收益'
    },
    {
      title: '在线用户数',
      value: renderCount(metrics?.onlineUsers),
      icon: Users,
      description: '当前活跃 MiniApp 用户'
    },
    {
      title: '待结算订单',
      value: renderCount(metrics?.pendingOrders),
      icon: Clock,
      description: '所有未到期订单总数'
    },
    {
      title: '资金池余额',
      value: renderMoney(metrics?.fundPoolBalance),
      icon: Landmark,
      description: '平台可用流动性资金'
    }
  ];

  // PRD §2.2 预警颜色映射
  const alertColors = {
    red: { bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-200 dark:border-red-800', badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', label: '红色警报' },
    orange: { bg: 'bg-orange-50 dark:bg-orange-950/30', border: 'border-orange-200 dark:border-orange-800', badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', label: '橙色预警' },
    yellow: { bg: 'bg-yellow-50 dark:bg-yellow-950/30', border: 'border-yellow-200 dark:border-yellow-800', badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', label: '黄色提示' },
    blue: { bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-800', badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', label: '蓝色提示' }
  };

  return (
    <PageContainer scrollable={false}>
      <div className='flex h-[calc(100vh-8rem)] w-full flex-col space-y-6 overflow-y-auto'>
        {/* 页面头部 */}
        <PageHeader
          title={`欢迎回来，${user.username} 👋`}
          description='BTC 秒合约管理后台 — 实时经营概览'
          action={{
            label: autoRefresh ? '暂停刷新' : '开启自动刷新',
            onClick: () => setAutoRefresh(!autoRefresh),
            icon: <RefreshCw className='mr-2 h-4 w-4' />
          }}
        />

        {/* PRD §2.1 实时核心指标 */}
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'>
          {coreMetrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card key={metric.title}>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    {metric.title}
                  </CardTitle>
                  <Icon className='text-muted-foreground h-4 w-4' />
                </CardHeader>
                <CardContent>
                  <div className='text-xl font-bold'>{metric.value}</div>
                  <p className='text-muted-foreground text-xs'>
                    {metric.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* PRD §2.2 风险预警看板 */}
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='flex items-center gap-2'>
                  <AlertTriangle className='h-5 w-5' />
                  风险预警看板
                </CardTitle>
                <CardDescription>
                  风险敞口超阈值 → 红色 | 资金池低于安全线 → 橙色 | 单边行情 → 黄色 | 异常账户 → 蓝色
                </CardDescription>
              </div>
              <Badge
                variant='outline'
                className={autoRefresh ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
              >
                {autoRefresh ? '5s 自动刷新' : '已暂停'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {alerts.length > 0 ? (
              <div className='space-y-3'>
                {alerts.map((alert, index) => {
                  const colorConfig = alertColors[alert.type];
                  return (
                    <div
                      key={index}
                      className={`flex items-center gap-3 rounded-lg border p-3 ${colorConfig.bg} ${colorConfig.border}`}
                    >
                      <Badge className={colorConfig.badge}>
                        {colorConfig.label}
                      </Badge>
                      <span className='flex-1 text-sm'>{alert.message}</span>
                      <span className='text-muted-foreground text-xs'>
                        {alert.timestamp}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className='flex h-20 items-center justify-center text-muted-foreground'>
                <Badge className='bg-green-100 text-green-800'>
                  ✅ 所有指标正常，暂无预警
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* PRD §2.3 实时订单流 */}
        <Card>
          <CardHeader>
            <div className='flex items-center gap-2'>
              <Activity className='h-5 w-5' />
              <CardTitle>实时订单流</CardTitle>
            </div>
            <CardDescription>
              最新下单动态（用户 ID 脱敏 / 方向 / 周期 / 金额 / 时间）
            </CardDescription>
          </CardHeader>
          <CardContent>
            {orderFlow.length > 0 ? (
              <div className='space-y-2'>
                {orderFlow.map((order) => (
                  <div
                    key={order.id}
                    className='flex items-center gap-4 rounded-md border p-2 text-sm'
                  >
                    <span className='text-muted-foreground w-24 font-mono'>
                      {order.userId}
                    </span>
                    <Badge
                      variant={order.direction === 'up' ? 'default' : 'secondary'}
                      className='flex items-center gap-1'
                    >
                      {order.direction === 'up' ? (
                        <ArrowUpCircle className='h-3 w-3' />
                      ) : (
                        <ArrowDownCircle className='h-3 w-3' />
                      )}
                      {order.direction === 'up' ? '买涨' : '买跌'}
                    </Badge>
                    <Badge variant='outline'>{order.period}</Badge>
                    <span className='font-medium'>
                      ${order.amount.toLocaleString()}
                    </span>
                    <span className='text-muted-foreground ml-auto text-xs'>
                      {order.time}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className='flex h-32 items-center justify-center text-muted-foreground'>
                暂无实时订单数据
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
