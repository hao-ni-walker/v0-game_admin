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
  const [formData, setFormData] = useState<PlayerEditFormData>({
    status: undefined,
    vip_level: undefined,
    agent: undefined,
    direct_superior_id: undefined,
    lock: undefined
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof PlayerEditFormData, string>>
  >({});

  // 当玩家数据变化时，更新表单
  useEffect(() => {
    if (player) {
      // 处理 status，可能是 boolean 或 string
      let statusValue: any = player.status;
      if (typeof player.status === 'boolean') {
        statusValue = player.status ? 'active' : 'disabled';
      }

      // 获取 VIP 等级，优先从 vip_info 对象获取
      const vipInfo = (player as any).vip_info;
      const vipLevel =
        vipInfo?.vip_level ?? vipInfo?.level ?? player.vip_level ?? 0;

      setFormData({
        status: statusValue,
        vip_level: vipLevel,
        agent: player.agent || '',
        direct_superior_id: player.direct_superior_id || undefined,
        lock: undefined
      });
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
      const success = await onSubmit(player.id, formData);
      if (success) {
        onClose();
        setFormData({
          status: undefined,
          vip_level: undefined,
          agent: undefined,
          direct_superior_id: undefined,
          lock: undefined
        });
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
      <DialogContent className='flex max-h-[90vh] max-w-2xl flex-col gap-0 p-0'>
        <DialogHeader className='shrink-0 px-6 pt-6 pb-2'>
          <DialogTitle>编辑玩家 - {player.username}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='flex min-h-0 flex-1 flex-col'>
          {/* 可滚动表单区域 */}
          <div className='flex-1 space-y-4 overflow-y-auto px-6 py-4'>
            <div className='space-y-2'>
              <Label>账户状态</Label>
              <Select
                value={getStatusValue()}
                onValueChange={(value) => {
                  handleChange('status', value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder='选择状态' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='active'>启用</SelectItem>
                  <SelectItem value='disabled'>关闭</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label>VIP等级</Label>
              <Input
                type='number'
                min={0}
                max={20}
                value={formData.vip_level ?? ''}
                onChange={(e) =>
                  handleChange(
                    'vip_level',
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                placeholder='0-20'
              />
            </div>

            <div className='space-y-2'>
              <Label>代理商</Label>
              <Input
                value={formData.agent ?? ''}
                onChange={(e) => handleChange('agent', e.target.value)}
                placeholder='代理商名称'
              />
            </div>

            <div className='space-y-2'>
              <Label>直属上级ID</Label>
              <Input
                type='number'
                value={formData.direct_superior_id ?? ''}
                onChange={(e) =>
                  handleChange(
                    'direct_superior_id',
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                placeholder='上级用户ID'
                className={
                  errors.direct_superior_id ? 'border-destructive' : ''
                }
              />
              {errors.direct_superior_id && (
                <p className='text-destructive text-sm'>
                  {errors.direct_superior_id}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className='shrink-0 border-t px-6 py-4'>
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
