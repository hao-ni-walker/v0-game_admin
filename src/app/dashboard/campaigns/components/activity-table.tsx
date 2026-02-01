'use client';

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MoreHorizontal,
  Eye,
  Edit,
  Settings,
  Play,
  Pause,
  Square,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Columns
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity } from '@/repository/models';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import {
  STATUS_COLORS,
  STATUS_LABELS,
  TYPE_LABELS,
  TRIGGER_MODE_LABELS
} from '../types';
import { Pagination } from '@/components/table/pagination';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

// 定义所有可用的列
interface ColumnConfig {
  key: string;
  label: string;
  defaultVisible: boolean;
  essential?: boolean; // 核心列，不能隐藏
}

const COLUMN_CONFIGS: ColumnConfig[] = [
  { key: 'id', label: '活动ID', defaultVisible: true, essential: true },
  { key: 'activity_code', label: '活动编码', defaultVisible: true },
  { key: 'name', label: '活动名称', defaultVisible: true, essential: true },
  { key: 'type', label: '活动类型', defaultVisible: true },
  { key: 'status', label: '活动状态', defaultVisible: true, essential: true },
  { key: 'time', label: '活动时间', defaultVisible: true, essential: true },
  { key: 'display_time', label: '展示时间', defaultVisible: false },
  { key: 'priority', label: '优先级', defaultVisible: true },
  { key: 'participation_config', label: '活动限制', defaultVisible: false },
  { key: 'created_by', label: '创建者', defaultVisible: false },
  { key: 'updated_by', label: '更新者', defaultVisible: false },
  { key: 'match_criteria', label: '触发条件', defaultVisible: false },
  { key: 'trigger_mode', label: '触发模式', defaultVisible: false },
  { key: 'cooldown', label: '冷却时间', defaultVisible: false },
  { key: 'daily_limit', label: '每日限制', defaultVisible: false },
  { key: 'total_limit', label: '总限制', defaultVisible: false },
  { key: 'reward', label: '奖励', defaultVisible: false },
  { key: 'created_at', label: '创建时间', defaultVisible: false },
  { key: 'actions', label: '操作', defaultVisible: true, essential: true }
];

interface ActivityTableProps {
  activities: Activity[];
  loading?: boolean;
  pagination: { page: number; page_size: number; total: number };
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onView: (activity: Activity) => void;
  onEdit: (activity: Activity) => void;
  onConfigureRules: (activity: Activity) => void;
  onChangeStatus: (activityId: number, status: string) => void;
  onSort?: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  emptyState?: {
    icon: React.ReactNode;
    title: string;
    description: string;
    action?: React.ReactNode;
  };
  // 权限控制
  canWrite?: boolean;
  canChangeStatus?: boolean;
  canManageTriggers?: boolean;
}

