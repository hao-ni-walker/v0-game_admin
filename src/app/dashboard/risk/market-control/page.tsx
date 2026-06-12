'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import PageContainer from '@/components/layout/page-container';
import { PageHeader } from '@/components/table/page-header';
import { AlertTriangle, RefreshCw } from 'lucide-react';

// PRD §3.4 单边行情判定条件
interface MarketControlState {
  period: string;
  isActive: boolean;
  triggerCondition?: 'price' | 'order_ratio' | 'exposure';
  triggerTime?: string;
}

// PRD §3.4 触发后系统行为
interface MarketEvent {
  id: string;
  time: string;
  period: string;
  triggerCondition: string;
  details: string;
  status: 'active' | 'resolved';
  resolvedAt?: string;
  resolvedBy?: string;
}

export default function MarketControlPage() {
  const [loading, setLoading] = useState(false);

  const states: MarketControlState[] = [
    { period: '1 分钟', isActive: false },
    { period: '3 分钟', isActive: false },
    { period: '5 分钟', isActive: false },
    { period: '10 分钟', isActive: false }
  ];

  return (
    <PageContainer>
      <PageHeader
        title='单边行情控制'
        description='识别单边行情并触发保护机制'
        action={{
          label: '刷新',
          onClick: () => {},
          icon: <RefreshCw className='mr-2 h-4 w-4' />
        }}
      />

      {/* PRD §3.4 触发条件说明 */}
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle>单边行情判定条件</CardTitle>
          <CardDescription>满足任一即触发保护机制</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-3 text-sm'>
            <div className='flex items-start gap-3'>
              <Badge variant='outline'>条件 A</Badge>
              <div>
                <p className='font-medium'>价格维度</p>
                <p className='text-muted-foreground'>
                  过去 N 分钟内（默认 5 分钟），BTC 价格单方向涨跌幅 ≥ X%（默认 1.5%）
                </p>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <Badge variant='outline'>条件 B</Badge>
              <div>
                <p className='font-medium'>下单维度</p>
                <p className='text-muted-foreground'>
                  某周期内，买涨（或买跌）订单金额占比 ≥ Y%（默认 75%）
                </p>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <Badge variant='outline'>条件 C</Badge>
              <div>
                <p className='font-medium'>净敞口维度</p>
                <p className='text-muted-foreground'>
                  净风险敞口达到"极限"级别（&gt; $10,000）
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 各周期状态 */}
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle>当前状态</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>周期</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>触发条件</TableHead>
                <TableHead>触发时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {states.map((state) => (
                <TableRow key={state.period}>
                  <TableCell className='font-medium'>{state.period}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        state.isActive
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }
                    >
                      {state.isActive ? '已触发' : '正常'}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-muted-foreground'>
                    {state.triggerCondition || '—'}
                  </TableCell>
                  <TableCell className='text-muted-foreground'>
                    {state.triggerTime || '—'}
                  </TableCell>
                  <TableCell>
                    <Button variant='outline' size='sm' disabled={!state.isActive}>
                      手动恢复赔率
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 恢复条件说明 */}
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle>自动恢复条件</CardTitle>
          <CardDescription>需同时满足以下三个条件</CardDescription>
        </CardHeader>
        <CardContent className='text-muted-foreground text-sm'>
          <ul className='list-inside list-disc space-y-1'>
            <li>价格涨跌幅回落至阈值内，持续 M 分钟（默认 3 分钟）</li>
            <li>买涨/买跌占比恢复至阈值以内</li>
            <li>净风险敞口降至"预警"级别以下</li>
          </ul>
          <p className='mt-2'>
            手动恢复需二次确认 + 操作备注，记录操作人员/时间/原因
          </p>
        </CardContent>
      </Card>

      {/* 触发事件列表 */}
      <Card>
        <CardHeader>
          <CardTitle>触发事件记录</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex h-32 items-center justify-center text-muted-foreground'>
            暂无触发事件
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
