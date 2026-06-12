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
import { Ban } from 'lucide-react';

// PRD §8.3 黑名单记录
interface BlacklistRecord {
  id: string;
  userId: string;
  telegramId?: string;
  reason: string;
  addedBy: string;
  addedAt: string;
  status: 'active' | 'removed';
  removedBy?: string;
  removedAt?: string;
}

export default function BlacklistPage() {
  return (
    <PageContainer>
      <PageHeader
        title='黑名单管理'
        description='管理被永久禁止的用户账户，加入黑名单需风控主管权限 + 管理员审批'
        action={{
          label: '加入黑名单',
          onClick: () => {},
          icon: <Ban className='mr-2 h-4 w-4' />
        }}
      />

      <Card>
        <CardHeader>
          <CardTitle>黑名单列表</CardTitle>
          <CardDescription>
            加入黑名单需双人复核（发起人 + 审批人）
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>用户 ID</TableHead>
                <TableHead>Telegram ID</TableHead>
                <TableHead>加入原因</TableHead>
                <TableHead>操作人</TableHead>
                <TableHead>加入时间</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell
                  colSpan={7}
                  className='text-muted-foreground h-32 text-center'
                >
                  暂无黑名单记录
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
