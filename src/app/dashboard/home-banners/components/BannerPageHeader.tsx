import React from 'react';
import { Image as ImageIcon, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/shared/heading';

interface BannerPageHeaderProps {
  onCreateBanner: () => void;
  onRefresh?: () => void;
  loading?: boolean;
}

/**
 * 轮播图页面头部组件
 */
export function BannerPageHeader({
  onCreateBanner,
  onRefresh,
  loading = false
}: BannerPageHeaderProps) {
  return (
    <div className='flex items-start justify-between'>
      <Heading
        title='轮播图管理'
        description='管理轮播图，配置显示位置、有效期、跳转链接等'
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
        <Button onClick={onCreateBanner} size='sm'>
          <Plus className='mr-2 h-4 w-4' />
          新增轮播图
        </Button>
      </div>
    </div>
  );
}
