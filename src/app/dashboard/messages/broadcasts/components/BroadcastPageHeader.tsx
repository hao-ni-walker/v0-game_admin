'use client';

import React from 'react';
import { Megaphone, RefreshCw, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Heading } from '@/components/shared/heading';

interface BroadcastPageHeaderProps {
  onRefresh: () => void;
  onCompose: () => void;
  loading?: boolean;
}

export function BroadcastPageHeader({
  onRefresh,
  onCompose,
  loading = false,
}: BroadcastPageHeaderProps) {
  return (
    <div className='flex items-start justify-between'>
      <div className='flex items-center gap-3'>
        <div className='bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg'>
          <Megaphone className='text-primary h-6 w-6' />
        </div>
        <Heading
          title='群发管理'
          description='批量群发站内信并支持审批与发送跟踪'
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
          新建群发
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
