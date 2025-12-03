'use client';

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet';
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
import { Switch } from '@/components/ui/switch';
import { ActivityAPI, CreateTriggerParams, EventActivityTrigger } from '@/service/api/activities';
import { TRIGGER_MODE_LABELS } from '../types';
import { toast } from 'sonner';

interface TriggerEditDrawerProps {
  open: boolean;
  activityId: number;
  triggerId: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

// 常见事件类型（可根据实际需求调整）
const EVENT_TYPES = [
  'deposit_created',
  'bet_settled',
  'withdrawal_created',
  'user_registered',
  'vip_level_up',
  'daily_login',
  'task_completed'
];

export function TriggerEditDrawer({
  open,
  activityId,
  triggerId,
  onClose,
  onSuccess
}: TriggerEditDrawerProps) {
  const isEdit = !!triggerId;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<CreateTriggerParams>>({
    event_type: '',
    match_criteria: {},
    trigger_mode: 'immediate',
    reward_items: {},
    cooldown_seconds: null,
    daily_limit_per_user: null,
    total_limit: null,
    priority: 0,
    is_active: true
  });
  const [matchCriteriaJson, setMatchCriteriaJson] = useState('{}');
  const [rewardItemsJson, setRewardItemsJson] = useState('{}');

  useEffect(() => {
    if (open) {
      if (triggerId) {
        // 编辑模式：加载触发规则数据
        loadTrigger();
      } else {
        // 新建模式：重置表单
        setFormData({
          event_type: '',
          match_criteria: {},
          trigger_mode: 'immediate',
          reward_items: {},
          cooldown_seconds: null,
          daily_limit_per_user: null,
          total_limit: null,
          priority: 0,
          is_active: true
        });
        setMatchCriteriaJson('{}');
        setRewardItemsJson('{}');
      }
    }
  }, [open, triggerId]);

  const loadTrigger = async () => {
    if (!triggerId) return;
    try {
      // 这里需要从触发规则列表获取，或者添加一个获取单个触发规则的 API
      // 暂时通过列表 API 获取
      const response = await ActivityAPI.getTriggers(activityId);
      if (response.code === 0) {
        const trigger = response.data.items.find((t) => t.id === triggerId);
        if (trigger) {
          setFormData({
            event_type: trigger.event_type,
            match_criteria: trigger.match_criteria,
            trigger_mode: trigger.trigger_mode,
            reward_items: trigger.reward_items,
            cooldown_seconds: trigger.cooldown_seconds,
            daily_limit_per_user: trigger.daily_limit_per_user,
            total_limit: trigger.total_limit,
            priority: trigger.priority,
            is_active: trigger.is_active
          });
          setMatchCriteriaJson(JSON.stringify(trigger.match_criteria, null, 2));
          setRewardItemsJson(JSON.stringify(trigger.reward_items, null, 2));
        }
      }
    } catch (error) {
      console.error('加载触发规则失败:', error);
      toast.error('加载触发规则失败');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.event_type) {
      toast.error('请选择事件类型');
      return;
    }

    let matchCriteria: Record<string, unknown> = {};
    let rewardItems: Record<string, unknown> = {};

    try {
      matchCriteria = JSON.parse(matchCriteriaJson);
    } catch {
      toast.error('匹配条件 JSON 格式错误');
      return;
    }

    try {
      rewardItems = JSON.parse(rewardItemsJson);
    } catch {
      toast.error('奖励配置 JSON 格式错误');
      return;
    }

    setLoading(true);
    try {
      const submitData: CreateTriggerParams = {
        activity_id: activityId,
        event_type: formData.event_type,
        match_criteria: matchCriteria,
        trigger_mode: formData.trigger_mode || 'immediate',
        reward_items: rewardItems,
        cooldown_seconds: formData.cooldown_seconds || null,
        daily_limit_per_user: formData.daily_limit_per_user || null,
        total_limit: formData.total_limit || null,
        priority: formData.priority || 0,
        is_active: formData.is_active !== false
      };

      if (isEdit && triggerId) {
        const response = await ActivityAPI.updateTrigger(triggerId, submitData);
        if (response.code === 0) {
          toast.success('更新成功');
          onSuccess();
          onClose();
        } else {
          toast.error(response.message || '更新失败');
        }
      } else {
        const response = await ActivityAPI.createTrigger(activityId, submitData);
        if (response.code === 0) {
          toast.success('创建成功');
          onSuccess();
          onClose();
        } else {
          toast.error(response.message || '创建失败');
        }
      }
    } catch (error) {
      console.error('保存失败:', error);
      toast.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className='w-full overflow-y-auto sm:max-w-lg'>
        <SheetHeader>
          <SheetTitle>{isEdit ? '编辑触发规则' : '新建触发规则'}</SheetTitle>
          <SheetDescription>
            {isEdit ? '修改触发规则配置' : '为活动创建新的触发规则'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className='mt-4 space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='event_type'>
              事件类型 <span className='text-red-500'>*</span>
            </Label>
            <Select
              value={formData.event_type}
              onValueChange={(value) =>
                setFormData({ ...formData, event_type: value })
              }
              required
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
              value={formData.trigger_mode}
              onValueChange={(value: 'enqueue' | 'immediate' | 'suppress') =>
                setFormData({ ...formData, trigger_mode: value })
              }
            >
              <SelectTrigger id='trigger_mode'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TRIGGER_MODE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
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
          </div>

          <div className='space-y-2'>
            <Label htmlFor='reward_items'>奖励配置 (JSON)</Label>
            <Textarea
              id='reward_items'
              value={rewardItemsJson}
              onChange={(e) => setRewardItemsJson(e.target.value)}
              className='font-mono text-sm'
              rows={6}
              placeholder='{"type": "balance", "amount": 10, "currency": "CNY"}'
            />
          </div>

          <div className='grid gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='cooldown_seconds'>冷却时间（秒）</Label>
              <Input
                id='cooldown_seconds'
                type='number'
                value={formData.cooldown_seconds || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cooldown_seconds: e.target.value
                      ? parseInt(e.target.value)
                      : null
                  })
                }
                placeholder='留空表示无冷却'
                min={0}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='daily_limit_per_user'>每用户每日上限</Label>
              <Input
                id='daily_limit_per_user'
                type='number'
                value={formData.daily_limit_per_user || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    daily_limit_per_user: e.target.value
                      ? parseInt(e.target.value)
                      : null
                  })
                }
                placeholder='留空表示无限制'
                min={0}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='total_limit'>全局总上限</Label>
              <Input
                id='total_limit'
                type='number'
                value={formData.total_limit || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    total_limit: e.target.value ? parseInt(e.target.value) : null
                  })
                }
                placeholder='留空表示无限制'
                min={0}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='priority'>优先级</Label>
              <Input
                id='priority'
                type='number'
                value={formData.priority}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priority: parseInt(e.target.value) || 0
                  })
                }
                placeholder='0'
              />
            </div>
          </div>

          <div className='flex items-center space-x-2'>
            <Switch
              id='is_active'
              checked={formData.is_active !== false}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_active: checked })
              }
            />
            <Label htmlFor='is_active' className='cursor-pointer'>
              是否启用
            </Label>
          </div>

          <SheetFooter>
            <Button type='button' variant='outline' onClick={onClose} disabled={loading}>
              取消
            </Button>
            <Button type='submit' disabled={loading}>
              {loading ? '保存中...' : isEdit ? '更新' : '创建'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

