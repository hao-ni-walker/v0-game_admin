'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { AdminDetail, CreateAdminFormData, EditAdminFormData, AdminRole } from '../types';
import { validateEmail, validatePassword } from '../utils';
import { useAuthStore } from '@/stores/auth';

interface AdminEditModalProps {
  open: boolean;
  admin: AdminDetail | null;
  isCreate?: boolean;
  roles: AdminRole[];
  currentUserId?: number;
  onClose: () => void;
  onSubmit: (
    data: CreateAdminFormData | EditAdminFormData,
    isCreate: boolean
  ) => Promise<boolean>;
}

/**
 * 创建/编辑管理员弹窗组件
 */
export function AdminEditModal({
  open,
  admin,
  isCreate = false,
  roles,
  currentUserId,
  onClose,
  onSubmit
}: AdminEditModalProps) {
  const { hasPermission, session } = useAuthStore();
  const [formData, setFormData] = useState<Partial<CreateAdminFormData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // 检查权限
  const canEditRole = hasPermission('admins:role');
  const canEditSuperAdmin = hasPermission('admins:role') && session?.user;

  // 初始化表单数据
  useEffect(() => {
    if (open) {
      if (isCreate) {
        setFormData({
          email: '',
          username: '',
          password: '',
          role_id: undefined,
          avatar: '',
          is_super_admin: false
        });
      } else if (admin) {
        setFormData({
          email: admin.email,
          username: admin.username,
          role_id: admin.role_id,
          avatar: admin.avatar || '',
          is_super_admin: admin.is_super_admin
        });
      }
      setErrors({});
    }
  }, [open, admin, isCreate]);

  /**
   * 更新表单字段
   */
  const updateField = (key: keyof CreateAdminFormData, value: any) => {
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

    if (!formData.email) {
      newErrors.email = '邮箱不能为空';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = '邮箱格式不正确';
    }

    if (!formData.username) {
      newErrors.username = '用户名不能为空';
    } else if (formData.username.length < 3) {
      newErrors.username = '用户名长度至少3位';
    }

    if (isCreate) {
      if (!formData.password) {
        newErrors.password = '密码不能为空';
      } else {
        const passwordValidation = validatePassword(formData.password || '');
        if (!passwordValidation.valid) {
          newErrors.password = passwordValidation.message || '密码不符合要求';
        }
      }
    }

    if (!formData.role_id) {
      newErrors.role_id = '请选择角色';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * 提交表单
   */
  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const success = await onSubmit(formData as CreateAdminFormData | EditAdminFormData, isCreate);
      if (success) {
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{isCreate ? '创建管理员' : '编辑管理员'}</DialogTitle>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          {/* 邮箱 */}
          <div className='space-y-2'>
            <Label htmlFor='email'>
              邮箱 <span className='text-red-500'>*</span>
            </Label>
            <Input
              id='email'
              type='email'
              placeholder='请输入邮箱'
              value={formData.email || ''}
              onChange={(e) => updateField('email', e.target.value)}
              disabled={loading}
            />
            {errors.email && (
              <p className='text-sm text-red-500'>{errors.email}</p>
            )}
          </div>

          {/* 用户名 */}
          <div className='space-y-2'>
            <Label htmlFor='username'>
              用户名 <span className='text-red-500'>*</span>
            </Label>
            <Input
              id='username'
              placeholder='请输入用户名'
              value={formData.username || ''}
              onChange={(e) => updateField('username', e.target.value)}
              disabled={loading}
            />
            {errors.username && (
              <p className='text-sm text-red-500'>{errors.username}</p>
            )}
          </div>

          {/* 密码（仅创建时） */}
          {isCreate && (
            <div className='space-y-2'>
              <Label htmlFor='password'>
                密码 <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='password'
                type='password'
                placeholder='请输入密码（至少8位，包含大小写字母、数字和特殊字符）'
                value={formData.password || ''}
                onChange={(e) => updateField('password', e.target.value)}
                disabled={loading}
              />
              {errors.password && (
                <p className='text-sm text-red-500'>{errors.password}</p>
              )}
            </div>
          )}

          {/* 角色 */}
          <div className='space-y-2'>
            <Label htmlFor='role_id'>
              角色 <span className='text-red-500'>*</span>
            </Label>
            <Select
              value={formData.role_id ? String(formData.role_id) : ''}
              onValueChange={(value) => updateField('role_id', Number(value))}
              disabled={loading || !canEditRole}
            >
              <SelectTrigger id='role_id'>
                <SelectValue placeholder='请选择角色' />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={String(role.id)}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role_id && (
              <p className='text-sm text-red-500'>{errors.role_id}</p>
            )}
          </div>

          {/* 头像 */}
          <div className='space-y-2'>
            <Label htmlFor='avatar'>头像URL</Label>
            <Input
              id='avatar'
              placeholder='请输入头像URL（可选）'
              value={formData.avatar || ''}
              onChange={(e) => updateField('avatar', e.target.value)}
              disabled={loading}
            />
          </div>

          {/* 超管标识 */}
          {canEditSuperAdmin && (
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='is_super_admin'
                checked={formData.is_super_admin || false}
                onCheckedChange={(checked) =>
                  updateField('is_super_admin', checked)
                }
                disabled={loading}
              />
              <Label
                htmlFor='is_super_admin'
                className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
              >
                设为超级管理员
              </Label>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={onClose} disabled={loading}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? '提交中...' : '确定'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

