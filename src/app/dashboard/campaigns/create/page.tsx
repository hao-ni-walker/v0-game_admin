'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Save, ArrowLeft } from 'lucide-react';

export default function CreateActivityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('创建活动');
      router.push('/dashboard/campaigns');
    } catch (error) {
      console.error('创建活动失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer scrollable={true}>
      <div className='space-y-6'>
        {/* 页面头部 */}
        <div className='flex items-center gap-4'>
          <Button
            variant='outline'
            size='icon'
            onClick={() => router.back()}
          >
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <div>
            <h1 className='text-2xl font-bold'>创建活动</h1>
            <p className='text-muted-foreground'>
              创建新的营销活动
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='grid gap-6 md:grid-cols-2'>
            {/* 基本信息卡片 */}
            <Card>
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='activityCode'>活动编码 *</Label>
                  <Input
                    id='activityCode'
                    placeholder='唯一业务主键，如 FIRST_DEPOSIT_NOV'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='name'>活动名称 *</Label>
                  <Input
                    id='name'
                    placeholder='活动标题'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='activityType'>活动类型 *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder='请选择活动类型' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='first_deposit'>首充活动</SelectItem>
                      <SelectItem value='daily_signin'>每日签到</SelectItem>
                      <SelectItem value='vip_reward'>VIP奖励</SelectItem>
                      <SelectItem value='limited_pack'>限时礼包</SelectItem>
                      <SelectItem value='lottery'>抽奖活动</SelectItem>
                      <SelectItem value='leaderboard'>排行榜</SelectItem>
                      <SelectItem value='cashback'>返利活动</SelectItem>
                      <SelectItem value='referral'>推荐奖励</SelectItem>
                      <SelectItem value='other'>其他活动</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='description'>活动描述 *</Label>
                  <Textarea
                    id='description'
                    placeholder='活动说明/玩法'
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 时间配置卡片 */}
            <Card>
              <CardHeader>
                <CardTitle>时间配置</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='startTime'>开始时间 *</Label>
                  <Input
                    id='startTime'
                    type='datetime-local'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='endTime'>结束时间 *</Label>
                  <Input
                    id='endTime'
                    type='datetime-local'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='displayStartTime'>展示开始时间</Label>
                  <Input
                    id='displayStartTime'
                    type='datetime-local'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='displayEndTime'>展示结束时间</Label>
                  <Input
                    id='displayEndTime'
                    type='datetime-local'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='priority'>展示优先级</Label>
                  <Input
                    id='priority'
                    type='number'
                    defaultValue='100'
                    placeholder='数值越大越靠前'
                  />
                </div>
              </CardContent>
            </Card>

            {/* 参与配置卡片 */}
            <Card>
              <CardHeader>
                <CardTitle>参与配置</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='participationConfig'>参与配置 (JSON)</Label>
                  <Textarea
                    id='participationConfig'
                    placeholder='{"perUserDailyLimit": 1, "minDeposit": 50}'
                    rows={6}
                    defaultValue='{}'
                  />
                </div>
              </CardContent>
            </Card>

            {/* 扩展配置卡片 */}
            <Card>
              <CardHeader>
                <CardTitle>扩展配置</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='extraConfig'>扩展配置 (JSON)</Label>
                  <Textarea
                    id='extraConfig'
                    placeholder='{"theme": "purple", "entry": "/promo/first-deposit"}'
                    rows={6}
                    defaultValue='{}'
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 操作按钮 */}
          <div className='flex justify-end gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => router.back()}
              disabled={loading}
            >
              取消
            </Button>
            <Button type='submit' disabled={loading}>
              {loading ? '创建中...' : '创建活动'}
              <Save className='ml-2 h-4 w-4' />
            </Button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}
