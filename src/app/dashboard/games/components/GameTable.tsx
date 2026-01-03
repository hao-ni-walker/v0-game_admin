import React, { useMemo } from 'react';
import Image from 'next/image';
import {
  Edit,
  Copy,
  Star,
  StarOff,
  Smartphone,
  Gamepad,
  Trophy,
  Gift,
  CheckCircle,
  Ban,
  Trash2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
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
  selectedGameIds: number[];
  onEdit: (game: Game) => void;
  onDelete: (game: Game) => void;
  onToggleStatus: (game: Game) => void;
  onToggleFeatured: (game: Game) => void;
  onToggleNew: (game: Game) => void;
  onSelectGame: (gameId: number, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onBatchEnable?: (gameIds: number[]) => void;
  onBatchDisable?: (gameIds: number[]) => void;
  onBatchFeature?: (gameIds: number[]) => void;
  onBatchUnfeature?: (gameIds: number[]) => void;
  onBatchDelete?: (gameIds: number[]) => void;
  emptyState?: EmptyStateProps;
}

/**
 * 游戏表格组件
 */
export function GameTable({
  games,
  loading,
  pagination,
  selectedGameIds,
  onEdit,
  onDelete,
  onToggleStatus,
  onToggleFeatured,
  onToggleNew,
  onSelectGame,
  onSelectAll,
  onBatchEnable,
  onBatchDisable,
  onBatchFeature,
  onBatchUnfeature,
  onBatchDelete,
  emptyState
}: GameTableProps) {
  // 复制游戏ID
  const handleCopyGameId = (gameId: string) => {
    navigator.clipboard.writeText(gameId);
    toast.success('游戏标识已复制');
  };

  // 全选状态
  const isAllSelected = useMemo(() => {
    return games.length > 0 && selectedGameIds.length === games.length;
  }, [games.length, selectedGameIds.length]);

  // 部分选中状态
  const isIndeterminate = useMemo(() => {
    return selectedGameIds.length > 0 && selectedGameIds.length < games.length;
  }, [selectedGameIds.length, games.length]);

  // 处理全选
  const handleSelectAll = (checked: boolean) => {
    onSelectAll(checked);
  };

  // 处理批量启用
  const handleBatchEnable = () => {
    if (onBatchEnable && selectedGameIds.length > 0) {
      onBatchEnable(selectedGameIds);
    }
  };

  // 处理批量停用
  const handleBatchDisable = () => {
    if (onBatchDisable && selectedGameIds.length > 0) {
      onBatchDisable(selectedGameIds);
    }
  };

  // 处理批量推荐
  const handleBatchFeature = () => {
    if (onBatchFeature && selectedGameIds.length > 0) {
      onBatchFeature(selectedGameIds);
    }
  };

  // 处理批量取消推荐
  const handleBatchUnfeature = () => {
    if (onBatchUnfeature && selectedGameIds.length > 0) {
      onBatchUnfeature(selectedGameIds);
    }
  };

  // 处理批量删除
  const handleBatchDelete = () => {
    if (onBatchDelete && selectedGameIds.length > 0) {
      onBatchDelete(selectedGameIds);
    }
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
                <div className='bg-muted flex h-10 w-10 items-center justify-center rounded-md'>
                  <Gamepad className='text-muted-foreground h-5 w-5' />
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
                className='text-muted-foreground hover:text-foreground h-3 w-3 cursor-pointer'
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
                <div className='text-muted-foreground line-clamp-1 text-xs'>
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
            <Badge variant='outline'>{CATEGORY_LABELS[value] || value}</Badge>
          );
        }
      };
    }

    if (col.key === 'provider_code') {
      return {
        ...col,
        render: (value: string) => {
          return (
            <Badge variant='secondary'>{PROVIDER_LABELS[value] || value}</Badge>
          );
        }
      };
    }

    if (col.key === 'min_bet') {
      return {
        ...col,
        render: (value: number | undefined) => {
          return value !== undefined && value !== null ? (
            <span className='font-mono text-xs'>{value.toFixed(2)}</span>
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
            <span className='font-mono text-xs'>{value.toFixed(2)}</span>
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
              {record.is_new && <Badge className='text-xs'>新</Badge>}
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
              <Switch
                checked={value}
                onCheckedChange={() => onToggleStatus(record)}
              />
            </div>
          );
        }
      };
    }

    if (col.key === 'is_featured') {
      return {
        ...col,
        render: (value: boolean, record: Game) => {
          return (
            <div className='flex justify-center'>
              <Switch
                checked={value}
                onCheckedChange={() => onToggleFeatured(record)}
              />
            </div>
          );
        }
      };
    }

    if (col.key === 'is_new') {
      return {
        ...col,
        render: (value: boolean, record: Game) => {
          return (
            <div className='flex justify-center'>
              <Switch
                checked={value}
                onCheckedChange={() => onToggleNew(record)}
              />
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
                游玩:{' '}
                <span className='font-mono'>{record.play_count || 0}</span>
              </div>
              {record.popularity_score !== undefined && (
                <div>
                  热度:{' '}
                  <span className='font-mono'>
                    {Number(record.popularity_score).toFixed(2)}
                  </span>
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

  // 添加选择列
  const columnsWithSelection = [
    {
      key: 'selection',
      title: (
        <div className='flex items-center gap-2'>
          <Checkbox
            checked={isAllSelected}
            onCheckedChange={handleSelectAll}
            ref={(el) => {
              if (el) {
                // 访问底层 DOM 元素设置 indeterminate 状态
                const input = el.querySelector(
                  'input'
                ) as HTMLInputElement | null;
                if (input) {
                  input.indeterminate = isIndeterminate;
                }
              }
            }}
          />
        </div>
      ),
      className: 'w-[50px]',
      render: (value: any, record: Game) => (
        <Checkbox
          checked={selectedGameIds.includes(record.id)}
          onCheckedChange={(checked) =>
            onSelectGame(record.id, checked === true)
          }
        />
      )
    },
    ...columns
  ];

  return (
    <div className='space-y-2'>
      {/* 批量操作栏 */}
      {selectedGameIds.length > 0 && (
        <div className='bg-muted/50 flex items-center gap-2 rounded-lg border p-3'>
          <span className='text-sm font-medium'>
            已选择 <strong>{selectedGameIds.length}</strong> 个游戏
          </span>
          {onBatchEnable && (
            <Button
              variant='outline'
              size='sm'
              onClick={handleBatchEnable}
              className='h-7 text-xs'
            >
              <CheckCircle className='mr-2 h-4 w-4' />
              批量启用
            </Button>
          )}
          {onBatchDisable && (
            <Button
              variant='outline'
              size='sm'
              onClick={handleBatchDisable}
              className='h-7 text-xs'
            >
              <Ban className='mr-2 h-4 w-4' />
              批量停用
            </Button>
          )}
          {onBatchFeature && (
            <Button
              variant='outline'
              size='sm'
              onClick={handleBatchFeature}
              className='h-7 text-xs'
            >
              <Star className='mr-2 h-4 w-4' />
              批量推荐
            </Button>
          )}
          {onBatchUnfeature && (
            <Button
              variant='outline'
              size='sm'
              onClick={handleBatchUnfeature}
              className='h-7 text-xs'
            >
              <StarOff className='mr-2 h-4 w-4' />
              取消推荐
            </Button>
          )}
          {onBatchDelete && (
            <Button
              variant='destructive'
              size='sm'
              onClick={handleBatchDelete}
              className='h-7 text-xs'
            >
              <Trash2 className='mr-2 h-4 w-4' />
              批量删除
            </Button>
          )}
          <Button
            variant='ghost'
            size='sm'
            onClick={() => handleSelectAll(false)}
            className='h-7 text-xs'
          >
            取消选择
          </Button>
        </div>
      )}
      <DataTable
        columns={columnsWithSelection}
        data={games}
        loading={loading}
        emptyText={MESSAGES.EMPTY.GAMES}
        emptyState={emptyState}
        rowKey='id'
      />
    </div>
  );
}
