'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UserRetentionPageHeaderProps {
  /** 刷新回调 */
  onRefresh: () => void;
  /** 加载状态 */
  loading?: boolean;
}

/**
 * 用户留存页面头部组件
 */
export function UserRetentionPageHeader({
  onRefresh,
  loading = false
}: UserRetentionPageHeaderProps) {
  return (
    <div className='flex items-center justify-between'>
      <div>
        <h1 className='text-2xl font-semibold'>用户留存</h1>
        <p className='text-muted-foreground mt-1 text-sm'>
          查看用户留存数据，包括注册人数、充值人数及各日留存率等信息
        </p>
      </div>
      <Button
        variant='outline'
        onClick={onRefresh}
        disabled={loading}
        className='gap-2'
      >
        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        刷新
      </Button>
    </div>
  );
}
