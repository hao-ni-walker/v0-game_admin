'use client';

import React from 'react';
import { Eye, RotateCcw } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/table/data-table';
import {
  ActionDropdown,
  type ActionItem,
} from '@/components/table/action-dropdown';

import type { Message, MessagePagination } from '../types';
import { CATEGORY_COLORS, PRIORITY_COLORS, STATUS_COLORS } from '../constants';

interface MessageTableProps {
  data: Message[];
  loading?: boolean;
  pagination: MessagePagination;
  onView: (msg: Message) => void;
  onRecall: (msg: Message) => void;
}

export function MessageTable({
  data,
  loading = false,
  onView,
  onRecall,
}: MessageTableProps) {
  const columns = [
    {
      key: 'message_id',
      title: '消息ID',
      className: 'w-[140px] font-mono text-xs',
      render: (value: string) => (
        <div
          className='max-w-[140px] truncate font-mono text-xs'
          title={value}
        >
          {value}
        </div>
      ),
    },
    {
      key: 'category',
      title: '分类',
      className: 'w-[90px]',
      render: (value: string) => (
        <Badge className={CATEGORY_COLORS[value] || 'bg-gray-100 text-gray-700'}>
          {value}
        </Badge>
      ),
    },
    {
      key: 'title',
      title: '标题',
      className: 'min-w-0 flex-1',
      render: (value: string) => (
        <div className='max-w-md truncate' title={value}>
          {value || '-'}
        </div>
      ),
    },
    {
      key: 'priority',
      title: '优先级',
      className: 'w-[80px]',
      render: (value: string) => (
        <Badge variant='outline' className={PRIORITY_COLORS[value] || ''}>
          {value}
        </Badge>
      ),
    },
    {
      key: 'status',
      title: '状态',
      className: 'w-[80px]',
      render: (value: string) => (
        <Badge variant='outline' className={STATUS_COLORS[value] || ''}>
          {value}
        </Badge>
      ),
    },
    {
      key: 'sender_type',
      title: '来源',
      className: 'w-[80px]',
      render: (value: string) => <span className='text-sm'>{value}</span>,
    },
    {
      key: 'created_at',
      title: '发送时间',
      className: 'w-[170px]',
      render: (value: number) => (
        <span className='font-mono text-xs'>
          {new Date(value * 1000).toLocaleString('zh-CN')}
        </span>
      ),
    },
    {
      key: 'actions',
      title: '操作',
      className: 'text-center w-[80px]',
      render: (_value: unknown, record: Message) => {
        const actions: ActionItem[] = [
          {
            key: 'view',
            label: '查看',
            icon: <Eye className='mr-2 h-4 w-4' />,
            onClick: () => onView(record),
          },
          {
            key: 'recall',
            label: '撤回',
            icon: <RotateCcw className='mr-2 h-4 w-4' />,
            onClick: () => onRecall(record),
          },
        ];
        return <ActionDropdown actions={actions} />;
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      loading={loading}
      emptyText='暂无消息数据'
      rowKey='message_id'
    />
  );
}
