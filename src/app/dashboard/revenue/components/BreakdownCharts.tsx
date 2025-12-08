'use client';

import * as React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BreakdownItem, BreakdownType } from '@/service/api/revenue';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BreakdownChartsProps {
  data: BreakdownItem[];
  loading: boolean;
  activeTab: BreakdownType;
  onTabChange: (tab: BreakdownType) => void;
  onItemClick: (item: BreakdownItem) => void;
}

export function BreakdownCharts({
  data,
  loading,
  activeTab,
  onTabChange,
  onItemClick
}: BreakdownChartsProps) {
  // Prepare data for chart (Top 5-10)
  const chartData = React.useMemo(() => {
    return data.slice(0, 10);
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload as BreakdownItem;
      return (
        <div className='bg-background rounded-lg border p-2 text-sm shadow-sm'>
          <div className='mb-1 font-medium'>{item.name}</div>
          <div>GMV: ${item.gmv.toLocaleString()}</div>
          <div>Users: {item.payingUsers.toLocaleString()}</div>
          <div>Share: {(item.percentage * 100).toFixed(2)}%</div>
        </div>
      );
    }
    return null;
  };

  const COLORS = [
    '#0088FE',
    '#00C49F',
    '#FFBB28',
    '#FF8042',
    '#8884d8',
    '#82ca9d',
    '#ffc658',
    '#8dd1e1',
    '#a4de6c',
    '#d0ed57'
  ];

  return (
    <Card className='col-span-1 flex h-[450px] flex-col lg:col-span-2'>
      <CardHeader className='pb-2'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-base font-medium'>Distribution</CardTitle>
        </div>
        <Tabs
          value={activeTab}
          onValueChange={(v) => onTabChange(v as BreakdownType)}
          className='mt-2 w-full'
        >
          <TabsList className='grid w-full grid-cols-4'>
            <TabsTrigger value='game'>Game</TabsTrigger>
            <TabsTrigger value='server'>Server</TabsTrigger>
            <TabsTrigger value='channel'>Channel</TabsTrigger>
            <TabsTrigger value='payTier'>Tier</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className='flex min-h-0 flex-1 flex-col gap-4 pt-2'>
        {loading ? (
          <div className='text-muted-foreground flex flex-1 items-center justify-center'>
            Loading...
          </div>
        ) : (
          <>
            {/* Chart Area */}
            <div className='min-h-[200px] flex-1'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart
                  layout={activeTab === 'payTier' ? 'horizontal' : 'vertical'}
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                  barSize={20}
                >
                  <CartesianGrid
                    strokeDasharray='3 3'
                    horizontal={activeTab === 'payTier'}
                    vertical={activeTab !== 'payTier'}
                    className='stroke-muted'
                  />
                  {activeTab === 'payTier' ? (
                    <>
                      <XAxis
                        dataKey='name'
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => `$${val / 1000}k`}
                      />
                    </>
                  ) : (
                    <>
                      <XAxis type='number' hide />
                      <YAxis
                        dataKey='name'
                        type='category'
                        width={80}
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                    </>
                  )}
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: 'transparent' }}
                  />
                  <Bar
                    dataKey='gmv'
                    radius={[4, 4, 0, 0]}
                    onClick={(data) => onItemClick(data as any)}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        cursor='pointer'
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* List Area */}
            <ScrollArea className='h-[120px] w-full rounded-md border p-2'>
              <div className='space-y-1'>
                {data.map((item, index) => (
                  <div
                    key={item.id}
                    className='hover:bg-muted/50 flex cursor-pointer items-center justify-between rounded p-1 text-xs'
                    onClick={() => onItemClick(item)}
                  >
                    <div className='flex items-center gap-2'>
                      <span
                        className={cn(
                          'flex h-4 w-4 items-center justify-center rounded-full text-[10px]',
                          index < 3
                            ? 'bg-primary text-primary-foreground font-bold'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {index + 1}
                      </span>
                      <span
                        className='max-w-[100px] truncate font-medium'
                        title={item.name}
                      >
                        {item.name}
                      </span>
                    </div>
                    <div className='flex items-center gap-4'>
                      <span className='font-mono'>
                        ${item.gmv.toLocaleString()}
                      </span>
                      <span className='text-muted-foreground w-10 text-right'>
                        {(item.percentage * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </>
        )}
      </CardContent>
    </Card>
  );
}
