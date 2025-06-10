'use client';

import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { Role, FormData } from './types';

interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  role?: Role | null;
  formData: FormData;
  onFormDataChange: (data: FormData) => void;
  onSubmit: () => void;
  loading?: boolean;
}

export function RoleFormDialog({
  open,
  onOpenChange,
  mode,
  role,
  formData,
  onFormDataChange,
  onSubmit,
  loading = false
}: RoleFormDialogProps) {
  // 当角色数据变化时，更新表单数据
  useEffect(() => {
    if (mode === 'edit' && role) {
      onFormDataChange({
        name: role.name,
        description: role.description || ''
      });
    } else if (mode === 'create') {
      onFormDataChange({
        name: '',
        description: ''
      });
    }
  }, [mode, role, onFormDataChange]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      return;
    }
    onSubmit();
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? '新增角色' : '编辑角色'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='name'>
              角色名称 <span className='text-red-500'>*</span>
            </Label>
            <Input
              id='name'
              placeholder='请输入角色名称'
              value={formData.name}
              onChange={(e) =>
                onFormDataChange({ ...formData, name: e.target.value })
              }
              disabled={loading}
              required
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='description'>角色描述</Label>
            <Textarea
              id='description'
              placeholder='请输入角色描述（可选）'
              value={formData.description}
              onChange={(e) =>
                onFormDataChange({ ...formData, description: e.target.value })
              }
              disabled={loading}
              rows={3}
            />
          </div>
          <div className='flex justify-end gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={handleClose}
              disabled={loading}
            >
              取消
            </Button>
            <Button type='submit' disabled={loading || !formData.name.trim()}>
              {loading
                ? mode === 'create'
                  ? '创建中...'
                  : '保存中...'
                : mode === 'create'
                  ? '创建'
                  : '保存'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
