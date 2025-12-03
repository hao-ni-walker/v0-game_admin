'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
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
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AdminUserDetail, WalletAdjustFormData, WalletField, AdjustType } from '../types';
import { formatCurrency } from '../utils';

interface WalletAdjustModalProps {
  open: boolean;
  user: AdminUserDetail | null;
  onClose: () => void;
  onSubmit: (
    userId: number,
    data: WalletAdjustFormData
  ) => Promise<boolean>;
  onRefresh: (userId: number) => Promise<AdminUserDetail | null>;
}

/**
 * 钱包调整弹窗组件
 */
export function WalletAdjustModal({
  open,
  user,
  onClose,
  onSubmit,
  onRefresh
}: WalletAdjustModalProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState<WalletAdjustFormData>({
    field: 'balance',
    type: 'add',
    amount: 0,
    reason: '',
    version: 0
  });
  const [errors, setErrors] = useState<Partial<Record<keyof WalletAdjustFormData, string>>>({});

  // 当用户数据变化时，更新表单
  useEffect(() => {
    if (user?.wallet) {
      setFormData({
        field: 'balance',
        type: 'add',
        amount: 0,
        reason: '',
        version: user.wallet.version
      });
      setErrors({});
    }
  }, [user]);

  const handleChange = (field: keyof WalletAdjustFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 清除该字段的错误
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof WalletAdjustFormData, string>> = {};

    if (formData.amount <= 0) {
      newErrors.amount = '金额必须大于0';
    }

    if (!formData.reason || formData.reason.trim().length === 0) {
      newErrors.reason = '原因不能为空';
    } else if (formData.reason.length > 200) {
      newErrors.reason = '原因不能超过200个字符';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitClick = () => {
    if (validateForm()) {
      setShowConfirm(true);
    }
  };

  const handleConfirm = async () => {
    if (!user) return;

    setShowConfirm(false);
    setLoading(true);
    try {
      const success = await onSubmit(user.id, formData);
      if (success) {
        // 刷新用户数据
        await onRefresh(user.id);
        onClose();
        setFormData({
          field: 'balance',
          type: 'add',
          amount: 0,
          reason: '',
          version: user.wallet?.version || 0
        });
        setErrors({});
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const getFieldLabel = (field: WalletField): string => {
    switch (field) {
      case 'balance':
        return '可用余额';
      case 'frozen_balance':
        return '冻结余额';
      case 'bonus':
        return '赠送金额';
      default:
        return field;
    }
  };

  const getCurrentValue = (): number => {
    switch (formData.field) {
      case 'balance':
        return user.wallet?.balance || 0;
      case 'frozen_balance':
        return user.wallet?.frozen_balance || 0;
      case 'bonus':
        return user.wallet?.bonus || 0;
      default:
        return 0;
    }
  };

  const getNewValue = (): number => {
    const current = getCurrentValue();
    if (formData.type === 'add') {
      return current + formData.amount;
    } else {
      return Math.max(0, current - formData.amount);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>调整钱包余额 - {user.username}</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmitClick();
            }}
            className='space-y-4'
          >
            <div className='space-y-2'>
              <Label>调整字段</Label>
              <Select
                value={formData.field}
                onValueChange={(value) => handleChange('field', value as WalletField)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='balance'>可用余额</SelectItem>
                  <SelectItem value='frozen_balance'>冻结余额</SelectItem>
                  <SelectItem value='bonus'>赠送金额</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label>调整类型</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleChange('type', value as AdjustType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='add'>增加</SelectItem>
                  <SelectItem value='subtract'>减少</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label>金额</Label>
              <Input
                type='number'
                step='0.01'
                min='0.01'
                value={formData.amount || ''}
                onChange={(e) =>
                  handleChange('amount', e.target.value ? Number(e.target.value) : 0)
                }
                placeholder='请输入金额'
                className={errors.amount ? 'border-destructive' : ''}
              />
              {errors.amount && (
                <p className='text-destructive text-sm'>{errors.amount}</p>
              )}
            </div>

            <div className='space-y-2'>
              <Label>原因</Label>
              <Textarea
                value={formData.reason}
                onChange={(e) => handleChange('reason', e.target.value)}
                placeholder='请输入调整原因（必填，1-200字符）'
                rows={4}
                className={errors.reason ? 'border-destructive' : ''}
              />
              {errors.reason && (
                <p className='text-destructive text-sm'>{errors.reason}</p>
              )}
            </div>

            {/* 预览信息 */}
            <div className='rounded-lg border bg-muted/50 p-4 space-y-2'>
              <div className='text-sm font-medium'>调整预览</div>
              <div className='grid grid-cols-2 gap-2 text-sm'>
                <div>
                  <span className='text-muted-foreground'>当前{getFieldLabel(formData.field)}：</span>
                  <span className='ml-2 font-mono'>{formatCurrency(getCurrentValue())}</span>
                </div>
                <div>
                  <span className='text-muted-foreground'>调整后：</span>
                  <span className='ml-2 font-mono font-semibold'>
                    {formatCurrency(getNewValue())}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type='button' variant='outline' onClick={onClose}>
                取消
              </Button>
              <Button type='submit' disabled={loading}>
                {loading ? '提交中...' : '提交'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 二次确认对话框 */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认调整钱包余额</AlertDialogTitle>
            <AlertDialogDescription>
              <div className='space-y-2 mt-2'>
                <p>
                  <strong>用户ID：</strong>
                  {user.id}
                </p>
                <p>
                  <strong>用户名：</strong>
                  {user.username}
                </p>
                <p>
                  <strong>调整字段：</strong>
                  {getFieldLabel(formData.field)}
                </p>
                <p>
                  <strong>调整类型：</strong>
                  {formData.type === 'add' ? '增加' : '减少'}
                </p>
                <p>
                  <strong>调整金额：</strong>
                  <span className='font-mono'>{formatCurrency(formData.amount)}</span>
                </p>
                <p>
                  <strong>调整原因：</strong>
                  {formData.reason}
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>确认</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

