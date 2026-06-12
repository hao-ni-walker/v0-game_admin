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
import { Landmark, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

// PRD §6.2 安全线配置
const safetyLevels = [
  {
    level: '健康',
    condition: '≥ $50,000',
    color: 'bg-green-100 text-green-800',
    behavior: '正常运营'
  },
  {
    level: '预警',
    condition: '$20,000 ~ $50,000',
    color: 'bg-yellow-100 text-yellow-800',
    behavior: '推送预警通知，限制新用户充值上限'
  },
  {
    level: '危险',
    condition: '$10,000 ~ $20,000',
    color: 'bg-orange-100 text-orange-800',
    behavior: '全平台单笔下单上限降至 $100，推送紧急通知'
  },
  {
    level: '停止',
    condition: '< $10,000',
    color: 'bg-red-100 text-red-800',
    behavior: '自动暂停新单接受，仅处理存量订单结算和提现'
  }
];

export default function FundPoolPage() {
  return (
    <PageContainer>
      <PageHeader
        title='资金池监控'
        description='监控平台资金池余额、安全线和最大赔付压力'
      />

      {/* 核心指标 */}
      <div className='mb-6 grid gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>资金池余额</CardTitle>
            <Landmark className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>—</div>
            <p className='text-muted-foreground text-xs'>
              用户充值 − 提现 − 赔付 + 累计收入
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>最大赔付压力</CardTitle>
            <AlertTriangle className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>—</div>
            <p className='text-muted-foreground text-xs'>
              Σ（每笔未结算订单金额 × 对应赔率）
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>安全系数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>—</div>
            <p className='text-muted-foreground text-xs'>
              最大赔付压力 / 资金池余额（阈值 80%）
            </p>
          </CardContent>
        </Card>
      </div>

      {/* PRD §6.2 安全线配置 */}
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle>安全线配置</CardTitle>
          <CardDescription>
            系统根据资金池余额自动触发不同级别的保护行为
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>级别</TableHead>
                <TableHead>资金池余额</TableHead>
                <TableHead>系统行为</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {safetyLevels.map((item) => (
                <TableRow key={item.level}>
                  <TableCell>
                    <Badge className={item.color}>{item.level}</Badge>
                  </TableCell>
                  <TableCell>{item.condition}</TableCell>
                  <TableCell className='text-muted-foreground'>
                    {item.behavior}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* PRD §6.4 资金流水监控 */}
      <Card>
        <CardHeader>
          <CardTitle>资金流向</CardTitle>
          <CardDescription>
            实时展示充值 / 提现 / 赔付 / 收入的资金流向，支持按日/周/月查看
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex h-48 items-center justify-center text-muted-foreground'>
            资金流向图表（待接入数据）
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
