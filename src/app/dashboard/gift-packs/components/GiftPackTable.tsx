import React from 'react';
import Image from 'next/image';
import {
  Edit,
  Eye,
  Copy,
  Power,
  PowerOff,
  Archive,
  Package,
  Star
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
import { GiftPack, PaginationInfo } from '../types';
import {
  TABLE_COLUMNS,
  MESSAGES,
  CATEGORY_LABELS,
  RARITY_LABELS,
  RARITY_COLORS,
  STATUS_LABELS,
  IMAGE_BASE_URL
} from '../constants';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

interface GiftPackTableProps {
  giftPacks: GiftPack[];
  loading: boolean;
  pagination: PaginationInfo;
  onEdit: (giftPack: GiftPack) => void;
  onView: (giftPack: GiftPack) => void;
  onDelete: (giftPack: GiftPack) => void;
  onToggleStatus: (giftPack: GiftPack) => void;
  onArchive: (giftPack: GiftPack) => void;
  emptyState?: EmptyStateProps;
}

/**
 * 礼包表格组件
 */
export function GiftPackTable({
  giftPacks,
  loading,
  pagination,
  onEdit,
  onView,
  onDelete,
  onToggleStatus,
  onArchive,
  emptyState
}: GiftPackTableProps) {
  // 复制道具ID
  const handleCopyItemId = (itemId: number) => {
    navigator.clipboard.writeText(String(itemId));
    toast.success('道具ID已复制');
  };

  // 表格列配置
  const columns = TABLE_COLUMNS.map((col) => {
    if (col.key === 'index') {
      return {
        ...col,
        render: (value: any, record: GiftPack, index: number) => {
          return (pagination.page - 1) * pagination.page_size + index + 1;
        }
      };
    }

    if (col.key === 'item_id') {
      return {
        ...col,
        render: (value: number, record: GiftPack) => {
          return (
            <div className='flex items-center justify-center gap-1'>
              <span className='truncate font-mono text-xs'>{value}</span>
              <Copy
                className='text-muted-foreground hover:text-foreground h-3 w-3 cursor-pointer'
                onClick={() => handleCopyItemId(value)}
              />
            </div>
          );
        }
      };
    }

    if (col.key === 'icon') {
      return {
        ...col,
        render: (value: any, record: GiftPack) => {
          const rawIcon =
            record.locale_overrides?.display_icon || record.display_icon;
          const displayIcon = rawIcon
            ? rawIcon.startsWith('http')
              ? rawIcon
              : `${IMAGE_BASE_URL}${rawIcon}`
            : null;

          return (
            <div className='flex items-center justify-center'>
              {displayIcon ? (
                <Image
                  src={displayIcon}
                  alt={record.name_default}
                  width={40}
                  height={40}
                  className='rounded-md object-cover'
                  unoptimized={true} // 避免 Next.js 图片优化问题，特别是对于外部 CDN
                />
              ) : (
                <div
                  className='flex h-10 w-10 items-center justify-center rounded-md'
                  style={{ backgroundColor: record.display_color || '#e5e7eb' }}
                >
                  <Package className='h-5 w-5 text-white' />
                </div>
              )}
            </div>
          );
        }
      };
    }

    if (col.key === 'name') {
      return {
        ...col,
        render: (value: string, record: GiftPack) => {
          const displayName =
            record.locale_overrides?.name || record.name || record.name_default;
          const description = record.locale_overrides?.description;
          const shortDesc = record.locale_overrides?.short_desc;

          return (
            <div className='space-y-1'>
              <div className='font-medium'>{displayName}</div>
              {(shortDesc || description) && (
                <div className='text-muted-foreground line-clamp-1 text-xs'>
                  {shortDesc || description}
                </div>
              )}
              {record.name !== record.name_default && (
                <div className='text-muted-foreground text-xs'>
                  默认: {record.name_default}
                </div>
              )}
            </div>
          );
        }
      };
    }

    if (col.key === 'category') {
      return {
        ...col,
        render: (value: string) => {
          return (
            <Badge variant='outline'>{CATEGORY_LABELS[value] || value}</Badge>
          );
        }
      };
    }

    if (col.key === 'rarity') {
      return {
        ...col,
        render: (value: string, record: GiftPack) => {
          const color = RARITY_COLORS[value] || '#9CA3AF';
          return (
            <div className='flex justify-center'>
              <Badge
                variant='outline'
                style={{ borderColor: color, color: color }}
              >
                <Star className='mr-1 h-3 w-3' fill={color} />
                {RARITY_LABELS[value] || value}
              </Badge>
            </div>
          );
        }
      };
    }

    if (col.key === 'properties') {
      return {
        ...col,
        render: (value: any, record: GiftPack) => {
          return (
            <div className='flex flex-wrap gap-1'>
              <Badge variant='outline' className='text-xs'>
                叠堆: {record.stack_limit}
              </Badge>
              {record.is_consumable && (
                <Badge variant='secondary' className='text-xs'>
                  消耗品
                </Badge>
              )}
              {record.bind_flag && (
                <Badge variant='secondary' className='text-xs'>
                  绑定
                </Badge>
              )}
            </div>
          );
        }
      };
    }

    if (col.key === 'requirements') {
      return {
        ...col,
        render: (value: any, record: GiftPack) => {
          const requirements = [];
          if (
            record.vip_required !== undefined &&
            record.vip_required !== null &&
            record.vip_required > 0
          ) {
            requirements.push(`VIP${record.vip_required}`);
          }
          if (
            record.level_required !== undefined &&
            record.level_required !== null &&
            record.level_required > 0
          ) {
            requirements.push(`Lv${record.level_required}`);
          }

          return (
            <div className='space-y-1 text-xs'>
              {requirements.length > 0 ? (
                requirements.map((req, idx) => (
                  <div key={idx}>
                    <Badge variant='outline' className='text-xs'>
                      {req}
                    </Badge>
                  </div>
                ))
              ) : (
                <span className='text-muted-foreground'>无要求</span>
              )}
            </div>
          );
        }
      };
    }

    if (col.key === 'limits') {
      return {
        ...col,
        render: (value: any, record: GiftPack) => {
          return (
            <div className='space-y-1 text-xs'>
              {record.expire_days !== null &&
                record.expire_days !== undefined && (
                  <div>
                    有效期:{' '}
                    <span className='font-mono'>{record.expire_days}天</span>
                  </div>
                )}
              {record.usage_limit !== null &&
                record.usage_limit !== undefined && (
                  <div>
                    使用:{' '}
                    <span className='font-mono'>{record.usage_limit}次</span>
                  </div>
                )}
              {(record.expire_days === null ||
                record.expire_days === undefined) &&
                (record.usage_limit === null ||
                  record.usage_limit === undefined) && (
                  <span className='text-muted-foreground'>无限制</span>
                )}
            </div>
          );
        }
      };
    }

    if (col.key === 'status') {
      return {
        ...col,
        render: (value: string, record: GiftPack) => {
          const statusVariant =
            value === 'active'
              ? 'default'
              : value === 'disabled'
                ? 'destructive'
                : 'secondary';

          return (
            <div className='flex justify-center'>
              <Badge variant={statusVariant}>
                {STATUS_LABELS[value] || value}
              </Badge>
            </div>
          );
        }
      };
    }

    if (col.key === 'sort_weight') {
      return {
        ...col,
        render: (value: number) => {
          return (
            <div className='text-center'>
              <span className='font-mono text-sm'>{value}</span>
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
        render: (value: any, record: GiftPack) => {
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
            },
            {
              key: 'copy',
              label: '复制道具ID',
              icon: <Copy className='mr-2 h-4 w-4' />,
              onClick: () => handleCopyItemId(record.item_id)
            }
          ];

          // 启用/停用
          if (record.status === 'active') {
            actions.push({
              key: 'disable',
              label: '停用',
              icon: <PowerOff className='mr-2 h-4 w-4' />,
              onClick: () => onToggleStatus(record)
            });
          } else if (record.status === 'disabled') {
            actions.push({
              key: 'enable',
              label: '启用',
              icon: <Power className='mr-2 h-4 w-4' />,
              onClick: () => onToggleStatus(record)
            });
          }

          // 归档
          if (record.status !== 'archived') {
            actions.push({
              key: 'archive',
              label: '归档',
              icon: <Archive className='mr-2 h-4 w-4' />,
              onClick: () => onArchive(record)
            });
          }

          const deleteAction: DeleteAction = {
            description: MESSAGES.CONFIRM.DELETE(
              record.name || record.name_default
            ),
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
      data={giftPacks}
      loading={loading}
      emptyText={MESSAGES.EMPTY.ITEMS}
      emptyState={emptyState}
      rowKey='id'
    />
  );
}
