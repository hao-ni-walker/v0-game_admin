'use client';

import {
  ArrowDown,
  ArrowUp,
  DollarSign,
  Users,
  UserPlus,
  Repeat,
  Trophy
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RevenueSummary } from '@/service/api/revenue';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

interface KPICardsProps {
  data: RevenueSummary | null;
  loading: boolean;
}

export function KPICards({ data, loading }: KPICardsProps) {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);

  const formatNumber = (val: number) =>
    new Intl.NumberFormat('en-US').format(val);

  const formatPercent = (val: number) => `${(Math.abs(val) * 100).toFixed(1)}%`;

  const cards = [
    {
      title: 'Total GMV',
      value: data ? formatCurrency(data.gmv) : '-',
      change: data?.gmvChange || 0,
      icon: DollarSign,
      desc: 'Gross Merchandise Value (Total Revenue)',
      metric: 'gmv'
    },
    {
      title: 'Paying Users',
      value: data ? formatNumber(data.payingUsers) : '-',
      change: data?.payingUsersChange || 0,
      icon: Users,
      desc: 'Unique users who made a purchase',
      metric: 'payingUsers'
    },
    {
      title: 'New Paying Users',
      value: data ? formatNumber(data.newPayingUsers) : '-',
      change: data?.newPayingUsersChange || 0,
      icon: UserPlus,
      desc: 'First-time payers in this period',
      metric: 'newPaying'
    },
    {
      title: 'Returning P. Users',
      value: data ? formatNumber(data.returningPayingUsers) : '-',
      change: data?.returningPayingUsersChange || 0,
      icon: Repeat,
      desc: 'Existing users who paid again',
      metric: 'returning'
    },
    {
      title: 'ARPPU',
      value: data ? formatCurrency(data.arppu) : '-',
      change: data?.arppuChange || 0,
      icon: DollarSign,
      desc: 'Average Revenue Per Paying User',
      metric: 'arppu'
    },
    {
      title: 'Top Player Rev',
      value: data ? formatCurrency(data.topPlayerRevenue) : '-',
      change: data?.topPlayerChange || 0,
      icon: Trophy,
      desc: 'Highest revenue from a single player',
      metric: 'top'
    }
  ];

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'>
      {cards.map((card, index) => (
        <TooltipProvider key={index}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Card
                className={cn(
                  'cursor-default transition-shadow hover:shadow-md',
                  loading && 'opacity-60'
                )}
              >
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-muted-foreground text-sm font-medium'>
                    {card.title}
                  </CardTitle>
                  <card.icon className='text-muted-foreground h-4 w-4' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {loading ? '...' : card.value}
                  </div>
                  <div className='flex items-center pt-1 text-xs'>
                    {card.change !== 0 && (
                      <>
                        {card.change > 0 ? (
                          <ArrowUp className='mr-1 h-3 w-3 text-green-500' />
                        ) : (
                          <ArrowDown className='mr-1 h-3 w-3 text-red-500' />
                        )}
                        <span
                          className={
                            card.change > 0 ? 'text-green-500' : 'text-red-500'
                          }
                        >
                          {formatPercent(card.change)}
                        </span>
                        <span className='text-muted-foreground ml-1'>
                          vs prev
                        </span>
                      </>
                    )}
                    {card.change === 0 && (
                      <span className='text-muted-foreground'>No change</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>{card.desc}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
}
