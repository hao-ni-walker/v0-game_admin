'use client';

import React from 'react';
import { Check, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/table/data-table';
import {
  ActionDropdown,
  type ActionItem,
} from '@/components/table/action-dropdown';

import type { Broadcast } from '../types';
import { STATUS_COLORS, STATUS_LABELS } from '../constants';

interface BroadcastTableProps {
  data: Broadcast[];
  loading?: boolean;
  onApprove: (item: Broadcast) => void;
  onReject: (item: Broadcast) => void;
}

function formatTargetType(value: string): string {
  switch (value) {
    case 'all':
      return '全部用户';
    case 'vip_level':
      return '按 VIP 等级';
    case 'user_list':
      return '指定用户';
    case 'condition':
      return '条件筛选';
    default:
      return value;
  }
}

function formatUnix(value: number | null): string {
  if (!value) return '-';
  return new Date(value * 1000).toLocaleString('zh-CN');
}

export function BroadcastTable({
  data,
  loading = false,
  onApprove,
  onReject,
}: BroadcastTableProps) {
  const columns = [
    {
      key: 'title',
      title: '标题',
      className: 'min-w-0 flex-1',
      render: (value: string, record: Broadcast) => (
        <div className='min-w-0'>
          <div className='max-w-md truncate font-medium' title={value}>
            {value || '-'}
          </div>
          <div className='text-muted-foreground truncate text-xs'>
            {record.category} · {record.template_type} · {record.priority}
          </div>
        </div>
      ),
    },
    {
      key: 'target_type',
      title: '目标',
      className: 'w-[120px]',
      render: (value: string) => (
        <span className='text-sm'>{formatTargetType(value)}</span>
      ),
    },
    {
      key: 'status',
      title: '状态',
      className: 'w-[100px]',
      render: (value: string) => (
        <Badge
          variant='outline'
          className={STATUS_COLORS[value] || 'bg-gray-100 text-gray-700'}
        >
          {STATUS_LABELS[value] || value}
        </Badge>
      ),
    },
    {
      key: 'sent_count',
      title: '已发送',
      className: 'w-[120px]',
      render: (_value: unknown, record: Broadcast) => (
        <span className='font-mono text-xs'>
          {record.sent_count} / {record.total_count}
          {record.failed_count > 0 && (
            <span className='text-red-600'> （失败 {record.failed_count}）</span>
          )}
        </span>
      ),
    },
    {
      key: 'created_by',
      title: '创建人',
      className: 'w-[120px]',
      render: (value: string | null) => (
        <span className='text-sm'>{value || '-'}</span>
      ),
    },
    {
      key: 'approved_by',
      title: '审批人',
      className: 'w-[120px]',
      render: (value: string | null) => (
        <span className='text-sm'>{value || '-'}</span>
      ),
    },
    {
      key: 'created_at',
      title: '创建时间',
      className: 'w-[170px]',
      render: (value: number) => (
        <span className='font-mono text-xs'>{formatUnix(value)}</span>
      ),
    },
    {
      key: 'actions',
      title: '操作',
      className: 'text-center w-[90px]',
      render: (_value: unknown, record: Broadcast) => {
        if (record.status !== 'awaiting_approval') {
          return <span className='text-muted-foreground text-xs'>-</span>;
        }
        const actions: ActionItem[] = [
          {
            key: 'approve',
            label: '批准',
            icon: <Check className='mr-2 h-4 w-4' />,
            onClick: () => onApprove(record),
          },
          {
            key: 'reject',
            label: '驳回',
            icon: <X className='mr-2 h-4 w-4' />,
            className: 'text-red-600',
            onClick: () => onReject(record),
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
      emptyText='暂无群发记录'
      rowKey='broadcast_id'
    />
  );
}
