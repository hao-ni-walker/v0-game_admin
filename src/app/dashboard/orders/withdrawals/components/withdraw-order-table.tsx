'use client';

import { useState } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { MoreHorizontal, Eye, Copy, CheckCircle, XCircle } from 'lucide-react';
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
import type { WithdrawOrder } from '../types';
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '../constants';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { toast } from 'sonner';

interface WithdrawOrderTableProps {
  orders: WithdrawOrder[];
  loading?: boolean;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  onView: (order: WithdrawOrder) => void;
  onAudit?: (order: WithdrawOrder) => void;
  onSelectChange?: (selectedIds: number[]) => void;
  emptyState?: {
    icon: React.ReactNode;
    title: string;
    description: string;
    action?: React.ReactNode;
  };
}

// 脱敏显示账户号
const maskAccountNumber = (accountNumber?: string | null) => {
  if (!accountNumber) return '—';
  if (accountNumber.length <= 8) return accountNumber;
  const start = accountNumber.slice(0, 4);
  const end = accountNumber.slice(-4);
  return `${start}****${end}`;
};

export function WithdrawOrderTable({
  orders,
  loading,
  pagination,
  onView,
  onAudit,
  onSelectChange,
  emptyState
}: WithdrawOrderTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

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

  // 全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelected = new Set(
        orders.filter((o) => o.status === 'pending_audit').map((o) => o.id)
      );
      setSelectedIds(newSelected);
      onSelectChange?.(Array.from(newSelected));
    } else {
      setSelectedIds(new Set());
      onSelectChange?.([]);
    }
  };

  // 单选
  const handleSelectOne = (orderId: number, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(orderId);
    } else {
      newSelected.delete(orderId);
    }
    setSelectedIds(newSelected);
    onSelectChange?.(Array.from(newSelected));
  };

  const canSelectAll =
    orders.filter((o) => o.status === 'pending_audit').length > 0;
  const allSelected =
    canSelectAll &&
    orders
      .filter((o) => o.status === 'pending_audit')
      .every((o) => selectedIds.has(o.id));
  const someSelected = orders
    .filter((o) => o.status === 'pending_audit')
    .some((o) => selectedIds.has(o.id));

  if (loading) {
    return (
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-12'>
                <Checkbox disabled />
              </TableHead>
              <TableHead>订单号</TableHead>
              <TableHead>用户信息</TableHead>
              <TableHead className='text-right'>提现金额</TableHead>
              <TableHead className='text-right'>手续费</TableHead>
              <TableHead className='text-right'>实际出款金额</TableHead>
              <TableHead>渠道</TableHead>
              <TableHead>提现账户</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>审核信息</TableHead>
              <TableHead>完成时间</TableHead>
              <TableHead>IP 地址</TableHead>
              <TableHead className='text-right'>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className='h-4 w-4' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-32' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-24' />
                </TableCell>
                <TableCell>
                  <Skeleton className='ml-auto h-4 w-20' />
                </TableCell>
                <TableCell>
                  <Skeleton className='ml-auto h-4 w-16' />
                </TableCell>
                <TableCell>
                  <Skeleton className='ml-auto h-4 w-20' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-20' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-24' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-5 w-16' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-32' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-32' />
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
            <TableHead className='w-12'>
              <Checkbox
                checked={allSelected}
                onCheckedChange={handleSelectAll}
                disabled={!canSelectAll}
              />
            </TableHead>
            <TableHead>订单号</TableHead>
            <TableHead>用户信息</TableHead>
            <TableHead className='text-right'>提现金额</TableHead>
            <TableHead className='text-right'>手续费</TableHead>
            <TableHead className='text-right'>实际出款金额</TableHead>
            <TableHead>渠道</TableHead>
            <TableHead>提现账户</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>审核信息</TableHead>
            <TableHead>完成时间</TableHead>
            <TableHead>IP 地址</TableHead>
            <TableHead className='text-right'>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const canSelect = order.status === 'pending_audit';
            return (
              <TableRow key={order.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.has(order.id)}
                    onCheckedChange={(checked) =>
                      handleSelectOne(order.id, checked as boolean)
                    }
                    disabled={!canSelect}
                  />
                </TableCell>
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
                <TableCell className='text-right font-medium'>
                  {formatCurrency(order.amount)}
                </TableCell>
                <TableCell className='text-right'>
                  {formatCurrency(order.fee)}
                </TableCell>
                <TableCell className='text-right font-semibold text-green-600'>
                  {formatCurrency(order.actualAmount)}
                </TableCell>
                <TableCell>
                  <div>{order.paymentChannelName || '-'}</div>
                  {order.channelType && (
                    <div className='text-muted-foreground text-xs'>
                      {order.channelType === 'bank'
                        ? '银行卡'
                        : order.channelType === 'usdt'
                          ? 'USDT'
                          : order.channelType}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className='text-sm'>
                    {order.bankName && <div>{order.bankName}</div>}
                    {order.accountName && (
                      <div className='text-muted-foreground'>
                        {order.accountName}
                      </div>
                    )}
                    <div className='font-mono'>
                      {maskAccountNumber(order.accountNumber)}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={ORDER_STATUS_COLORS[order.status] || ''}>
                    {ORDER_STATUS_LABELS[order.status] || order.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {order.auditorName && order.auditAt ? (
                    <div>
                      <div className='text-sm'>{order.auditorName}</div>
                      <div className='text-muted-foreground text-xs'>
                        {formatDateTime(order.auditAt)}
                      </div>
                    </div>
                  ) : (
                    <span className='text-muted-foreground'>未审核</span>
                  )}
                </TableCell>
                <TableCell className='text-muted-foreground'>
                  {order.completedAt ? formatDateTime(order.completedAt) : '—'}
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className='text-sm'>
                          {order.ipAddress || '—'}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>归属地: 待接入 IP 库</p>
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
                      <DropdownMenuItem onClick={() => onView(order)}>
                        <Eye className='mr-2 h-4 w-4' />
                        查看详情
                      </DropdownMenuItem>
                      {order.status === 'pending_audit' && onAudit && (
                        <DropdownMenuItem onClick={() => onAudit(order)}>
                          <CheckCircle className='mr-2 h-4 w-4' />
                          审核
                        </DropdownMenuItem>
                      )}
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
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
