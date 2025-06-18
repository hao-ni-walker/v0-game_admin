'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { PermissionForm } from './PermissionForm';
import type { PermissionDialogState, PermissionFormData } from '../types';

interface PermissionDialogsProps {
  /** 对话框状态 */
  dialogState: PermissionDialogState;
  /** 关闭对话框回调 */
  onClose: () => void;
  /** 提交表单回调 */
  onSubmit: (data: PermissionFormData) => Promise<void>;
}

/**
 * 权限对话框组件
 * 包含创建和编辑权限的对话框
 */
export function PermissionDialogs({
  dialogState,
  onClose,
  onSubmit
}: PermissionDialogsProps) {
  const { type, permission, open } = dialogState;

  const handleSubmit = async (data: PermissionFormData) => {
    await onSubmit(data);
  };

  const getDialogTitle = () => {
    switch (type) {
      case 'create':
        return '新增权限';
      case 'edit':
        return '编辑权限';
      default:
        return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
        </DialogHeader>
        <PermissionForm
          initialData={permission || undefined}
          onSubmit={handleSubmit}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
