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
import { MoreHorizontal, Eye, Trash2, Play, Pause, Square } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity } from '@/repository/models';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { STATUS_COLORS, STATUS_LABELS, TYPE_LABELS } from '../types';

interface ActivityTableProps {
  activities: Activity[];
  loading?: boolean;
  pagination: { page: number; page_size: number; total: number };
  onView: (activity: Activity) => void;
  onDelete: (activity: Activity) => void;
  onChangeStatus: (activityId: number, status: string) => void;
  emptyState?: {
    icon: React.ReactNode;
    title: string;
    description: string;
    action?: React.ReactNode;
  };
}

export function ActivityTable({
  activities,
  loading,
  pagination,
  onView,
  onDelete,
  onChangeStatus,
  emptyState
}: ActivityTableProps) {
  if (loading) {
    return (
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>活动名称</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>优先级</TableHead>
              <TableHead>时间窗</TableHead>
              <TableHead>参与人数</TableHead>
              <TableHead>发放奖励</TableHead>
              <TableHead>更新时间</TableHead>
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
                  <Skeleton className='h-4 w-48' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-5 w-16' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-5 w-12' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-20' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-24' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-16' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-16' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-24' />
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

  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>活动名称</TableHead>
            <TableHead>类型</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>优先级</TableHead>
            <TableHead>时间窗</TableHead>
            <TableHead>参与人数</TableHead>
            <TableHead>发放奖励</TableHead>
            <TableHead>更新时间</TableHead>
            <TableHead className='text-right'>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activities.map((activity) => (
            <TableRow key={activity.id}>
              <TableCell className='font-medium'>#{activity.id}</TableCell>
              <TableCell className='max-w-md'>
                <div className='truncate font-medium'>{activity.name}</div>
                <div className='text-muted-foreground text-sm'>
                  {activity.activityCode}
                </div>
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
              <TableCell>{activity.priority}</TableCell>
              <TableCell className='text-muted-foreground'>
                {formatDistanceToNow(new Date(activity.startTime), {
                  locale: zhCN,
                  addSuffix: true
                })}
              </TableCell>
              <TableCell>{activity.totalParticipants}</TableCell>
              <TableCell>{activity.totalRewardsGiven}</TableCell>
              <TableCell className='text-muted-foreground'>
                {formatDistanceToNow(new Date(activity.updatedAt), {
                  locale: zhCN,
                  addSuffix: true
                })}
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
                    {activity.status === 'draft' && (
                      <DropdownMenuItem
                        onClick={() => onChangeStatus(activity.id, 'active')}
                      >
                        <Play className='mr-2 h-4 w-4' />
                        上线
                      </DropdownMenuItem>
                    )}
                    {activity.status === 'active' && (
                      <DropdownMenuItem
                        onClick={() => onChangeStatus(activity.id, 'paused')}
                      >
                        <Pause className='mr-2 h-4 w-4' />
                        暂停
                      </DropdownMenuItem>
                    )}
                    {activity.status === 'paused' && (
                      <DropdownMenuItem
                        onClick={() => onChangeStatus(activity.id, 'active')}
                      >
                        <Play className='mr-2 h-4 w-4' />
                        恢复
                      </DropdownMenuItem>
                    )}
                    {(activity.status === 'active' || activity.status === 'paused') && (
                      <DropdownMenuItem
                        onClick={() => onChangeStatus(activity.id, 'ended')}
                      >
                        <Square className='mr-2 h-4 w-4' />
                        结束
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => onDelete(activity)}
                      className='text-red-600'
                    >
                      <Trash2 className='mr-2 h-4 w-4' />
                      删除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
