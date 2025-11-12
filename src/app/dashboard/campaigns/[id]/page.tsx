'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Play, Pause, Square, Copy, Eye, QrCode, Edit } from 'lucide-react';
import { Activity } from '@/repository/models';
import { STATUS_COLORS, STATUS_LABELS, TYPE_LABELS } from '../types';

export default function ActivityDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        // 模拟API调用
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        // 模拟数据
        const mockActivity: Activity = {
          id: parseInt(params.id, 10),
          activityCode: "FIRST_DEPOSIT_NOV",
          activityType: "first_deposit",
          name: "新用户首充返利",
          description: "首充返利 100%，上限 100 元。新用户首次充值即可享受超值返利优惠！",
          startTime: "2025-11-01T00:00:00Z",
          endTime: "2025-12-01T00:00:00Z",
          displayStartTime: "2025-10-28T00:00:00Z",
          displayEndTime: "2025-12-05T00:00:00Z",
          status: "active",
          priority: 900,
          participationConfig: {
            perUserDailyLimit: 1,
            minDeposit: 50,
            maxBonus: 100,
            eligibility: "new_user"
          },
          extraConfig: {
            theme: "purple",
            entry: "/promo/first-deposit",
            abGroup: "A"
          },
          totalParticipants: 12845,
          totalRewardsGiven: 11320,
          iconUrl: "https://cdn.example.com/icons/fd.png",
          bannerUrl: "https://cdn.example.com/banners/fd_1125.jpg",
          createdBy: 1,
          updatedBy: 1,
          createdAt: "2025-10-20T09:30:00Z",
          updatedAt: "2025-11-11T21:00:00Z"
        };
        
        setActivity(mockActivity);
      } catch (error) {
        console.error('获取活动详情失败:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [params.id]);

  if (loading) {
    return (
      <PageContainer scrollable={true}>
        <div className='space-y-6'>
          <div className='flex items-center justify-between'>
            <div>
              <div className='h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse'></div>
              <div className='mt-2 h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse'></div>
            </div>
            <div className='flex gap-2'>
              <div className='h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse'></div>
              <div className='h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse'></div>
            </div>
          </div>
          
          <div className='grid gap-6 md:grid-cols-2'>
            {[...Array(4)].map((_, i) => (
              <div key={i} className='h-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse'></div>
            ))}
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!activity) {
    notFound();
    return null;
  }

  const handleStatusChange = async (status: string) => {
    try {
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 300));
      console.log('更改状态:', status);
      // 刷新页面数据
      router.refresh();
    } catch (error) {
      console.error('更改状态失败:', error);
    }
  };

  const handleCopyActivity = () => {
    router.push(`/dashboard/campaigns/create?copyFrom=${activity.id}`);
  };

  const handleEditActivity = () => {
    router.push(`/dashboard/campaigns/${activity.id}/edit`);
  };

  return (
    <PageContainer scrollable={true}>
      <div className='space-y-6'>
        {/* 页面头部 */}
        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div>
            <h1 className='text-2xl font-bold'>{activity.name}</h1>
            <p className='text-muted-foreground'>
              活动编码: {activity.activityCode}
            </p>
          </div>
          <div className='flex flex-wrap gap-2'>
            <Button variant='outline' onClick={handleEditActivity}>
              <Edit className='mr-2 h-4 w-4' />
              编辑
            </Button>
            <Button variant='outline' onClick={handleCopyActivity}>
              <Copy className='mr-2 h-4 w-4' />
              复制
            </Button>
            <Button variant='outline'>
              <Eye className='mr-2 h-4 w-4' />
              预览
            </Button>
            <Button variant='outline'>
              <QrCode className='mr-2 h-4 w-4' />
              二维码
            </Button>
            {activity.status === 'draft' && (
              <Button onClick={() => handleStatusChange('active')}>
                <Play className='mr-2 h-4 w-4' />
                上线
              </Button>
            )}
            {activity.status === 'active' && (
              <Button
                variant='secondary'
                onClick={() => handleStatusChange('paused')}
              >
                <Pause className='mr-2 h-4 w-4' />
                暂停
              </Button>
            )}
            {activity.status === 'paused' && (
              <Button onClick={() => handleStatusChange('active')}>
                <Play className='mr-2 h-4 w-4' />
                恢复
              </Button>
            )}
            {(activity.status === 'active' || activity.status === 'paused') && (
              <Button
                variant='destructive'
                onClick={() => handleStatusChange('ended')}
              >
                <Square className='mr-2 h-4 w-4' />
                结束
              </Button>
            )}
          </div>
        </div>

        {/* 基本信息卡片 */}
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
          </CardHeader>
          <CardContent className='grid gap-4 md:grid-cols-2'>
            <div>
              <h3 className='font-medium'>活动ID</h3>
              <p className='text-muted-foreground'>#{activity.id}</p>
            </div>
            <div>
              <h3 className='font-medium'>活动类型</h3>
              <p className='text-muted-foreground'>
                {TYPE_LABELS[activity.activityType] || activity.activityType}
              </p>
            </div>
            <div>
              <h3 className='font-medium'>状态</h3>
              <Badge className={STATUS_COLORS[activity.status] || ''}>
                {STATUS_LABELS[activity.status] || activity.status}
              </Badge>
            </div>
            <div>
              <h3 className='font-medium'>优先级</h3>
              <p className='text-muted-foreground'>{activity.priority}</p>
            </div>
            <div>
              <h3 className='font-medium'>活动时间</h3>
              <p className='text-muted-foreground'>
                {new Date(activity.startTime).toLocaleString()} -{' '}
                {new Date(activity.endTime).toLocaleString()}
              </p>
            </div>
            <div>
              <h3 className='font-medium'>展示时间</h3>
              <p className='text-muted-foreground'>
                {activity.displayStartTime
                  ? new Date(activity.displayStartTime).toLocaleString()
                  : '无'}{' '}
                -{' '}
                {activity.displayEndTime
                  ? new Date(activity.displayEndTime).toLocaleString()
                  : '无'}
              </p>
            </div>
            <div>
              <h3 className='font-medium'>创建者</h3>
              <p className='text-muted-foreground'>用户 #{activity.createdBy}</p>
            </div>
            <div>
              <h3 className='font-medium'>最后更新</h3>
              <p className='text-muted-foreground'>
                {new Date(activity.updatedAt).toLocaleString()} (用户 #
                {activity.updatedBy})
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 配置卡片 */}
        <div className='grid gap-6 md:grid-cols-2'>
          <Card>
            <CardHeader>
              <CardTitle>参与配置</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className='text-muted-foreground overflow-x-auto text-sm'>
                {JSON.stringify(activity.participationConfig, null, 2)}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>扩展配置</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className='text-muted-foreground overflow-x-auto text-sm'>
                {JSON.stringify(activity.extraConfig, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>

        {/* 数据卡片 */}
        <Card>
          <CardHeader>
            <CardTitle>统计数据</CardTitle>
          </CardHeader>
          <CardContent className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <div className='text-center'>
              <div className='text-2xl font-bold'>{activity.totalParticipants}</div>
              <div className='text-muted-foreground'>累计参与人次</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold'>{activity.totalRewardsGiven}</div>
              <div className='text-muted-foreground'>累计发放奖励</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold'>0</div>
              <div className='text-muted-foreground'>近7天参与</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold'>0</div>
              <div className='text-muted-foreground'>近7天发放</div>
            </div>
          </CardContent>
        </Card>

        {/* 资源卡片 */}
        <Card>
          <CardHeader>
            <CardTitle>展示资源</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid gap-4 md:grid-cols-2'>
              <div>
                <h3 className='font-medium mb-2'>图标</h3>
                {activity.iconUrl ? (
                  <img
                    src={activity.iconUrl}
                    alt='活动图标'
                    className='h-16 w-16 rounded-md border'
                  />
                ) : (
                  <p className='text-muted-foreground'>未设置</p>
                )}
              </div>
              <div>
                <h3 className='font-medium mb-2'>横幅</h3>
                {activity.bannerUrl ? (
                  <img
                    src={activity.bannerUrl}
                    alt='活动横幅'
                    className='h-32 w-full rounded-md border object-cover'
                  />
                ) : (
                  <p className='text-muted-foreground'>未设置</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
