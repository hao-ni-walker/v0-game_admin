'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  PermissionTree,
  type Permission as TreePermission
} from '@/components/permission-tree';
import type { Role, Permission } from './types';

interface PermissionAssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role | null;
  permissions: Permission[];
  selectedPermissions: number[];
  onPermissionsChange: (permissionIds: number[]) => void;
  onSave: () => void;
  loading?: boolean;
}

export function PermissionAssignDialog({
  open,
  onOpenChange,
  role,
  permissions,
  selectedPermissions,
  onPermissionsChange,
  onSave,
  loading = false
}: PermissionAssignDialogProps) {
  const handleClose = () => {
    onOpenChange(false);
  };

  const handlePermissionChange = (newIds: number[]) => {
    console.log('权限选择变化:', {
      from: selectedPermissions.length,
      to: newIds.length,
      ids: newIds
    });
    onPermissionsChange(newIds);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[80vh] max-w-4xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center justify-between'>
            <span>权限分配 - {role?.name}</span>
          </DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='text-muted-foreground pb-2 text-sm'>
            选中父权限将自动选中所有子权限，取消父权限将自动取消所有子权限
          </div>
          <div className='max-h-96 overflow-y-auto rounded-lg border p-4'>
            <PermissionTree
              permissions={permissions as TreePermission[]}
              selectedIds={selectedPermissions}
              onSelectionChange={handlePermissionChange}
              disabled={loading}
            />
          </div>
          <div className='flex items-center justify-between'>
            <div className='text-muted-foreground text-sm'>
              {selectedPermissions.length > 0
                ? `当前已选择 ${selectedPermissions.length} 个权限`
                : '尚未选择任何权限'}
            </div>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                onClick={handleClose}
                disabled={loading}
              >
                取消
              </Button>
              <Button
                onClick={onSave}
                disabled={loading || selectedPermissions.length === 0}
              >
                {loading ? '保存中...' : `保存 (${selectedPermissions.length})`}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
