import React from 'react';
import Image from 'next/image';
import {
  Edit,
  Copy,
  Power,
  RotateCcw,
  ExternalLink,
  Link as LinkIcon
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
    if (col.key === 'id') {
      return {
        ...col,
        render: (value: number | undefined) => {
          if (value === undefined || value === null) {
            return <span className='text-muted-foreground text-xs'>-</span>;
          }
          return <div className='text-center font-mono text-sm'>{value}</div>;
        }
      };
    }

    if (col.key === 'image') {
      return {
        ...col,
        render: (value: any, record: Banner) => {
          if (!record.image_url) {
            return (
              <div className='bg-muted flex h-16 w-20 items-center justify-center rounded-md'>
                <LinkIcon className='text-muted-foreground h-6 w-6' />
              </div>
            );
          }

          return (
            <div className='flex items-center justify-center'>
              <div className='relative h-16 w-20 overflow-hidden rounded-md'>
                <Image
                  src={record.image_url}
                  alt={record.title || '轮播图'}
                  fill
                  className='object-cover'
                  unoptimized={true}
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    if (target.parentElement) {
                      target.parentElement.style.display = 'none';
                    }
                  }}
                />
              </div>
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
                {value || (
                  <span className='text-muted-foreground'>未设置标题</span>
                )}
              </div>
            </div>
          );
        }
      };
    }

    if (col.key === 'position') {
      return {
        ...col,
        render: (value: string | undefined) => {
          if (!value) {
            return <span className='text-muted-foreground text-xs'>-</span>;
          }
          return (
            <Badge variant='outline'>{POSITION_LABELS[value] || value}</Badge>
          );
        }
      };
    }

    if (col.key === 'link') {
      return {
        ...col,
        render: (value: any, record: Banner) => {
          const linkUrl = record.link_url;
          if (!linkUrl) {
            return (
              <span className='text-muted-foreground text-xs'>无跳转</span>
            );
          }
          return (
            <div className='flex items-center gap-1 truncate'>
              <span className='truncate text-xs'>{linkUrl}</span>
              <Copy
                className='text-muted-foreground hover:text-foreground h-3 w-3 flex-shrink-0 cursor-pointer'
                onClick={() => handleCopyLink(linkUrl)}
              />
              {record.target === '_blank' && (
                <ExternalLink className='text-muted-foreground h-3 w-3 flex-shrink-0' />
              )}
            </div>
          );
        }
      };
    }

    if (col.key === 'target') {
      return {
        ...col,
        render: (value: '_self' | '_blank' | undefined, record: Banner) => {
          const target = value || record.target || '_self';
          const label = target === '_blank' ? '新标签页' : '当前标签页';
          return (
            <div className='text-center'>
              <Badge variant='outline'>{label}</Badge>
            </div>
          );
        }
      };
    }

    if (col.key === 'page') {
      return {
        ...col,
        render: (value: string | undefined) => {
          if (!value) {
            return <span className='text-muted-foreground text-xs'>-</span>;
          }
          return <Badge variant='secondary'>{value}</Badge>;
        }
      };
    }

    if (col.key === 'sort_order') {
      return {
        ...col,
        render: (value: number | undefined) => {
          if (value === undefined || value === null) {
            return <span className='text-muted-foreground text-xs'>-</span>;
          }
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
          const startTime = record.start_time
            ? new Date(record.start_time)
            : null;
          const endTime = record.end_time ? new Date(record.end_time) : null;
          const now = new Date();

          let isActive = true;
          if (startTime && now < startTime) isActive = false;
          if (endTime && now > endTime) isActive = false;

          return (
            <div className='space-y-1 text-xs'>
              <div>
                开始:{' '}
                {startTime ? formatDateTime(record.start_time!) : '立即生效'}
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
        render: (value: 0 | 1 | undefined, record: Banner) => {
          const status = value ?? record.status ?? 0;
          const isActive = status === 1 && !record.disabled;

          return (
            <div className='flex items-center justify-center gap-2'>
              <Switch
                checked={isActive}
                onCheckedChange={() => onToggleStatus(record)}
              />
              <Label
                className='cursor-pointer text-sm'
                onClick={() => onToggleStatus(record)}
              >
                {isActive ? '激活' : '禁用'}
              </Label>
            </div>
          );
        }
      };
    }

    if (col.key === 'created_at') {
      return {
        ...col,
        render: (value: string | undefined) => {
          if (!value) {
            return <span className='text-muted-foreground text-xs'>-</span>;
          }
          return (
            <span className='font-mono text-xs'>{formatDateTime(value)}</span>
          );
        }
      };
    }

    if (col.key === 'updated_at') {
      return {
        ...col,
        render: (value: string | undefined) => {
          if (!value) {
            return <span className='text-muted-foreground text-xs'>-</span>;
          }
          return (
            <span className='font-mono text-xs'>{formatDateTime(value)}</span>
          );
        }
      };
    }

    if (col.key === 'actions') {
      return {
        ...col,
        render: (value: any, record: Banner) => {
          const actions: ActionItem[] = [
            {
              key: 'edit',
              label: '编辑',
              icon: <Edit className='mr-2 h-4 w-4' />,
              onClick: () => onEdit(record)
            }
          ];

          // 上线
          if (record.status !== 1) {
            actions.push({
              key: 'enable',
              label: '上线',
              icon: <Power className='mr-2 h-4 w-4' />,
              onClick: () => onToggleStatus(record)
            });
          }

          // 恢复
          if (record.disabled && onRestore) {
            actions.push({
              key: 'restore',
              label: '恢复',
              icon: <RotateCcw className='mr-2 h-4 w-4' />,
              onClick: () => onRestore(record)
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
