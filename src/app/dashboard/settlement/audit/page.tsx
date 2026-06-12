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
import PageContainer from '@/components/layout/page-container';
import { PageHeader } from '@/components/table/page-header';
import { FileCheck } from 'lucide-react';

// PRD §11.2 结算审计日志字段
interface SettlementAuditRecord {
  orderId: string;
  userId: string;
  period: string;
  direction: 'up' | 'down'; // 买涨 / 买跌
  amount: number; // 下单金额
  openPrice: number; // 开单价格（含毫秒级时间戳）
  closePrice: number; // 开奖价格（含毫秒级时间戳）
  odds: number; // 结算时赔率
  result: 'win' | 'lose' | 'draw'; // 获奖 / 亏损 / 平局
  payout: number; // 实际到账金额
  settledAt: string; // 结算时间
  priceSource: string; // 价格数据来源
}

export default function SettlementAuditPage() {
  return (
    <PageContainer>
      <PageHeader
        title='结算审计'
        description='每笔结算均记录完整链路，支持精确还原。审计日志不可删除、不可修改，仅支持查询，保留 3 年。'
      />

      {/* 结算审计明细表 */}
      <Card>
        <CardHeader>
          <CardTitle>结算明细</CardTitle>
          <CardDescription>
            PRD §11.2 — 结算记录字段包含 order_id / user_id / period / direction / amount / open_price / close_price / odds / result / payout / settled_at / price_source
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>订单 ID</TableHead>
                <TableHead>用户 ID</TableHead>
                <TableHead>周期</TableHead>
                <TableHead>方向</TableHead>
                <TableHead>金额</TableHead>
                <TableHead>开单价格</TableHead>
                <TableHead>开奖价格</TableHead>
                <TableHead>赔率</TableHead>
                <TableHead>结果</TableHead>
                <TableHead>到账金额</TableHead>
                <TableHead>结算时间</TableHead>
                <TableHead>数据来源</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell
                  colSpan={12}
                  className='text-muted-foreground h-32 text-center'
                >
                  暂无结算记录
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* PRD §7.3 批量结算流程说明 */}
      <Card className='mt-6'>
        <CardHeader>
          <CardTitle>批量结算流程</CardTitle>
          <CardDescription>每期结算任务自动触发（8 步）</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className='list-inside list-decimal space-y-1 text-sm text-muted-foreground'>
            <li>获取结算时间点的开奖价格</li>
            <li>查询本期所有未结算订单</li>
            <li>逐笔判定涨跌结果</li>
            <li>批量更新订单状态（获奖 / 亏损 / 平局）</li>
            <li>批量更新用户余额（加减账）</li>
            <li>写入结算审计日志（含开奖价、每笔明细）</li>
            <li>推送结果通知至前端（WebSocket）</li>
            <li>生成本期结算汇总报告</li>
          </ol>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
