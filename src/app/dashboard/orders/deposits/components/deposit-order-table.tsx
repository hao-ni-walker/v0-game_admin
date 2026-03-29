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
import { MoreHorizontal, Eye, Copy, ExternalLink } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import type { DepositOrder } from '../types';
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '../constants';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { toast } from 'sonner';

interface DepositOrderTableProps {
  orders: DepositOrder[];
  loading?: boolean;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  onView: (order: DepositOrder) => void;
  emptyState?: {
    icon: React.ReactNode;
    title: string;
    description: string;
    action?: React.ReactNode;
  };
}

export function DepositOrderTable({
  orders,
  loading,
  pagination,
  onView,
  emptyState
}: DepositOrderTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'yyyy-MM-dd HH:mm:ss', {
      locale: zhCN
    });
  };

  const copyOrderNo = (orderNo: string) => {
    navigator.clipboard.writeText(orderNo);
    toast.success('订单号已复制');
  };

  if (loading) {
    return (
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>订单号</TableHead>
              <TableHead>用户信息</TableHead>
              <TableHead>渠道</TableHead>
              <TableHead className='text-right'>充值金额</TableHead>
              <TableHead className='text-right'>手续费</TableHead>
              <TableHead className='text-right'>赠送金额</TableHead>
              <TableHead className='text-right'>实收金额</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>IP 地址</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead>完成时间</TableHead>
              <TableHead className='text-right'>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className='h-4 w-32' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-24' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-20' />
                </TableCell>
                <TableCell>
                  <Skeleton className='ml-auto h-4 w-20' />
                </TableCell>
                <TableCell>
                  <Skeleton className='ml-auto h-4 w-16' />
                </TableCell>
                <TableCell>
                  <Skeleton className='ml-auto h-4 w-16' />
                </TableCell>
                <TableCell>
                  <Skeleton className='ml-auto h-4 w-20' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-5 w-16' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-24' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-32' />
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

  if (!orders || orders.length === 0) {
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
    <div className='overflow-x-auto rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>订单号</TableHead>
            <TableHead>用户信息</TableHead>
            <TableHead>渠道</TableHead>
            <TableHead className='text-right'>充值金额</TableHead>
            <TableHead className='text-right'>手续费</TableHead>
            <TableHead className='text-right'>赠送金额</TableHead>
            <TableHead className='text-right'>实收金额</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>IP 地址</TableHead>
            <TableHead>创建时间</TableHead>
            <TableHead>完成时间</TableHead>
            <TableHead className='text-right'>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => onView(order)}
                        className='text-primary font-medium hover:underline'
                      >
                        {order.orderNo}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>点击查看详情</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {order.channelOrderNo && (
                  <div className='text-muted-foreground mt-1 text-xs'>
                    渠道: {order.channelOrderNo}
                  </div>
                )}
              </TableCell>
              <TableCell>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <div className='font-medium'>
                          {order.userId}
                          {order.nickname && ` / ${order.nickname}`}
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className='space-y-1'>
                        {order.phone && <p>手机号: {order.phone}</p>}
                        {order.email && <p>邮箱: {order.email}</p>}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
              <TableCell>
                <div>{order.paymentChannelName || '-'}</div>
                {order.paymentChannelCode && (
                  <div className='text-muted-foreground text-xs'>
                    {order.paymentChannelCode}
                  </div>
                )}
              </TableCell>
              <TableCell className='text-right font-medium'>
                {formatCurrency(order.amount)}
              </TableCell>
              <TableCell className='text-right'>
                {formatCurrency(order.fee)}
              </TableCell>
              <TableCell className='text-right'>
                {order.bonusAmount > 0 ? (
                  <span className='text-orange-600'>
                    {formatCurrency(order.bonusAmount)}
                  </span>
                ) : (
                  <span className='text-muted-foreground'>—</span>
                )}
              </TableCell>
              <TableCell className='text-right font-semibold text-green-600'>
                {order.actualAmount !== null && order.actualAmount !== undefined
                  ? formatCurrency(order.actualAmount)
                  : '—'}
              </TableCell>
              <TableCell>
                <Badge className={ORDER_STATUS_COLORS[order.status] || ''}>
                  {ORDER_STATUS_LABELS[order.status] || order.status}
                </Badge>
              </TableCell>
              <TableCell>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className='text-sm'>{order.ipAddress || '—'}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>归属地: 待接入 IP 库</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
              <TableCell className='text-muted-foreground'>
                {formatDateTime(order.createdAt)}
              </TableCell>
              <TableCell className='text-muted-foreground'>
                {order.completedAt ? formatDateTime(order.completedAt) : '—'}
              </TableCell>
              <TableCell className='text-right'>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' className='h-8 w-8 p-0'>
                      <MoreHorizontal className='h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem onClick={() => onView(order)}>
                      <Eye className='mr-2 h-4 w-4' />
                      查看详情
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => copyOrderNo(order.orderNo)}
                    >
                      <Copy className='mr-2 h-4 w-4' />
                      复制订单号
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
