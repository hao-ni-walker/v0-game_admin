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
import { SlidersHorizontal, RefreshCw, History } from 'lucide-react';

// PRD §4.1 基础赔率配置
interface OddsConfig {
  period: string;
  baseOdds: number; // 基础赔率
  minOdds: number; // 可配置下限
  maxOdds: number; // 可配置上限
  currentOdds: number; // 当前实际赔率（动态调节后）
  dynamicOddsUp: number; // 当前买涨赔率
  dynamicOddsDown: number; // 当前买跌赔率
}

// PRD §4.4 赔率历史记录
interface OddsHistory {
  id: string;
  time: string;
  period: string;
  beforeOdds: number;
  afterOdds: number;
  triggerType: 'auto' | 'manual';
  operator?: string;
  reason: string;
}

export default function OddsManagementPage() {
  const [loading, setLoading] = useState(false);

  // PRD §4.1 默认基础赔率
  const oddsConfigs: OddsConfig[] = [
    { period: '1 分钟', baseOdds: 35, minOdds: 0, maxOdds: 60, currentOdds: 35, dynamicOddsUp: 28, dynamicOddsDown: 42 },
    { period: '3 分钟', baseOdds: 50, minOdds: 0, maxOdds: 70, currentOdds: 50, dynamicOddsUp: 50, dynamicOddsDown: 50 },
    { period: '5 分钟', baseOdds: 65, minOdds: 0, maxOdds: 80, currentOdds: 65, dynamicOddsUp: 65, dynamicOddsDown: 65 },
    { period: '10 分钟', baseOdds: 80, minOdds: 0, maxOdds: 90, currentOdds: 80, dynamicOddsUp: 80, dynamicOddsDown: 80 }
  ];

  return (
    <PageContainer>
      <PageHeader
        title='赔率管理'
        description='管理各周期基础赔率、动态调节算法和手动操作'
        action={{
          label: '刷新',
          onClick: () => {},
          icon: <RefreshCw className='mr-2 h-4 w-4' />
        }}
      />

      {/* PRD §4.1 基础赔率配置表 */}
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle>基础赔率配置</CardTitle>
          <CardDescription>
            修改基础赔率需管理员权限 + 二次确认 + 生效时间设定
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>周期</TableHead>
                <TableHead>基础赔率</TableHead>
                <TableHead>可配置范围</TableHead>
                <TableHead>当前买涨赔率</TableHead>
                <TableHead>当前买跌赔率</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {oddsConfigs.map((config) => (
                <TableRow key={config.period}>
                  <TableCell className='font-medium'>{config.period}</TableCell>
                  <TableCell>{config.baseOdds}%</TableCell>
                  <TableCell className='text-muted-foreground'>
                    {config.minOdds}% ~ {config.maxOdds}%
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={config.dynamicOddsUp !== config.baseOdds ? 'destructive' : 'default'}
                    >
                      {config.dynamicOddsUp}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={config.dynamicOddsDown !== config.baseOdds ? 'default' : 'secondary'}
                    >
                      {config.dynamicOddsDown}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className='bg-green-100 text-green-800'>正常</Badge>
                  </TableCell>
                  <TableCell>
                    <div className='flex gap-2'>
                      <Button variant='outline' size='sm' disabled>
                        手动清零
                      </Button>
                      <Button variant='outline' size='sm' disabled>
                        恢复赔率
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* PRD §4.3 动态调节算法说明 */}
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle>动态调节算法</CardTitle>
          <CardDescription>
            当净风险敞口进入“高风险”区间时，系统自动降低占优方向的赔率
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='text-muted-foreground space-y-2 text-sm'>
            <p>
              <strong>计算逻辑：</strong>
              imbalance = |买涨总额 − 买跌总额| / 总额
            </p>
            <p>
              占优方向赔率 = base_odds × (1 − imbalance × k)，k 默认 0.5
            </p>
            <p>
              劣势方向赔率 = base_odds × (1 + imbalance × k)
            </p>
            <p>
              <strong>保护：</strong>
              赔率下限 5%，上限不超过基础赔率 × 1.5
            </p>
          </div>
        </CardContent>
      </Card>

      {/* PRD §4.2 手动操作按钮 */}
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle>手动操作</CardTitle>
          <CardDescription>
            手动清零/恢复操作需对应权限并填写原因
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex gap-4'>
            <Button variant='destructive' disabled>
              全周期赔率清零（需二次确认）
            </Button>
            <Button variant='outline' disabled>
              全周期恢复赔率（需二次确认）
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* PRD §4.4 赔率历史记录 */}
      <Card>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <History className='h-5 w-5' />
            <CardTitle>赔率变更历史</CardTitle>
          </div>
          <CardDescription>
            所有赔率变动（自动或手动）均记录在案
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex h-32 items-center justify-center text-muted-foreground'>
            暂无历史记录
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
