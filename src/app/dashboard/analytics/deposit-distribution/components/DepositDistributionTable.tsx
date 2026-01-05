'use client';

import React from 'react';

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

import type { DepositRange, DepositDistributionResponse } from '../types';

interface DepositDistributionTableProps {
  /** 储值分布数据 */
  data: DepositDistributionResponse | null;
  /** 加载状态 */
  loading?: boolean;
}

/**
 * 格式化金额
 */
function formatAmount(amount: string | null): string {
  if (amount === null) {
    return '-';
  }
  const num = parseFloat(amount);
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * 格式化数字
 */
function formatNumber(value: number): string {
  return value.toLocaleString('zh-CN');
}

/**
 * 计算百分比
 */
function calculatePercentage(count: number, total: number): string {
  if (total === 0) {
    return '0.00%';
  }
  return `${((count / total) * 100).toFixed(2)}%`;
}

export function DepositDistributionTable({
  data,
  loading = false
}: DepositDistributionTableProps) {
  if (loading && !data) {
    return (
      <Card>
        <div className='space-y-3 p-4'>
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className='h-12 w-full' />
          ))}
        </div>
      </Card>
    );
  }

  if (!data || !data.ranges || data.ranges.length === 0) {
    return (
      <Card>
        <div className='flex h-64 items-center justify-center'>
          <p className='text-muted-foreground text-sm'>暂无数据</p>
        </div>
      </Card>
    );
  }

  const totalOrders = data.total_orders || 0;

  return (
    <Card>
      <div className='p-4'>
        {/* 统计摘要 */}
        <div className='bg-muted/50 mb-4 flex items-center justify-between rounded-lg p-4'>
          <div>
            <p className='text-muted-foreground text-sm'>统计日期范围</p>
            <p className='mt-1 text-lg font-semibold'>
              {data.start_date} 至 {data.end_date}
            </p>
          </div>
          <div className='text-right'>
            <p className='text-muted-foreground text-sm'>总订单数</p>
            <p className='mt-1 text-lg font-semibold'>
              {formatNumber(totalOrders)}
            </p>
          </div>
        </div>

        {/* 数据表格 */}
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-[100px] text-center'>序号</TableHead>
                <TableHead className='w-[150px]'>金额范围</TableHead>
                <TableHead className='w-[150px] text-right'>最小金额</TableHead>
                <TableHead className='w-[150px] text-right'>最大金额</TableHead>
                <TableHead className='w-[150px] text-right'>订单数量</TableHead>
                <TableHead className='w-[150px] text-right'>占比</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.ranges.map((range: DepositRange, index: number) => {
                const percentage = calculatePercentage(
                  range.order_count,
                  totalOrders
                );
                return (
                  <TableRow key={range.range_label}>
                    <TableCell className='text-center'>{index + 1}</TableCell>
                    <TableCell className='font-medium'>
                      {range.range_label}
                    </TableCell>
                    <TableCell className='text-right'>
                      {formatAmount(range.min_amount)}
                    </TableCell>
                    <TableCell className='text-right'>
                      {formatAmount(range.max_amount)}
                    </TableCell>
                    <TableCell className='text-right font-semibold'>
                      {formatNumber(range.order_count)}
                    </TableCell>
                    <TableCell className='text-muted-foreground text-right'>
                      {percentage}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
}
