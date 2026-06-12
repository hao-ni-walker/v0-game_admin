'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, UserCheck, UserX, Wallet, UserPlus } from 'lucide-react';
import { PlayerStatistics } from '../types';
import { formatCurrency } from '../utils';

interface PlayerStatisticsCardsProps {
  statistics: PlayerStatistics | null;
  loading: boolean;
  onRetry?: () => void;
}

/**
 * 统计卡片组件
 */
export function PlayerStatisticsCards({
  statistics,
  loading,
  onRetry
}: PlayerStatisticsCardsProps) {
  if (loading) {
    return (
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-5'>
        {[...Array(5)].map((_, i) => (
          <Card key={i} className='p-4'>
            <Skeleton className='h-8 w-24 mb-2' />
            <Skeleton className='h-4 w-16' />
          </Card>
        ))}
      </div>
    );
  }

  if (!statistics) {
    return (
      <Card className='p-4'>
        <div className='text-center text-muted-foreground'>
          <p>暂无统计数据</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className='mt-2 text-sm text-primary hover:underline'
            >
              重试
            </button>
          )}
        </div>
      </Card>
    );
  }

  const cards = [
    {
      title: '总玩家数',
      value: statistics.total_players,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      title: '启用玩家数',
      value: statistics.active_players,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      title: '禁用玩家数',
      value: statistics.disabled_players,
      icon: UserX,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/20'
    },
    {
      title: '总余额',
      value: formatCurrency(statistics.total_balance),
      icon: Wallet,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20'
    },
    {
      title: '今日新增',
      value: statistics.today_new_players,
      icon: UserPlus,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20'
    }
  ];

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-5'>
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className='p-4'>
            <div className='flex items-center justify-between'>
              <div className='flex-1'>
                <p className='text-sm font-medium text-muted-foreground'>
                  {card.title}
                </p>
                <p className='mt-1 text-2xl font-bold'>{card.value}</p>
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.bgColor}`}
              >
                <Icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

