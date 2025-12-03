import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';

interface ActivityPageHeaderProps {
  onCreateActivity?: () => void;
  onRefresh: () => void;
  loading?: boolean;
}

export function ActivityPageHeader({
  onCreateActivity,
  onRefresh,
  loading
}: ActivityPageHeaderProps) {
  return (
    <div className='flex items-center justify-between'>
      <div>
        <h1 className='text-2xl font-bold'>活动管理</h1>
        <p className='text-muted-foreground'>
          管理平台活动，包括创建、编辑、上线和统计数据查看
        </p>
      </div>
      <div className='flex gap-2'>
        <Button variant='outline' onClick={onRefresh} disabled={loading}>
          <RefreshCw
            className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
          />
          刷新
        </Button>
        {onCreateActivity && (
          <Button onClick={onCreateActivity}>
            <Plus className='mr-2 h-4 w-4' />
            创建活动
          </Button>
        )}
      </div>
    </div>
  );
}
