import React from 'react';
import { Package, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/shared/heading';

interface GiftPackPageHeaderProps {
  onCreateGiftPack: () => void;
  onRefresh: () => void;
  loading?: boolean;
}

/**
 * 礼包页面头部组件
 */
export function GiftPackPageHeader({
  onCreateGiftPack,
  onRefresh,
  loading = false
}: GiftPackPageHeaderProps) {
  return (
    <div className='flex items-center justify-between'>
      <div className='flex items-center gap-3'>
        <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
          <Package className='h-6 w-6 text-primary' />
        </div>
        <Heading
          title='礼包管理'
          description='管理平台道具与礼包配置'
        />
      </div>
      <div className='flex gap-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </Button>
        <Button size='sm' onClick={onCreateGiftPack}>
          <Plus className='mr-2 h-4 w-4' />
          创建礼包
        </Button>
      </div>
    </div>
  );
}
