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

import type { UserRetentionItem, PaginationInfo } from '../types';

interface UserRetentionTableProps {
  /** 用户留存列表数据 */
  data: UserRetentionItem[];
  /** 加载状态 */
  loading?: boolean;
  /** 分页信息 */
  pagination: PaginationInfo;
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
function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

/**
 * 格式化数字
 */
function formatNumber(value: number): string {
  return value.toLocaleString('zh-CN');
}

export function UserRetentionTable({
  data,
  loading = false,
  pagination
}: UserRetentionTableProps) {
  if (loading && data.length === 0) {
    return (
      <Card>
        <div className='space-y-3 p-4'>
          {[...Array(5)].map((_, i) => (
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
              <TableHead className='w-[80px] text-center'>序号</TableHead>
              <TableHead className='w-[120px]'>统计时间</TableHead>
              <TableHead className='w-[100px] text-right'>注册人数</TableHead>
              <TableHead className='w-[100px] text-right'>充值人数</TableHead>
              <TableHead className='w-[140px] text-right'>1日留存</TableHead>
              <TableHead className='w-[140px] text-right'>
                1日充值人数
              </TableHead>
              <TableHead className='w-[140px] text-right'>3日留存</TableHead>
              <TableHead className='w-[140px] text-right'>
                3日充值人数
              </TableHead>
              <TableHead className='w-[140px] text-right'>5日留存</TableHead>
              <TableHead className='w-[140px] text-right'>
                5日充值人数
              </TableHead>
              <TableHead className='w-[140px] text-right'>7日留存</TableHead>
              <TableHead className='w-[140px] text-right'>
                7日充值人数
              </TableHead>
              <TableHead className='w-[140px] text-right'>15日留存</TableHead>
              <TableHead className='w-[140px] text-right'>
                15日充值人数
              </TableHead>
              <TableHead className='w-[140px] text-right'>30日留存</TableHead>
              <TableHead className='w-[140px] text-right'>
                30日充值人数
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => {
              // 计算全局序号
              const globalIndex =
                (pagination.page - 1) * pagination.limit + index + 1;

              return (
                <TableRow key={item.stat_date}>
                  <TableCell className='text-center'>{globalIndex}</TableCell>
                  <TableCell>{formatDate(item.stat_date)}</TableCell>
                  <TableCell className='text-right'>
                    {formatNumber(item.register_count)}
                  </TableCell>
                  <TableCell className='text-right'>
                    {formatNumber(item.deposit_count)}
                  </TableCell>
                  <TableCell className='text-right'>
                    {formatNumber(item.day1_retention.retention_count)} (
                    {formatPercentage(item.day1_retention.retention_rate)})
                  </TableCell>
                  <TableCell className='text-right'>
                    {formatNumber(item.day1_retention.deposit_count)} (
                    {formatPercentage(item.day1_retention.deposit_rate)})
                  </TableCell>
                  <TableCell className='text-right'>
                    {formatNumber(item.day3_retention.retention_count)} (
                    {formatPercentage(item.day3_retention.retention_rate)})
                  </TableCell>
                  <TableCell className='text-right'>
                    {formatNumber(item.day3_retention.deposit_count)} (
                    {formatPercentage(item.day3_retention.deposit_rate)})
                  </TableCell>
                  <TableCell className='text-right'>
                    {formatNumber(item.day5_retention.retention_count)} (
                    {formatPercentage(item.day5_retention.retention_rate)})
                  </TableCell>
                  <TableCell className='text-right'>
                    {formatNumber(item.day5_retention.deposit_count)} (
                    {formatPercentage(item.day5_retention.deposit_rate)})
                  </TableCell>
                  <TableCell className='text-right'>
                    {formatNumber(item.day7_retention.retention_count)} (
                    {formatPercentage(item.day7_retention.retention_rate)})
                  </TableCell>
                  <TableCell className='text-right'>
                    {formatNumber(item.day7_retention.deposit_count)} (
                    {formatPercentage(item.day7_retention.deposit_rate)})
                  </TableCell>
                  <TableCell className='text-right'>
                    {formatNumber(item.day15_retention.retention_count)} (
                    {formatPercentage(item.day15_retention.retention_rate)})
                  </TableCell>
                  <TableCell className='text-right'>
                    {formatNumber(item.day15_retention.deposit_count)} (
                    {formatPercentage(item.day15_retention.deposit_rate)})
                  </TableCell>
                  <TableCell className='text-right'>
                    {formatNumber(item.day30_retention.retention_count)} (
                    {formatPercentage(item.day30_retention.retention_rate)})
                  </TableCell>
                  <TableCell className='text-right'>
                    {formatNumber(item.day30_retention.deposit_count)} (
                    {formatPercentage(item.day30_retention.deposit_rate)})
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
