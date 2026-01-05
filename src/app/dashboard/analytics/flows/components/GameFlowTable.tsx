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

import type { GameFlowItem, PaginationInfo } from '../types';

interface GameFlowTableProps {
  /** 游戏流水列表数据 */
  data: GameFlowItem[];
  /** 加载状态 */
  loading?: boolean;
  /** 分页信息 */
  pagination: PaginationInfo;
}

/**
 * 格式化金额
 */
function formatAmount(amount: string): string {
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
 * 格式化返奖率
 */
function formatRTP(rtp: string): string {
  const num = parseFloat(rtp);
  if (isNaN(num)) return '0.00';
  return `${num.toFixed(2)}%`;
}

export function GameFlowTable({
  data,
  loading = false,
  pagination
}: GameFlowTableProps) {
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
              <TableHead className='w-[120px]'>日期</TableHead>
              <TableHead className='w-[120px]'>平台名</TableHead>
              <TableHead className='min-w-[200px]'>游戏名称</TableHead>
              <TableHead className='w-[120px] text-right'>总下注</TableHead>
              <TableHead className='w-[120px] text-right'>输赢</TableHead>
              <TableHead className='w-[120px] text-right'>返奖率</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => {
              // 计算全局序号
              const globalIndex =
                (pagination.page - 1) * pagination.limit + index + 1;
              const profitLoss = parseFloat(item.profit_loss);
              const isProfit = profitLoss >= 0;

              return (
                <TableRow
                  key={`${item.bet_date}-${item.game_id}-${item.platform_id}`}
                >
                  <TableCell className='text-center'>{globalIndex}</TableCell>
                  <TableCell>{formatDate(item.bet_date)}</TableCell>
                  <TableCell>{item.platform_name}</TableCell>
                  <TableCell className='font-medium'>
                    {item.game_name}
                  </TableCell>
                  <TableCell className='text-right'>
                    {formatAmount(item.total_bet_amount)}
                  </TableCell>
                  <TableCell
                    className={`text-right font-medium ${
                      isProfit ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {isProfit ? '+' : ''}
                    {formatAmount(item.profit_loss)}
                  </TableCell>
                  <TableCell className='text-right'>
                    {formatRTP(item.rtp_rate)}
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
