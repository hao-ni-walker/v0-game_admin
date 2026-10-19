import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/shared/heading';

interface SystemConfigPageHeaderProps {
  onRefresh?: () => void;
  loading?: boolean;
}

/**
 * 系统配置页面头部组件 — 运行参数以业务语言展示与编辑；
 * 配置键由代码定义，不提供新增/删除。
 */
export function SystemConfigPageHeader({
  onRefresh,
  loading = false
}: SystemConfigPageHeaderProps) {
  return (
    <div className='flex items-start justify-between'>
      <Heading
        title='系统参数配置'
        description='以业务语言查看与调整运行参数：每个参数单独编辑，保存即生效（热读取）'
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
      </div>
    </div>
  );
}
