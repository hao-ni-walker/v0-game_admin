'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Banner, BannerFormData } from '../types';
import { POSITION_OPTIONS, TARGET_OPTIONS, STATUS_OPTIONS } from '../constants';

interface BannerEditDialogProps {
  open: boolean;
  banner: Banner | null;
  onClose: () => void;
  onSubmit: (data: BannerFormData & { version: number }) => Promise<boolean>;
  loading?: boolean;
}

export function BannerEditDialog({
  open,
  banner,
  onClose,
  onSubmit,
  loading = false
}: BannerEditDialogProps) {
  const [formData, setFormData] = useState<BannerFormData>({
    title: '',
    image_url: '',
    link_url: '',
    target: '_self',
    page: '',
    position: 'home',
    sort_order: 0,
    start_time: '',
    end_time: '',
    status: 1,
    disabled: false
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof BannerFormData, string>>
  >({});

  // 当 banner 变化时，更新表单数据
  useEffect(() => {
    if (banner) {
      setFormData({
        title: banner.title || '',
        image_url: banner.image_url || '',
        link_url: banner.link_url || '',
        target: banner.target || '_self',
        page: banner.page || '',
        position: banner.position || 'home',
        sort_order: banner.sort_order || 0,
        start_time: banner.start_time
          ? new Date(banner.start_time).toISOString().slice(0, 16)
          : '',
        end_time: banner.end_time
          ? new Date(banner.end_time).toISOString().slice(0, 16)
          : '',
        status: banner.status ?? 1,
        disabled: banner.disabled || false
      });
      setErrors({});
    }
  }, [banner]);

  const handleChange = (field: keyof BannerFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 清除该字段的错误
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof BannerFormData, string>> = {};

    if (!formData.image_url.trim()) {
      newErrors.image_url = '图片URL不能为空';
    }

    if (!formData.position) {
      newErrors.position = '请选择位置';
    }

    if (formData.sort_order < 0) {
      newErrors.sort_order = '排序值不能小于0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate() || !banner) {
      return;
    }

    const submitData: BannerFormData & { version: number } = {
      ...formData,
      version: banner.version
    };

    // 处理时间格式
    if (submitData.start_time) {
      submitData.start_time = new Date(submitData.start_time).toISOString();
    } else {
      delete submitData.start_time;
    }

    if (submitData.end_time) {
      submitData.end_time = new Date(submitData.end_time).toISOString();
    } else {
      delete submitData.end_time;
    }

    const success = await onSubmit(submitData);
    if (success) {
      onClose();
    }
  };

  if (!banner) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>编辑轮播图</DialogTitle>
          <DialogDescription>修改轮播图信息</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* 名称 */}
          <div className='space-y-2'>
            <Label htmlFor='title'>名称</Label>
            <Input
              id='title'
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder='请输入名称'
              disabled={loading}
            />
          </div>

          {/* 图片URL */}
          <div className='space-y-2'>
            <Label htmlFor='image_url'>
              图片URL <span className='text-red-500'>*</span>
            </Label>
            <Input
              id='image_url'
              value={formData.image_url}
              onChange={(e) => handleChange('image_url', e.target.value)}
              placeholder='请输入图片URL'
              disabled={loading}
              required
            />
            {errors.image_url && (
              <p className='text-sm text-red-500'>{errors.image_url}</p>
            )}
            {formData.image_url && (
              <div className='relative mt-2 h-32 w-auto overflow-hidden rounded-md border'>
                <Image
                  src={formData.image_url}
                  alt='预览'
                  width={400}
                  height={128}
                  className='h-full w-auto object-contain'
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                  unoptimized
                />
              </div>
            )}
          </div>

          {/* 跳转地址 */}
          <div className='space-y-2'>
            <Label htmlFor='link_url'>跳转地址</Label>
            <Input
              id='link_url'
              value={formData.link_url}
              onChange={(e) => handleChange('link_url', e.target.value)}
              placeholder='请输入跳转地址'
              disabled={loading}
            />
          </div>

          {/* 跳转方式 */}
          <div className='space-y-2'>
            <Label htmlFor='target'>跳转方式</Label>
            <Select
              value={formData.target}
              onValueChange={(value) =>
                handleChange('target', value as '_self' | '_blank')
              }
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder='选择跳转方式' />
              </SelectTrigger>
              <SelectContent>
                {TARGET_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 页面 */}
          <div className='space-y-2'>
            <Label htmlFor='page'>页面</Label>
            <Input
              id='page'
              value={formData.page}
              onChange={(e) => handleChange('page', e.target.value)}
              placeholder='请输入页面'
              disabled={loading}
            />
          </div>

          {/* 位置 */}
          <div className='space-y-2'>
            <Label htmlFor='position'>
              位置 <span className='text-red-500'>*</span>
            </Label>
            <Select
              value={formData.position}
              onValueChange={(value) => handleChange('position', value)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder='选择位置' />
              </SelectTrigger>
              <SelectContent>
                {POSITION_OPTIONS.filter((opt) => opt.value !== 'all').map(
                  (option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            {errors.position && (
              <p className='text-sm text-red-500'>{errors.position}</p>
            )}
          </div>

          {/* 排序 */}
          <div className='space-y-2'>
            <Label htmlFor='sort_order'>排序</Label>
            <Input
              id='sort_order'
              type='number'
              min={0}
              value={formData.sort_order}
              onChange={(e) =>
                handleChange('sort_order', parseInt(e.target.value) || 0)
              }
              placeholder='请输入排序值'
              disabled={loading}
            />
            {errors.sort_order && (
              <p className='text-sm text-red-500'>{errors.sort_order}</p>
            )}
          </div>

          {/* 展示时间 */}
          <div className='grid gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='start_time'>开始时间</Label>
              <Input
                id='start_time'
                type='datetime-local'
                value={formData.start_time}
                onChange={(e) => handleChange('start_time', e.target.value)}
                disabled={loading}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='end_time'>结束时间</Label>
              <Input
                id='end_time'
                type='datetime-local'
                value={formData.end_time}
                onChange={(e) => handleChange('end_time', e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* 状态 */}
          <div className='space-y-2'>
            <Label htmlFor='status'>状态</Label>
            <Select
              value={String(formData.status)}
              onValueChange={(value) =>
                handleChange('status', parseInt(value) as 0 | 1)
              }
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder='选择状态' />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.filter((opt) => opt.value !== 'all').map(
                  (option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={onClose}
              disabled={loading}
            >
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
