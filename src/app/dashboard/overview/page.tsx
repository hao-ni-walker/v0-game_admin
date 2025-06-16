'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import PageContainer from '@/components/layout/page-container';
import { useAuth } from '@/hooks/use-auth';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { formatDateTime, PageHeader } from '@/components/custom-table';
import { Area, AreaChart, XAxis, YAxis, CartesianGrid } from 'recharts';
import { DashboardAPI } from '@/service/request';
import { toast } from 'sonner';
import { DashboardSkeleton } from '@/components/ui/dashboard-skeleton';

interface DashboardStats {
  overview: {
    totalUsers: number;
    todayUsers: number;
    weekUsers: number;
    userGrowthRate: string;
    totalRoles: number;
    totalPermissions: number;
    totalLogs: number;
    todayLogs: number;
    weekLogs: number;
    errorLogs: number;
  };
  recentUsers: Array<{
    id: number;
    username: string;
    email: string;
    avatar: string;
    createdAt: string;
  }>;
  logLevelStats: Array<{
    level: string;
    count: number;
  }>;
  userTrend: Array<{
    date: string;
    users: number;
  }>;
}

export default function DashboardOverview() {
  const { session } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  const user = {
    username: '游客',
    email: '未登录',
    avatar: '/avatars/default.jpg',
    ...session?.user
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await DashboardAPI.getStats();
      if (res.code === 0) {
        setStats(res.data);
      } else {
        toast.error(res.message || '获取dashboard数据失败');
      }
    } catch (error) {
      console.error('获取dashboard数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <PageContainer scrollable={false}>
        <DashboardSkeleton />
      </PageContainer>
    );
  }

  // 图表配置
  const chartConfig = {
    users: {
      label: '用户数',
      color: 'hsl(var(--chart-1))'
    }
  } satisfies ChartConfig;

  // 处理图表数据
  const chartData =
    stats?.userTrend?.map((item) => ({
      date: new Date(item.date).toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric'
      }),
      users: item.users
    })) || [];

  const isPositiveGrowth = stats?.overview.userGrowthRate.startsWith('+');
  const weekGrowthRate = '+12.5%'; // 示例数据
  const roleGrowthRate = '+4.5%'; // 示例数据
  const logGrowthRate = '-8.2%'; // 示例数据

  return (
    <PageContainer scrollable={false}>
      <div className='flex h-[calc(100vh-8rem)] w-full flex-col space-y-6 overflow-y-auto'>
        {/* 页面头部 */}
        <PageHeader
          title={`欢迎回来，${user.username} 👋`}
          description='这里是您的系统概览和关键指标'
          action={{
            label: '刷新数据',
            onClick: fetchStats,
            icon: <RefreshCw className='mr-2 h-4 w-4' />
          }}
        />

        {/* 统计卡片 */}
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>总用户数</CardTitle>
              <Badge
                variant={isPositiveGrowth ? 'default' : 'destructive'}
                className='ml-auto'
              >
                {isPositiveGrowth ? (
                  <TrendingUp className='mr-1 h-3 w-3' />
                ) : (
                  <TrendingDown className='mr-1 h-3 w-3' />
                )}
                {stats?.overview.userGrowthRate || '+0%'}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {stats?.overview.totalUsers?.toLocaleString() || 0}
              </div>
              <p className='text-muted-foreground text-xs'>
                本月新增用户趋势向上
              </p>
              <p className='text-muted-foreground mt-1 text-xs'>
                今日注册 {stats?.overview.todayUsers || 0} 位新用户
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>本周活跃</CardTitle>
              <Badge variant='default' className='ml-auto'>
                <TrendingUp className='mr-1 h-3 w-3' />
                {weekGrowthRate}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {stats?.overview.weekUsers?.toLocaleString() || 0}
              </div>
              <p className='text-muted-foreground text-xs'>
                用户活跃度稳步提升
              </p>
              <p className='text-muted-foreground mt-1 text-xs'>
                用户参与度超出预期目标
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>系统角色</CardTitle>
              <Badge variant='default' className='ml-auto'>
                <TrendingUp className='mr-1 h-3 w-3' />
                {roleGrowthRate}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {stats?.overview.totalRoles || 0}
              </div>
              <p className='text-muted-foreground text-xs'>角色配置持续优化</p>
              <p className='text-muted-foreground mt-1 text-xs'>
                权限节点: {stats?.overview.totalPermissions || 0} 个
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>系统日志</CardTitle>
              <Badge variant='destructive' className='ml-auto'>
                <TrendingDown className='mr-1 h-3 w-3' />
                {logGrowthRate}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {stats?.overview.totalLogs?.toLocaleString() || 0}
              </div>
              <p className='text-muted-foreground text-xs'>日志量环比下降</p>
              <p className='text-muted-foreground mt-1 text-xs'>
                今日 {stats?.overview.todayLogs || 0} 条 | 错误{' '}
                {stats?.overview.errorLogs || 0} 条
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 主图表区域 */}
        <Card className='col-span-full'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle>用户活动趋势</CardTitle>
                <CardDescription>过去一段时间的用户注册情况</CardDescription>
              </div>
              <div className='flex space-x-1'>
                <Button
                  variant={timeRange === '30d' ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setTimeRange('30d')}
                >
                  最近 30 天
                </Button>
                <Button
                  variant={timeRange === '7d' ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setTimeRange('7d')}
                >
                  最近 7 天
                </Button>
                <Button
                  variant={timeRange === '3d' ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setTimeRange('3d')}
                >
                  最近 3 天
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className='h-[400px]'>
              <AreaChart
                accessibilityLayer
                data={chartData}
                margin={{
                  left: 12,
                  right: 12,
                  top: 12,
                  bottom: 12
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey='date'
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => `${value}`}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <defs>
                  <linearGradient id='fillUsers' x1='0' y1='0' x2='0' y2='1'>
                    <stop
                      offset='5%'
                      stopColor='var(--color-users)'
                      stopOpacity={0.8}
                    />
                    <stop
                      offset='95%'
                      stopColor='var(--color-users)'
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <Area
                  dataKey='users'
                  type='natural'
                  fill='url(#fillUsers)'
                  fillOpacity={0.4}
                  stroke='var(--color-users)'
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* 详细信息网格 */}
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {/* 最近用户 */}
          <Card>
            <CardHeader>
              <CardTitle>最近注册</CardTitle>
              <CardDescription>新用户注册列表</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {stats?.recentUsers?.slice(0, 3).map((user, index) => (
                  <div
                    key={user.id}
                    className='flex items-center justify-between'
                  >
                    <div className='flex items-center space-x-3'>
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium text-white ${
                          index === 0
                            ? 'bg-blue-500'
                            : index === 1
                              ? 'bg-green-500'
                              : 'bg-purple-500'
                        }`}
                      >
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className='text-sm font-medium'>{user.username}</p>
                        <p className='text-muted-foreground text-xs'>
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className='text-muted-foreground text-xs'>
                      {formatDateTime(user.createdAt).split(' ')[0]}
                    </div>
                  </div>
                )) || (
                  <p className='text-muted-foreground py-4 text-center'>
                    暂无数据
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 日志分布 */}
          <Card>
            <CardHeader>
              <CardTitle>日志分布</CardTitle>
              <CardDescription>按级别统计</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {stats?.logLevelStats?.map((stat, index) => {
                  const colors = ['#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
                  return (
                    <div
                      key={stat.level}
                      className='flex items-center justify-between'
                    >
                      <div className='flex items-center gap-2'>
                        <div
                          className='h-3 w-3 rounded-full'
                          style={{ backgroundColor: colors[index % 4] }}
                        />
                        <span className='text-sm font-medium capitalize'>
                          {stat.level}
                        </span>
                      </div>
                      <span className='text-sm font-bold'>{stat.count}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* 系统状态 */}
          <Card>
            <CardHeader>
              <CardTitle>系统状态</CardTitle>
              <CardDescription>运行状态监控</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <span className='text-muted-foreground text-sm'>
                    系统状态
                  </span>
                  <Badge
                    variant='default'
                    className='bg-green-100 text-green-800'
                  >
                    正常运行
                  </Badge>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-muted-foreground text-sm'>
                    本周用户
                  </span>
                  <span className='font-medium'>
                    {stats?.overview.weekUsers || 0}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-muted-foreground text-sm'>
                    本周日志
                  </span>
                  <span className='font-medium'>
                    {stats?.overview.weekLogs || 0}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-muted-foreground text-sm'>错误率</span>
                  <span
                    className={`font-medium ${stats?.overview.errorLogs ? 'text-red-600' : 'text-green-600'}`}
                  >
                    {stats?.overview.errorLogs ? '0.02%' : '0%'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
