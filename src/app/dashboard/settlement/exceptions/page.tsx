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
import { AlertCircle } from 'lucide-react';

// PRD §7.4 结算异常类型
const exceptionTypes = [
  { type: '价格数据源异常', handling: '暂停结算，人工确认价格后手动触发' },
  { type: '系统延迟导致超时', handling: '以实际结算时刻价格为准，记录延迟原因' },
  { type: '用户投诉结算有误', handling: '调取审计日志核查，7 日内答复' },
  { type: '批量结算中途失败', handling: '事务回滚，全部订单恢复待结算状态，重新执行' }
];

// PRD §7.4 异常结算记录
interface SettlementException {
  id: string;
  period: string;
  exceptionType: string;
  description: string;
  status: 'pending' | 'processing' | 'resolved';
  createdAt: string;
  resolvedBy?: string;
  resolvedAt?: string;
}

export default function SettlementExceptionsPage() {
  return (
    <PageContainer>
      <PageHeader
        title='异常结算处理'
        description='处理价格数据源异常、系统延迟、用户投诉等结算异常'
      />

      {/* PRD §7.4 异常类型说明 */}
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle>异常类型与处理方式</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>异常类型</TableHead>
                <TableHead>处理方式</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exceptionTypes.map((item) => (
                <TableRow key={item.type}>
                  <TableCell className='font-medium'>{item.type}</TableCell>
                  <TableCell className='text-muted-foreground'>
                    {item.handling}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 人工介入操作区 */}
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle>人工介入</CardTitle>
          <CardDescription>
            管理员可手动输入开奖价格并附上数据来源截图（取价失败 3 次后触发）
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex gap-4'>
            <Button variant='outline' disabled>
              手动输入开奖价格
            </Button>
            <Button variant='outline' disabled>
              手动触发结算
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 异常结算列表 */}
      <Card>
        <CardHeader>
          <CardTitle>异常结算列表</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>周期</TableHead>
                <TableHead>异常类型</TableHead>
                <TableHead>描述</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell
                  colSpan={7}
                  className='text-muted-foreground h-32 text-center'
                >
                  暂无异常结算记录
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
