'use client';

import { RefreshCw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DepositOrderPageHeaderProps {
  onRefresh?: () => void;
  onChainCheck?: () => void;
  loading?: boolean;
}

export function DepositOrderPageHeader({
  onRefresh,
  onChainCheck,
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
      <div className='flex items-center gap-2'>
        {onChainCheck && (
          <Button variant='outline' size='sm' onClick={onChainCheck}>
            <Search className='mr-2 h-4 w-4' />
            链上查证
          </Button>
        )}
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
    </div>
  );
}
