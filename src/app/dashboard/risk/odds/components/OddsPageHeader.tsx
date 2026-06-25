'use client';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  onRefresh: () => void;
  loading: boolean;
}

export function OddsPageHeader({ onRefresh, loading }: Props) {
  return (
    <div className='flex items-center justify-between'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>收益率管理</h1>
        <p className='text-muted-foreground mt-2'>按币种管理各周期基础收益率与时间窗口活动收益率</p>
      </div>
      <Button variant='outline' onClick={onRefresh} disabled={loading} className='cursor-pointer'>
        <RefreshCw className={loading ? 'mr-2 h-4 w-4 animate-spin' : 'mr-2 h-4 w-4'} />
        刷新
      </Button>
    </div>
  );
}
