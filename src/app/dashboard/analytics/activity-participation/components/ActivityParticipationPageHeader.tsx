'use client';

import React from 'react';
import { RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';

interface ActivityParticipationPageHeaderProps {
  onRefresh: () => void;
  loading?: boolean;
}

export function ActivityParticipationPageHeader({
  onRefresh,
  loading = false
}: ActivityParticipationPageHeaderProps) {
  return (
    <>
      <div className='flex items-start justify-between'>
        <Heading
          title='运营活动分析'
          description='查看用户参与运营活动的详细记录'
        />
        <Button
          variant='outline'
          size='sm'
          onClick={onRefresh}
          disabled={loading}
        >
          <RotateCw
            className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
          />
          刷新
        </Button>
      </div>
      <Separator />
    </>
  );
}
