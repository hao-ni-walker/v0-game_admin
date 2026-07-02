'use client';
import { RefreshCw, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  onRefresh: () => void;
  loading: boolean;
  canWrite: boolean;
  onBatch: () => void;
}

export function OddsPageHeader({ onRefresh, loading, canWrite, onBatch }: Props) {
  return (
    <div className='flex items-center justify-between'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>收益率管理</h1>
        <p className='text-muted-foreground mt-2'>按币种管理各周期基础收益率与时间窗口活动收益率</p>
      </div>
      <div className='flex items-center gap-2'>
        {canWrite && (
          <Button onClick={onBatch} disabled={loading} className='cursor-pointer'>
            <Layers className='mr-2 h-4 w-4' />
            批量修改
          </Button>
        )}
        <Button variant='outline' onClick={onRefresh} disabled={loading} className='cursor-pointer'>
          <RefreshCw className={loading ? 'mr-2 h-4 w-4 animate-spin' : 'mr-2 h-4 w-4'} />
          刷新
        </Button>
      </div>
    </div>
  );
}
