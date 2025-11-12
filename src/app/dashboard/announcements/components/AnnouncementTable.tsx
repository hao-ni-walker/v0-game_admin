import React from 'react';
import {
  Edit,
  Eye,
  Copy,
  Power,
  PowerOff,
  Ban,
  Check,
  AlertTriangle
} from 'lucide-react';
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

  // 判断是否生效中
  const isActive = (announcement: Announcement): boolean => {
    if (announcement.disabled || announcement.status === 0) return false;
    const now = new Date().toISOString();
    const startOk = !announcement.start_time || announcement.start_time <= now;
    const endOk = !announcement.end_time || announcement.end_time >= now;
    return startOk && endOk;
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
                className='h-3 w-3 cursor-pointer text-muted-foreground hover:text-foreground'
                onClick={() => handleCopyId(value)}
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
              <div className='flex items-center gap-2'>
                <span className='font-medium line-clamp-1' title={value}>
                  {value}
                </span>
                {record.removed && (
                  <Badge variant='outline' className='text-xs'>
                    已删除
                  </Badge>
                )}
              </div>
              {isActive(record) && (
                <Badge variant='default' className='text-xs'>
                  生效中
                </Badge>
              )}
            </div>
          );
        }
      };
    }

    if (col.key === 'type') {
      return {
        ...col,
        render: (value: number) => {
          const variant = ANNOUNCEMENT_TYPE_COLORS[value] as any;
          return (
            <Badge variant={variant}>
              {ANNOUNCEMENT_TYPE_LABELS[value] || value}
            </Badge>
          );
        }
      };
    }

    if (col.key === 'priority') {
      return {
        ...col,
        render: (value: number) => {
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

    if (col.key === 'time_range') {
      return {
        ...col,
        render: (value: any, record: Announcement) => {
          return (
            <div className='space-y-1 text-xs'>
              <div>
                开始: {record.start_time ? formatDateTime(record.start_time) : <span className='text-muted-foreground'>不限</span>}
              </div>
              <div>
                结束: {record.end_time ? formatDateTime(record.end_time) : <span className='text-muted-foreground'>不限</span>}
              </div>
            </div>
          );
        }
      };
    }

    if (col.key === 'status') {
      return {
        ...col,
        render: (value: number) => {
          return (
            <div className='flex justify-center'>
              <Badge variant={value === 1 ? 'default' : 'secondary'}>
                {value === 1 ? '上线' : '下线'}
              </Badge>
            </div>
          );
        }
      };
    }

    if (col.key === 'disabled') {
      return {
        ...col,
        render: (value: boolean) => {
          return (
            <div className='flex justify-center'>
              {value ? (
                <Ban className='h-4 w-4 text-destructive' />
              ) : (
                <Check className='h-4 w-4 text-muted-foreground' />
              )}
            </div>
          );
        }
      };
    }

    if (col.key === 'version') {
      return {
        ...col,
        render: (value: number) => {
          return <span className='text-xs'>{value}</span>;
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

          // 上线/下线
          if (record.status === 1) {
            actions.push({
              key: 'offline',
              label: '下线',
              icon: <PowerOff className='mr-2 h-4 w-4' />,
              onClick: () => onToggleStatus(record)
            });
          } else {
            actions.push({
              key: 'publish',
              label: '上线',
              icon: <Power className='mr-2 h-4 w-4' />,
              onClick: () => onToggleStatus(record)
            });
          }

          // 禁用/启用
          if (record.disabled) {
            actions.push({
              key: 'enable',
              label: '启用',
              icon: <Check className='mr-2 h-4 w-4' />,
              onClick: () => onToggleDisabled(record)
            });
          } else {
            actions.push({
              key: 'disable',
              label: '紧急禁用',
              icon: <AlertTriangle className='mr-2 h-4 w-4' />,
              onClick: () => onToggleDisabled(record)
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
