'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import PageContainer from '@/components/layout/page-container';
import { PageHeader } from '@/components/table/page-header';
import { useSettlementRecords } from './hooks/useSettlementRecords';

const PERIOD_OPTIONS = ['', '1m', '3m', '5m', '10m'];
const RESULT_OPTIONS = [
  { value: '', label: '全部结果' },
  { value: 'up', label: '涨' },
  { value: 'down', label: '跌' },
  { value: 'draw', label: '平' },
];

function fmtTime(ts: number): string {
  if (!ts) return '—';
  return new Date(ts * 1000).toLocaleString();
}

export default function SettlementRecordsPage() {
  const {
    records,
    loading,
    page,
    pageSize,
    total,
    period,
    setPeriod,
    result,
    setResult,
    setPage,
    refresh,
  } = useSettlementRecords();

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <PageContainer>
      <PageHeader
        title='开奖记录'
        description='按币种 + 周期查询开奖价格、来源及结算状态（数据源自 trades 表）'
      />

      {/* 价格数据源 */}
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle>价格数据源</CardTitle>
          <CardDescription>
            开奖价格按币种独立统计；待结算期次不展示收盘价和涨跌幅，避免将不同币种或未结算数据混在一起
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
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <div>
              <CardTitle>开奖记录</CardTitle>
              <CardDescription>共 {total} 条记录</CardDescription>
            </div>
            <div className='flex flex-wrap items-center gap-2'>
              <select
                className='border-input h-9 rounded-md border bg-background px-2 text-sm'
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                {PERIOD_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p ? `周期: ${p}` : '全部周期'}
                  </option>
                ))}
              </select>
              <select
                className='border-input h-9 rounded-md border bg-background px-2 text-sm'
                value={result}
                onChange={(e) => setResult(e.target.value)}
              >
                {RESULT_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <Button variant='outline' size='sm' onClick={refresh} disabled={loading}>
                {loading ? '加载中…' : '刷新'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>期号</TableHead>
                <TableHead>周期</TableHead>
                <TableHead>币种</TableHead>
                <TableHead>开奖时间</TableHead>
                <TableHead>开盘价</TableHead>
                <TableHead>收盘价</TableHead>
                <TableHead>涨跌幅</TableHead>
                <TableHead>数据来源</TableHead>
                <TableHead>总订单</TableHead>
                <TableHead>赢/输/退</TableHead>
                <TableHead>平台盈亏</TableHead>
                <TableHead>结算状态</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={12}
                    className='text-muted-foreground h-32 text-center'
                  >
                    {loading ? '加载中…' : '暂无开奖记录'}
                  </TableCell>
                </TableRow>
              ) : (
                records.map((r) => (
                  <TableRow key={r.settlement_id}>
                    <TableCell className='font-medium'>{r.settlement_id}</TableCell>
                    <TableCell>{r.period}</TableCell>
                    <TableCell>{r.asset}</TableCell>
                    <TableCell className='text-sm'>{fmtTime(r.period_end)}</TableCell>
                    <TableCell>{r.open_price}</TableCell>
                    <TableCell>{r.close_price}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          r.price_change_pct === '—'
                            ? 'secondary'
                            : r.price_change_pct.startsWith('+')
                            ? 'default'
                            : r.price_change_pct.startsWith('-')
                              ? 'destructive'
                              : 'secondary'
                        }
                      >
                        {r.price_change_pct}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-sm'>{r.price_source}</TableCell>
                    <TableCell>{r.total_orders}</TableCell>
                    <TableCell className='text-sm'>
                      <span className='text-green-600'>{r.won_orders}</span> /{' '}
                      <span className='text-red-600'>{r.lost_orders}</span> /{' '}
                      <span className='text-muted-foreground'>{r.refunded_orders}</span>
                    </TableCell>
                    <TableCell
                      className={`text-sm font-medium ${r.platform_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {r.platform_profit >= 0 ? '+' : ''}
                      {r.platform_profit.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={r.status === 'settled' ? 'default' : 'secondary'}>
                        {r.status === 'settled' ? '已结算' : '待结算'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* 分页 */}
          {total > pageSize && (
            <div className='flex items-center justify-end gap-2 pt-4'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setPage(page - 1)}
                disabled={page <= 1 || loading}
              >
                上一页
              </Button>
              <span className='text-muted-foreground text-sm'>
                第 {page} / {totalPages} 页
              </span>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages || loading}
              >
                下一页
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