export function ActivityTable({
  activities,
  loading,
  pagination,
  sortBy,
  sortOrder,
  onView,
  onEdit,
  onConfigureRules,
  onChangeStatus,
  onSort,
  onPageChange,
  onPageSizeChange,
  emptyState,
  canWrite = true,
  canChangeStatus = true,
  canManageTriggers = true
}: ActivityTableProps) {
  // 列显示状态管理（使用 localStorage 持久化）
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') {
      return new Set(
        COLUMN_CONFIGS.filter((col) => col.defaultVisible).map((col) => col.key)
      );
    }
    const saved = localStorage.getItem('activity-table-visible-columns');
    if (saved) {
      try {
        return new Set(JSON.parse(saved));
      } catch {
        // 如果解析失败，使用默认值
      }
    }
    return new Set(
      COLUMN_CONFIGS.filter((col) => col.defaultVisible).map((col) => col.key)
    );
  });

  // 保存列显示状态到 localStorage
  const updateVisibleColumns = (newColumns: Set<string>) => {
    setVisibleColumns(newColumns);
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'activity-table-visible-columns',
        JSON.stringify(Array.from(newColumns))
      );
    }
  };

  // 切换列显示
  const toggleColumn = (key: string) => {
    const config = COLUMN_CONFIGS.find((col) => col.key === key);
    if (config?.essential) return; // 核心列不能隐藏

    const newVisible = new Set(visibleColumns);
    if (newVisible.has(key)) {
      newVisible.delete(key);
    } else {
      newVisible.add(key);
    }
    updateVisibleColumns(newVisible);
  };

  const handleSort = (column: string) => {
    if (!onSort) return;
    if (sortBy === column) {
      onSort(column, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(column, 'asc');
    }
  };

  const renderSortableHeader = (column: string, label: string, key: string) => {
    const isActive = sortBy === column;
    return (
      <TableHead
        key={key}
        className={onSort ? 'cursor-pointer' : ''}
        onClick={() => onSort && handleSort(column)}
      >
        <div className='flex items-center gap-2'>
          {label}
          {onSort && (
            <>
              {isActive ? (
                sortOrder === 'asc' ? (
                  <ArrowUp className='h-4 w-4' />
                ) : (
                  <ArrowDown className='h-4 w-4' />
                )
              ) : (
                <ArrowUpDown className='text-muted-foreground h-4 w-4 opacity-50' />
              )}
            </>
          )}
        </div>
      </TableHead>
    );
  };

  const formatDateTime = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN });
    } catch {
      return dateStr;
    }
  };

  const formatDateRange = (start: string, end: string) => {
    try {
      const startDate = format(new Date(start), 'yyyy-MM-dd', { locale: zhCN });
      const endDate = format(new Date(end), 'yyyy-MM-dd', { locale: zhCN });
      return `${startDate} ~ ${endDate}`;
    } catch {
      return `${start} ~ ${end}`;
    }
  };

  // 格式化参与配置显示
  const formatParticipationConfig = (
    config: Record<string, unknown> | undefined
  ) => {
    if (!config || typeof config !== 'object') return '-';
    const parts: string[] = [];
    if (config.total_stock !== undefined)
      parts.push(`库存: ${config.total_stock}`);
    if (config.purchase_limit_per_user !== undefined)
      parts.push(`限购: ${config.purchase_limit_per_user}`);
    if (config.eligible_vip_min !== undefined)
      parts.push(`VIP: ≥${config.eligible_vip_min}`);
    return parts.length > 0 ? parts.join(', ') : '-';
  };

  // 格式化触发条件显示
  const formatMatchCriteria = (
    criteria: Record<string, unknown> | undefined
  ) => {
    if (!criteria || typeof criteria !== 'object') return '-';
    if (criteria.event_type) return String(criteria.event_type);
    return JSON.stringify(criteria).substring(0, 30) + '...';
  };

  // 格式化奖励显示
  const formatRewardItems = (items: unknown[] | undefined) => {
    if (!items || !Array.isArray(items) || items.length === 0) return '-';
    return items
      .map((item: any) => {
        if (item.type && item.amount) {
          return `${item.type}: ${item.amount}`;
        }
        return JSON.stringify(item).substring(0, 20);
      })
      .join(', ');
  };

  // 格式化时间（秒转小时）
  const formatSeconds = (seconds: number | null | undefined) => {
    if (!seconds) return '-';
    if (seconds < 60) return `${seconds}秒`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟`;
    return `${Math.floor(seconds / 3600)}小时`;
  };

  // 渲染表格单元格
  const renderCell = (activity: Activity, columnKey: string) => {
    switch (columnKey) {
      case 'id':
        return <TableCell className='font-medium'>#{activity.id}</TableCell>;

      case 'activity_code':
        return (
          <TableCell>
            <code className='text-muted-foreground bg-muted rounded px-2 py-1 text-xs'>
              {(activity as any).activity_code || activity.activityCode}
            </code>
          </TableCell>
        );

      case 'name':
        return (
          <TableCell key={columnKey} className='max-w-md'>
            <div className='truncate font-medium'>{activity.name}</div>
            {activity.description && (
              <div className='text-muted-foreground mt-1 truncate text-xs'>
                {activity.description}
              </div>
            )}
          </TableCell>
        );

      case 'type':
        return (
          <TableCell>
            <Badge variant='outline'>
              {TYPE_LABELS[
                (activity as any).activity_type || activity.activityType
              ] ||
                (activity as any).activity_type ||
                activity.activityType}
            </Badge>
          </TableCell>
        );

      case 'status':
        return (
          <TableCell>
            <Badge className={STATUS_COLORS[activity.status] || ''}>
              {STATUS_LABELS[activity.status] || activity.status}
            </Badge>
          </TableCell>
        );

      case 'time':
        return (
          <TableCell>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className='text-muted-foreground cursor-help text-sm'>
                    {formatDateRange(
                      (activity as any).start_time || activity.startTime,
                      (activity as any).end_time || activity.endTime
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className='text-xs'>
                    <div>
                      开始:{' '}
                      {formatDateTime(
                        (activity as any).start_time || activity.startTime
                      )}
                    </div>
                    <div>
                      结束:{' '}
                      {formatDateTime(
                        (activity as any).end_time || activity.endTime
                      )}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </TableCell>
        );

      case 'display_time':
        return (
          <TableCell>
            {activity.displayStartTime && activity.displayEndTime ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className='text-muted-foreground cursor-help text-sm'>
                      {formatDateRange(
                        (activity as any).display_start_time ||
                          activity.displayStartTime ||
                          '',
                        (activity as any).display_end_time ||
                          activity.displayEndTime ||
                          ''
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className='text-xs'>
                      <div>
                        开始:{' '}
                        {formatDateTime(
                          (activity as any).display_start_time ||
                            activity.displayStartTime ||
                            ''
                        )}
                      </div>
                      <div>
                        结束:{' '}
                        {formatDateTime(
                          (activity as any).display_end_time ||
                            activity.displayEndTime ||
                            ''
                        )}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <span className='text-muted-foreground text-sm'>
                跟随活动时间
              </span>
            )}
          </TableCell>
        );

      case 'priority':
        return <TableCell key={columnKey}>{activity.priority}</TableCell>;

      case 'participation_config':
        return (
          <TableCell>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className='text-muted-foreground max-w-[150px] cursor-help truncate text-sm'>
                    {formatParticipationConfig(
                      (activity as any).participation_config ||
                        activity.participationConfig
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className='max-w-xs text-xs'>
                    <pre className='whitespace-pre-wrap'>
                      {JSON.stringify(
                        (activity as any).participation_config ||
                          activity.participationConfig ||
                          {},
                        null,
                        2
                      )}
                    </pre>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </TableCell>
        );

      case 'created_by':
        return (
          <TableCell>
            <span className='text-muted-foreground text-sm'>
              #{(activity as any).created_by || activity.createdBy || '-'}
            </span>
          </TableCell>
        );

      case 'updated_by':
        return (
          <TableCell>
            <span className='text-muted-foreground text-sm'>
              #{(activity as any).updated_by || activity.updatedBy || '-'}
            </span>
          </TableCell>
        );

      case 'match_criteria':
        return (
          <TableCell>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className='text-muted-foreground max-w-[150px] cursor-help truncate text-sm'>
                    {formatMatchCriteria((activity as any).match_criteria)}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className='max-w-xs text-xs'>
                    <pre className='whitespace-pre-wrap'>
                      {JSON.stringify(
                        (activity as any).match_criteria || {},
                        null,
                        2
                      )}
                    </pre>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </TableCell>
        );

      case 'trigger_mode':
        return (
          <TableCell>
            <Badge variant='outline' className='text-xs'>
              {TRIGGER_MODE_LABELS[(activity as any).trigger_mode] ||
                (activity as any).trigger_mode ||
                '-'}
            </Badge>
          </TableCell>
        );

      case 'cooldown':
        return (
          <TableCell>
            <span className='text-muted-foreground text-sm'>
              {formatSeconds((activity as any).cooldown_seconds)}
            </span>
          </TableCell>
        );

      case 'daily_limit':
        return (
          <TableCell>
            <span className='text-muted-foreground text-sm'>
              {(activity as any).daily_limit_per_user ?? '-'}
            </span>
          </TableCell>
        );

      case 'total_limit':
        return (
          <TableCell>
            <span className='text-muted-foreground text-sm'>
              {(activity as any).total_limit ?? '-'}
            </span>
          </TableCell>
        );

      case 'reward':
        return (
          <TableCell>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className='text-muted-foreground max-w-[150px] cursor-help truncate text-sm'>
                    {formatRewardItems((activity as any).reward_items)}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className='max-w-xs text-xs'>
                    <pre className='whitespace-pre-wrap'>
                      {JSON.stringify(
                        (activity as any).reward_items || [],
                        null,
                        2
                      )}
                    </pre>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </TableCell>
        );

      case 'created_at':
        return (
          <TableCell>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className='text-muted-foreground cursor-help text-sm'>
                    {formatDateTime(
                      (activity as any).created_at || activity.createdAt
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className='text-xs'>
                    <div>
                      创建:{' '}
                      {formatDateTime(
                        (activity as any).created_at || activity.createdAt
                      )}
                    </div>
                    <div>
                      更新:{' '}
                      {formatDateTime(
                        (activity as any).updated_at || activity.updatedAt
                      )}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </TableCell>
        );

      case 'actions':
        return (
          <TableCell key={columnKey} className='text-right'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='h-8 w-8 p-0'>
                  <MoreHorizontal className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem onClick={() => onView(activity)}>
                  <Eye className='mr-2 h-4 w-4' />
                  查看详情
                </DropdownMenuItem>
                {canWrite && (
                  <DropdownMenuItem onClick={() => onEdit(activity)}>
                    <Edit className='mr-2 h-4 w-4' />
                    编辑
                  </DropdownMenuItem>
                )}
                {canManageTriggers && (
                  <DropdownMenuItem onClick={() => onConfigureRules(activity)}>
                    <Settings className='mr-2 h-4 w-4' />
                    配置规则
                  </DropdownMenuItem>
                )}
                {canChangeStatus && (
                  <>
                    <DropdownMenuSeparator />
                    {activity.status === 'draft' && (
                      <DropdownMenuItem
                        onClick={() => onChangeStatus(activity.id, 'scheduled')}
                      >
                        <Play className='mr-2 h-4 w-4' />
                        排期
                      </DropdownMenuItem>
                    )}
                    {activity.status === 'scheduled' && (
                      <DropdownMenuItem
                        onClick={() => onChangeStatus(activity.id, 'active')}
                      >
                        <Play className='mr-2 h-4 w-4' />
                        启用
                      </DropdownMenuItem>
                    )}
                    {activity.status === 'active' && (
                      <>
                        <DropdownMenuItem
                          onClick={() => onChangeStatus(activity.id, 'paused')}
                        >
                          <Pause className='mr-2 h-4 w-4' />
                          暂停
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onChangeStatus(activity.id, 'ended')}
                        >
                          <Square className='mr-2 h-4 w-4' />
                          结束
                        </DropdownMenuItem>
                      </>
                    )}
                    {activity.status === 'paused' && (
                      <>
                        <DropdownMenuItem
                          onClick={() => onChangeStatus(activity.id, 'active')}
                        >
                          <Play className='mr-2 h-4 w-4' />
                          恢复
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onChangeStatus(activity.id, 'ended')}
                        >
                          <Square className='mr-2 h-4 w-4' />
                          结束
                        </DropdownMenuItem>
                      </>
                    )}
                    {(activity.status === 'active' ||
                      activity.status === 'paused' ||
                      activity.status === 'scheduled') && (
                      <DropdownMenuItem
                        onClick={() => onChangeStatus(activity.id, 'disabled')}
                        className='text-red-600'
                      >
                        <Square className='mr-2 h-4 w-4' />
                        禁用
                      </DropdownMenuItem>
                    )}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        );

      default:
        return <TableCell>-</TableCell>;
    }
  };

  // 获取可见的列配置
  const visibleColumnConfigs = COLUMN_CONFIGS.filter((col) =>
    visibleColumns.has(col.key)
  );

  if (loading && activities.length === 0) {
    return (
      <div className='space-y-4'>
        <div className='flex justify-end'>
          <Button variant='outline' size='sm' className='gap-2' disabled>
            <Columns className='h-4 w-4' />
            列设置
          </Button>
        </div>
        <div className='rounded-md border'>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  {visibleColumnConfigs.map((col) => (
                    <TableHead key={col.key}>{col.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {visibleColumnConfigs.map((col) => (
                      <TableCell key={col.key}>
                        <Skeleton className='h-4 w-12' />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center rounded-md border border-dashed p-12 text-center'>
        {emptyState?.icon}
        <h3 className='mt-4 text-lg font-semibold'>
          {emptyState?.title || '暂无数据'}
        </h3>
        <p className='text-muted-foreground mt-2 text-sm'>
          {emptyState?.description}
        </p>
        {emptyState?.action}
      </div>
    );
  }

  const totalPages = Math.ceil(pagination.total / pagination.page_size);

  return (
    <div className='space-y-4'>
      {/* 列选择器 */}
      <div className='flex justify-end'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' size='sm' className='gap-2'>
              <Columns className='h-4 w-4' />
              列设置
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-48'>
            <DropdownMenuLabel>显示列</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {COLUMN_CONFIGS.map((col) => (
              <DropdownMenuCheckboxItem
                key={col.key}
                checked={visibleColumns.has(col.key)}
                onCheckedChange={() => toggleColumn(col.key)}
                disabled={col.essential}
              >
                {col.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className='rounded-md border'>
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow>
                {visibleColumnConfigs.map((col) => {
                  if (col.key === 'id') {
                    return renderSortableHeader('id', col.label, col.key);
                  }
                  if (col.key === 'time') {
                    return renderSortableHeader(
                      'start_time',
                      col.label,
                      col.key
                    );
                  }
                  if (col.key === 'priority') {
                    return renderSortableHeader('priority', col.label, col.key);
                  }
                  if (col.key === 'created_at') {
                    return renderSortableHeader(
                      'created_at',
                      col.label,
                      col.key
                    );
                  }
                  if (col.key === 'actions') {
                    return (
                      <TableHead key={col.key} className='text-right'>
                        {col.label}
                      </TableHead>
                    );
                  }
                  return <TableHead key={col.key}>{col.label}</TableHead>;
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity) => (
                <TableRow key={activity.id}>
                  {visibleColumnConfigs.map((col) => (
                    <React.Fragment key={col.key}>
                      {renderCell(activity, col.key)}
                    </React.Fragment>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 分页 */}
      {onPageChange && onPageSizeChange && (
        <Pagination
          pagination={{
            page: pagination.page,
            limit: pagination.page_size,
            total: pagination.total,
            totalPages
          }}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
}
