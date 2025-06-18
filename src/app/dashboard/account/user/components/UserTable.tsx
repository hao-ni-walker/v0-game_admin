import React from 'react';
import { Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DataTable,
  ActionDropdown,
  formatDateTime,
  type ActionItem,
  type DeleteAction
} from '@/components/custom-table';
import { User } from '../types';
import { TABLE_COLUMNS, MESSAGES } from '../constants';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

interface UserTableProps {
  /** 用户数据列表 */
  users: User[];
  /** 加载状态 */
  loading: boolean;
  /** 编辑用户回调 */
  onEdit: (user: User) => void;
  /** 删除用户回调 */
  onDelete: (user: User) => void;
  /** 空状态配置 */
  emptyState?: EmptyStateProps;
}

/**
 * 用户表格组件
 * 负责展示用户列表数据和操作按钮
 */
export function UserTable({
  users,
  loading,
  onEdit,
  onDelete,
  emptyState
}: UserTableProps) {
  // 表格列配置
  const columns = TABLE_COLUMNS.map((col) => {
    if (col.key === 'index') {
      return {
        ...col,
        render: (value: any, record: User, index: number) => index + 1
      };
    }

    if (col.key === 'role') {
      return {
        ...col,
        render: (value: any, record: User) =>
          record.role?.name ? (
            <Badge variant='secondary'>{record.role.name}</Badge>
          ) : (
            <span className='text-muted-foreground'>{MESSAGES.EMPTY.ROLE}</span>
          )
      };
    }

    if (col.key === 'createdAt') {
      return {
        ...col,
        render: (value: string) => formatDateTime(value)
      };
    }

    if (col.key === 'actions') {
      return {
        ...col,
        render: (value: any, record: User) => {
          const actions: ActionItem[] = [
            {
              key: 'edit',
              label: '编辑',
              icon: <Edit className='mr-2 h-4 w-4' />,
              onClick: () => onEdit(record)
            }
          ];

          const deleteAction: DeleteAction = {
            description: MESSAGES.CONFIRM.DELETE(record.username),
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
      data={users}
      loading={loading}
      emptyText={MESSAGES.EMPTY.USERS}
      emptyState={emptyState}
      rowKey='id'
    />
  );
}
