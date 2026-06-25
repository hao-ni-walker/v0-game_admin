'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import PageContainer from '@/components/layout/page-container';
import { PageHeader } from '@/components/table/page-header';
import { Landmark, TrendingUp, TrendingDown, AlertTriangle, RefreshCw } from 'lucide-react';
import { FundPoolAPI, type FundPoolStatus } from '@/service/request';
import { apiRequest } from '@/service/api/base';
import { toast } from 'sonner';

interface CashflowPoint {
  ts: number;
  deposits: number;
  withdrawals: number;
  payouts: number;
  income: number;
  net: number;
}

interface CashflowData {
  range: string;
  points: CashflowPoint[];
  summary: {
    total_deposits: number;
    total_withdrawals: number;
    total_payouts: number;
    total_income: number;
    net_change: number;
  };
}

// PRD §6.2 安全线配置
const safetyLevels = [
  {
    level: '健康',
    condition: '≥ $50,000',
    color: 'bg-green-100 text-green-800',
    behavior: '正常运营',
  },
  {
    level: '预警',
    condition: '$20,000 ~ $50,000',
    color: 'bg-yellow-100 text-yellow-800',
    behavior: '推送预警通知，限制新用户充值上限',
  },
  {
    level: '危险',
    condition: '$10,000 ~ $20,000',
    color: 'bg-orange-100 text-orange-800',
    behavior: '全平台单笔下单上限降至 $100，推送紧急通知',
  },
  {
    level: '停止',
    condition: '< $10,000',
    color: 'bg-red-100 text-red-800',
    behavior: '自动暂停新单接受，仅处理存量订单结算和提现',
  },
];

const LEVEL_LABEL: Record<FundPoolStatus['level'], string> = {
  healthy: '健康',
  warning: '预警',
  danger: '危险',
  stop: '停止',
};

const LEVEL_BADGE: Record<FundPoolStatus['level'], string> = {
  healthy: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-orange-100 text-orange-800',
  stop: 'bg-red-100 text-red-800',
};

function fmtUSD(n: number): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtPct(n: number): string {
  return (n * 100).toFixed(1) + '%';
}

