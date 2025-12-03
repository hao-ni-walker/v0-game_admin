'use client';

import React, { useState } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { PasswordResetFormData } from '../types';
import { validatePassword } from '../utils';

interface PasswordResetModalProps {
  open: boolean;
  adminId: number | null;
  adminName?: string;
  onClose: () => void;
  onSubmit: (adminId: number, data: PasswordResetFormData) => Promise<boolean>;
}

/**
 * 密码重置弹窗组件
 */
export function PasswordResetModal({
  open,
  adminId,
  adminName,
  onClose,
  onSubmit
}: PasswordResetModalProps) {
  const [formData, setFormData] = useState<PasswordResetFormData>({
    new_password: '',
    require_logout: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // 重置表单
  React.useEffect(() => {
    if (open) {
      setFormData({
        new_password: '',
        require_logout: false
      });
      setErrors({});
    }
  }, [open]);

  /**
   * 更新表单字段
   */
  const updateField = (key: keyof PasswordResetFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    // 清除该字段的错误
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  /**
   * 表单验证
   */
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.new_password) {
      newErrors.new_password = '新密码不能为空';
    } else {
      const passwordValidation = validatePassword(formData.new_password);
      if (!passwordValidation.valid) {
        newErrors.new_password = passwordValidation.message || '密码不符合要求';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * 提交表单
   */
  const handleSubmit = async () => {
    if (!validate() || !adminId) {
      return;
    }

    setLoading(true);
    try {
      const success = await onSubmit(adminId, formData);
      if (success) {
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>重置密码</DialogTitle>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          {adminName && (
            <div className='rounded-lg bg-muted p-3'>
              <p className='text-sm text-muted-foreground'>
                管理员：<span className='font-medium'>{adminName}</span>
              </p>
            </div>
          )}

          {/* 新密码 */}
          <div className='space-y-2'>
            <Label htmlFor='new_password'>
              新密码 <span className='text-red-500'>*</span>
            </Label>
            <Input
              id='new_password'
              type='password'
              placeholder='请输入新密码（至少8位，包含大小写字母、数字和特殊字符）'
              value={formData.new_password}
              onChange={(e) => updateField('new_password', e.target.value)}
              disabled={loading}
            />
            {errors.new_password && (
              <p className='text-sm text-red-500'>{errors.new_password}</p>
            )}
          </div>

          {/* 使会话失效 */}
          <div className='flex items-center space-x-2'>
            <Checkbox
              id='require_logout'
              checked={formData.require_logout}
              onCheckedChange={(checked) =>
                updateField('require_logout', checked)
              }
              disabled={loading}
            />
            <Label
              htmlFor='require_logout'
              className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
            >
              使该管理员所有会话失效
            </Label>
          </div>

          <div className='rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-3'>
            <p className='text-sm text-yellow-800 dark:text-yellow-200'>
              重置成功后，请将新密码安全告知该管理员。
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={onClose} disabled={loading}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? '重置中...' : '确定重置'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

