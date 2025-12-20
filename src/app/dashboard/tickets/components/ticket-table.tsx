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
import { MoreHorizontal, Eye, Trash2, AlertCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import type { Ticket } from '@/repository/models';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { TicketCommentInline } from './ticket-comment-inline';

interface TicketTableProps {
  tickets: (Ticket & {
    sla?: { isOverdue: boolean; remainingMinutes: number };
  })[];
  loading?: boolean;
  pagination: { page: number; page_size: number; total: number };
  onView: (ticket: Ticket) => void;
  onDelete: (ticket: Ticket) => void;
  onAssign: (ticketId: number, assigneeId: number | null) => void;
  onChangeStatus: (ticketId: number, status: string) => void;
  emptyState?: {
    icon: React.ReactNode;
    title: string;
    description: string;
    action?: React.ReactNode;
  };
}

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  in_progress:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  pending:
    'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  resolved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  closed: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  canceled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
};

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300',
  normal: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
};

const STATUS_LABELS: Record<string, string> = {
  open: '待处理',
  in_progress: '处理中',
  pending: '挂起',
  resolved: '已解决',
  closed: '已关闭',
  canceled: '已取消'
};

const PRIORITY_LABELS: Record<string, string> = {
  low: '低',
  normal: '普通',
  high: '高',
  urgent: '紧急'
};

export function TicketTable({
  tickets,
  loading,
  pagination,
  onView,
  onDelete,
  emptyState
}: TicketTableProps) {
  if (loading) {
    return (
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>标题</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>优先级</TableHead>
              <TableHead>分类</TableHead>
              <TableHead>截止时间</TableHead>
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

  if (!tickets || tickets.length === 0) {
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
            <TableHead>标题</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>优先级</TableHead>
            <TableHead>分类</TableHead>
            <TableHead>截止时间</TableHead>
            <TableHead>创建时间</TableHead>
            <TableHead className='text-right'>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => (
            <>
              <TableRow key={ticket.id}>
                <TableCell className='font-medium'>#{ticket.id}</TableCell>
                <TableCell className='max-w-md'>
                  <div className='truncate font-medium'>{ticket.title}</div>
                  {ticket.tags && ticket.tags.length > 0 && (
                    <div className='mt-1 flex gap-1'>
                      {ticket.tags.slice(0, 2).map((tag, i) => (
                        <Badge key={i} variant='outline' className='text-xs'>
                          {tag}
                        </Badge>
                      ))}
                      {ticket.tags.length > 2 && (
                        <Badge variant='outline' className='text-xs'>
                          +{ticket.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge className={STATUS_COLORS[ticket.status] || ''}>
                    {STATUS_LABELS[ticket.status] || ticket.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={PRIORITY_COLORS[ticket.priority] || ''}>
                    {PRIORITY_LABELS[ticket.priority] || ticket.priority}
                  </Badge>
                </TableCell>
                <TableCell>{ticket.category}</TableCell>
                <TableCell>
                  {ticket.dueAt ? (
                    <div className='flex items-center gap-1'>
                      {ticket.sla?.isOverdue && (
                        <AlertCircle className='h-3.5 w-3.5 text-red-500' />
                      )}
                      <span
                        className={
                          ticket.sla?.isOverdue
                            ? 'font-medium text-red-500'
                            : ''
                        }
                      >
                        {formatDistanceToNow(new Date(ticket.dueAt), {
                          locale: zhCN,
                          addSuffix: true
                        })}
                      </span>
                    </div>
                  ) : (
                    <span className='text-muted-foreground'>-</span>
                  )}
                </TableCell>
                <TableCell className='text-muted-foreground'>
                  {formatDistanceToNow(new Date(ticket.createdAt), {
                    locale: zhCN,
                    addSuffix: true
                  })}
                </TableCell>
                <TableCell className='text-right'>
                  <div className='flex items-center justify-end gap-2'>
                    <TicketCommentInline
                      ticketId={ticket.id}
                      onCommentAdded={() => {
                        // 可以在这里触发列表刷新
                      }}
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' className='h-8 w-8 p-0'>
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem onClick={() => onView(ticket)}>
                          <Eye className='mr-2 h-4 w-4' />
                          查看详情
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(ticket)}
                          className='text-red-600'
                        >
                          <Trash2 className='mr-2 h-4 w-4' />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            </>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
