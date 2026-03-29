import React from 'react';
import { Copy, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/table/data-table';
import {
  ActionDropdown,
  type ActionItem
} from '@/components/table/action-dropdown';
import { formatDateTime } from '@/components/table/utils';
import { toast } from 'sonner';
import { NotificationTemplate, PaginationInfo } from '../types';
import {
  TABLE_COLUMNS,
  MESSAGES,
  NOTIFICATION_TYPE_LABELS,
  PRIORITY_LABELS
} from '../constants';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

interface TemplateTableProps {
  templates: NotificationTemplate[];
  loading: boolean;
  pagination: PaginationInfo;
  onView: (template: NotificationTemplate) => void;
  emptyState?: EmptyStateProps;
}

/**
 * 模板表格组件
 */
export function TemplateTable({
  templates,
  loading,
  pagination,
  onView,
  emptyState
}: TemplateTableProps) {
  // 复制ID
  const handleCopyId = (id: number) => {
    navigator.clipboard.writeText(String(id));
    toast.success('ID已复制');
  };

  // 表格列配置
  const columns = TABLE_COLUMNS.map((col) => {
    if (col.key === 'index') {
      return {
        ...col,
        render: (value: any, record: NotificationTemplate, index: number) => {
          return (pagination.page - 1) * pagination.page_size + index + 1;
        }
      };
    }

    if (col.key === 'id') {
      return {
        ...col,
        render: (value: number) => {
          return (
            <div className='flex items-center justify-center gap-1'>
              <span className='truncate font-mono text-xs'>{value}</span>
              <Copy
                className='text-muted-foreground hover:text-foreground h-3 w-3 cursor-pointer'
                onClick={() => handleCopyId(value)}
              />
            </div>
          );
        }
      };
    }

    if (col.key === 'template_code') {
      return {
        ...col,
        render: (value: string) => {
          return (
            <span className='font-mono text-xs' title={value}>
              {value}
            </span>
          );
        }
      };
    }

    if (col.key === 'template_name') {
      return {
        ...col,
        render: (value: string) => {
          return (
            <span className='line-clamp-1 font-medium' title={value}>
              {value}
            </span>
          );
        }
      };
    }

    if (col.key === 'notification_type') {
      return {
        ...col,
        render: (value: string) => {
          const label = NOTIFICATION_TYPE_LABELS[value] || value;
          return <Badge variant='outline'>{label}</Badge>;
        }
      };
    }

    if (col.key === 'priority') {
      return {
        ...col,
        render: (value: string) => {
          const config = PRIORITY_LABELS[value];
          return (
            <div className='flex justify-center'>
              <Badge variant={config?.variant as any}>
                {config?.label || value}
              </Badge>
            </div>
          );
        }
      };
    }

    if (col.key === 'supported_channels') {
      return {
        ...col,
        render: (value: string[]) => {
          return (
            <div className='flex flex-wrap gap-1'>
              {value.map((channel) => (
                <Badge key={channel} variant='secondary' className='text-xs'>
                  {channel}
                </Badge>
              ))}
            </div>
          );
        }
      };
    }

    if (col.key === 'is_active') {
      return {
        ...col,
        render: (value: boolean) => {
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
        render: (value: any, record: NotificationTemplate) => {
          const actions: ActionItem[] = [
            {
              key: 'view',
              label: '查看详情',
              icon: <Eye className='mr-2 h-4 w-4' />,
              onClick: () => onView(record)
            },
            {
              key: 'copy',
              label: '复制ID',
              icon: <Copy className='mr-2 h-4 w-4' />,
              onClick: () => handleCopyId(record.id)
            }
          ];

          return <ActionDropdown actions={actions} />;
        }
      };
    }

    return col;
  });

  return (
    <DataTable
      columns={columns}
      data={templates}
      loading={loading}
      emptyText={MESSAGES.EMPTY.TEMPLATES}
      emptyState={emptyState}
      rowKey='id'
    />
  );
}
