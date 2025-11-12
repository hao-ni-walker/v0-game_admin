import React from 'react';
import { Megaphone, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/shared/heading';

interface AnnouncementPageHeaderProps {
  onCreateAnnouncement: () => void;
  onRefresh: () => void;
  loading?: boolean;
}

/**
 * 公告页面头部组件
 */
export function AnnouncementPageHeader({
  onCreateAnnouncement,
  onRefresh,
  loading = false
}: AnnouncementPageHeaderProps) {
  return (
    <div className='flex items-center justify-between'>
      <div className='flex items-center gap-3'>
        <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
          <Megaphone className='h-6 w-6 text-primary' />
        </div>
        <Heading
          title='公告管理'
          description='管理系统公告、活动公告与维护公告'
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
        <Button size='sm' onClick={onCreateAnnouncement}>
          <Plus className='mr-2 h-4 w-4' />
          创建公告
        </Button>
      </div>
    </div>
  );
}
