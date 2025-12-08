'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Wallet, DollarSign, Gift, TrendingUp } from 'lucide-react';
import type { DepositOrderStats } from '../types';

interface DepositOrderStatsCardsProps {
  stats: DepositOrderStats | null;
  loading: boolean;
}

export function DepositOrderStatsCards({
  stats,
  loading
}: DepositOrderStatsCardsProps) {
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
      title: '订单数',
      value: stats ? formatNumber(stats.orderCount) : '-',
      icon: Wallet,
      color: 'text-blue-600'
    },
    {
      title: '充值总额',
      value: stats ? formatCurrency(stats.totalAmount) : '-',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: '实收金额',
      value: stats ? formatCurrency(stats.totalActualAmount) : '-',
      icon: TrendingUp,
      color: 'text-purple-600'
    },
    {
      title: '赠送金额',
      value: stats ? formatCurrency(stats.totalBonusAmount) : '-',
      icon: Gift,
      color: 'text-orange-600'
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
