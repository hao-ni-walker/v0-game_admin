'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OperationReportPageHeaderProps {
  /** 刷新回调 */
  onRefresh: () => void;
  /** 加载状态 */
  loading?: boolean;
}

/**
 * 运营报表页面头部组件
 */
export function OperationReportPageHeader({
  onRefresh,
  loading = false
}: OperationReportPageHeaderProps) {
  return (
    <div className='flex items-center justify-between'>
      <div>
        <h1 className='text-2xl font-semibold'>运营报表</h1>
        <p className='text-muted-foreground mt-1 text-sm'>
          按天数统计运营数据，包括访问人数、注册人数、充值、提现等关键指标
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
