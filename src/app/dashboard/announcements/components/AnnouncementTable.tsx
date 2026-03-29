import React from 'react';
import { Edit, Eye, Copy, Check, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/table/data-table';
import {
  ActionDropdown,
  type ActionItem,
  type DeleteAction
} from '@/components/table/action-dropdown';
import { formatDateTime } from '@/components/table/utils';
import { toast } from 'sonner';
import { Announcement, PaginationInfo } from '../types';
import {
  TABLE_COLUMNS,
  MESSAGES,
  ANNOUNCEMENT_TYPE_LABELS,
  ANNOUNCEMENT_TYPE_COLORS,
  PRIORITY_LABELS
} from '../constants';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

interface AnnouncementTableProps {
  announcements: Announcement[];
  loading: boolean;
  pagination: PaginationInfo;
  onEdit: (announcement: Announcement) => void;
  onView: (announcement: Announcement) => void;
  onPreview: (announcement: Announcement) => void;
  onDelete: (announcement: Announcement) => void;
  onToggleStatus: (announcement: Announcement) => void;
  onToggleDisabled: (announcement: Announcement) => void;
  emptyState?: EmptyStateProps;
}

/**
 * 公告表格组件
 */
export function AnnouncementTable({
  announcements,
  loading,
  pagination,
  onEdit,
  onView,
  onPreview,
  onDelete,
  onToggleStatus,
  onToggleDisabled,
  emptyState
}: AnnouncementTableProps) {
  // 复制ID
  const handleCopyId = (id: number) => {
    navigator.clipboard.writeText(String(id));
    toast.success('ID已复制');
  };

  // 复制用户ID
  const handleCopyUserId = (userId: number) => {
    navigator.clipboard.writeText(String(userId));
    toast.success('用户ID已复制');
  };

  // 表格列配置
  const columns = TABLE_COLUMNS.map((col) => {
    if (col.key === 'index') {
      return {
        ...col,
        render: (value: any, record: Announcement, index: number) => {
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

    if (col.key === 'user_id') {
      return {
        ...col,
        render: (value: number) => {
          return (
            <div className='flex items-center justify-center gap-1'>
              <span className='truncate font-mono text-xs'>{value}</span>
              <Copy
                className='text-muted-foreground hover:text-foreground h-3 w-3 cursor-pointer'
                onClick={() => handleCopyUserId(value)}
              />
            </div>
          );
        }
      };
    }

    if (col.key === 'title') {
      return {
        ...col,
        render: (value: string, record: Announcement) => {
          return (
            <div className='space-y-1'>
              <span className='line-clamp-2 font-medium' title={value}>
                {value}
              </span>
            </div>
          );
        }
      };
    }

    if (col.key === 'notification_type') {
      return {
        ...col,
        render: (value: string) => {
          const variant = ANNOUNCEMENT_TYPE_COLORS[value] || 'default';
          return (
            <Badge variant={variant as any}>
              {ANNOUNCEMENT_TYPE_LABELS[value] || value}
            </Badge>
          );
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

    if (col.key === 'status') {
      return {
        ...col,
        render: (value: string) => {
          const statusMap: Record<string, { label: string; variant: string }> =
            {
              pending: { label: '待发送', variant: 'secondary' },
              sent: { label: '已发送', variant: 'default' },
              read: { label: '已读', variant: 'outline' }
            };
          const config = statusMap[value] || {
            label: value,
            variant: 'default'
          };
          return (
            <div className='flex justify-center'>
              <Badge variant={config.variant as any}>{config.label}</Badge>
            </div>
          );
        }
      };
    }

    if (col.key === 'is_read') {
      return {
        ...col,
        render: (value: boolean) => {
          return (
            <div className='flex justify-center'>
              {value ? (
                <Check className='h-4 w-4 text-green-600' />
              ) : (
                <AlertTriangle className='text-muted-foreground h-4 w-4' />
              )}
            </div>
          );
        }
      };
    }

    if (col.key === 'created_at') {
      return {
        ...col,
        render: (value: string) => (
          <span className='font-mono text-xs'>{formatDateTime(value)}</span>
        )
      };
    }

    if (col.key === 'sent_at') {
      return {
        ...col,
        render: (value: string | null) => (
          <span className='font-mono text-xs'>
            {value ? (
              formatDateTime(value)
            ) : (
              <span className='text-muted-foreground'>-</span>
            )}
          </span>
        )
      };
    }

    if (col.key === 'read_at') {
      return {
        ...col,
        render: (value: string | null) => (
          <span className='font-mono text-xs'>
            {value ? (
              formatDateTime(value)
            ) : (
              <span className='text-muted-foreground'>-</span>
            )}
          </span>
        )
      };
    }

    if (col.key === 'actions') {
      return {
        ...col,
        render: (value: any, record: Announcement) => {
          const actions: ActionItem[] = [
            {
              key: 'view',
              label: '查看详情',
              icon: <Eye className='mr-2 h-4 w-4' />,
              onClick: () => onView(record)
            },
            {
              key: 'preview',
              label: '前台预览',
              icon: <Eye className='mr-2 h-4 w-4' />,
              onClick: () => onPreview(record)
            },
            {
              key: 'edit',
              label: '编辑',
              icon: <Edit className='mr-2 h-4 w-4' />,
              onClick: () => onEdit(record)
            },
            {
              key: 'copy',
              label: '复制ID',
              icon: <Copy className='mr-2 h-4 w-4' />,
              onClick: () => handleCopyId(record.id)
            }
          ];

          // 标记已读/未读
          if (!record.is_read) {
            actions.push({
              key: 'mark_read',
              label: '标记已读',
              icon: <Check className='mr-2 h-4 w-4' />,
              onClick: () => onToggleStatus(record)
            });
          }

          const deleteAction: DeleteAction = {
            description: MESSAGES.CONFIRM.DELETE(record.title),
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
      data={announcements}
      loading={loading}
      emptyText={MESSAGES.EMPTY.ANNOUNCEMENTS}
      emptyState={emptyState}
      rowKey='id'
    />
  );
}
