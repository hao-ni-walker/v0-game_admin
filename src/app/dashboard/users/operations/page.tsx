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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import PageContainer from '@/components/layout/page-container';
import { PageHeader } from '@/components/table/page-header';
import { UserCog } from 'lucide-react';

// PRD §8.3 账户操作
const accountOperations = [
  {
    operation: '调整余额（加/减）',
    permission: '主管以上',
    description: '需填写原因，记录入审计日志'
  },
  {
    operation: '临时提升单笔限额',
    permission: '风控专员',
    description: '指定用户、指定有效期'
  },
  {
    operation: '冻结账户',
    permission: '风控专员',
    description: '禁止该账户下单、充值、提现'
  },
  {
    operation: '解冻账户',
    permission: '风控主管',
    description: '需填写解冻理由'
  },
  {
    operation: '加入黑名单',
    permission: '风控主管',
    description: '永久禁止，需管理员审批'
  },
  {
    operation: '人工退款',
    permission: '主管以上',
    description: '针对结算异议的补偿操作'
  }
];

export default function UserOperationsPage() {
  return (
    <PageContainer>
      <PageHeader
        title='账户操作'
        description='对用户账户进行余额调整、冻结/解冻、退款等操作'
      />

      {/* 可用操作说明 */}
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle>可用操作</CardTitle>
          <CardDescription>PRD §8.3 账户操作权限与说明</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>操作</TableHead>
                <TableHead>权限要求</TableHead>
                <TableHead>说明</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accountOperations.map((op) => (
                <TableRow key={op.operation}>
                  <TableCell className='font-medium'>{op.operation}</TableCell>
                  <TableCell>
                    <Badge variant='outline'>{op.permission}</Badge>
                  </TableCell>
                  <TableCell className='text-muted-foreground'>
                    {op.description}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 操作面板 */}
      <Card>
        <CardHeader>
          <CardTitle>执行操作</CardTitle>
          <CardDescription>搜索用户后执行账户操作</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex h-48 flex-col items-center justify-center gap-4 text-muted-foreground'>
            <UserCog className='h-12 w-12' />
            <p>搜索用户 ID 或 Telegram ID 后执行操作</p>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