export default function FundPoolPage() {
  const [status, setStatus] = useState<FundPoolStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [cashflow, setCashflow] = useState<CashflowData | null>(null);
  const [flowRange, setFlowRange] = useState<'today' | '7d' | '30d'>('7d');

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [statusRes, flowRes] = await Promise.all([
        FundPoolAPI.getStatus(),
        apiRequest<CashflowData>(`/admin/pool/cashflow?range=${flowRange}`),
      ]);
      if (statusRes.success && statusRes.data) {
        setStatus(statusRes.data);
      } else {
        toast.error(statusRes.message || '获取资金池数据失败');
      }
      if (flowRes.success && flowRes.data) {
        setCashflow(flowRes.data);
      }
    } catch {
      toast.error('获取资金池数据失败');
    } finally {
      setLoading(false);
    }
  }, [flowRange]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const safetyRatioPct = status ? status.safetyRatio : 0;
  const safetyHealthy = safetyRatioPct < 0.8;

  return (
    <PageContainer>
      <PageHeader
        title='资金池监控'
        description='监控平台资金池余额、安全线和最大赔付压力'
        action={{
          label: loading ? '刷新中…' : '刷新',
          onClick: refresh,
          icon: <RefreshCw className='mr-2 h-4 w-4' />,
        }}
      />

      {/* 核心指标 */}
      <div className='mb-6 grid gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>资金池余额</CardTitle>
            <Landmark className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {status ? fmtUSD(status.balance) : '—'}
            </div>
            <p className='text-muted-foreground text-xs'>
              用户充值 − 提现 − 赔付 + 累计收入
            </p>
            {status && (
              <div className='mt-2 flex items-center gap-2 text-xs'>
                <Badge className={LEVEL_BADGE[status.level]}>
                  {LEVEL_LABEL[status.level]}
                </Badge>
                <span className='text-muted-foreground'>
                  冻结 {fmtUSD(status.frozenBalance)} · 可用 {fmtUSD(status.availableBalance)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>最大赔付压力</CardTitle>
            <AlertTriangle className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {status ? fmtUSD(status.maxPayoutPressure) : '—'}
            </div>
            <p className='text-muted-foreground text-xs'>
              Σ（每笔未结算订单金额 × 对应收益率）
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>安全系数</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${status ? (safetyHealthy ? 'text-green-600' : 'text-red-600') : ''}`}
            >
              {status ? fmtPct(safetyRatioPct) : '—'}
            </div>
            <p className='text-muted-foreground text-xs'>
              最大赔付压力 / 资金池余额（阈值 80%）
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 资金构成 */}
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle>资金构成</CardTitle>
          <CardDescription>
            平台资金池由用户充值、提现、赔付和收入共同决定
            {status?.updatedAt && (
              <span className='ml-2 text-xs'>
                · 更新于 {new Date(status.updatedAt * 1000).toLocaleString()}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-4'>
            <div className='flex items-center gap-3 rounded-lg border p-3'>
              <TrendingUp className='h-8 w-8 text-green-600' />
              <div>
                <p className='text-muted-foreground text-xs'>用户充值总额</p>
                <p className='font-mono text-lg font-semibold'>
                  {status ? fmtUSD(status.totalDeposits) : '—'}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-3 rounded-lg border p-3'>
              <TrendingDown className='h-8 w-8 text-red-600' />
              <div>
                <p className='text-muted-foreground text-xs'>用户提现总额</p>
                <p className='font-mono text-lg font-semibold'>
                  {status ? fmtUSD(status.totalWithdrawals) : '—'}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-3 rounded-lg border p-3'>
              <TrendingDown className='h-8 w-8 text-orange-600' />
              <div>
                <p className='text-muted-foreground text-xs'>平台已赔付</p>
                <p className='font-mono text-lg font-semibold'>
                  {status ? fmtUSD(status.totalPayouts) : '—'}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-3 rounded-lg border p-3'>
              <TrendingUp className='h-8 w-8 text-blue-600' />
              <div>
                <p className='text-muted-foreground text-xs'>平台累计收入</p>
                <p className='font-mono text-lg font-semibold'>
                  {status ? fmtUSD(status.totalIncome) : '—'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <div>
              <CardTitle>资金流向</CardTitle>
              <CardDescription>
                实时展示充值 / 提现 / 赔付 / 收入的资金流向
                {cashflow?.summary && (
                  <span className='ml-2 text-xs'>
                    · 净变动 {fmtUSD(cashflow.summary.net_change)}
                  </span>
                )}
              </CardDescription>
            </div>
            <div className='flex items-center gap-2 text-sm'>
              {(['today', '7d', '30d'] as const).map((r) => (
                <Button
                  key={r}
                  size='sm'
                  variant={flowRange === r ? 'default' : 'outline'}
                  onClick={() => setFlowRange(r)}
                >
                  {r === 'today' ? '今日' : r === '7d' ? '近 7 天' : '近 30 天'}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>日期</TableHead>
                <TableHead>充值</TableHead>
                <TableHead>提现</TableHead>
                <TableHead>赔付</TableHead>
                <TableHead>收入</TableHead>
                <TableHead>净变动</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!cashflow?.points || cashflow.points.length === 0) ? (
                <TableRow>
                  <TableCell colSpan={6} className='text-muted-foreground h-24 text-center'>
                    {loading ? '加载中...' : '暂无流水数据'}
                  </TableCell>
                </TableRow>
              ) : (
                [...cashflow.points].reverse().map((p) => (
                  <TableRow key={p.ts}>
                    <TableCell className='text-xs'>
                      {new Date(p.ts * 1000).toLocaleDateString('zh-CN')}
                    </TableCell>
                    <TableCell className='text-green-700'>{fmtUSD(p.deposits)}</TableCell>
                    <TableCell className='text-red-700'>{fmtUSD(p.withdrawals)}</TableCell>
                    <TableCell className='text-orange-700'>{fmtUSD(p.payouts)}</TableCell>
                    <TableCell className='text-blue-700'>{fmtUSD(p.income)}</TableCell>
                    <TableCell className={p.net >= 0 ? 'font-medium text-green-700' : 'font-medium text-red-700'}>
                      {fmtUSD(p.net)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
