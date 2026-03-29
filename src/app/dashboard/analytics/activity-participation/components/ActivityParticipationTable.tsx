'use client';

import React from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

import { UserActivityRecord } from '../types';

interface ActivityParticipationTableProps {
  data: UserActivityRecord[];
  loading?: boolean;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '-';
  try {
    return format(new Date(dateStr), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN });
  } catch {
    return dateStr;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'completed':
      return (
        <Badge variant='default' className='bg-green-500'>
          已完成
        </Badge>
      );
    case 'ongoing':
      return (
        <Badge variant='secondary' className='bg-blue-500 text-white'>
          进行中
        </Badge>
      );
    case 'expired':
      return (
        <Badge variant='outline' className='text-gray-500'>
          已过期
        </Badge>
      );
    default:
      return <Badge variant='outline'>{status}</Badge>;
  }
}

export function ActivityParticipationTable({
  data,
  loading = false
}: ActivityParticipationTableProps) {
  if (loading && data.length === 0) {
    return (
      <Card>
        <div className='space-y-3 p-4'>
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className='h-12 w-full' />
          ))}
        </div>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <div className='flex h-64 items-center justify-center'>
          <p className='text-muted-foreground text-sm'>暂无数据</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className='overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>用户</TableHead>
              <TableHead>活动</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>参与次数</TableHead>
              <TableHead>奖励信息</TableHead>
              <TableHead>首次参与时间</TableHead>
              <TableHead>最后参与时间</TableHead>
              <TableHead>完成时间</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((record, index) => (
              <TableRow
                key={`${record.user_id}-${record.activity_id}-${index}`}
              >
                <TableCell>
                  <div className='flex flex-col'>
                    <span className='font-medium'>{record.username}</span>
                    <span className='text-muted-foreground text-xs'>
                      ID: {record.user_id}
                    </span>
                    <span className='text-muted-foreground text-xs'>
                      {record.email}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className='flex flex-col'>
                    <span className='font-medium'>
                      {record.activity_display_name}
                    </span>
                    <span className='text-muted-foreground text-xs'>
                      ID: {record.activity_id}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(record.status)}</TableCell>
                <TableCell>{record.participation_count}</TableCell>
                <TableCell>
                  {record.rewards_claimed ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className='max-w-[150px] cursor-help truncate text-sm'>
                            {JSON.stringify(record.rewards_claimed)}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <pre className='text-xs whitespace-pre-wrap'>
                            {JSON.stringify(record.rewards_claimed, null, 2)}
                          </pre>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  {formatDate(record.first_participation_time)}
                </TableCell>
                <TableCell>
                  {formatDate(record.last_participation_time)}
                </TableCell>
                <TableCell>{formatDate(record.completed_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
