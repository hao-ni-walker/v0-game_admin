'use client';

import React from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import type { OperationReportItem } from '../types';

interface OperationReportTableProps {
  /** 运营报表列表数据 */
  data: OperationReportItem[];
  /** 加载状态 */
  loading?: boolean;
}

/**
 * 格式化金额
 */
function formatAmount(amount: string | null): string {
  if (!amount || amount === 'null') return '0.00';
  const num = parseFloat(amount);
  if (isNaN(num)) return '0.00';
  return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 格式化日期
 */
function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return format(date, 'yyyy-MM-dd', { locale: zhCN });
  } catch {
    return dateStr;
  }
}

/**
 * 格式化百分比
 */
function formatPercentage(value: string | null): string {
  if (!value || value === 'null') return '-';
  const num = parseFloat(value);
  if (isNaN(num)) return '-';
  return `${num.toFixed(2)}%`;
}

export function OperationReportTable({
  data,
  loading = false
}: OperationReportTableProps) {
  if (loading && data.length === 0) {
    return (
      <Card>
        <div className='space-y-3 p-4'>
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} className='h-12 w-full' />
          ))}
        </div>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <div className='flex h-64 items-center justify-center'>
          <p className='text-muted-foreground text-sm'>暂无数据</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className='overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[100px] text-center'>统计时间</TableHead>
              <TableHead className='w-[100px] text-right'>访问人数</TableHead>
              <TableHead className='w-[100px] text-right'>注册人数</TableHead>
              <TableHead className='w-[120px] text-right'>
                新用户付费转化率
              </TableHead>
              <TableHead className='w-[140px] text-right'>
                新用户充值（金额/人数）
              </TableHead>
              <TableHead className='w-[120px] text-right'>
                首充（金额/人数）
              </TableHead>
              <TableHead className='w-[120px] text-right'>
                首充用户充值金额
              </TableHead>
              <TableHead className='w-[140px] text-right'>
                充值（金额/人数/笔数）
              </TableHead>
              <TableHead className='w-[120px] text-right'>
                ARPU（首充用户）
              </TableHead>
              <TableHead className='w-[100px] text-right'>ARPU</TableHead>
              <TableHead className='w-[120px] text-right'>
                提现（金额/人数）
              </TableHead>
              <TableHead className='w-[100px] text-right'>总营收</TableHead>
              <TableHead className='w-[100px] text-right'>收益比</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => {
              return (
                <TableRow key={item.stat_date}>
                  <TableCell className='text-center'>
                    {formatDate(item.stat_date)}
                  </TableCell>
                  <TableCell className='text-right'>
                    {item.visit_count}
                  </TableCell>
                  <TableCell className='text-right'>
                    {item.register_count}
                  </TableCell>
                  <TableCell className='text-right'>
                    {formatPercentage(item.new_user_paid_conversion_rate)}
                  </TableCell>
                  <TableCell className='text-right'>
                    {formatAmount(item.new_user_deposit_amount)} /{' '}
                    {item.new_user_deposit_count}
                  </TableCell>
                  <TableCell className='text-right'>
                    {formatAmount(item.first_deposit_amount)} /{' '}
                    {item.first_deposit_count}
                  </TableCell>
                  <TableCell className='text-right'>
                    {formatAmount(item.first_deposit_user_amount)}
                  </TableCell>
                  <TableCell className='text-right'>
                    {formatAmount(item.deposit_amount)} / {item.deposit_count} /{' '}
                    {item.deposit_order_count}
                  </TableCell>
                  <TableCell className='text-right'>
                    {formatAmount(item.arpu_first_deposit)}
                  </TableCell>
                  <TableCell className='text-right'>
                    {formatAmount(item.arpu)}
                  </TableCell>
                  <TableCell className='text-right'>
                    {formatAmount(item.withdraw_amount)} / {item.withdraw_count}
                  </TableCell>
                  <TableCell className='text-right font-medium'>
                    {formatAmount(item.total_revenue)}
                  </TableCell>
                  <TableCell className='text-right'>
                    {formatPercentage(item.profit_ratio)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
