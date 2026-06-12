'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DollarSign,
  CreditCard,
  TrendingDown,
  CheckCircle,
  XCircle
} from 'lucide-react';
import type { WithdrawOrderStats } from '../types';

interface WithdrawOrderStatsCardsProps {
  stats: WithdrawOrderStats | null;
  loading: boolean;
}

export function WithdrawOrderStatsCards({
  stats,
  loading
}: WithdrawOrderStatsCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('zh-CN').format(value);
  };

  const cards = [
    {
      title: '提现总金额',
      value: stats ? formatCurrency(stats.totalAmount) : '-',
      icon: DollarSign,
      color: 'text-blue-600'
    },
    {
      title: '手续费总额',
      value: stats ? formatCurrency(stats.totalFee) : '-',
      icon: CreditCard,
      color: 'text-orange-600'
    },
    {
      title: '实际出款金额',
      value: stats ? formatCurrency(stats.totalActualAmount) : '-',
      icon: TrendingDown,
      color: 'text-purple-600'
    },
    {
      title: '成功/失败笔数',
      value: stats
        ? `${formatNumber(stats.successCount)} / ${formatNumber(stats.failedCount)}`
        : '-',
      icon:
        stats && stats.successCount > stats.failedCount ? CheckCircle : XCircle,
      color:
        stats && stats.successCount > stats.failedCount
          ? 'text-green-600'
          : 'text-red-600'
    }
  ];

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>{card.title}</CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className='h-8 w-32' />
            ) : (
              <div className='text-2xl font-bold'>{card.value}</div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
