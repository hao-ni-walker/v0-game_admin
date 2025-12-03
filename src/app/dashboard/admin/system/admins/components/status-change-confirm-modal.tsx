'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Admin, AdminStatus, StatusChangeData } from '../types';
import { getAdminStatusText } from '../utils';

interface StatusChangeConfirmModalProps {
  open: boolean;
  admin: Admin | null;
  onClose: () => void;
  onSubmit: (adminId: number, data: StatusChangeData) => Promise<boolean>;
}

/**
 * 状态变更确认弹窗组件
 */
export function StatusChangeConfirmModal({
  open,
  admin,
  onClose,
  onSubmit
}: StatusChangeConfirmModalProps) {
  const [action, setAction] = useState<'status' | 'lock' | 'unlock'>('status');
  const [status, setStatus] = useState<AdminStatus>('active');
  const [lockUntil, setLockUntil] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // 初始化表单
  useEffect(() => {
    if (open && admin) {
      if (admin.status === 'locked') {
        setAction('unlock');
      } else {
        setAction('status');
        setStatus(admin.status);
      }
      setLockUntil('');
    }
  }, [open, admin]);

  /**
   * 提交
   */
  const handleSubmit = async () => {
    if (!admin) return;

    setLoading(true);
    try {
      let data: StatusChangeData = {};

      if (action === 'status') {
        data.status = status;
      } else if (action === 'lock') {
        data.lock_action = 'lock';
        if (lockUntil) {
          data.lock_until = lockUntil;
        }
      } else if (action === 'unlock') {
        data.lock_action = 'unlock';
      }

      const success = await onSubmit(admin.id, data);
      if (success) {
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  if (!admin) return null;

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确认操作</AlertDialogTitle>
          <AlertDialogDescription>
            <div className='space-y-4 mt-4'>
              <div className='rounded-lg bg-muted p-3'>
                <p className='text-sm'>
                  管理员ID：<span className='font-medium'>{admin.id}</span>
                </p>
                <p className='text-sm'>
                  用户名：<span className='font-medium'>{admin.username}</span>
                </p>
                <p className='text-sm'>
                  当前状态：<span className='font-medium'>{getAdminStatusText(admin.status)}</span>
                </p>
                {admin.is_super_admin && (
                  <p className='text-sm text-yellow-600 dark:text-yellow-400'>
                    注意：该账号为超级管理员
                  </p>
                )}
              </div>

              {/* 操作类型选择 */}
              <div className='space-y-2'>
                <Label>操作类型</Label>
                <Select
                  value={action}
                  onValueChange={(value: any) => setAction(value)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='status'>修改状态</SelectItem>
                    <SelectItem value='lock'>锁定账号</SelectItem>
                    <SelectItem value='unlock'>解锁账号</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 状态选择 */}
              {action === 'status' && (
                <div className='space-y-2'>
                  <Label>目标状态</Label>
                  <Select
                    value={status}
                    onValueChange={(value: AdminStatus) => setStatus(value)}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='active'>启用</SelectItem>
                      <SelectItem value='disabled'>禁用</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* 锁定截止时间 */}
              {action === 'lock' && (
                <div className='space-y-2'>
                  <Label>锁定截止时间（可选，留空表示永久锁定）</Label>
                  <Input
                    type='datetime-local'
                    value={lockUntil}
                    onChange={(e) => setLockUntil(e.target.value)}
                    disabled={loading}
                  />
                </div>
              )}

              {/* 风险提示 */}
              <div className='rounded-lg bg-red-50 dark:bg-red-900/20 p-3'>
                <p className='text-sm text-red-800 dark:text-red-200'>
                  {action === 'status' && status === 'disabled'
                    ? '禁用后将阻止该管理员登录系统。'
                    : action === 'lock'
                      ? '锁定后将阻止该管理员登录系统。'
                      : '解锁后该管理员可以正常登录系统。'}
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>取消</AlertDialogCancel>
          <AlertDialogAction onClick={handleSubmit} disabled={loading}>
            {loading ? '处理中...' : '确认'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

