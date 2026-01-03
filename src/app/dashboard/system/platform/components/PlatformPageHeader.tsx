import React from 'react';
import { Server, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/shared/heading';

interface PlatformPageHeaderProps {
  onRefresh?: () => void;
  loading?: boolean;
}

/**
 * 平台页面头部组件
 */
export function PlatformPageHeader({
  onRefresh,
  loading = false
}: PlatformPageHeaderProps) {
  return (
    <div className='flex items-start justify-between'>
      <Heading
        title='平台管理'
        description='管理系统平台列表，包括平台名称和描述信息'
      />
      <div className='flex gap-2'>
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
