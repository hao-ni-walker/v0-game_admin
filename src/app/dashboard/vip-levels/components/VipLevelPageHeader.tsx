import React from 'react';
import { Plus, RefreshCw, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/table/page-header';

interface VipLevelPageHeaderProps {
  onCreateVipLevel: () => void;
  onRefresh: () => void;
  loading?: boolean;
}

/**
 * VIP等级页面头部组件
 */
export function VipLevelPageHeader({
  onCreateVipLevel,
  onRefresh,
  loading = false
}: VipLevelPageHeaderProps) {
  return (
    <PageHeader title='VIP 等级管理' description='管理用户 VIP 等级配置、升级奖励、每日奖励及权益设置'>
      <div className='flex gap-2'>
        <Button variant='outline' size='sm' onClick={onRefresh} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </Button>
        <Button size='sm' onClick={onCreateVipLevel}>
          <Plus className='mr-2 h-4 w-4' />
          创建等级
        </Button>
      </div>
    </PageHeader>
  );
}
