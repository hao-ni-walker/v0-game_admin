import React from 'react';
import Image from 'next/image';
import {
  Edit,
  Eye,
  Copy,
  Star,
  StarOff,
  Power,
  PowerOff,
  Smartphone,
  Gamepad,
  Trophy,
  Gift
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
import { Game, PaginationInfo } from '../types';
import {
  TABLE_COLUMNS,
  MESSAGES,
  CATEGORY_LABELS,
  PROVIDER_LABELS
} from '../constants';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

interface GameTableProps {
  games: Game[];
  loading: boolean;
  pagination: PaginationInfo;
  onEdit: (game: Game) => void;
  onView: (game: Game) => void;
  onDelete: (game: Game) => void;
  onToggleStatus: (game: Game) => void;
  onToggleFeatured: (game: Game) => void;
  emptyState?: EmptyStateProps;
}

/**
 * 游戏表格组件
 */
export function GameTable({
  games,
  loading,
  pagination,
  onEdit,
  onView,
  onDelete,
  onToggleStatus,
  onToggleFeatured,
  emptyState
}: GameTableProps) {
  // 复制游戏ID
  const handleCopyGameId = (gameId: string) => {
    navigator.clipboard.writeText(gameId);
    toast.success('游戏标识已复制');
  };

  // 表格列配置
  const columns = TABLE_COLUMNS.map((col) => {
    if (col.key === 'index') {
      return {
        ...col,
        render: (value: any, record: Game, index: number) => {
          return (pagination.page - 1) * pagination.page_size + index + 1;
        }
      };
    }

    if (col.key === 'icon') {
      return {
        ...col,
        render: (value: any, record: Game) => {
          return (
            <div className='flex items-center justify-center'>
              {record.icon_url ? (
                <Image
                  src={record.icon_url}
                  alt={record.name}
                  width={40}
                  height={40}
                  className='rounded-md object-cover'
                />
              ) : (
                <div className='flex h-10 w-10 items-center justify-center rounded-md bg-muted'>
                  <Gamepad className='h-5 w-5 text-muted-foreground' />
                </div>
              )}
            </div>
          );
        }
      };
    }

    if (col.key === 'game_id') {
      return {
        ...col,
        render: (value: string, record: Game) => {
          return (
            <div className='flex items-center gap-1'>
              <span className='truncate text-xs'>{value}</span>
              <Copy
                className='h-3 w-3 cursor-pointer text-muted-foreground hover:text-foreground'
                onClick={() => handleCopyGameId(value)}
              />
            </div>
          );
        }
      };
    }

    if (col.key === 'name') {
      return {
        ...col,
        render: (value: string, record: Game) => {
          return (
            <div className='space-y-1'>
              <div className='font-medium'>{value}</div>
              {record.description && (
                <div className='line-clamp-1 text-xs text-muted-foreground'>
                  {record.description}
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
            <Badge variant='outline'>
              {CATEGORY_LABELS[value] || value}
            </Badge>
          );
        }
      };
    }

    if (col.key === 'provider_code') {
      return {
        ...col,
        render: (value: string) => {
          return (
            <Badge variant='secondary'>
              {PROVIDER_LABELS[value] || value}
            </Badge>
          );
        }
      };
    }

    if (col.key === 'min_bet') {
      return {
        ...col,
        render: (value: number | undefined) => {
          return value !== undefined && value !== null ? (
            <span className='font-mono text-xs'>
              {value.toFixed(2)}
            </span>
          ) : (
            <span className='text-muted-foreground'>—</span>
          );
        }
      };
    }

    if (col.key === 'max_bet') {
      return {
        ...col,
        render: (value: number | undefined) => {
          return value !== undefined && value !== null ? (
            <span className='font-mono text-xs'>
              {value.toFixed(2)}
            </span>
          ) : (
            <span className='text-muted-foreground'>—</span>
          );
        }
      };
    }

    if (col.key === 'rtp') {
      return {
        ...col,
        render: (value: number | undefined) => {
          return value !== undefined && value !== null ? (
            <Badge variant='outline' className='font-mono'>
              {value.toFixed(2)}%
            </Badge>
          ) : (
            <span className='text-muted-foreground'>—</span>
          );
        }
      };
    }

    if (col.key === 'features') {
      return {
        ...col,
        render: (value: any, record: Game) => {
          return (
            <div className='flex flex-wrap gap-1'>
              {record.is_mobile_supported && (
                <Badge variant='outline' className='gap-1 text-xs'>
                  <Smartphone className='h-3 w-3' />
                  移动端
                </Badge>
              )}
              {record.is_demo_available && (
                <Badge variant='outline' className='gap-1 text-xs'>
                  <Gamepad className='h-3 w-3' />
                  试玩
                </Badge>
              )}
              {record.has_jackpot && (
                <Badge variant='outline' className='gap-1 text-xs'>
                  <Trophy className='h-3 w-3' />
                  奖池
                </Badge>
              )}
              {record.has_bonus_game && (
                <Badge variant='outline' className='gap-1 text-xs'>
                  <Gift className='h-3 w-3' />
                  奖励
                </Badge>
              )}
              {record.is_new && (
                <Badge className='text-xs'>新</Badge>
              )}
            </div>
          );
        }
      };
    }

    if (col.key === 'status') {
      return {
        ...col,
        render: (value: boolean, record: Game) => {
          return (
            <div className='flex justify-center'>
              <Badge variant={value ? 'default' : 'destructive'}>
                {value ? '启用' : '停用'}
              </Badge>
            </div>
          );
        }
      };
    }

    if (col.key === 'stats') {
      return {
        ...col,
        render: (value: any, record: Game) => {
          return (
            <div className='space-y-1 text-right text-xs'>
              <div>
                游玩: <span className='font-mono'>{record.play_count || 0}</span>
              </div>
              {record.popularity_score !== undefined && (
                <div>
                  热度: <span className='font-mono'>{record.popularity_score.toFixed(2)}</span>
                </div>
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
        render: (value: any, record: Game) => {
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
              label: '复制游戏ID',
              icon: <Copy className='mr-2 h-4 w-4' />,
              onClick: () => handleCopyGameId(record.game_id)
            }
          ];

          // 启用/停用
          if (record.status) {
            actions.push({
              key: 'disable',
              label: '停用',
              icon: <PowerOff className='mr-2 h-4 w-4' />,
              onClick: () => onToggleStatus(record)
            });
          } else {
            actions.push({
              key: 'enable',
              label: '启用',
              icon: <Power className='mr-2 h-4 w-4' />,
              onClick: () => onToggleStatus(record)
            });
          }

          // 推荐/取消推荐
          if (record.is_featured) {
            actions.push({
              key: 'unfeature',
              label: '取消推荐',
              icon: <StarOff className='mr-2 h-4 w-4' />,
              onClick: () => onToggleFeatured(record)
            });
          } else {
            actions.push({
              key: 'feature',
              label: '设置推荐',
              icon: <Star className='mr-2 h-4 w-4' />,
              onClick: () => onToggleFeatured(record)
            });
          }

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
      data={games}
      loading={loading}
      emptyText={MESSAGES.EMPTY.GAMES}
      emptyState={emptyState}
      rowKey='id'
    />
  );
}
