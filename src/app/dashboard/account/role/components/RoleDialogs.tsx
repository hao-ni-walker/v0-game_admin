'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { RoleForm } from './RoleForm';
import type { RoleDialogState, RoleFormData, Role } from '../types';
import { MESSAGES } from '../constants';

interface RoleDialogsProps {
  dialogState: RoleDialogState;
  onClose: () => void;
  onCreate: (data: RoleFormData) => Promise<boolean>;
  onUpdate: (id: number, data: RoleFormData) => Promise<boolean>;
  loading?: boolean;
}

export function RoleDialogs({
  dialogState,
  onClose,
  onCreate,
  onUpdate,
  loading = false
}: RoleDialogsProps) {
  const [formData, setFormData] = useState<RoleFormData>({
    name: '',
    description: ''
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof RoleFormData, string>>
  >({});

  // 当对话框状态变化时重置表单
  useEffect(() => {
    if (dialogState.open) {
      if (dialogState.type === 'edit' && dialogState.role) {
        setFormData({
          name: dialogState.role.name,
          description: dialogState.role.description || ''
        });
      } else {
        setFormData({
          name: '',
          description: ''
        });
      }
      setErrors({});
    }
  }, [dialogState]);

  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof RoleFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = '请输入角色名称';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = '角色名称不能超过50个字符';
    }

    if (formData.description && formData.description.length > 255) {
      newErrors.description = '描述不能超过255个字符';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 提交处理
  const handleSubmit = async () => {
    if (!validateForm()) return;

    let success = false;

    if (dialogState.type === 'create') {
      success = await onCreate(formData);
    } else if (dialogState.type === 'edit' && dialogState.role) {
      success = await onUpdate(dialogState.role.id, formData);
    }

    if (success) {
      onClose();
    }
  };

  const isCreateMode = dialogState.type === 'create';
  const title = isCreateMode ? '新增角色' : '编辑角色';
  const submitText = isCreateMode ? '创建' : '保存';

  return (
    <Dialog open={dialogState.open} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className='py-4'>
          <RoleForm data={formData} onChange={setFormData} errors={errors} />
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
          <Button type='button' onClick={handleSubmit} disabled={loading}>
            {loading ? '处理中...' : submitText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
