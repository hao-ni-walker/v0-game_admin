'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { GameFlowFilters } from '../types';

interface GameFlowPageHeaderProps {
  /** 筛选条件 */
  filters: GameFlowFilters;
  /** 刷新回调 */
  onRefresh: () => void;
  /** 加载状态 */
  loading?: boolean;
}

/**
 * 交易流水页面头部组件
 */
export function GameFlowPageHeader({
  onRefresh,
  loading = false
}: GameFlowPageHeaderProps) {
  return (
    <div className='flex items-center justify-between'>
      <div>
        <h1 className='text-2xl font-semibold'>交易流水</h1>
        <p className='text-muted-foreground mt-1 text-sm'>
          查看交易流水数据，包括总交易额、盈亏和回报率等信息
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
