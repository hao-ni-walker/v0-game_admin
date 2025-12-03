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
import { PlayerDetail, PlayerEditFormData } from '../types';

interface PlayerEditModalProps {
  open: boolean;
  player: PlayerDetail | null;
  onClose: () => void;
  onSubmit: (playerId: number, data: PlayerEditFormData) => Promise<boolean>;
}

/**
 * 玩家编辑弹窗组件
 */
export function PlayerEditModal({
  open,
  player,
  onClose,
  onSubmit
}: PlayerEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [lockAction, setLockAction] = useState<'lock' | 'unlock' | 'none'>('none');
  const [formData, setFormData] = useState<PlayerEditFormData>({
    status: undefined,
    vip_level: undefined,
    agent: undefined,
    direct_superior_id: undefined,
    lock: undefined
  });
  const [errors, setErrors] = useState<Partial<Record<keyof PlayerEditFormData, string>>>({});

  // 当玩家数据变化时，更新表单
  useEffect(() => {
    if (player) {
      // 处理 status，可能是 boolean 或 string
      let statusValue: any = player.status;
      if (typeof player.status === 'boolean') {
        statusValue = player.status ? 'active' : 'disabled';
      }
      
      setFormData({
        status: statusValue,
        vip_level: player.vip_level,
        agent: player.agent || '',
        direct_superior_id: player.direct_superior_id || undefined,
        lock: undefined
      });
      setLockAction('none');
      setErrors({});
    }
  }, [player]);

  const handleChange = (field: keyof PlayerEditFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 清除该字段的错误
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!player) return;

    // 验证 direct_superior_id 不能等于当前玩家 ID
    if (formData.direct_superior_id === player.id) {
      setErrors({ direct_superior_id: '直属上级不能是自己' });
      return;
    }

    setLoading(true);
    try {
      const submitData: PlayerEditFormData = { ...formData };

      // 处理锁定操作
      if (lockAction !== 'none') {
        submitData.lock = {
          action: lockAction,
          lock_time: lockAction === 'lock' ? new Date().toISOString() : undefined
        };
      }

      const success = await onSubmit(player.id, submitData);
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

  if (!player) return null;

  // 处理 status 显示值
  const getStatusValue = () => {
    if (!formData.status) return '';
    if (typeof formData.status === 'boolean') {
      return formData.status ? 'active' : 'disabled';
    }
    return String(formData.status);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>编辑玩家 - {player.username}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label>账户状态</Label>
            <Select
              value={getStatusValue()}
              onValueChange={(value) => {
                if (value === 'active' || value === 'disabled' || value === 'locked') {
                  handleChange('status', value);
                } else if (value === 'true' || value === 'false') {
                  handleChange('status', value === 'true');
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder='选择状态' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='active'>启用</SelectItem>
                <SelectItem value='disabled'>禁用</SelectItem>
                <SelectItem value='locked'>锁定</SelectItem>
                <SelectItem value='true'>启用（布尔）</SelectItem>
                <SelectItem value='false'>禁用（布尔）</SelectItem>
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

