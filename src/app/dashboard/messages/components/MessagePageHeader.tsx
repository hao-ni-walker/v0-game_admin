'use client';

import React from 'react';
import { Mail, RefreshCw, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Heading } from '@/components/shared/heading';

interface MessagePageHeaderProps {
  onRefresh: () => void;
  onCompose: () => void;
  loading?: boolean;
}

export function MessagePageHeader({
  onRefresh,
  onCompose,
  loading = false,
}: MessagePageHeaderProps) {
  return (
    <div className='flex items-start justify-between'>
      <div className='flex items-center gap-3'>
        <div className='bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg'>
          <Mail className='text-primary h-6 w-6' />
        </div>
        <Heading
          title='站内信管理'
          description='向用户推送系统消息并支持撤回'
        />
      </div>
      <div className='flex items-center gap-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={onCompose}
          className='cursor-pointer'
        >
          <Plus className='mr-2 h-4 w-4' />
          新建消息
        </Button>
        <Button
          variant='outline'
          size='sm'
          onClick={onRefresh}
          disabled={loading}
          className='cursor-pointer'
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
          />
          刷新
        </Button>
      </div>
    </div>
  );
}
