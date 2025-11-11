import React from 'react';
import Image from 'next/image';
import {
  Edit,
  Eye,
  Copy,
  Power,
  PowerOff,
  RotateCcw,
  ExternalLink,
  Link as LinkIcon
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
import { Banner, PaginationInfo } from '../types';
import {
  TABLE_COLUMNS,
  MESSAGES,
  POSITION_LABELS,
  STATUS_LABELS
} from '../constants';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

interface BannerTableProps {
  banners: Banner[];
  loading: boolean;
  pagination: PaginationInfo;
  onEdit: (banner: Banner) => void;
  onView: (banner: Banner) => void;
  onDelete: (banner: Banner) => void;
  onToggleStatus: (banner: Banner) => void;
  onDisable: (banner: Banner) => void;
  onRestore?: (banner: Banner) => void;
  emptyState?: EmptyStateProps;
}

/**
 * 轮播图表格组件
 */
export function BannerTable({
  banners,
  loading,
  pagination,
  onEdit,
  onView,
  onDelete,
  onToggleStatus,
  onDisable,
  onRestore,
  emptyState
}: BannerTableProps) {
  // 复制链接
  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('链接已复制');
  };

  // 表格列配置
  const columns = TABLE_COLUMNS.map((col) => {
    if (col.key === 'index') {
      return {
        ...col,
        render: (value: any, record: Banner, index: number) => {
          return (pagination.page - 1) * pagination.page_size + index + 1;
        }
      };
    }

    if (col.key === 'image') {
      return {
        ...col,
        render: (value: any, record: Banner) => {
          return (
            <div className='flex items-center justify-center'>
              {record.image_url ? (
                <div className='relative h-16 w-20 overflow-hidden rounded-md'>
                  <Image
                    src={record.image_url}
                    alt={record.title || '轮播图'}
                    fill
                    className='object-cover'
                  />
                </div>
              ) : (
                <div className='flex h-16 w-20 items-center justify-center rounded-md bg-muted'>
                  <LinkIcon className='h-6 w-6 text-muted-foreground' />
                </div>
              )}
            </div>
          );
        }
      };
    }

    if (col.key === 'title') {
      return {
        ...col,
        render: (value: string | undefined, record: Banner) => {
          return (
            <div className='space-y-1'>
              <div className='font-medium'>
                {value || <span className='text-muted-foreground'>未设置标题</span>}
              </div>
            </div>
          );
        }
      };
    }

    if (col.key === 'position') {
      return {
        ...col,
        render: (value: string) => {
          return (
            <Badge variant='outline'>
              {POSITION_LABELS[value] || value}
            </Badge>
          );
        }
      };
    }

    if (col.key === 'link') {
      return {
        ...col,
        render: (value: string | undefined, record: Banner) => {
          if (!value) {
            return <span className='text-muted-foreground text-xs'>无跳转</span>;
          }
          return (
            <div className='flex items-center gap-1 truncate'>
              <span className='truncate text-xs'>{value}</span>
              <Copy
                className='h-3 w-3 flex-shrink-0 cursor-pointer text-muted-foreground hover:text-foreground'
                onClick={() => handleCopyLink(value)}
              />
              {record.target === '_blank' && (
                <ExternalLink className='h-3 w-3 flex-shrink-0 text-muted-foreground' />
              )}
            </div>
          );
        }
      };
    }

    if (col.key === 'sort_order') {
      return {
        ...col,
        render: (value: number) => {
          return (
            <div className='text-center font-mono text-sm font-semibold'>
              {value}
            </div>
          );
        }
      };
    }

    if (col.key === 'validity') {
      return {
        ...col,
        render: (value: any, record: Banner) => {
          const startTime = record.start_time ? new Date(record.start_time) : null;
          const endTime = record.end_time ? new Date(record.end_time) : null;
          const now = new Date();

          let isActive = true;
          if (startTime && now < startTime) isActive = false;
          if (endTime && now > endTime) isActive = false;

          return (
            <div className='space-y-1 text-xs'>
              <div>
                开始: {startTime ? formatDateTime(record.start_time!) : '立即生效'}
              </div>
              <div>
                结束: {endTime ? formatDateTime(record.end_time!) : '长期有效'}
              </div>
              {record.status === 1 && (
                <Badge
                  variant={isActive ? 'outline' : 'secondary'}
                  className='mt-1'
                >
                  {isActive ? '生效中' : '已过期'}
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
        render: (value: 0 | 1, record: Banner) => {
          const statusInfo = STATUS_LABELS[value];
          return (
            <div className='flex flex-col items-center gap-1'>
              <Badge variant={statusInfo.variant as any}>
                {statusInfo.label}
              </Badge>
              {record.disabled && (
                <Badge variant='secondary' className='text-xs'>
                  禁用
                </Badge>
              )}
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
        render: (value: any, record: Banner) => {
          const actions: ActionItem[] = [
            {
              key: 'view',
              label: '查看详情',
              icon: <Eye className='mr-2 h-4 w-4' />,
              onClick: () => onView(record)
            },
            {
              key: 'edit',
              label: '编辑',
              icon: <Edit className='mr-2 h-4 w-4' />,
              onClick: () => onEdit(record)
            }
          ];

          // 上线/下线
          if (record.status === 1) {
            actions.push({
              key: 'disable',
              label: '下线',
              icon: <PowerOff className='mr-2 h-4 w-4' />,
              onClick: () => onToggleStatus(record)
            });
          } else {
            actions.push({
              key: 'enable',
              label: '上线',
              icon: <Power className='mr-2 h-4 w-4' />,
              onClick: () => onToggleStatus(record)
            });
          }

          // 禁用/恢复
          if (record.disabled && onRestore) {
            actions.push({
              key: 'restore',
              label: '恢复',
              icon: <RotateCcw className='mr-2 h-4 w-4' />,
              onClick: () => onRestore(record)
            });
          } else if (!record.disabled) {
            actions.push({
              key: 'disable_banner',
              label: '紧急禁用',
              icon: <PowerOff className='mr-2 h-4 w-4' />,
              onClick: () => onDisable(record)
            });
          }

          const deleteAction: DeleteAction = {
            description: MESSAGES.CONFIRM.DELETE(record.title || '未命名'),
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
      data={banners}
      loading={loading}
      emptyText={MESSAGES.EMPTY.BANNERS}
      emptyState={emptyState}
      rowKey='id'
    />
  );
}
