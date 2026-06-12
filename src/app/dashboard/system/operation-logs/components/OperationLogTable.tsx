'use client';

import React from 'react';
import { Eye, FileText } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/table/data-table';
import {
  ActionDropdown,
  type ActionItem
} from '@/components/table/action-dropdown';
import { formatDateTime } from '@/components/table/utils';

import type { UserOperationLog, PaginationInfo } from '../types';
import { OPERATION_TYPE_COLORS } from '../constants';

interface OperationLogTableProps {
  /** 操作日志列表数据 */
  data: UserOperationLog[];
  /** 加载状态 */
  loading?: boolean;
  /** 分页信息 */
  pagination: PaginationInfo;
  /** 查看详情操作 */
  onView: (log: UserOperationLog) => void;
}

export function OperationLogTable({
  data,
  loading = false,
  pagination,
  onView
}: OperationLogTableProps) {
  // 定义表格列
  const columns = [
    {
      key: 'id',
      title: 'ID',
      className: 'text-center w-[80px] font-mono text-sm',
      render: (value: number) => (
        <span className='font-mono text-sm'>{value}</span>
      )
    },
    {
      key: 'userId',
      title: '用户ID',
      className: 'w-[80px] font-mono text-sm',
      render: (value: number) => (
        <span className='font-mono text-sm'>{value}</span>
      )
    },
    {
      key: 'username',
      title: '用户名',
      className: 'w-[120px] font-medium'
    },
    {
      key: 'operation',
      title: '操作类型',
      className: 'w-[100px]',
      render: (value: string) => {
        const colorClass =
          OPERATION_TYPE_COLORS[value] || 'bg-gray-100 text-gray-800';
        return <Badge className={colorClass}>{value}</Badge>;
      }
    },
    {
      key: 'tableName',
      title: '表名',
      className: 'w-[120px] font-medium'
    },
    {
      key: 'objectId',
      title: '对象ID',
      className: 'w-[100px] font-mono text-sm',
      render: (value: string) => (
        <div className='max-w-[100px] truncate font-mono text-sm' title={value}>
          {value}
        </div>
      )
    },
    {
      key: 'description',
      title: '操作说明',
      className: 'min-w-0 flex-1',
      render: (value: string, record: UserOperationLog) => (
        <div className='flex flex-col gap-1'>
          <div className='max-w-md truncate' title={value}>
            {value || '-'}
          </div>
          {record.source && (
            <span className='text-muted-foreground text-xs'>
              来源: {record.source}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'ipAddress',
      title: 'IP地址',
      className: 'w-[130px] font-mono text-sm',
      render: (value: string) => (
        <span className='font-mono text-sm'>{value || '-'}</span>
      )
    },
    {
      key: 'operationAt',
      title: '操作时间',
      className: 'w-[160px]',
      render: (value: string) => (
        <span className='font-mono text-sm'>{formatDateTime(value)}</span>
      )
    },
    {
      key: 'actions',
      title: '操作',
      className: 'text-center w-[80px]',
      render: (value: any, record: UserOperationLog) => {
        const actions: ActionItem[] = [
          {
            key: 'view',
            label: '查看详情',
            icon: <Eye className='mr-2 h-4 w-4' />,
            onClick: () => onView(record)
          }
        ];

        // 如果有数据变更，添加查看变更项
        if (record.oldData || record.newData) {
          actions.push({
            key: 'diff',
            label: '查看变更',
            icon: <FileText className='mr-2 h-4 w-4' />,
            onClick: () => onView(record)
          });
        }

        return <ActionDropdown actions={actions} />;
      }
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      loading={loading}
      emptyText='暂无操作日志数据'
      rowKey='id'
    />
  );
}
