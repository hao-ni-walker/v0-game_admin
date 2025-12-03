'use client';

import React, { useState, useEffect } from 'react';
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
import { AdminUserDetail, UserEditFormData } from '../types';

interface UserEditModalProps {
  open: boolean;
  user: AdminUserDetail | null;
  onClose: () => void;
  onSubmit: (userId: number, data: UserEditFormData) => Promise<boolean>;
}

/**
 * 用户编辑弹窗组件
 */
export function UserEditModal({
  open,
  user,
  onClose,
  onSubmit
}: UserEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [lockAction, setLockAction] = useState<'lock' | 'unlock' | 'none'>('none');
  const [formData, setFormData] = useState<UserEditFormData>({
    status: undefined,
    vip_level: undefined,
    agent: undefined,
    direct_superior_id: undefined,
    lock: undefined
  });
  const [errors, setErrors] = useState<Partial<Record<keyof UserEditFormData, string>>>({});

  // 当用户数据变化时，更新表单
  useEffect(() => {
    if (user) {
      setFormData({
        status: user.status as any,
        vip_level: user.vip_level,
        agent: user.agent || '',
        direct_superior_id: user.direct_superior_id || undefined,
        lock: undefined
      });
      setLockAction('none');
      setErrors({});
    }
  }, [user]);

  const handleChange = (field: keyof UserEditFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 清除该字段的错误
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // 验证 direct_superior_id 不能等于当前用户 ID
    if (formData.direct_superior_id === user.id) {
      setErrors({ direct_superior_id: '直属上级不能是自己' });
      return;
    }

    setLoading(true);
    try {
      const submitData: UserEditFormData = { ...formData };

      // 处理锁定操作
      if (lockAction !== 'none') {
        submitData.lock = {
          action: lockAction,
          lock_time: lockAction === 'lock' ? new Date().toISOString() : undefined
        };
      }

      const success = await onSubmit(user.id, submitData);
      if (success) {
        onClose();
        setFormData({
          status: undefined,
          vip_level: undefined,
          agent: undefined,
          direct_superior_id: undefined,
          lock: undefined
        });
        setLockAction('none');
        setErrors({});
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>编辑用户 - {user.username}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label>账户状态</Label>
            <Select
              value={formData.status || ''}
              onValueChange={(value) => handleChange('status', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder='选择状态' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='active'>启用</SelectItem>
                <SelectItem value='disabled'>禁用</SelectItem>
                <SelectItem value='locked'>锁定</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label>VIP等级</Label>
            <Input
              type='number'
              min={0}
              max={20}
              value={formData.vip_level || ''}
              onChange={(e) =>
                handleChange('vip_level', e.target.value ? Number(e.target.value) : undefined)
              }
            />
          </div>

          <div className='space-y-2'>
            <Label>代理商</Label>
            <Input
              value={formData.agent || ''}
              onChange={(e) => handleChange('agent', e.target.value)}
              placeholder='代理商名称'
            />
          </div>

          <div className='space-y-2'>
            <Label>直属上级ID</Label>
            <Input
              type='number'
              value={formData.direct_superior_id || ''}
              onChange={(e) =>
                handleChange('direct_superior_id', e.target.value ? Number(e.target.value) : null)
              }
              placeholder='上级用户ID'
              className={errors.direct_superior_id ? 'border-destructive' : ''}
            />
            {errors.direct_superior_id && (
              <p className='text-destructive text-sm'>{errors.direct_superior_id}</p>
            )}
          </div>

            <div className='space-y-2'>
              <Label>账户锁定操作</Label>
              <div className='flex gap-2'>
                <Button
                  type='button'
                  variant={lockAction === 'unlock' ? 'default' : 'outline'}
                  onClick={() => setLockAction(lockAction === 'unlock' ? 'none' : 'unlock')}
                >
                  解锁账户
                </Button>
                <Button
                  type='button'
                  variant={lockAction === 'lock' ? 'default' : 'outline'}
                  onClick={() => setLockAction(lockAction === 'lock' ? 'none' : 'lock')}
                >
                  锁定账户
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button type='button' variant='outline' onClick={onClose}>
                取消
              </Button>
              <Button type='submit' disabled={loading}>
                {loading ? '保存中...' : '保存'}
              </Button>
            </DialogFooter>
          </form>
      </DialogContent>
    </Dialog>
  );
}

