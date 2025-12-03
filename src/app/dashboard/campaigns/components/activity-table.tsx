'use client';

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
  ArrowDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity } from '@/repository/models';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { STATUS_COLORS, STATUS_LABELS, TYPE_LABELS } from '../types';
import { Pagination } from '@/components/table/pagination';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

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
  const handleSort = (column: string) => {
    if (!onSort) return;
    if (sortBy === column) {
      onSort(column, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(column, 'asc');
    }
  };

  const renderSortableHeader = (column: string, label: string) => {
    const isActive = sortBy === column;
    return (
      <TableHead
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
                <ArrowUpDown className='h-4 w-4 text-muted-foreground opacity-50' />
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

  if (loading && activities.length === 0) {
    return (
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>活动编码</TableHead>
              <TableHead>活动名称</TableHead>
              <TableHead>活动类型</TableHead>
              <TableHead>活动状态</TableHead>
              <TableHead>活动时间</TableHead>
              <TableHead>展示时间</TableHead>
              <TableHead>优先级</TableHead>
              <TableHead>触发规则</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className='text-right'>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className='h-4 w-12' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-24' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-48' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-5 w-16' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-5 w-12' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-32' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-32' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-20' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-24' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-32' />
                </TableCell>
                <TableCell>
                  <Skeleton className='ml-auto h-8 w-8' />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              {renderSortableHeader('id', '活动ID')}
              <TableHead>活动编码</TableHead>
              <TableHead>活动名称</TableHead>
              <TableHead>活动类型</TableHead>
              <TableHead>活动状态</TableHead>
              {renderSortableHeader('start_time', '活动时间')}
              <TableHead>展示时间</TableHead>
              {renderSortableHeader('priority', '优先级')}
              <TableHead>触发规则</TableHead>
              {renderSortableHeader('created_at', '创建时间')}
              <TableHead className='text-right'>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell className='font-medium'>#{activity.id}</TableCell>
                <TableCell>
                  <code className='text-muted-foreground rounded bg-muted px-2 py-1 text-xs'>
                    {activity.activityCode}
                  </code>
                </TableCell>
                <TableCell className='max-w-md'>
                  <div className='truncate font-medium'>{activity.name}</div>
                  {activity.description && (
                    <div className='text-muted-foreground mt-1 truncate text-xs'>
                      {activity.description}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant='outline'>
                    {TYPE_LABELS[activity.activityType] || activity.activityType}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={STATUS_COLORS[activity.status] || ''}>
                    {STATUS_LABELS[activity.status] || activity.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className='text-muted-foreground cursor-help text-sm'>
                          {formatDateRange(activity.startTime, activity.endTime)}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className='text-xs'>
                          <div>开始: {formatDateTime(activity.startTime)}</div>
                          <div>结束: {formatDateTime(activity.endTime)}</div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>
                  {activity.displayStartTime && activity.displayEndTime ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className='text-muted-foreground cursor-help text-sm'>
                            {formatDateRange(
                              activity.displayStartTime,
                              activity.displayEndTime
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className='text-xs'>
                            <div>
                              开始: {formatDateTime(activity.displayStartTime)}
                            </div>
                            <div>
                              结束: {formatDateTime(activity.displayEndTime)}
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <span className='text-muted-foreground text-sm'>跟随活动时间</span>
                  )}
                </TableCell>
                <TableCell>{activity.priority}</TableCell>
                <TableCell>
                  <div className='text-muted-foreground text-sm'>
                    {/* 这里可以显示触发规则摘要，需要从后端获取 */}
                    <span>规则数: -</span>
                  </div>
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className='text-muted-foreground cursor-help text-sm'>
                          {formatDateTime(activity.createdAt)}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className='text-xs'>
                          <div>创建: {formatDateTime(activity.createdAt)}</div>
                          <div>更新: {formatDateTime(activity.updatedAt)}</div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell className='text-right'>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
