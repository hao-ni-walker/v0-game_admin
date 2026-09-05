'use client';

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
import { Skeleton } from '@/components/ui/skeleton';
import { Settings2, ArrowUpCircle, ArrowDownCircle, TrendingUp, Eye } from 'lucide-react';
import { format } from 'date-fns';
import type { PredictionMarket } from '@/service/request';
import { compactUsd } from '../utils';

interface MarketTableProps {
  markets: PredictionMarket[];
  loading: boolean;
  canWrite: boolean;
  onView: (m: PredictionMarket) => void;
  onConfig: (m: PredictionMarket) => void;
  onToggle: (m: PredictionMarket) => void;
  emptyState: {
    icon: React.ReactNode;
    title: string;
    description: string;
  };
}

/** YES/NO 两档价格，如 "Y 0.62 / N 0.38"；异常结构降级为 —。 */
function outcomeSummary(m: PredictionMarket): string {
  const labels = m.outcomes || [];
  const prices = m.outcome_prices || [];
  if (labels.length !== 2 || prices.length !== 2) return '—';
  const fmt = (p: string) => {
    const n = Number(p);
    return Number.isFinite(n) ? n.toFixed(2) : '—';
  };
  return `${labels[0]} ${fmt(prices[0])} / ${labels[1]} ${fmt(prices[1])}`;
}

function configSummary(m: PredictionMarket): string {
  const parts: string[] = [];
  if (m.spread_bps !== null && m.spread_bps !== undefined) parts.push(`点差 ${m.spread_bps}bp`);
  if (m.max_exposure_usdt !== null && m.max_exposure_usdt !== undefined)
    parts.push(`敞口 ${compactUsd(Number(m.max_exposure_usdt))}`);
  if (
    (m.min_bet_usdt !== null && m.min_bet_usdt !== undefined) ||
    (m.max_bet_usdt !== null && m.max_bet_usdt !== undefined)
  ) {
    parts.push(
      `注 ${m.min_bet_usdt ?? '∞'}~${m.max_bet_usdt ?? '∞'}`
    );
  }
  return parts.length ? parts.join(' · ') : '全局默认';
}

export function MarketTable({
  markets,
  loading,
  canWrite,
  onView,
  onConfig,
  onToggle,
  emptyState,
}: MarketTableProps) {
  if (loading) {
    return (
      <div className='space-y-2 p-4'>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className='h-12 w-full' />
        ))}
      </div>
    );
  }

  if (markets.length === 0) {
    return (
      <div className='flex h-full flex-col items-center justify-center space-y-3 p-8'>
        {emptyState.icon}
        <p className='text-lg font-medium'>{emptyState.title}</p>
        <p className='text-muted-foreground text-sm'>{emptyState.description}</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className='min-w-[280px]'>市场</TableHead>
          <TableHead>价格 (YES/NO)</TableHead>
          <TableHead className='text-right'>24h 交易量</TableHead>
          <TableHead>结束时间</TableHead>
          <TableHead>状态</TableHead>
          <TableHead>上架配置</TableHead>
          <TableHead className='text-right'>操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {markets.map((m) => (
          <TableRow key={m.id} className='cursor-pointer' onClick={() => onView(m)}>
            <TableCell>
              <div className='max-w-[360px] space-y-0.5'>
                <p className='truncate font-medium' title={m.question}>
                  {m.question}
                </p>
                <p className='text-muted-foreground truncate text-xs'>
                  {m.slug}
                  {m.category ? ` · ${m.category}` : ''}
                </p>
              </div>
            </TableCell>
            <TableCell className='whitespace-nowrap text-sm'>
              {outcomeSummary(m)}
            </TableCell>
            <TableCell className='text-right tabular-nums'>
              {compactUsd(m.volume_24hr)}
            </TableCell>
            <TableCell className='whitespace-nowrap text-sm'>
              {m.end_date ? format(new Date(m.end_date), 'yyyy-MM-dd HH:mm') : '—'}
            </TableCell>
            <TableCell>
              <div className='flex flex-wrap gap-1'>
                {m.is_listed ? (
                  <Badge variant='default'>已上架</Badge>
                ) : (
                  <Badge variant='secondary'>未上架</Badge>
                )}
                {m.closed && <Badge variant='destructive'>已关闭</Badge>}
                {m.archived && <Badge variant='outline'>已归档</Badge>}
                {!m.active && !m.closed && <Badge variant='outline'>未激活</Badge>}
              </div>
            </TableCell>
            <TableCell className='text-xs'>{configSummary(m)}</TableCell>
            <TableCell className='text-right'>
              <div className='flex justify-end gap-1'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={(e) => {
                    e.stopPropagation();
                    onView(m);
                  }}
                >
                  <Eye className='mr-1 h-4 w-4' />
                  详情
                </Button>
                {canWrite && (
                  <>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={(e) => {
                        e.stopPropagation();
                        onConfig(m);
                      }}
                    >
                      <Settings2 className='mr-1 h-4 w-4' />
                      配置
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggle(m);
                      }}
                    >
                      {m.is_listed ? (
                        <>
                          <ArrowDownCircle className='mr-1 h-4 w-4' />
                          下架
                        </>
                      ) : (
                        <>
                          <ArrowUpCircle className='mr-1 h-4 w-4' />
                          上架
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function MarketTableEmptyIcon() {
  return <TrendingUp className='text-muted-foreground h-10 w-10' />;
}
