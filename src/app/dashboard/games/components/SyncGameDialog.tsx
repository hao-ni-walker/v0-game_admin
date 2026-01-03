'use client';

import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { PROVIDER_OPTIONS } from '../constants';

interface SyncGameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSync: (providerCode: string) => Promise<void>;
  loading?: boolean;
}

/**
 * 同步游戏对话框组件
 */
export function SyncGameDialog({
  open,
  onOpenChange,
  onSync,
  loading = false
}: SyncGameDialogProps) {
  const [selectedProvider, setSelectedProvider] = useState<string>('');

  // 过滤掉"全部"选项，只显示实际平台
  const platformOptions = PROVIDER_OPTIONS.filter(
    (option) => option.value !== 'all'
  );

  const handleSync = async () => {
    if (!selectedProvider) {
      return;
    }
    await onSync(selectedProvider);
    // 同步成功后重置选择并关闭对话框
    setSelectedProvider('');
    onOpenChange(false);
  };

  const handleClose = () => {
    if (!loading) {
      setSelectedProvider('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>同步平台游戏</DialogTitle>
          <DialogDescription>
            选择要同步的游戏平台，系统将从该平台同步游戏数据
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <Label htmlFor='provider'>选择平台</Label>
            <Select
              value={selectedProvider}
              onValueChange={setSelectedProvider}
              disabled={loading}
            >
              <SelectTrigger id='provider'>
                <SelectValue placeholder='请选择平台' />
              </SelectTrigger>
              <SelectContent>
                {platformOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={handleClose} disabled={loading}>
            取消
          </Button>
          <Button onClick={handleSync} disabled={!selectedProvider || loading}>
            {loading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                同步中...
              </>
            ) : (
              <>
                <Download className='mr-2 h-4 w-4' />
                同步游戏
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
