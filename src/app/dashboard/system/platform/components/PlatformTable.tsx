import React from 'react';
import { Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { DataTable } from '@/components/table/data-table';
import {
  ActionDropdown,
  type ActionItem,
  type DeleteAction
} from '@/components/table/action-dropdown';
import { Platform, PaginationInfo } from '../types';
import { TABLE_COLUMNS, MESSAGES } from '../constants';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

interface PlatformTableProps {
  platforms: Platform[];
  loading: boolean;
  pagination: PaginationInfo;
  onEdit: (platform: Platform) => void;
  onDelete: (platform: Platform) => void;
  onToggleEnabled?: (platform: Platform) => void;
  emptyState?: EmptyStateProps;
}

/**
 * 平台表格组件
 */
export function PlatformTable({
  platforms,
  loading,
  pagination,
  onEdit,
  onDelete,
  onToggleEnabled,
  emptyState
}: PlatformTableProps) {
  // 表格列配置
  const columns = TABLE_COLUMNS.map((col) => {
    if (col.key === 'id') {
      return {
        ...col,
        render: (value: number) => {
          return <div className='text-center font-mono text-sm'>{value}</div>;
        }
      };
    }

    if (col.key === 'name') {
      return {
        ...col,
        render: (value: string) => {
          return <div className='font-medium'>{value}</div>;
        }
      };
    }

    if (col.key === 'description') {
      return {
        ...col,
        render: (value: string) => {
          return (
            <span className='line-clamp-2 text-sm'>
              {value || <span className='text-muted-foreground'>无描述</span>}
            </span>
          );
        }
      };
    }

    if (col.key === 'pre_url') {
      return {
        ...col,
        render: (value: string | null) => {
          if (!value) {
            return <span className='text-muted-foreground'>-</span>;
          }
          return (
            <span
              className='text-muted-foreground max-w-[200px] truncate font-mono text-xs'
              title={value}
            >
              {value}
            </span>
          );
        }
      };
    }

    if (col.key === 'enabled') {
      return {
        ...col,
        render: (value: boolean, record: Platform) => {
          if (onToggleEnabled) {
            return (
              <div className='flex justify-center'>
                <Switch
                  checked={value}
                  onCheckedChange={() => onToggleEnabled(record)}
                />
              </div>
            );
          }
          return (
            <div className='flex justify-center'>
              <Badge variant={value ? 'default' : 'secondary'}>
                {value ? '启用' : '禁用'}
              </Badge>
            </div>
          );
        }
      };
    }

    if (col.key === 'actions') {
      return {
        ...col,
        render: (value: any, record: Platform) => {
          const actions: ActionItem[] = [
            {
              key: 'edit',
              label: '编辑',
              icon: <Edit className='mr-2 h-4 w-4' />,
              onClick: () => onEdit(record)
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
      data={platforms}
      loading={loading}
      emptyText={MESSAGES.EMPTY.PLATFORMS}
      emptyState={emptyState}
      rowKey='id'
    />
  );
}
