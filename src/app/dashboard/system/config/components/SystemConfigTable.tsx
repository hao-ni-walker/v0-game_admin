import React from 'react';
import { Edit, Copy, Globe, EyeOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { DataTable } from '@/components/table/data-table';
import {
  ActionDropdown,
  type ActionItem,
  type DeleteAction
} from '@/components/table/action-dropdown';
import { formatDateTime } from '@/components/table/utils';
import { toast } from 'sonner';
import { SystemConfig, PaginationInfo } from '../types';
import {
  TABLE_COLUMNS,
  MESSAGES,
  CONFIG_TYPE_LABELS,
  CONFIG_TYPE_VARIANTS
} from '../constants';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

interface SystemConfigTableProps {
  configs: SystemConfig[];
  loading: boolean;
  pagination: PaginationInfo;
  onEdit: (config: SystemConfig) => void;
  onDelete: (config: SystemConfig) => void;
  onToggleDisabled: (config: SystemConfig) => void;
  emptyState?: EmptyStateProps;
}

/**
 * 系统配置表格组件
 */
export function SystemConfigTable({
  configs,
  loading,
  pagination,
  onEdit,
  onDelete,
  onToggleDisabled,
  emptyState
}: SystemConfigTableProps) {
  // 复制配置值
  const handleCopyValue = (value: string) => {
    navigator.clipboard.writeText(value);
    toast.success('配置值已复制');
  };

  // 解析JSON值
  const parseValue = (value: string, type: string) => {
    if (type === 'json') {
      try {
        const parsed = JSON.parse(value);
        return JSON.stringify(parsed).substring(0, 60) + '...';
      } catch {
        return value;
      }
    }
    if (type === 'boolean') {
      return value === 'true' || value === '1' ? '是' : '否';
    }
    return value;
  };

  // 表格列配置
  const columns = TABLE_COLUMNS.map((col) => {
    if (col.key === 'index') {
      return {
        ...col,
        render: (value: any, record: SystemConfig, index: number) => {
          return (pagination.page - 1) * pagination.page_size + index + 1;
        }
      };
    }

    if (col.key === 'config_key') {
      return {
        ...col,
        render: (value: string) => {
          return <div className='font-mono font-medium break-all'>{value}</div>;
        }
      };
    }

    if (col.key === 'config_type') {
      return {
        ...col,
        render: (value: string) => {
          return (
            <div className='text-center'>
              <Badge variant={CONFIG_TYPE_VARIANTS[value] as any}>
                {CONFIG_TYPE_LABELS[value]}
              </Badge>
            </div>
          );
        }
      };
    }

    if (col.key === 'config_value') {
      return {
        ...col,
        render: (value: string, record: SystemConfig) => {
          const displayValue = parseValue(value, record.config_type);
          return (
            <div className='flex items-center gap-1'>
              <span className='max-w-[200px] truncate font-mono text-xs'>
                {displayValue}
              </span>
              <Copy
                className='text-muted-foreground hover:text-foreground h-3 w-3 flex-shrink-0 cursor-pointer'
                onClick={() => handleCopyValue(value)}
              />
            </div>
          );
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

    if (col.key === 'is_public') {
      return {
        ...col,
        render: (value: boolean) => {
          return (
            <div className='flex justify-center'>
              {value ? (
                <Badge variant='outline' className='gap-1'>
                  <Globe className='h-3 w-3' />
                  公开
                </Badge>
              ) : (
                <Badge variant='secondary' className='gap-1'>
                  <EyeOff className='h-3 w-3' />
                  私有
                </Badge>
              )}
            </div>
          );
        }
      };
    }

    if (col.key === 'status') {
      return {
        ...col,
        render: (value: any, record: SystemConfig) => {
          return (
            <div className='flex justify-center'>
              <Switch
                checked={!record.disabled}
                onCheckedChange={() => onToggleDisabled(record)}
              />
            </div>
          );
        }
      };
    }

    if (col.key === 'version') {
      return {
        ...col,
        render: (value: number) => {
          return <div className='text-center font-mono text-sm'>v{value}</div>;
        }
      };
    }

    if (col.key === 'updated_at') {
      return {
        ...col,
        render: (value: string) => (
          <span className='font-mono text-xs'>{formatDateTime(value)}</span>
        )
      };
    }

    if (col.key === 'actions') {
      return {
        ...col,
        render: (value: any, record: SystemConfig) => {
          const actions: ActionItem[] = [
            {
              key: 'edit',
              label: '编辑',
              icon: <Edit className='mr-2 h-4 w-4' />,
              onClick: () => onEdit(record)
            }
          ];

          const deleteAction: DeleteAction = {
            description: MESSAGES.CONFIRM.DELETE(record.config_key),
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
      data={configs}
      loading={loading}
      emptyText={MESSAGES.EMPTY.CONFIGS}
      emptyState={emptyState}
      rowKey='id'
    />
  );
}
