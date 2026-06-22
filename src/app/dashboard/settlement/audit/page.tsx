'use client';

import React, { useCallback, useEffect, useState } from 'react';
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
import { Input } from '@/components/ui/input';
import PageContainer from '@/components/layout/page-container';
import { PageHeader } from '@/components/table/page-header';
import { FileCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { SettlementAPI, type SettlementAuditRecord } from '@/service/request';

const PAGE_SIZE = 20;

const RESULT_LABEL: Record<SettlementAuditRecord['result'], { text: string; cls: string }> = {
  win: { text: '获奖', cls: 'bg-green-100 text-green-800' },
  lose: { text: '亏损', cls: 'bg-red-100 text-red-800' },
  draw: { text: '平局', cls: 'bg-gray-100 text-gray-800' }
};

function maskUserId(id: string): string {
  if (!id) return '—';
  return id.length > 6 ? `${id.slice(0, 3)}****${id.slice(-3)}` : id;
}

function fmtTs(ts: string): string {
  if (!ts) return '—';
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? ts : d.toLocaleString();
}

export default function SettlementAuditPage() {
  const [records, setRecords] = useState<SettlementAuditRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [periodFilter, setPeriodFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await SettlementAPI.getAuditRecords({
        page,
        limit: PAGE_SIZE,
        periodId: periodFilter || undefined,
        userId: userFilter || undefined
      });
      if (res.success && res.data) {
        setRecords(res.data.list ?? []);
        setTotal(res.data.total ?? 0);
      }
    } catch (error) {
      console.error('获取结算审计数据失败:', error);
    } finally {
      setLoading(false);
    }
  }, [page, periodFilter, userFilter]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <PageContainer>
      <PageHeader
        title='结算审计'
        description='每笔结算均记录完整链路，支持精确还原。审计日志不可删除、不可修改，仅支持查询，保留 3 年。'
      />

      {/* 筛选条 */}
      <div className='mb-4 flex flex-wrap items-center gap-3'>
        <Input
          placeholder='周期 (1m/3m/5m/10m)'
          value={periodFilter}
          onChange={(e) => { setPeriodFilter(e.target.value); setPage(1); }}
          className='w-40'
        />
        <Input
          placeholder='用户 ID'
          value={userFilter}
          onChange={(e) => { setUserFilter(e.target.value); setPage(1); }}
          className='w-40'
        />
        <Button variant='outline' onClick={refresh} disabled={loading}>
          {loading ? '查询中...' : '查询'}
        </Button>
        <span className='text-muted-foreground text-sm'>共 {total} 条</span>
      </div>

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
                <TableHead>赔率(%)</TableHead>
                <TableHead>结果</TableHead>
                <TableHead>到账金额</TableHead>
                <TableHead>结算时间</TableHead>
                <TableHead>数据来源</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={12}
                    className='text-muted-foreground h-32 text-center'
                  >
                    {loading ? '加载中...' : '暂无结算记录'}
                  </TableCell>
                </TableRow>
              ) : (
                records.map((r) => {
                  const resultMeta = RESULT_LABEL[r.result] ?? RESULT_LABEL.draw;
                  return (
                    <TableRow key={r.orderId}>
                      <TableCell className='font-mono text-xs'>{r.orderId}</TableCell>
                      <TableCell className='font-mono text-xs'>{maskUserId(r.userId)}</TableCell>
                      <TableCell>{r.period}</TableCell>
                      <TableCell>
                        <Badge variant='outline' className={r.direction === 'up' ? 'text-green-700' : 'text-red-700'}>
                          {r.direction === 'up' ? '涨' : '跌'}
                        </Badge>
                      </TableCell>
                      <TableCell>${r.amount.toLocaleString()}</TableCell>
                      <TableCell>${r.openPrice.toLocaleString()}</TableCell>
                      <TableCell>${r.closePrice.toLocaleString()}</TableCell>
                      <TableCell>{r.odds}</TableCell>
                      <TableCell>
                        <Badge className={resultMeta.cls}>{resultMeta.text}</Badge>
                      </TableCell>
                      <TableCell className={r.payout > 0 ? 'font-medium text-green-700' : ''}>
                        ${r.payout.toLocaleString()}
                      </TableCell>
                      <TableCell className='text-xs'>{fmtTs(r.settledAt)}</TableCell>
                      <TableCell className='text-xs text-muted-foreground'>{r.priceSource}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* 分页 */}
          {total > PAGE_SIZE && (
            <div className='mt-4 flex items-center justify-end gap-2'>
              <Button
                variant='outline'
                size='sm'
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className='h-4 w-4' />
              </Button>
              <span className='text-muted-foreground text-sm'>
                {page} / {totalPages}
              </span>
              <Button
                variant='outline'
                size='sm'
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>
          )}
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
