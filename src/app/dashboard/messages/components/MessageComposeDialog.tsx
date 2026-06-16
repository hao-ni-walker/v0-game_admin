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

import type { MessageFormData } from '../types';
import { CATEGORY_OPTIONS, PRIORITY_OPTIONS } from '../constants';

interface MessageComposeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: MessageFormData) => Promise<boolean>;
}

const INITIAL_FORM: MessageFormData = {
  user_id: 0,
  category: 'system',
  template_type: 'custom',
  priority: 'normal',
  title: '',
  body: '',
  action_url: '',
  action_label: '',
};

export function MessageComposeDialog({
  open,
  onOpenChange,
  onSubmit,
}: MessageComposeDialogProps) {
  const [form, setForm] = useState<MessageFormData>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  const updateField = <K extends keyof MessageFormData>(
    key: K,
    value: MessageFormData[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.user_id || !form.title || !form.body) {
      return;
    }
    setSubmitting(true);
    try {
      const payload: MessageFormData = {
        ...form,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[85vh] max-w-2xl'>
        <DialogHeader>
          <DialogTitle>新建站内信</DialogTitle>
        </DialogHeader>

        <div className='grid max-h-[calc(85vh-10rem)] gap-4 overflow-auto pr-2'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label>用户 ID</Label>
              <Input
                type='number'
                placeholder='请输入用户 ID'
                value={form.user_id || ''}
                onChange={(e) =>
                  updateField('user_id', Number(e.target.value))
                }
              />
            </div>
            <div className='space-y-2'>
              <Label>分类</Label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  updateField('category', v as MessageFormData['category'])
                }
              >
                <SelectTrigger className='w-full cursor-pointer'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.filter((o) => o.value !== '').map((opt) => (
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

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label>优先级</Label>
              <Select
                value={form.priority}
                onValueChange={(v) =>
                  updateField('priority', v as MessageFormData['priority'])
                }
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
            <div className='space-y-2'>
              <Label>模板类型</Label>
              <Input
                placeholder='custom'
                value={form.template_type}
                onChange={(e) => updateField('template_type', e.target.value)}
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label>标题</Label>
            <Input
              placeholder='请输入消息标题'
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
                value={form.action_url || ''}
                onChange={(e) => updateField('action_url', e.target.value)}
              />
            </div>
            <div className='space-y-2'>
              <Label>跳转文案 (可选)</Label>
              <Input
                placeholder='查看详情'
                value={form.action_label || ''}
                onChange={(e) =>
                  updateField('action_label', e.target.value)
                }
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
            disabled={
              submitting || !form.user_id || !form.title || !form.body
            }
            className='cursor-pointer'
          >
            <Send className='mr-2 h-4 w-4' />
            发送
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
