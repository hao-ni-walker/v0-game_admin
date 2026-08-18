'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import PageContainer from '@/components/layout/page-container';
import { PageHeader } from '@/components/table/page-header';
import { Pagination } from '@/components/table/pagination';
import { RefreshCw, Wallet, MapPin, AlertTriangle, ScanLine } from 'lucide-react';
import { toast } from 'sonner';
import { WalletStatsAPI, type WalletStatsSnapshot } from '@/service/api/wallet-stats';

const PAGE_SIZE = 20;
const POLL_INTERVAL_MS = 2000;

const CHAIN_LABEL: Record<string, string> = {
  TON: 'TON',
  ETH: 'Ethereum',
  BSC: 'BNB Chain',
  TRON: 'Tron',
};

function fmtUSD(n: number | null | undefined): string {
  if (n === null || n === undefined) return '—';
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtAmt(n: number): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: 8 });
}

export default function WalletBalancesPage() {
  const [snapshot, setSnapshot] = useState<WalletStatsSnapshot | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const scanning = snapshot?.scanStatus?.running ?? false;
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadOverview = useCallback(async (targetPage: number) => {
    setLoading(true);
    const res = await WalletStatsAPI.getOverview(targetPage, PAGE_SIZE);
    if (res.success && res.data) {
      setSnapshot(res.data);
    } else {
      toast.error(res.message || '获取钱包余额数据失败');
    }
    setLoading(false);
  }, []);

  // 轮询:扫描进行中时每 2s 刷新进度,结束后展示最终快照
  const pollWhileScanning = useCallback(() => {
    if (pollTimer.current) clearTimeout(pollTimer.current);
    pollTimer.current = setTimeout(async () => {
      const res = await WalletStatsAPI.getOverview(1, PAGE_SIZE);
      if (res.success && res.data) {
        setSnapshot(res.data);
        if (res.data.scanStatus.running) {
          pollWhileScanning();
        } else {
          toast.success(
            `扫描完成：${res.data.addressCount} 个地址，总估值 ${fmtUSD(res.data.totalUsd)}`
          );
        }
      } else {
        pollWhileScanning();
      }
    }, POLL_INTERVAL_MS);
  }, []);

  useEffect(() => {
    loadOverview(page);
  }, [loadOverview, page]);

  // 进入页面时如果已有扫描在进行,自动恢复轮询
  useEffect(() => {
    if (scanning) pollWhileScanning();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanning]);

  useEffect(() => {
    return () => {
      if (pollTimer.current) clearTimeout(pollTimer.current);
    };
  }, []);

  const rescan = useCallback(async () => {
    if (scanning) return;
    const res = await WalletStatsAPI.refresh();
    if (res.success && res.data) {
      if (res.data.started) {
        setSnapshot((prev) =>
          prev ? { ...prev, scanStatus: res.data!.scanStatus } : prev
        );
        pollWhileScanning();
      } else {
        toast.info('已有扫描正在进行，请等待完成');
        pollWhileScanning();
      }
    } else {
      toast.error(res.message || '启动扫描失败');
    }
  }, [scanning, pollWhileScanning]);

  const stats = snapshot;
  const hasData = !!stats?.scannedAt;
  const progress = stats?.scanStatus;
  const progressPct =
    progress?.running && progress.total
      ? Math.min(100, Math.round(((progress.scanned ?? 0) / progress.total) * 100))
      : 0;

  return (
    <PageContainer>
      <PageHeader
        title='钱包余额统计'
        description='平台所有用户充值地址的链上实时余额汇总（仅统计发生过转账的钱包，分批限速扫描）'
        action={{
          label: scanning
            ? `扫描中 ${progress?.scanned ?? 0}/${progress?.total ?? '?'}`
            : '重新扫描链上余额',
          onClick: rescan,
          icon: <RefreshCw className={`mr-2 h-4 w-4 ${scanning ? 'animate-spin' : ''}`} />,
        }}
      />

      {scanning && (
        <Card className='mb-6'>
          <CardContent className='py-4'>
            <div className='mb-2 flex items-center justify-between text-sm'>
              <span>
                正在分批扫描链上余额（按链限速，地址量大时需要数分钟到数十分钟）
              </span>
              <span className='font-mono'>
                {progress?.scanned ?? 0} / {progress?.total ?? '?'}（{progressPct}%）
              </span>
            </div>
            <div className='bg-muted h-2 w-full overflow-hidden rounded-full'>
              <div
                className='h-full rounded-full bg-blue-600 transition-all'
                style={{ width: `${Math.max(progressPct, 2)}%` }}
              />
            </div>
            <p className='text-muted-foreground mt-2 text-xs'>
              页面每 2 秒自动刷新进度；下表仍显示上一次完成的快照，扫描结束后自动更新
            </p>
          </CardContent>
        </Card>
      )}

      {!hasData && !scanning && (
        <Card className='mb-6'>
          <CardContent className='flex flex-col items-center gap-3 py-10 text-center'>
            <ScanLine className='text-muted-foreground h-10 w-10' />
            <div>
              <p className='font-medium'>暂无扫描数据</p>
              <p className='text-muted-foreground text-sm'>
                点击右上角「重新扫描链上余额」拉取所有充值地址的实时余额
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {hasData && (
        <>
          {/* 核心指标 */}
          <div className='mb-6 grid gap-4 md:grid-cols-4'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>链上总余额估值</CardTitle>
                <Wallet className='text-muted-foreground h-4 w-4' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{fmtUSD(stats?.totalUsd)}</div>
                <p className='text-muted-foreground text-xs'>
                  数据截至 {stats?.scannedAt ? new Date(stats.scannedAt * 1000).toLocaleString('zh-CN') : '—'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>扫描地址数</CardTitle>
                <MapPin className='text-muted-foreground h-4 w-4' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stats?.addressCount ?? '—'}</div>
                <p className='text-muted-foreground text-xs'>发生过转账的充值地址</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>有余额地址</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stats?.itemCount ?? '—'}</div>
                <p className='text-muted-foreground text-xs'>当前链上余额大于 0</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>拉取失败</CardTitle>
                <AlertTriangle className='text-muted-foreground h-4 w-4' />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stats?.errorCount ? 'text-orange-600' : ''}`}>
                  {stats?.errorCount ?? '—'}
                </div>
                <p className='text-muted-foreground text-xs'>失败的地址不计入汇总</p>
              </CardContent>
            </Card>
          </div>

          {/* 按链汇总 */}
          <Card className='mb-6'>
            <CardHeader>
              <CardTitle>按链汇总</CardTitle>
              <CardDescription>
                各链原生币与代币余额
                {stats?.rates && Object.keys(stats.rates).length > 0 && (
                  <span className='ml-2 text-xs'>
                    · 汇率{' '}
                    {Object.entries(stats.rates)
                      .map(([sym, rate]) => `${sym}=${rate === null ? 'N/A' : rate}`)
                      .join(' ')}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>链</TableHead>
                    <TableHead>资产余额</TableHead>
                    <TableHead className='text-right'>USD 估值</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats?.chains.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className='text-muted-foreground h-24 text-center'>
                        所有地址链上余额为 0（可能已归集至热钱包）
                      </TableCell>
                    </TableRow>
                  ) : (
                    stats?.chains.map((c) => (
                      <TableRow key={c.chainCode}>
                        <TableCell className='font-medium'>
                          {CHAIN_LABEL[c.chainCode] ?? c.chainCode}
                        </TableCell>
                        <TableCell>
                          <div className='flex flex-wrap gap-2'>
                            {c.assets.map((a) => (
                              <Badge key={a.symbol} variant='outline' className='font-mono'>
                                {fmtAmt(a.balance)} {a.symbol}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className='text-right font-mono font-medium'>
                          {fmtUSD(c.usdValue)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* 地址明细 */}
          <Card>
            <CardHeader>
              <CardTitle>地址明细</CardTitle>
              <CardDescription>当前链上余额大于 0 的充值地址，按 USD 估值降序</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>地址</TableHead>
                    <TableHead>链</TableHead>
                    <TableHead>用户 ID</TableHead>
                    <TableHead>余额</TableHead>
                    <TableHead className='text-right'>USD 估值</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(!stats?.items || stats.items.length === 0) && !loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className='text-muted-foreground h-24 text-center'>
                        暂无余额大于 0 的地址
                      </TableCell>
                    </TableRow>
                  ) : (
                    stats?.items.map((item) => (
                      <TableRow key={`${item.chain}-${item.address}`}>
                        <TableCell className='max-w-[220px] truncate font-mono text-xs' title={item.address}>
                          {item.address}
                        </TableCell>
                        <TableCell>
                          <Badge variant='outline'>{item.chain}</Badge>
                        </TableCell>
                        <TableCell>{item.userId}</TableCell>
                        <TableCell>
                          <div className='flex flex-wrap gap-1'>
                            {Object.entries(item.balances).map(([sym, amt]) => (
                              <span key={sym} className='font-mono text-xs'>
                                {fmtAmt(amt)} {sym}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className='text-right font-mono font-medium'>
                          {fmtUSD(item.usdValue)}
                          {item.usdIncomplete && (
                            <span className='text-muted-foreground ml-1 text-xs'>(部分汇率缺失)</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {stats?.pagination && (
                <Pagination
                  pagination={{
                    page: stats.pagination.page,
                    limit: stats.pagination.size,
                    total: stats.pagination.total,
                    totalPages: Math.max(1, Math.ceil(stats.pagination.total / stats.pagination.size)),
                  }}
                  onPageChange={setPage}
                  onPageSizeChange={() => {}}
                  showPageSizeSelector={false}
                />
              )}
              {scanning && (
                <p className='text-muted-foreground mt-2 text-xs'>
                  <Button variant='link' size='sm' className='h-auto p-0' onClick={() => loadOverview(page)}>
                    手动刷新
                  </Button>
                  扫描结束后表格自动更新为最新快照
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </PageContainer>
  );
}
