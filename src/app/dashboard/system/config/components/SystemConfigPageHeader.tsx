import React from 'react';
import { Settings, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/shared/heading';

interface SystemConfigPageHeaderProps {
  onCreateConfig: () => void;
  onRefresh?: () => void;
  loading?: boolean;
}

/**
 * 系统配置页面头部组件
 */
export function SystemConfigPageHeader({
  onCreateConfig,
  onRefresh,
  loading = false
}: SystemConfigPageHeaderProps) {
  return (
    <div className='flex items-start justify-between'>
      <Heading
        title='系统配置'
        description='管理全局系统配置，包括支付、主题、功能开关等'
      />
      <div className='flex gap-2'>
        {onRefresh && (
          <Button
            variant='outline'
            size='sm'
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
        )}
        <Button onClick={onCreateConfig} size='sm'>
          <Plus className='mr-2 h-4 w-4' />
          新增配置
        </Button>
      </div>
    </div>
  );
}
