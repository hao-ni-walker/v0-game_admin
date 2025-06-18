'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
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
      <DialogContent className='max-h-[80vh] max-w-4xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center justify-between'>
            <span>权限分配 - {dialogState.role?.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='text-muted-foreground pb-2 text-sm'>
            选中父权限将自动选中所有子权限，取消父权限将自动取消所有子权限
          </div>

          <div className='max-h-96 overflow-y-auto rounded-lg border p-4'>
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

          <div className='flex items-center justify-between'>
            <div className='text-muted-foreground text-sm'>
              {dialogState.selectedPermissions.length > 0
                ? `当前已选择 ${dialogState.selectedPermissions.length} 个权限`
                : '尚未选择任何权限'}
            </div>
            <div className='flex gap-2'>
              <Button variant='outline' onClick={onClose} disabled={loading}>
                取消
              </Button>
              <Button
                onClick={handleSave}
                disabled={
                  loading || dialogState.selectedPermissions.length === 0
                }
              >
                {loading
                  ? '保存中...'
                  : `保存 (${dialogState.selectedPermissions.length})`}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
