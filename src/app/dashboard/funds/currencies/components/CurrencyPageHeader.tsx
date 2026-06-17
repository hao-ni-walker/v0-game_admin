'use client';
import { RefreshCw, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  onRefresh: () => void;
  onCreate: () => void;
  loading: boolean;
  canWrite: boolean;
}

export function CurrencyPageHeader({ onRefresh, onCreate, loading, canWrite }: Props) {
  return (
    <div className='flex items-center justify-between'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>币种管理</h1>
        <p className='text-muted-foreground mt-2'>管理可交易的 Web3 资产、充提开关与排序</p>
      </div>
      <div className='flex items-center gap-2'>
        <Button variant='outline' onClick={onRefresh} disabled={loading} className='cursor-pointer'>
          <RefreshCw className={loading ? 'mr-2 h-4 w-4 animate-spin' : 'mr-2 h-4 w-4'} />
          刷新
        </Button>
        {canWrite && (
          <Button onClick={onCreate} className='cursor-pointer'>
            <Plus className='mr-2 h-4 w-4' />
            新增币种
          </Button>
        )}
      </div>
    </div>
  );
}
