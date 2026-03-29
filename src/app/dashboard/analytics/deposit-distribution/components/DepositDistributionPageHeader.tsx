'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DepositDistributionPageHeaderProps {
  /** 刷新回调 */
  onRefresh: () => void;
  /** 加载状态 */
  loading?: boolean;
}

/**
 * 储值分布页面头部组件
 */
export function DepositDistributionPageHeader({
  onRefresh,
  loading = false
}: DepositDistributionPageHeaderProps) {
  return (
    <div className='flex items-center justify-between'>
      <div>
        <h1 className='text-2xl font-semibold'>储值分布</h1>
        <p className='text-muted-foreground mt-1 text-sm'>
          查看储值分布数据，按金额范围统计订单数量
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
