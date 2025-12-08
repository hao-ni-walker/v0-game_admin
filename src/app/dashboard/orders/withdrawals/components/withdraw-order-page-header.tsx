'use client';

import { RefreshCw, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WithdrawOrderPageHeaderProps {
  onRefresh?: () => void;
  onBatchAudit?: () => void;
  selectedCount?: number;
  loading?: boolean;
}

export function WithdrawOrderPageHeader({
  onRefresh,
  onBatchAudit,
  selectedCount = 0,
  loading
}: WithdrawOrderPageHeaderProps) {
  return (
    <div className='flex items-center justify-between'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>提现订单</h1>
        <p className='text-muted-foreground mt-1 text-sm'>
          管理所有提现订单，支持审核、出款和风控查询
        </p>
      </div>
      <div className='flex gap-2'>
        {selectedCount > 0 && onBatchAudit && (
          <Button
            variant='default'
            size='sm'
            onClick={onBatchAudit}
            disabled={loading}
          >
            <CheckSquare className='mr-2 h-4 w-4' />
            批量审核 ({selectedCount})
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
