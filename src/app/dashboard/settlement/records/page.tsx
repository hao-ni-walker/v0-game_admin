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
import { ScrollText } from 'lucide-react';

// PRD §7.1 开奖价格来源
interface SettlementRecord {
  id: string;
  period: string; // 1m, 3m, 5m, 10m
  openTime: string; // 开奖时间
  openPrice: number; // 开奖价格 BTC/USD
  priceSource: string; // 数据来源 Binance/Coincoinbase/OKX
  totalOrders: number; // 本期总订单数
  longOrders: number; // 买涨订单数
  shortOrders: number; // 买跌订单数
  result: 'up' | 'down' | 'draw'; // 涨/跌/平局
  settled: boolean; // 是否已结算
}

export default function SettlementRecordsPage() {
  return (
    <PageContainer>
      <PageHeader
        title='开奖记录'
        description='按期查询开奖价格、来源及结算状态'
      />

      {/* PRD §7.1 价格来源配置 */}
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle>价格数据源</CardTitle>
          <CardDescription>
            开奖价格取自合作行情数据源（如 Binance / Coinbase API），取价逻辑为每期结算时间点的 BTC/USD 1 分钟收盘价
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex gap-4 text-sm'>
            <div className='flex items-center gap-2'>
              <span className='text-muted-foreground'>主数据源：</span>
              <Badge variant='default'>Binance</Badge>
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-muted-foreground'>备用数据源：</span>
              <Badge variant='secondary'>Coinbase</Badge>
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-muted-foreground'>异常判定：</span>
              <span className='text-sm'>主备差异 &gt; 0.1% 时人工介入</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 开奖记录表 */}
      <Card>
        <CardHeader>
          <CardTitle>开奖记录</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>期号</TableHead>
                <TableHead>周期</TableHead>
                <TableHead>开奖时间</TableHead>
                <TableHead>开奖价格</TableHead>
                <TableHead>数据来源</TableHead>
                <TableHead>总订单</TableHead>
                <TableHead>买涨/买跌</TableHead>
                <TableHead>结果</TableHead>
                <TableHead>结算状态</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell
                  colSpan={9}
                  className='text-muted-foreground h-32 text-center'
                >
                  暂无开奖记录
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
