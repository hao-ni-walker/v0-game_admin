'use client';
import { RefreshCw, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  onRefresh: () => void;
  onCreate: () => void;
  loading: boolean;
  canWrite: boolean;
}

export function AutomationPageHeader({ onRefresh, onCreate, loading, canWrite }: Props) {
  return (
    <div className='flex items-center justify-between'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>自动化任务</h1>
        <p className='text-muted-foreground mt-2'>
          定时执行数据库备份（转存 Cloudflare R2）、每日报表推送与自定义脚本，结果通知到 Telegram
        </p>
      </div>
      <div className='flex items-center gap-2'>
        <Button variant='outline' onClick={onRefresh} disabled={loading} className='cursor-pointer'>
          <RefreshCw className={loading ? 'mr-2 h-4 w-4 animate-spin' : 'mr-2 h-4 w-4'} />
          刷新
        </Button>
        {canWrite && (
          <Button onClick={onCreate} className='cursor-pointer'>
            <Plus className='mr-2 h-4 w-4' />
            新建任务
          </Button>
        )}
      </div>
    </div>
  );
}
