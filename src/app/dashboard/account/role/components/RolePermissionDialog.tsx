'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { X } from 'lucide-react';
import {
  PermissionTree,
  type Permission as TreePermission
} from '@/components/common/permission-tree';
import type { PermissionDialogState } from '../types';
import { MESSAGES } from '../constants';

interface RolePermissionDialogProps {
  dialogState: PermissionDialogState;
  onClose: () => void;
  onPermissionsChange: (permissionIds: number[]) => void;
  onSave: () => Promise<boolean>;
  loading?: boolean;
}

export function RolePermissionDialog({
  dialogState,
  onClose,
  onPermissionsChange,
  onSave,
  loading = false
}: RolePermissionDialogProps) {
  const handlePermissionChange = (newIds: number[]) => {
    console.log('权限选择变化:', {
      from: dialogState.selectedPermissions.length,
      to: newIds.length,
      ids: newIds
    });
    onPermissionsChange(newIds);
  };

  const handleSave = async () => {
    const success = await onSave();
    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={dialogState.open} onOpenChange={onClose}>
      <DialogContent className='flex max-h-[80vh] max-w-4xl flex-col overflow-hidden p-0'>
        <DialogHeader className='relative shrink-0 border-b px-6 py-4'>
          <DialogTitle className='flex items-center justify-between'>
            <span>权限分配 - {dialogState.role?.name}</span>
          </DialogTitle>
          <DialogClose className='ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 cursor-pointer rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none'>
            <X className='h-4 w-4' />
            <span className='sr-only'>关闭</span>
          </DialogClose>
        </DialogHeader>

        <div className='flex flex-1 flex-col overflow-hidden px-6 py-4'>
          <div className='text-muted-foreground mb-4 text-sm'>
            选中父权限将自动选中所有子权限，取消父权限将自动取消所有子权限
          </div>

          <div className='flex-1 overflow-y-auto rounded-lg border p-4'>
            {dialogState.permissions.length > 0 ? (
              <PermissionTree
                permissions={dialogState.permissions as TreePermission[]}
                selectedIds={dialogState.selectedPermissions}
                onSelectionChange={handlePermissionChange}
                disabled={loading}
              />
            ) : (
              <div className='text-muted-foreground py-8 text-center'>
                {MESSAGES.EMPTY.PERMISSIONS}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className='shrink-0 border-t px-6 py-4'>
          <div className='flex w-full items-center justify-between'>
            <div className='text-muted-foreground text-sm'>
              {dialogState.selectedPermissions.length > 0
                ? `当前已选择 ${dialogState.selectedPermissions.length} 个权限`
                : '尚未选择任何权限'}
            </div>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                onClick={onClose}
                disabled={loading}
                className='cursor-pointer'
              >
                取消
              </Button>
              <Button
                onClick={handleSave}
                disabled={
                  loading || dialogState.selectedPermissions.length === 0
                }
                className='cursor-pointer'
              >
                {loading
                  ? '保存中...'
                  : `保存 (${dialogState.selectedPermissions.length})`}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
