'use client';

import * as React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendDataPoint } from '@/service/api/revenue';
import { cn } from '@/lib/utils';

interface TrendChartProps {
  data: TrendDataPoint[];
  loading: boolean;
  period: 'hour' | 'day' | 'week';
  onPeriodChange: (period: 'hour' | 'day' | 'week') => void;
}

export function TrendChart({
  data,
  loading,
  period,
  onPeriodChange
}: TrendChartProps) {
  // Visible Lines State
  const [visible, setVisible] = React.useState({
    gmv: true,
    orders: false,
    payingUsers: false
  });

  const toggleVisibility = (key: keyof typeof visible) => {
    // Prevent hiding all
    const currentVisibleCount = Object.values(visible).filter(Boolean).length;
    if (visible[key] && currentVisibleCount === 1) return;
    setVisible((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className='bg-background rounded-lg border p-2 shadow-sm'>
          <div className='mb-2 font-medium'>{label}</div>
          {payload.map((entry: any) => (
            <div key={entry.name} className='flex items-center gap-2 text-sm'>
              <div
                className='h-2 w-2 rounded-full'
                style={{ backgroundColor: entry.color }}
              />
              <span className='text-muted-foreground'>
                {entry.name === 'gmv'
                  ? 'GMV'
                  : entry.name === 'orders'
                    ? 'Orders'
                    : 'Paying Users'}
                :
              </span>
              <span className='font-bold'>
                {entry.name === 'gmv'
                  ? `$${entry.value.toLocaleString()}`
                  : entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className='col-span-1 flex h-[450px] flex-col lg:col-span-4'>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
        <CardTitle className='text-base font-medium'>Revenue Trend</CardTitle>
        <Tabs
          value={period}
          onValueChange={(v) => onPeriodChange(v as any)}
          className='w-auto'
        >
          <TabsList>
            <TabsTrigger value='hour'>Hour</TabsTrigger>
            <TabsTrigger value='day'>Day</TabsTrigger>
            <TabsTrigger value='week'>Week</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className='min-h-0 flex-1 pl-0'>
        {loading ? (
          <div className='text-muted-foreground flex h-full items-center justify-center'>
            Loading chart...
          </div>
        ) : (
          <div className='h-full w-full'>
            {/* Custom Legend Control */}
            <div className='mb-2 flex justify-end gap-4 pr-6 text-sm'>
              <div
                className={cn(
                  'flex cursor-pointer items-center gap-1',
                  !visible.gmv && 'opacity-50'
                )}
                onClick={() => toggleVisibility('gmv')}
              >
                <div className='h-3 w-3 rounded-full bg-[#8884d8]' /> GMV
              </div>
              <div
                className={cn(
                  'flex cursor-pointer items-center gap-1',
                  !visible.orders && 'opacity-50'
                )}
                onClick={() => toggleVisibility('orders')}
              >
                <div className='h-3 w-3 rounded-full bg-[#82ca9d]' /> Orders
              </div>
              <div
                className={cn(
                  'flex cursor-pointer items-center gap-1',
                  !visible.payingUsers && 'opacity-50'
                )}
                onClick={() => toggleVisibility('payingUsers')}
              >
                <div className='h-3 w-3 rounded-full bg-[#ffc658]' /> Users
              </div>
            </div>

            <ResponsiveContainer width='100%' height='90%'>
              <AreaChart
                data={data}
                margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id='colorGmv' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='#8884d8' stopOpacity={0.8} />
                    <stop offset='95%' stopColor='#8884d8' stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id='colorOrders' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='#82ca9d' stopOpacity={0.8} />
                    <stop offset='95%' stopColor='#82ca9d' stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id='colorUsers' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='#ffc658' stopOpacity={0.8} />
                    <stop offset='95%' stopColor='#ffc658' stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey='time'
                  stroke='#888888'
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke='#888888'
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                  yAxisId='left'
                />
                <YAxis
                  stroke='#888888'
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                  yAxisId='right'
                  orientation='right'
                />
                <CartesianGrid
                  strokeDasharray='3 3'
                  vertical={false}
                  className='stroke-muted'
                />
                <Tooltip content={<CustomTooltip />} />

                {visible.gmv && (
                  <Area
                    yAxisId='left'
                    type='monotone'
                    dataKey='gmv'
                    stroke='#8884d8'
                    fillOpacity={1}
                    fill='url(#colorGmv)'
                    name='gmv'
                  />
                )}
                {visible.orders && (
                  <Area
                    yAxisId='right'
                    type='monotone'
                    dataKey='orders'
                    stroke='#82ca9d'
                    fillOpacity={1}
                    fill='url(#colorOrders)'
                    name='orders'
                  />
                )}
                {visible.payingUsers && (
                  <Area
                    yAxisId='right'
                    type='monotone'
                    dataKey='payingUsers'
                    stroke='#ffc658'
                    fillOpacity={1}
                    fill='url(#colorUsers)'
                    name='payingUsers'
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
