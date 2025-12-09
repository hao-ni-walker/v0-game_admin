'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { CalendarIcon, Check, ChevronRight, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  ActivityAPI,
  CreateActivityParams,
  CreateTriggerParams
} from '@/service/api/activities';
import { TYPE_LABELS, STATUS_LABELS, TRIGGER_MODE_LABELS } from '../types';
import { toast } from 'sonner';

interface ActivityCreateWizardProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const STEPS = [
  { id: 1, title: '基本信息' },
  { id: 2, title: '规则配置' },
  { id: 3, title: '奖励配置' }
];

const EVENT_TYPES = [
  'deposit_created',
  'bet_settled',
  'withdrawal_created',
  'user_registered',
  'vip_level_up',
  'daily_login',
  'task_completed'
];

export function ActivityCreateWizard({
  open,
  onClose,
  onSuccess
}: ActivityCreateWizardProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [activityId, setActivityId] = useState<number | null>(null);

  // Step 1 Data
  const [activityForm, setActivityForm] = useState<
    Partial<CreateActivityParams>
  >({
    activity_code: '',
    activity_type: '',
    name: '',
    description: '',
    status: 'draft',
    priority: 0,
    icon_url: '',
    banner_url: ''
  });
  const [dates, setDates] = useState<{
    start?: Date;
    end?: Date;
    displayStart?: Date;
    displayEnd?: Date;
  }>({});

  // Step 2 Data
  const [triggerForm, setTriggerForm] = useState<Partial<CreateTriggerParams>>({
    event_type: '',
    trigger_mode: 'immediate',
    cooldown_seconds: null,
    daily_limit_per_user: null,
    total_limit: null,
    priority: 0,
    is_active: true
  });
  const [matchCriteriaJson, setMatchCriteriaJson] = useState('{}');

  // Step 3 Data
  const [rewardItemsJson, setRewardItemsJson] = useState('{}');

  // Reset on open
  useEffect(() => {
    if (open) {
      setStep(1);
      setActivityId(null);
      setActivityForm({
        activity_code: '',
        activity_type: '',
        name: '',
        description: '',
        status: 'draft',
        priority: 0,
        icon_url: '',
        banner_url: ''
      });
      setDates({});
      setTriggerForm({
        event_type: '',
        trigger_mode: 'immediate',
        cooldown_seconds: null,
        daily_limit_per_user: null,
        total_limit: null,
        priority: 0,
        is_active: true
      });
      setMatchCriteriaJson('{}');
      setRewardItemsJson('{}');
    }
  }, [open]);

  const handleStep1Submit = async () => {
    if (
      !activityForm.activity_code ||
      !activityForm.activity_type ||
      !activityForm.name
    ) {
      toast.error('请填写必填字段');
      return;
    }
    if (!dates.start || !dates.end) {
      toast.error('请选择活动时间');
      return;
    }
    if (dates.start >= dates.end) {
      toast.error('活动开始时间必须早于结束时间');
      return;
    }

    setLoading(true);
    try {
      const submitData: CreateActivityParams = {
        activity_code: activityForm.activity_code!,
        activity_type: activityForm.activity_type!,
        name: activityForm.name!,
        description: activityForm.description || '',
        start_time: dates.start.toISOString(),
        end_time: dates.end.toISOString(),
        display_start_time: dates.displayStart?.toISOString(),
        display_end_time: dates.displayEnd?.toISOString(),
        status: activityForm.status || 'draft',
        priority: activityForm.priority || 0,
        icon_url: activityForm.icon_url,
        banner_url: activityForm.banner_url
      };

      let currentId = activityId;
      if (!currentId) {
        const response = await ActivityAPI.createActivity(submitData);
        if (response.code === 0 && response.data) {
          // response.data 是 Activity 对象，包含 id
          currentId = response.data.id;
          setActivityId(currentId);
          toast.success('活动基本信息已保存');
          setStep(2);
        } else {
          toast.error(response.message || '创建活动失败');
        }
      } else {
        // 更新现有的（如果用户返回并修改）
        const response = await ActivityAPI.updateActivity(
          currentId,
          submitData
        );
        if (response.code === 0) {
          toast.success('活动基本信息已更新');
          setStep(2);
        } else {
          toast.error(response.message || '更新活动失败');
        }
      }
    } catch (error) {
      console.error('保存活动失败:', error);
      toast.error('保存活动失败');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = () => {
    if (!triggerForm.event_type) {
      toast.error('请选择事件类型');
      return;
    }
    try {
      JSON.parse(matchCriteriaJson);
    } catch {
      toast.error('匹配条件 JSON 格式错误');
      return;
    }
    setStep(3);
  };

  const handleStep3Submit = async () => {
    if (!activityId) {
      toast.error('未找到活动 ID');
      return;
    }
    try {
      JSON.parse(rewardItemsJson);
    } catch {
      toast.error('奖励配置 JSON 格式错误');
      return;
    }

    setLoading(true);
    try {
      const submitData: CreateTriggerParams = {
        activity_id: activityId,
        event_type: triggerForm.event_type!,
        match_criteria: JSON.parse(matchCriteriaJson),
        trigger_mode: triggerForm.trigger_mode || 'immediate',
        reward_items: JSON.parse(rewardItemsJson),
        cooldown_seconds: triggerForm.cooldown_seconds,
        daily_limit_per_user: triggerForm.daily_limit_per_user,
        total_limit: triggerForm.total_limit,
        priority: triggerForm.priority || 0,
        is_active: triggerForm.is_active !== false
      };

      const response = await ActivityAPI.createTrigger(activityId, submitData);
      if (response.code === 0) {
        toast.success('活动创建流程完成');
        onSuccess();
        onClose();
      } else {
        toast.error(response.message || '创建触发规则失败');
      }
    } catch (error) {
      console.error('保存触发规则失败:', error);
      toast.error('保存触发规则失败');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      handleStep1Submit();
    } else if (step === 2) {
      handleStep2Submit();
    } else if (step === 3) {
      handleStep3Submit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !loading && onClose()}>
      <DialogContent className='max-h-[90vh] max-w-3xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>创建活动</DialogTitle>
          <DialogDescription>请按照步骤完成活动创建</DialogDescription>
        </DialogHeader>

        {/* 步骤指示器 */}
        <div className='mb-6 flex items-center justify-center'>
          {STEPS.map((s, index) => (
            <div key={s.id} className='flex items-center'>
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium',
                  step >= s.id
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted text-muted-foreground border-muted-foreground/30'
                )}
              >
                {step > s.id ? <Check className='h-4 w-4' /> : s.id}
              </div>
              <span
                className={cn(
                  'ml-2 text-sm font-medium',
                  step >= s.id ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {s.title}
              </span>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    'mx-4 h-0.5 w-12',
                    step > index + 1 ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        <div className='space-y-6 py-4'>
          {/* Step 1: 基本信息 */}
          {step === 1 && (
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='activity_code'>
                  活动编码 <span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='activity_code'
                  value={activityForm.activity_code}
                  onChange={(e) =>
                    setActivityForm({
                      ...activityForm,
                      activity_code: e.target.value
                    })
                  }
                  placeholder='请输入活动编码'
                  required
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='activity_type'>
                  活动类型 <span className='text-red-500'>*</span>
                </Label>
                <Select
                  value={activityForm.activity_type}
                  onValueChange={(value) =>
                    setActivityForm({ ...activityForm, activity_type: value })
                  }
                  required
                >
                  <SelectTrigger id='activity_type'>
                    <SelectValue placeholder='请选择活动类型' />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2 md:col-span-2'>
                <Label htmlFor='name'>
                  活动名称 <span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='name'
                  value={activityForm.name}
                  onChange={(e) =>
                    setActivityForm({ ...activityForm, name: e.target.value })
                  }
                  placeholder='请输入活动名称'
                  required
                />
              </div>

              <div className='space-y-2 md:col-span-2'>
                <Label htmlFor='description'>描述</Label>
                <Textarea
                  id='description'
                  value={activityForm.description}
                  onChange={(e) =>
                    setActivityForm({
                      ...activityForm,
                      description: e.target.value
                    })
                  }
                  placeholder='请输入活动描述'
                  rows={3}
                />
              </div>

              <div className='space-y-2'>
                <Label>
                  活动开始时间 <span className='text-red-500'>*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !dates.start && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className='mr-2 h-4 w-4' />
                      {dates.start ? (
                        format(dates.start, 'yyyy-MM-dd HH:mm', {
                          locale: zhCN
                        })
                      ) : (
                        <span>选择开始时间</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0'>
                    <Calendar
                      mode='single'
                      selected={dates.start}
                      onSelect={(date) => setDates({ ...dates, start: date })}
                      locale={zhCN}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className='space-y-2'>
                <Label>
                  活动结束时间 <span className='text-red-500'>*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !dates.end && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className='mr-2 h-4 w-4' />
                      {dates.end ? (
                        format(dates.end, 'yyyy-MM-dd HH:mm', { locale: zhCN })
                      ) : (
                        <span>选择结束时间</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0'>
                    <Calendar
                      mode='single'
                      selected={dates.end}
                      onSelect={(date) => setDates({ ...dates, end: date })}
                      locale={zhCN}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className='space-y-2'>
                <Label>展示开始时间</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !dates.displayStart && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className='mr-2 h-4 w-4' />
                      {dates.displayStart ? (
                        format(dates.displayStart, 'yyyy-MM-dd HH:mm', {
                          locale: zhCN
                        })
                      ) : (
                        <span>选择展示开始时间</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0'>
                    <Calendar
                      mode='single'
                      selected={dates.displayStart}
                      onSelect={(date) =>
                        setDates({ ...dates, displayStart: date })
                      }
                      locale={zhCN}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className='space-y-2'>
                <Label>展示结束时间</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !dates.displayEnd && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className='mr-2 h-4 w-4' />
                      {dates.displayEnd ? (
                        format(dates.displayEnd, 'yyyy-MM-dd HH:mm', {
                          locale: zhCN
                        })
                      ) : (
                        <span>选择展示结束时间</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0'>
                    <Calendar
                      mode='single'
                      selected={dates.displayEnd}
                      onSelect={(date) =>
                        setDates({ ...dates, displayEnd: date })
                      }
                      locale={zhCN}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='status'>初始状态</Label>
                <Select
                  value={activityForm.status}
                  onValueChange={(value) =>
                    setActivityForm({ ...activityForm, status: value })
                  }
                >
                  <SelectTrigger id='status'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='priority'>优先级</Label>
                <Input
                  id='priority'
                  type='number'
                  value={activityForm.priority}
                  onChange={(e) =>
                    setActivityForm({
                      ...activityForm,
                      priority: parseInt(e.target.value) || 0
                    })
                  }
                  placeholder='0'
                />
              </div>

              <div className='space-y-2 md:col-span-2'>
                <Label htmlFor='icon_url'>图标 URL</Label>
                <Input
                  id='icon_url'
                  value={activityForm.icon_url}
                  onChange={(e) =>
                    setActivityForm({
                      ...activityForm,
                      icon_url: e.target.value
                    })
                  }
                  placeholder='https://...'
                />
              </div>

              <div className='space-y-2 md:col-span-2'>
                <Label htmlFor='banner_url'>横幅 URL</Label>
                <Input
                  id='banner_url'
                  value={activityForm.banner_url}
                  onChange={(e) =>
                    setActivityForm({
                      ...activityForm,
                      banner_url: e.target.value
                    })
                  }
                  placeholder='https://...'
                />
              </div>
            </div>
          )}

          {/* Step 2: 规则配置 */}
          {step === 2 && (
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='event_type'>
                  事件类型 <span className='text-red-500'>*</span>
                </Label>
                <Select
                  value={triggerForm.event_type}
                  onValueChange={(value) =>
                    setTriggerForm({ ...triggerForm, event_type: value })
                  }
                >
                  <SelectTrigger id='event_type'>
                    <SelectValue placeholder='请选择事件类型' />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='trigger_mode'>触发模式</Label>
                <Select
                  value={triggerForm.trigger_mode}
                  onValueChange={(
                    value: 'enqueue' | 'immediate' | 'suppress'
                  ) => setTriggerForm({ ...triggerForm, trigger_mode: value })}
                >
                  <SelectTrigger id='trigger_mode'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TRIGGER_MODE_LABELS).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='match_criteria'>匹配条件 (JSON)</Label>
                <Textarea
                  id='match_criteria'
                  value={matchCriteriaJson}
                  onChange={(e) => setMatchCriteriaJson(e.target.value)}
                  className='font-mono text-sm'
                  rows={6}
                  placeholder='{"min_amount": 100, "channel": "alipay"}'
                />
                <p className='text-muted-foreground text-xs'>
                  请输入有效的 JSON 格式
                </p>
              </div>

              <div className='grid gap-4 md:grid-cols-3'>
                <div className='space-y-2'>
                  <Label htmlFor='cooldown_seconds'>冷却时间（秒）</Label>
                  <Input
                    id='cooldown_seconds'
                    type='number'
                    value={triggerForm.cooldown_seconds || ''}
                    onChange={(e) =>
                      setTriggerForm({
                        ...triggerForm,
                        cooldown_seconds: e.target.value
                          ? parseInt(e.target.value)
                          : null
                      })
                    }
                    placeholder='无限制'
                    min={0}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='daily_limit_per_user'>每日上限/用户</Label>
                  <Input
                    id='daily_limit_per_user'
                    type='number'
                    value={triggerForm.daily_limit_per_user || ''}
                    onChange={(e) =>
                      setTriggerForm({
                        ...triggerForm,
                        daily_limit_per_user: e.target.value
                          ? parseInt(e.target.value)
                          : null
                      })
                    }
                    placeholder='无限制'
                    min={0}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='total_limit'>全局总上限</Label>
                  <Input
                    id='total_limit'
                    type='number'
                    value={triggerForm.total_limit || ''}
                    onChange={(e) =>
                      setTriggerForm({
                        ...triggerForm,
                        total_limit: e.target.value
                          ? parseInt(e.target.value)
                          : null
                      })
                    }
                    placeholder='无限制'
                    min={0}
                  />
                </div>
              </div>

              <div className='flex items-center space-x-2'>
                <Switch
                  id='is_active'
                  checked={triggerForm.is_active !== false}
                  onCheckedChange={(checked) =>
                    setTriggerForm({ ...triggerForm, is_active: checked })
                  }
                />
                <Label htmlFor='is_active' className='cursor-pointer'>
                  启用此规则
                </Label>
              </div>
            </div>
          )}

          {/* Step 3: 奖励配置 */}
          {step === 3 && (
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='reward_items'>奖励配置 (JSON)</Label>
                <Textarea
                  id='reward_items'
                  value={rewardItemsJson}
                  onChange={(e) => setRewardItemsJson(e.target.value)}
                  className='font-mono text-sm'
                  rows={10}
                  placeholder='{"type": "balance", "amount": 10, "currency": "CNY"}'
                />
                <p className='text-muted-foreground text-xs'>
                  请输入有效的 JSON 格式
                </p>
              </div>

              <div className='bg-muted/50 rounded-md p-4 text-sm'>
                <h4 className='mb-2 font-medium'>确认信息</h4>
                <div className='grid grid-cols-2 gap-2'>
                  <span className='text-muted-foreground'>活动名称:</span>
                  <span>{activityForm.name}</span>
                  <span className='text-muted-foreground'>事件类型:</span>
                  <span>{triggerForm.event_type}</span>
                  <span className='text-muted-foreground'>触发模式:</span>
                  <span>
                    {
                      TRIGGER_MODE_LABELS[
                        triggerForm.trigger_mode as keyof typeof TRIGGER_MODE_LABELS
                      ]
                    }
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <div className='flex w-full justify-between'>
            <Button
              type='button'
              variant='outline'
              onClick={onClose}
              disabled={loading}
            >
              取消
            </Button>
            <div className='flex gap-2'>
              {step > 1 && (
                <Button
                  type='button'
                  variant='outline'
                  onClick={handleBack}
                  disabled={loading}
                >
                  上一步
                </Button>
              )}
              <Button type='button' onClick={handleNext} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    保存中...
                  </>
                ) : step === 3 ? (
                  '完成'
                ) : (
                  <>
                    下一步
                    <ChevronRight className='ml-2 h-4 w-4' />
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
