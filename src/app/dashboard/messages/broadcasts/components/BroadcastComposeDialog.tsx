'use client';

import React, { useState } from 'react';
import { Send } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  SelectValue,
} from '@/components/ui/select';

import type { BroadcastFormData } from '@/service/request';
import {
  CATEGORY_OPTIONS,
  PRIORITY_OPTIONS,
  TARGET_TYPE_OPTIONS,
} from '../constants';

interface BroadcastComposeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: BroadcastFormData) => Promise<boolean>;
}

type TargetType = BroadcastFormData['target_type'];

interface FormState {
  target_type: TargetType;
  vip_levels: string;
  user_ids: string;
  min_deposit: string;
  registered_days: string;
  category: string;
  template_type: string;
  priority: string;
  title: string;
  body: string;
  action_url: string;
  action_label: string;
}

const INITIAL_FORM: FormState = {
  target_type: 'all',
  vip_levels: '',
  user_ids: '',
  min_deposit: '',
  registered_days: '',
  category: 'system',
  template_type: 'custom',
  priority: 'normal',
  title: '',
  body: '',
  action_url: '',
  action_label: '',
};

function parseNumberList(input: string): number[] {
  return input
    .split(/[,，\s]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => Number(s))
    .filter((n) => Number.isFinite(n));
}

export function BroadcastComposeDialog({
  open,
  onOpenChange,
  onSubmit,
}: BroadcastComposeDialogProps) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  const updateField = <K extends keyof FormState>(
    key: K,
    value: FormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const buildTargetConfig = (): Record<string, unknown> => {
    switch (form.target_type) {
      case 'vip_level':
        return { vip_levels: parseNumberList(form.vip_levels) };
      case 'user_list':
        return { user_ids: parseNumberList(form.user_ids) };
      case 'condition':
        return {
          min_deposit: form.min_deposit ? Number(form.min_deposit) : undefined,
          registered_days: form.registered_days
            ? Number(form.registered_days)
            : undefined,
        };
      case 'all':
      default:
        return {};
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.body) {
      return;
    }
    if (
      form.target_type === 'vip_level' &&
      parseNumberList(form.vip_levels).length === 0
    ) {
      return;
    }
    if (
      form.target_type === 'user_list' &&
      parseNumberList(form.user_ids).length === 0
    ) {
      return;
    }
    setSubmitting(true);
    try {
      const payload: BroadcastFormData = {
        target_type: form.target_type,
        target_config: buildTargetConfig(),
        category: form.category,
        template_type: form.template_type,
        priority: form.priority,
        title: form.title,
        body: form.body,
        action_url: form.action_url || undefined,
        action_label: form.action_label || undefined,
      };
      const ok = await onSubmit(payload);
      if (ok) {
        setForm(INITIAL_FORM);
        onOpenChange(false);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isSubmitDisabled =
    submitting ||
    !form.title ||
    !form.body ||
    (form.target_type === 'vip_level' &&
      parseNumberList(form.vip_levels).length === 0) ||
    (form.target_type === 'user_list' &&
      parseNumberList(form.user_ids).length === 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[85vh] max-w-2xl'>
        <DialogHeader>
          <DialogTitle>新建群发</DialogTitle>
        </DialogHeader>

        <div className='grid max-h-[calc(85vh-10rem)] gap-4 overflow-auto pr-2'>
          <div className='space-y-2'>
            <Label>目标类型</Label>
            <Select
              value={form.target_type}
              onValueChange={(v) => updateField('target_type', v as TargetType)}
            >
              <SelectTrigger className='w-full cursor-pointer'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TARGET_TYPE_OPTIONS.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    className='cursor-pointer'
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {form.target_type === 'vip_level' && (
            <div className='space-y-2'>
              <Label>VIP 等级（逗号分隔，例如 1,2,3）</Label>
              <Input
                placeholder='1, 2, 3'
                value={form.vip_levels}
                onChange={(e) => updateField('vip_levels', e.target.value)}
              />
            </div>
          )}

          {form.target_type === 'user_list' && (
            <div className='space-y-2'>
              <Label>用户 ID 列表（逗号分隔）</Label>
              <Input
                placeholder='10001, 10002, 10003'
                value={form.user_ids}
                onChange={(e) => updateField('user_ids', e.target.value)}
              />
            </div>
          )}

          {form.target_type === 'condition' && (
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label>最小累计充值（可选）</Label>
                <Input
                  type='number'
                  placeholder='如 1000'
                  value={form.min_deposit}
                  onChange={(e) => updateField('min_deposit', e.target.value)}
                />
              </div>
              <div className='space-y-2'>
                <Label>注册天数（可选）</Label>
                <Input
                  type='number'
                  placeholder='如 30'
                  value={form.registered_days}
                  onChange={(e) =>
                    updateField('registered_days', e.target.value)
                  }
                />
              </div>
            </div>
          )}

          <div className='grid grid-cols-3 gap-4'>
            <div className='space-y-2'>
              <Label>分类</Label>
              <Select
                value={form.category}
                onValueChange={(v) => updateField('category', v)}
              >
                <SelectTrigger className='w-full cursor-pointer'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className='cursor-pointer'
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label>模板类型</Label>
              <Input
                placeholder='custom'
                value={form.template_type}
                onChange={(e) => updateField('template_type', e.target.value)}
              />
            </div>
            <div className='space-y-2'>
              <Label>优先级</Label>
              <Select
                value={form.priority}
                onValueChange={(v) => updateField('priority', v)}
              >
                <SelectTrigger className='w-full cursor-pointer'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className='cursor-pointer'
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='space-y-2'>
            <Label>标题</Label>
            <Input
              placeholder='请输入群发标题'
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
            />
          </div>

          <div className='space-y-2'>
            <Label>正文</Label>
            <Textarea
              placeholder='请输入消息正文'
              rows={5}
              value={form.body}
              onChange={(e) => updateField('body', e.target.value)}
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label>跳转路由 (可选)</Label>
              <Input
                placeholder='/dashboard/...'
                value={form.action_url}
                onChange={(e) => updateField('action_url', e.target.value)}
              />
            </div>
            <div className='space-y-2'>
              <Label>跳转文案 (可选)</Label>
              <Input
                placeholder='查看详情'
                value={form.action_label}
                onChange={(e) => updateField('action_label', e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            className='cursor-pointer'
          >
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className='cursor-pointer'
          >
            <Send className='mr-2 h-4 w-4' />
            提交审批
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
