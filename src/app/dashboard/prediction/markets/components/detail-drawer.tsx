'use client';

import { useCallback, useEffect, useState } from 'react';
import { ExternalLink, Settings2 } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { PredictionMarketAPI } from '@/service/request';
import type { PredictionMarketDetail } from '@/service/request';
import { compactUsd, fmtDateTime, polymarketUrl } from '../utils';

interface DetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  marketId: number | null;
  canWrite: boolean;
  onConfig: (m: PredictionMarketDetail) => void;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className='flex items-start justify-between gap-4 py-1.5'>
      <span className='text-muted-foreground shrink-0 text-sm'>{label}</span>
      <span className='text-right text-sm'>{children}</span>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h4 className='pt-3 text-xs font-semibold tracking-wide uppercase'>{children}</h4>;
}

function priceLabel(v: number | null | undefined): string {
  if (v === null || v === undefined) return '—';
  return v.toFixed(4);
}

export function DetailDrawer({ open, onOpenChange, marketId, canWrite, onConfig }: DetailDrawerProps) {
  const [detail, setDetail] = useState<PredictionMarketDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!marketId) return;
    setLoading(true);
    try {
      const res = await PredictionMarketAPI.getDetail(marketId);
      if (res.success && res.data) {
        setDetail(res.data);
      } else {
        toast.error(res.message || '获取市场详情失败');
      }
    } catch {
      toast.error('获取市场详情失败');
    } finally {
      setLoading(false);
    }
  }, [marketId]);

  useEffect(() => {
    if (open && marketId) {
      setDetail(null);
      fetchDetail();
    }
  }, [open, marketId, fetchDetail]);

  const outcomes = detail?.outcomes || [];
  const prices = detail?.outcome_prices || [];
  const pricePairs =
    outcomes.length === prices.length && outcomes.length > 0
      ? outcomes.map((label, i) => {
          const n = Number(prices[i]);
          return `${label} ${Number.isFinite(n) ? n.toFixed(2) : '—'}`;
        })
      : [];

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction='right'>
      <DrawerContent className='h-full w-full overflow-y-auto sm:max-w-lg'>
        <DrawerHeader className='border-b pb-3'>
          <DrawerTitle className='pr-8 text-base leading-snug'>
            {loading ? <Skeleton className='h-5 w-3/4' /> : detail?.question || '市场详情'}
          </DrawerTitle>
          {detail && (
            <div className='flex flex-wrap items-center gap-1.5 pt-1'>
              {detail.is_listed ? <Badge>已上架</Badge> : <Badge variant='secondary'>未上架</Badge>}
              {detail.closed && <Badge variant='destructive'>已关闭</Badge>}
              {detail.archived && <Badge variant='outline'>已归档</Badge>}
              {!detail.active && !detail.closed && <Badge variant='outline'>未激活</Badge>}
              {detail.category && <Badge variant='outline'>{detail.category}</Badge>}
              {detail.accepting_orders === false && <Badge variant='outline'>暂停接单</Badge>}
            </div>
          )}
        </DrawerHeader>

        <div className='space-y-1 px-4 pb-8'>
          {loading && (
            <div className='space-y-2 py-4'>
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className='h-6 w-full' />
              ))}
            </div>
          )}

          {!loading && detail && (
            <>
              {detail.listing_blockers.length > 0 && !detail.is_listed && (
                <Alert variant='destructive' className='mt-3'>
                  <AlertTitle>暂不可上架</AlertTitle>
                  <AlertDescription>
                    <ul className='list-disc pl-4'>
                      {detail.listing_blockers.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <div className='flex flex-wrap gap-2 pt-3'>
                <Button variant='outline' size='sm' asChild>
                  <a href={polymarketUrl(detail.slug)} target='_blank' rel='noreferrer'>
                    <ExternalLink className='mr-1 h-4 w-4' />
                    Polymarket 原市场
                  </a>
                </Button>
                {canWrite && (
                  <Button variant='outline' size='sm' onClick={() => onConfig(detail)}>
                    <Settings2 className='mr-1 h-4 w-4' />
                    上架配置
                  </Button>
                )}
              </div>

              <SectionTitle>价格</SectionTitle>
              <Row label='结果 / 份额价'>
                {pricePairs.length ? pricePairs.join(' · ') : '—'}
              </Row>
              <Row label='买一 / 卖一'>
                {priceLabel(detail.best_bid)} / {priceLabel(detail.best_ask)}
              </Row>
              <Row label='最近成交'>{priceLabel(detail.last_trade_price)}</Row>

              <SectionTitle>规模</SectionTitle>
              <Row label='24h 交易量'>{compactUsd(detail.volume_24hr)}</Row>
              <Row label='累计交易量'>{compactUsd(detail.volume_num)}</Row>
              <Row label='流动性'>{compactUsd(detail.liquidity_num)}</Row>

              <SectionTitle>时间</SectionTitle>
              <Row label='结束时间'>{fmtDateTime(detail.end_date)}</Row>
              <Row label='上架时间'>{fmtDateTime(detail.listed_at)}</Row>
              <Row label='最近同步'>{fmtDateTime(detail.synced_at)}</Row>

              <SectionTitle>上架配置（运营字段）</SectionTitle>
              <Row label='点差'>
                {detail.spread_bps !== null && detail.spread_bps !== undefined
                  ? `${detail.spread_bps} bp`
                  : '全局默认'}
              </Row>
              <Row label='敞口上限'>
                {detail.max_exposure_usdt !== null && detail.max_exposure_usdt !== undefined
                  ? compactUsd(Number(detail.max_exposure_usdt))
                  : '全局默认'}
              </Row>
              <Row label='注单限额'>
                {detail.min_bet_usdt !== null && detail.max_bet_usdt !== null
                  ? `$${detail.min_bet_usdt} ~ $${detail.max_bet_usdt}`
                  : '全局默认'}
              </Row>
              <Row label='排序权重'>{detail.sort_order}</Row>

              <Separator className='my-2' />
              <SectionTitle>链上标识</SectionTitle>
              <Row label='market_id'>
                <code className='bg-muted rounded px-1 text-xs'>{detail.market_id}</code>
              </Row>
              <Row label='condition_id'>
                <code className='bg-muted rounded px-1 text-xs break-all'>
                  {detail.condition_id || '—'}
                </code>
              </Row>
              <Row label='slug'>
                <code className='bg-muted rounded px-1 text-xs break-all'>{detail.slug}</code>
              </Row>
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
