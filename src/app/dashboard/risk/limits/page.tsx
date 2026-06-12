'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
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
import { Wallet } from 'lucide-react';

// PRD §5.1 单笔下单限额
const singleBetLimits = [
  { param: '单笔最低下单额', defaultValue: '$1', description: '低于此值拒绝下单' },
  { param: '单笔最高下单额', defaultValue: '$500', description: '超出此值拒绝下单' },
  { param: 'VIP 用户单笔上限', defaultValue: '$2,000', description: '可按用户等级配置' }
];

// PRD §5.2 单用户周期限额
const userPeriodLimits = [
  { param: '单用户单日下单总额上限', defaultValue: '$5,000', description: '超出当日禁止继续下单' },
  { param: '单用户同时持仓订单数上限', defaultValue: '20 笔', description: '超出时拒绝新单' },
  { param: '单用户单周期最大持仓额', defaultValue: '$1,000', description: '同一周期内该用户总持仓不超过此值' }
];

// PRD §5.3 平台全局限额
const platformLimits = [
  { param: '单周期全平台总下单额上限', defaultValue: '$50,000', description: '超出后该周期不再接受新单' },
  { param: '单方向单周期上限', defaultValue: '$30,000', description: '防止单方向过度集中' }
];

// PRD §5.4 截止下单时间控制
const cutoffTimes = [
  { period: '1 分钟', cutoffBefore: '提前 10 秒', totalDuration: '60s' },
  { period: '3 分钟', cutoffBefore: '提前 15 秒', totalDuration: '180s' },
  { period: '5 分钟', cutoffBefore: '提前 20 秒', totalDuration: '300s' },
  { period: '10 分钟', cutoffBefore: '提前 30 秒', totalDuration: '600s' }
];

export default function LimitsConfigPage() {
  return (
    <PageContainer>
      <PageHeader
        title='限额配置'
        description='管理下单限额与截止时间控制参数'
      />

      {/* PRD §5.1 单笔下单限额 */}
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle>单笔下单限额</CardTitle>
          <CardDescription>控制每笔订单的金额范围</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>参数</TableHead>
                <TableHead>默认值</TableHead>
                <TableHead>说明</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {singleBetLimits.map((item) => (
                <TableRow key={item.param}>
                  <TableCell className='font-medium'>{item.param}</TableCell>
                  <TableCell>{item.defaultValue}</TableCell>
                  <TableCell className='text-muted-foreground'>
                    {item.description}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* PRD §5.2 单用户周期限额 */}
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle>单用户周期限额</CardTitle>
          <CardDescription>防止单用户过度集中</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>参数</TableHead>
                <TableHead>默认值</TableHead>
                <TableHead>说明</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userPeriodLimits.map((item) => (
                <TableRow key={item.param}>
                  <TableCell className='font-medium'>{item.param}</TableCell>
                  <TableCell>{item.defaultValue}</TableCell>
                  <TableCell className='text-muted-foreground'>
                    {item.description}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* PRD §5.3 平台全局限额 */}
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle>平台全局限额</CardTitle>
          <CardDescription>控制全平台下单总量</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>参数</TableHead>
                <TableHead>默认值</TableHead>
                <TableHead>说明</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {platformLimits.map((item) => (
                <TableRow key={item.param}>
                  <TableCell className='font-medium'>{item.param}</TableCell>
                  <TableCell>{item.defaultValue}</TableCell>
                  <TableCell className='text-muted-foreground'>
                    {item.description}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* PRD §5.4 截止下单时间控制 */}
      <Card>
        <CardHeader>
          <CardTitle>截止下单时间控制</CardTitle>
          <CardDescription>
            每期订单截止时间可配置，截止后前端锁定下单按钮
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>周期</TableHead>
                <TableHead>截止提前量</TableHead>
                <TableHead>总时长</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cutoffTimes.map((item) => (
                <TableRow key={item.period}>
                  <TableCell className='font-medium'>{item.period}</TableCell>
                  <TableCell>{item.cutoffBefore}</TableCell>
                  <TableCell className='text-muted-foreground'>
                    {item.totalDuration}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
