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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Game, GameFormData } from '../hgapi365/types';
import { CATEGORY_OPTIONS } from '../hgapi365/constants';

interface EditGameDialogProps {
  open: boolean;
  game: Game | null;
  onClose: () => void;
  onSubmit: (id: number, data: Partial<GameFormData>) => Promise<boolean>;
}

export function EditGameDialog({
  open,
  game,
  onClose,
  onSubmit
}: EditGameDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<GameFormData>>({});

  useEffect(() => {
    if (game) {
      setFormData({
        name: game.name,
        category: game.category,
        min_bet: typeof game.min_bet === 'number' ? game.min_bet : undefined,
        max_bet: typeof game.max_bet === 'number' ? game.max_bet : undefined,
        rtp: typeof game.rtp === 'number' ? game.rtp : undefined,
        description: game.description || '',
        icon_url: game.icon_url || '',
        is_mobile_supported: game.is_mobile_supported,
        is_demo_available: game.is_demo_available,
        has_jackpot: game.has_jackpot,
        has_bonus_game: game.has_bonus_game,
        status: game.status,
        is_featured: game.is_featured,
        is_new: game.is_new,
        sort_order: game.sort_order
      });
    }
  }, [game]);

  const handleChange = (field: keyof GameFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!game) return;

    setLoading(true);
    try {
      const success = await onSubmit(game.id, formData);
      if (success) {
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  if (!game) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='flex max-h-[90vh] max-w-2xl flex-col gap-0 p-0'>
        <DialogHeader className='shrink-0 px-6 pt-6 pb-2'>
          <DialogTitle>编辑游戏 - {game.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='flex min-h-0 flex-1 flex-col'>
          <div className='flex-1 space-y-6 overflow-y-auto px-6 py-4'>
            {/* 基本信息 */}
            <div className='space-y-4'>
              <h3 className='text-muted-foreground text-sm font-medium'>
                基本信息
              </h3>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label>游戏名称</Label>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder='请输入游戏名称'
                  />
                </div>
                <div className='space-y-2'>
                  <Label>分类</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='选择分类' />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.filter(
                        (opt) => opt.value !== 'all'
                      ).map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-2'>
                  <Label>排序权重</Label>
                  <Input
                    type='number'
                    value={formData.sort_order || 0}
                    onChange={(e) =>
                      handleChange('sort_order', Number(e.target.value))
                    }
                  />
                </div>
                <div className='space-y-2'>
                  <Label>图标 URL</Label>
                  <Input
                    value={formData.icon_url || ''}
                    onChange={(e) => handleChange('icon_url', e.target.value)}
                    placeholder='https://...'
                  />
                </div>
              </div>
              <div className='space-y-2'>
                <Label>描述</Label>
                <Textarea
                  value={formData.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder='游戏描述'
                  rows={3}
                />
              </div>
            </div>

            {/* 数值设置 */}
            <div className='space-y-4'>
              <h3 className='text-muted-foreground text-sm font-medium'>
                数值设置
              </h3>
              <div className='grid grid-cols-3 gap-4'>
                <div className='space-y-2'>
                  <Label>最小下注</Label>
                  <Input
                    type='number'
                    step='0.01'
                    value={formData.min_bet || ''}
                    onChange={(e) =>
                      handleChange('min_bet', Number(e.target.value))
                    }
                  />
                </div>
                <div className='space-y-2'>
                  <Label>最大下注</Label>
                  <Input
                    type='number'
                    step='0.01'
                    value={formData.max_bet || ''}
                    onChange={(e) =>
                      handleChange('max_bet', Number(e.target.value))
                    }
                  />
                </div>
                <div className='space-y-2'>
                  <Label>RTP (%)</Label>
                  <Input
                    type='number'
                    step='0.01'
                    value={formData.rtp || ''}
                    onChange={(e) =>
                      handleChange('rtp', Number(e.target.value))
                    }
                  />
                </div>
              </div>
            </div>

            {/* 功能特性 */}
            <div className='space-y-4'>
              <h3 className='text-muted-foreground text-sm font-medium'>
                功能特性
              </h3>
              <div className='grid grid-cols-2 gap-4'>
                <div className='flex items-center justify-between rounded-lg border p-3'>
                  <Label
                    className='cursor-pointer'
                    htmlFor='is_mobile_supported'
                  >
                    移动端支持
                  </Label>
                  <Switch
                    id='is_mobile_supported'
                    checked={formData.is_mobile_supported}
                    onCheckedChange={(checked) =>
                      handleChange('is_mobile_supported', checked)
                    }
                  />
                </div>
                <div className='flex items-center justify-between rounded-lg border p-3'>
                  <Label className='cursor-pointer' htmlFor='is_demo_available'>
                    试玩支持
                  </Label>
                  <Switch
                    id='is_demo_available'
                    checked={formData.is_demo_available}
                    onCheckedChange={(checked) =>
                      handleChange('is_demo_available', checked)
                    }
                  />
                </div>
                <div className='flex items-center justify-between rounded-lg border p-3'>
                  <Label className='cursor-pointer' htmlFor='has_jackpot'>
                    奖池功能
                  </Label>
                  <Switch
                    id='has_jackpot'
                    checked={formData.has_jackpot}
                    onCheckedChange={(checked) =>
                      handleChange('has_jackpot', checked)
                    }
                  />
                </div>
                <div className='flex items-center justify-between rounded-lg border p-3'>
                  <Label className='cursor-pointer' htmlFor='has_bonus_game'>
                    奖励游戏
                  </Label>
                  <Switch
                    id='has_bonus_game'
                    checked={formData.has_bonus_game}
                    onCheckedChange={(checked) =>
                      handleChange('has_bonus_game', checked)
                    }
                  />
                </div>
              </div>
            </div>

            {/* 状态设置 */}
            <div className='space-y-4'>
              <h3 className='text-muted-foreground text-sm font-medium'>
                状态设置
              </h3>
              <div className='grid grid-cols-3 gap-4'>
                <div className='flex items-center justify-between rounded-lg border p-3'>
                  <Label className='cursor-pointer' htmlFor='status'>
                    启用状态
                  </Label>
                  <Switch
                    id='status'
                    checked={formData.status}
                    onCheckedChange={(checked) =>
                      handleChange('status', checked)
                    }
                  />
                </div>
                <div className='flex items-center justify-between rounded-lg border p-3'>
                  <Label className='cursor-pointer' htmlFor='is_featured'>
                    推荐游戏
                  </Label>
                  <Switch
                    id='is_featured'
                    checked={formData.is_featured}
                    onCheckedChange={(checked) =>
                      handleChange('is_featured', checked)
                    }
                  />
                </div>
                <div className='flex items-center justify-between rounded-lg border p-3'>
                  <Label className='cursor-pointer' htmlFor='is_new'>
                    新游标记
                  </Label>
                  <Switch
                    id='is_new'
                    checked={formData.is_new}
                    onCheckedChange={(checked) =>
                      handleChange('is_new', checked)
                    }
                  />
                </div>
              </div>
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
