'use client';

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Edit, Plus, Settings, BarChart3 } from 'lucide-react';
import { Activity } from '@/repository/models';
import { ActivityAPI, EventActivityTrigger } from '@/service/api/activities';
import { STATUS_COLORS, STATUS_LABELS, TYPE_LABELS, TRIGGER_MODE_LABELS } from '../types';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { toast } from 'sonner';
import Image from 'next/image';

interface ActivityDetailDrawerProps {
  open: boolean;
  activityId: number | null;
  onClose: () => void;
  onEdit: (activity: Activity) => void;
  onConfigureTrigger: (activityId: number, triggerId?: number) => void;
  onRefresh?: () => void;
  initialTab?: 'basic' | 'config' | 'triggers' | 'statistics';
}

export function ActivityDetailDrawer({
  open,
  activityId,
  onClose,
  onEdit,
  onConfigureTrigger,
  onRefresh,
  initialTab = 'basic'
}: ActivityDetailDrawerProps) {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [triggers, setTriggers] = useState<EventActivityTrigger[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [triggersLoading, setTriggersLoading] = useState(false);
  const [statisticsLoading, setStatisticsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [configForm, setConfigForm] = useState({
    participationConfig: '',
    extraConfig: ''
  });
  const [savingConfig, setSavingConfig] = useState(false);

  // 加载活动详情
  useEffect(() => {
    if (open && activityId) {
      loadActivity();
      if (activeTab === 'triggers') {
        loadTriggers();
      } else if (activeTab === 'statistics') {
        loadStatistics();
      }
    } else {
      setActivity(null);
      setTriggers([]);
      setStatistics(null);
      setActiveTab(initialTab);
    }
  }, [open, activityId, activeTab]);

  const loadActivity = async () => {
    if (!activityId) return;
    setLoading(true);
    try {
      const response = await ActivityAPI.getActivity(activityId);
      if (response.code === 0) {
        setActivity(response.data);
        setConfigForm({
          participationConfig: JSON.stringify(response.data.participationConfig, null, 2),
          extraConfig: JSON.stringify(response.data.extraConfig, null, 2)
        });
      } else {
        toast.error(response.message || '获取活动详情失败');
      }
    } catch (error) {
      console.error('获取活动详情失败:', error);
      toast.error('获取活动详情失败');
    } finally {
      setLoading(false);
    }
  };

  const loadTriggers = async () => {
    if (!activityId) return;
    setTriggersLoading(true);
    try {
      const response = await ActivityAPI.getTriggers(activityId);
      if (response.code === 0) {
        setTriggers(response.data.items || []);
      } else {
        toast.error(response.message || '获取触发规则失败');
      }
    } catch (error) {
      console.error('获取触发规则失败:', error);
      toast.error('获取触发规则失败');
    } finally {
      setTriggersLoading(false);
    }
  };

  const loadStatistics = async () => {
    if (!activityId) return;
    setStatisticsLoading(true);
    try {
      const response = await ActivityAPI.getStatistics(activityId);
      if (response.code === 0) {
        setStatistics(response.data);
      } else {
        toast.error(response.message || '获取统计信息失败');
      }
    } catch (error) {
      console.error('获取统计信息失败:', error);
      toast.error('获取统计信息失败');
    } finally {
      setStatisticsLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!activityId) return;
    setSavingConfig(true);
    try {
      let participationConfig: Record<string, unknown> = {};
      let extraConfig: Record<string, unknown> = {};

      try {
        participationConfig = JSON.parse(configForm.participationConfig);
      } catch {
        toast.error('参与配置 JSON 格式错误');
        setSavingConfig(false);
        return;
      }

      try {
        extraConfig = JSON.parse(configForm.extraConfig);
      } catch {
        toast.error('扩展配置 JSON 格式错误');
        setSavingConfig(false);
        return;
      }

      const response = await ActivityAPI.updateActivity(activityId, {
        participation_config: participationConfig,
        extra_config: extraConfig
      });

      if (response.code === 0) {
        toast.success('保存成功');
        await loadActivity();
        onRefresh?.();
      } else {
        toast.error(response.message || '保存失败');
      }
    } catch (error) {
      console.error('保存配置失败:', error);
      toast.error('保存配置失败');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleToggleTriggerStatus = async (triggerId: number, isActive: boolean) => {
    try {
      const response = await ActivityAPI.updateTriggerStatus(triggerId, !isActive);
      if (response.code === 0) {
        toast.success('状态更新成功');
        await loadTriggers();
      } else {
        toast.error(response.message || '状态更新失败');
      }
    } catch (error) {
      console.error('状态更新失败:', error);
      toast.error('状态更新失败');
    }
  };

  const formatDateTime = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN });
    } catch {
      return dateStr;
    }
  };

  if (!activityId) return null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className='w-full overflow-y-auto sm:max-w-2xl'>
        {loading && !activity ? (
          <div className='space-y-4'>
            <Skeleton className='h-8 w-48' />
            <Skeleton className='h-64 w-full' />
          </div>
        ) : activity ? (
          <>
            <SheetHeader>
              <SheetTitle>{activity.name}</SheetTitle>
              <SheetDescription>活动编码: {activity.activityCode}</SheetDescription>
            </SheetHeader>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className='mt-4'>
              <TabsList className='grid w-full grid-cols-4'>
                <TabsTrigger value='basic'>基本信息</TabsTrigger>
                <TabsTrigger value='config'>规则配置</TabsTrigger>
                <TabsTrigger value='triggers'>触发规则</TabsTrigger>
                <TabsTrigger value='statistics'>统计信息</TabsTrigger>
              </TabsList>

              {/* 基本信息 Tab */}
              <TabsContent value='basic' className='space-y-4'>
                <Card>
                  <CardHeader>
                    <div className='flex items-center justify-between'>
                      <CardTitle>基本信息</CardTitle>
                      <Button variant='outline' size='sm' onClick={() => onEdit(activity)}>
                        <Edit className='mr-2 h-4 w-4' />
                        编辑
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className='grid gap-4 md:grid-cols-2'>
                    <div>
                      <Label>活动ID</Label>
                      <p className='text-muted-foreground'>#{activity.id}</p>
                    </div>
                    <div>
                      <Label>活动编码</Label>
                      <p className='text-muted-foreground'>{activity.activityCode}</p>
                    </div>
                    <div>
                      <Label>活动类型</Label>
                      <Badge variant='outline'>
                        {TYPE_LABELS[activity.activityType] || activity.activityType}
                      </Badge>
                    </div>
                    <div>
                      <Label>状态</Label>
                      <Badge className={STATUS_COLORS[activity.status] || ''}>
                        {STATUS_LABELS[activity.status] || activity.status}
                      </Badge>
                    </div>
                    <div>
                      <Label>优先级</Label>
                      <p className='text-muted-foreground'>{activity.priority}</p>
                    </div>
                    <div>
                      <Label>活动时间</Label>
                      <p className='text-muted-foreground text-sm'>
                        {formatDateTime(activity.startTime)} ~ {formatDateTime(activity.endTime)}
                      </p>
                    </div>
                    <div>
                      <Label>展示时间</Label>
                      <p className='text-muted-foreground text-sm'>
                        {activity.displayStartTime && activity.displayEndTime
                          ? `${formatDateTime(activity.displayStartTime)} ~ ${formatDateTime(activity.displayEndTime)}`
                          : '跟随活动时间'}
                      </p>
                    </div>
                    <div>
                      <Label>描述</Label>
                      <p className='text-muted-foreground'>{activity.description || '-'}</p>
                    </div>
                    {(activity.iconUrl || activity.bannerUrl) && (
                      <>
                        {activity.iconUrl && (
                          <div>
                            <Label>图标</Label>
                            <div className='mt-2'>
                              <Image
                                src={activity.iconUrl}
                                alt='活动图标'
                                width={64}
                                height={64}
                                className='rounded-md border'
                              />
                            </div>
                          </div>
                        )}
                        {activity.bannerUrl && (
                          <div>
                            <Label>横幅</Label>
                            <div className='mt-2'>
                              <Image
                                src={activity.bannerUrl}
                                alt='活动横幅'
                                width={400}
                                height={128}
                                className='rounded-md border object-cover'
                              />
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    <div>
                      <Label>创建人</Label>
                      <p className='text-muted-foreground'>用户 #{activity.createdBy}</p>
                    </div>
                    <div>
                      <Label>更新人</Label>
                      <p className='text-muted-foreground'>用户 #{activity.updatedBy}</p>
                    </div>
                    <div>
                      <Label>创建时间</Label>
                      <p className='text-muted-foreground text-sm'>
                        {formatDateTime(activity.createdAt)}
                      </p>
                    </div>
                    <div>
                      <Label>更新时间</Label>
                      <p className='text-muted-foreground text-sm'>
                        {formatDateTime(activity.updatedAt)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 规则配置 Tab */}
              <TabsContent value='config' className='space-y-4'>
                <Card>
                  <CardHeader>
                    <CardTitle>活动级规则配置</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='space-y-2'>
                      <Label>参与配置 (participation_config)</Label>
                      <Textarea
                        value={configForm.participationConfig}
                        onChange={(e) =>
                          setConfigForm({ ...configForm, participationConfig: e.target.value })
                        }
                        className='font-mono text-sm'
                        rows={10}
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label>扩展配置 (extra_config)</Label>
                      <Textarea
                        value={configForm.extraConfig}
                        onChange={(e) =>
                          setConfigForm({ ...configForm, extraConfig: e.target.value })
                        }
                        className='font-mono text-sm'
                        rows={10}
                      />
                    </div>
                    <Button onClick={handleSaveConfig} disabled={savingConfig}>
                      {savingConfig ? '保存中...' : '保存规则'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 触发规则 Tab */}
              <TabsContent value='triggers' className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <CardTitle>触发规则列表</CardTitle>
                  <Button
                    size='sm'
                    onClick={() => onConfigureTrigger(activityId)}
                    onMouseEnter={() => !triggersLoading && loadTriggers()}
                  >
                    <Plus className='mr-2 h-4 w-4' />
                    新建规则
                  </Button>
                </div>
                {triggersLoading ? (
                  <div className='space-y-2'>
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className='h-16 w-full' />
                    ))}
                  </div>
                ) : triggers.length === 0 ? (
                  <Card>
                    <CardContent className='py-8 text-center text-muted-foreground'>
                      暂无触发规则
                    </CardContent>
                  </Card>
                ) : (
                  <div className='rounded-md border'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>规则ID</TableHead>
                          <TableHead>事件类型</TableHead>
                          <TableHead>触发模式</TableHead>
                          <TableHead>是否启用</TableHead>
                          <TableHead>冷却时间</TableHead>
                          <TableHead>日限</TableHead>
                          <TableHead>总限</TableHead>
                          <TableHead>优先级</TableHead>
                          <TableHead className='text-right'>操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {triggers.map((trigger) => (
                          <TableRow key={trigger.id}>
                            <TableCell>#{trigger.id}</TableCell>
                            <TableCell>
                              <code className='text-xs'>{trigger.event_type}</code>
                            </TableCell>
                            <TableCell>
                              {TRIGGER_MODE_LABELS[trigger.trigger_mode] || trigger.trigger_mode}
                            </TableCell>
                            <TableCell>
                              <Switch
                                checked={trigger.is_active}
                                onCheckedChange={() =>
                                  handleToggleTriggerStatus(trigger.id, trigger.is_active)
                                }
                              />
                            </TableCell>
                            <TableCell>
                              {trigger.cooldown_seconds
                                ? `${trigger.cooldown_seconds}秒`
                                : '-'}
                            </TableCell>
                            <TableCell>
                              {trigger.daily_limit_per_user || '-'}
                            </TableCell>
                            <TableCell>{trigger.total_limit || '-'}</TableCell>
                            <TableCell>{trigger.priority}</TableCell>
                            <TableCell className='text-right'>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => onConfigureTrigger(activityId, trigger.id)}
                              >
                                <Settings className='h-4 w-4' />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>

              {/* 统计信息 Tab */}
              <TabsContent value='statistics' className='space-y-4'>
                {statisticsLoading ? (
                  <div className='grid gap-4 md:grid-cols-2'>
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className='h-24 w-full' />
                    ))}
                  </div>
                ) : statistics ? (
                  <div className='grid gap-4 md:grid-cols-2'>
                    <Card>
                      <CardHeader>
                        <CardTitle>参与用户数</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className='text-2xl font-bold'>
                          {statistics.total_participants || 0}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>累计发放奖励</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className='text-2xl font-bold'>
                          {statistics.total_rewards_given || 0}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>近7天参与</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className='text-2xl font-bold'>
                          {statistics.participants_7d || 0}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>近7天发放</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className='text-2xl font-bold'>{statistics.rewards_7d || 0}</div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card>
                    <CardContent className='py-8 text-center text-muted-foreground'>
                      暂无统计数据
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

