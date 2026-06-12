'use client';

import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DepositOrderPageHeaderProps {
  onRefresh?: () => void;
  loading?: boolean;
}

export function DepositOrderPageHeader({
  onRefresh,
  loading
}: DepositOrderPageHeaderProps) {
  return (
    <div className='flex items-center justify-between'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>储值订单</h1>
        <p className='text-muted-foreground mt-1 text-sm'>
          管理所有储值订单，支持筛选、查询和导出
        </p>
      </div>
      {onRefresh && (
        <Button
          variant='outline'
          size='sm'
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
          />
          刷新
        </Button>
      )}
    </div>
  );
}
