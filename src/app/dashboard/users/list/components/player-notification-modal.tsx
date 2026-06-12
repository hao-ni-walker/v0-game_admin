'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Player, NotificationFormData } from '../types';

interface PlayerNotificationModalProps {
  open: boolean;
  player: Player | null;
  onClose: () => void;
  onSubmit: (playerId: number, data: NotificationFormData) => Promise<boolean>;
}

/**
 * 发送通知弹窗组件
 */
export function PlayerNotificationModal({
  open,
  player,
  onClose,
  onSubmit
}: PlayerNotificationModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<NotificationFormData>({
    channel: 'in_app',
    title: '',
    content: ''
  });
  const [errors, setErrors] = useState<Partial<Record<keyof NotificationFormData, string>>>({});

  const handleChange = (field: keyof NotificationFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 清除该字段的错误
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof NotificationFormData, string>> = {};

    if (!formData.title || formData.title.trim().length === 0) {
      newErrors.title = '标题不能为空';
    }

    if (!formData.content || formData.content.trim().length === 0) {
      newErrors.content = '内容不能为空';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!player || !validateForm()) return;

    setLoading(true);
    try {
      const success = await onSubmit(player.id, formData);
      if (success) {
        onClose();
        setFormData({
          channel: 'in_app',
          title: '',
          content: ''
        });
        setErrors({});
      }
    } finally {
      setLoading(false);
    }
  };

  if (!player) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>发送通知 - {player.username}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label>通知渠道</Label>
            <Select
              value={formData.channel}
              onValueChange={(value) => handleChange('channel', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='in_app'>站内信</SelectItem>
                <SelectItem value='email'>邮件</SelectItem>
                <SelectItem value='sms'>短信</SelectItem>
                <SelectItem value='push'>推送通知</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label>标题</Label>
            <Input
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder='请输入通知标题'
              className={errors.title ? 'border-destructive' : ''}
            />
            {errors.title && (
              <p className='text-destructive text-sm'>{errors.title}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label>内容</Label>
            <Textarea
              value={formData.content}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder='请输入通知内容'
              rows={6}
              className={errors.content ? 'border-destructive' : ''}
            />
            {errors.content && (
              <p className='text-destructive text-sm'>{errors.content}</p>
            )}
          </div>

          <DialogFooter>
            <Button type='button' variant='outline' onClick={onClose}>
              取消
            </Button>
            <Button type='submit' disabled={loading}>
              {loading ? '发送中...' : '发送'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

