'use client';

import React from 'react';
import { Edit, Users, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DataTable,
  ActionDropdown,
  formatDateTime,
  type ActionItem,
  type DeleteAction
} from '@/components/custom-table';
import { TABLE_COLUMNS, MESSAGES } from '../constants';
import type { Role } from '../types';

interface RoleTableProps {
  data: Role[];
  loading: boolean;
  onEdit: (role: Role) => void;
  onPermission: (role: Role) => void;
  onDelete: (role: Role) => void;
}

export function RoleTable({
  data,
  loading,
  onEdit,
  onPermission,
  onDelete
}: RoleTableProps) {
  // 定义表格列
  const columns = TABLE_COLUMNS.map((col) => {
    if (col.key === 'index') {
      return {
        ...col,
        render: (value: any, record: Role, index: number) => index + 1
      };
    }

    if (col.key === 'userCount') {
      return {
        ...col,
        render: (value: number) => (
          <Badge variant='outline' className='flex w-fit items-center gap-1'>
            <Users className='h-3 w-3' />
            {value || 0}
          </Badge>
        )
      };
    }

    if (col.key === 'createdAt') {
      return {
        ...col,
        render: (value: string) => (
          <span className='font-mono text-sm'>{formatDateTime(value)}</span>
        )
      };
    }

    if (col.key === 'actions') {
      return {
        ...col,
        render: (_: unknown, record: Role) => {
          const actions: ActionItem[] = [
            {
              key: 'edit',
              label: '编辑',
              icon: <Edit className='mr-2 h-4 w-4' />,
              onClick: () => onEdit(record)
            },
            {
              key: 'permissions',
              label: '权限分配',
              icon: <Settings className='mr-2 h-4 w-4' />,
              onClick: () => onPermission(record)
            }
          ];

          const deleteAction: DeleteAction = {
            description: MESSAGES.CONFIRM.DELETE(record.name),
            onConfirm: () => onDelete(record)
          };

          return (
            <ActionDropdown actions={actions} deleteAction={deleteAction} />
          );
        }
      };
    }

    return col;
  });

  return (
    <DataTable
      columns={columns}
      data={data}
      loading={loading}
      emptyText={MESSAGES.EMPTY.ROLES}
      rowKey='id'
    />
  );
}
