'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { ScanSearch } from 'lucide-react';

// PRD §9.1 检测规则
const detectionRules = [
  {
    id: 'A',
    name: '高频下单检测',
    condition: '同一用户在 60 秒内下单次数 ≥ 10 笔',
    action: '标记预警，降低该用户单笔上限至 $50',
    params: [
      { name: '时间窗口', defaultValue: '60 秒', range: '30 ~ 300 秒' },
      { name: '笔数阈值', defaultValue: '10 笔', range: '5 ~ 50 笔' }
    ]
  },
  {
    id: 'B',
    name: '套利模式检测',
    condition: '同一用户在同一周期同时持有买涨和买跌订单',
    action: '标记记录，累计 3 次触发账户预警',
    params: []
  },
  {
    id: 'C',
    name: '多账户关联检测',
    condition: '相同设备指纹 / IP / 钱包地址关联 ≥ 3 个账户',
    action: '关联账户组标记，人工复查',
    params: []
  },
  {
    id: 'D',
    name: '大额异常下单',
    condition: '单笔下单金额 > 日均下单额 × 10 倍',
    action: '自动暂扣订单 30 秒，风控审查',
    params: [{ name: '异常倍数阈值', defaultValue: '10 倍', range: '3 ~ 20 倍' }]
  },
  {
    id: 'E',
    name: '提现异常检测',
    condition: '充值后 1 小时内未交易直接申请全额提现',
    action: '标记人工复核，疑似搬砖套利或洗钱',
    params: [{ name: '提现观察期', defaultValue: '1 小时', range: '0 ~ 24 小时' }]
  }
];

export default function AnomalyDetectionPage() {
  return (
    <PageContainer>
      <PageHeader
        title='异常行为检测'
        description='5 条检测规则及阈值配置'
      />

      {/* PRD §9.1 检测规则 */}
      {detectionRules.map((rule) => (
        <Card key={rule.id} className='mb-4'>
          <CardHeader>
            <div className='flex items-center gap-3'>
              <Badge variant='outline' className='text-base'>
                规则 {rule.id}
              </Badge>
              <CardTitle className='text-base'>{rule.name}</CardTitle>
            </div>
            <CardDescription>{rule.condition}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <div>
                <span className='text-muted-foreground text-sm'>触发后处理：</span>
                <span className='text-sm'>{rule.action}</span>
              </div>
              {rule.params.length > 0 && (
                <div className='mt-2'>
                  <span className='text-muted-foreground text-sm font-medium'>
                    可配置参数：
                  </span>
                  <Table className='mt-2'>
                    <TableHeader>
                      <TableRow>
                        <TableHead>参数名</TableHead>
                        <TableHead>默认值</TableHead>
                        <TableHead>可调范围</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rule.params.map((param) => (
                        <TableRow key={param.name}>
                          <TableCell className='font-medium text-sm'>
                            {param.name}
                          </TableCell>
                          <TableCell className='text-sm'>
                            {param.defaultValue}
                          </TableCell>
                          <TableCell className='text-muted-foreground text-sm'>
                            {param.range}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* 触发记录 */}
      <Card>
        <CardHeader>
          <CardTitle>触发记录</CardTitle>
          <CardDescription>异常行为检测触发的历史记录</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex h-32 items-center justify-center text-muted-foreground'>
            暂无触发记录
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
