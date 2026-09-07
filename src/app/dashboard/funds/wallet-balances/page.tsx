'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
import { RefreshCw, Wallet, MapPin, AlertTriangle, ScanLine, Settings2, ArrowDownToLine } from 'lucide-react';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/use-permissions';
import {
  WalletStatsAPI,
  type SweepEstimateData,
  type SweepJobData,
  type DepositSweepConfig,
  type WalletStatsSnapshot,
} from '@/service/api/wallet-stats';

const PAGE_SIZE = 20;
const POLL_INTERVAL_MS = 2000;
const SWEEP_BATCH_LIMIT = 20;
const SWEEP_CHAINS = ['TON', 'ETH', 'BSC', 'TRON'] as const;

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
  const { hasPermission } = usePermissions();
  const canSweep = hasPermission('fund:write');
  const canEditConfig = hasPermission('risk:write');

  const [snapshot, setSnapshot] = useState<WalletStatsSnapshot | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // 筛选:最低 USD 估值(下推到后端,作用于全量 items 而非当前页)
  const [minUsdFilter, setMinUsdFilter] = useState('');
  const [chainFilter, setChainFilter] = useState('ALL');

  // 归集配置卡片
  const [config, setConfig] = useState<DepositSweepConfig | null>(null);
  const [configDirty, setConfigDirty] = useState(false);
  const [configReason, setConfigReason] = useState('');
  const [savingConfig, setSavingConfig] = useState(false);

  // 手动归集:估算弹窗
  const [estimateOpen, setEstimateOpen] = useState(false);
  const [estimateLoading, setEstimateLoading] = useState(false);
  const [estimateData, setEstimateData] = useState<SweepEstimateData | null>(null);
  const [sweepReason, setSweepReason] = useState('');
  const [pendingTargets, setPendingTargets] = useState<{ chain: string; address: string }[]>([]);

  // 归集任务进度
  const [sweepJob, setSweepJob] = useState<SweepJobData | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set()); // key = chain:address

  const scanning = snapshot?.scanStatus?.running ?? false;
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sweepPollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadOverview = useCallback(async (targetPage: number, minUsd?: number) => {
    setLoading(true);
    const res = await WalletStatsAPI.getOverview(targetPage, PAGE_SIZE, minUsd);
    if (res.success && res.data) {
      setSnapshot(res.data);
    } else {
      toast.error(res.message || '获取钱包余额数据失败');
    }
    setLoading(false);
  }, []);

  const loadConfig = useCallback(async () => {
    const res = await WalletStatsAPI.getDepositConfig();
    if (res.success && res.data) {
      setConfig(res.data);
      setConfigDirty(false);
    }
  }, []);

  useEffect(() => {
    loadOverview(page, Number(minUsdFilter) || undefined);
  }, [loadOverview, page, minUsdFilter]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // 轮询:扫描进行中时每 2s 刷新进度
  const pollWhileScanning = useCallback(() => {
    if (pollTimer.current) clearTimeout(pollTimer.current);
    pollTimer.current = setTimeout(async () => {
      const res = await WalletStatsAPI.getOverview(1, PAGE_SIZE, Number(minUsdFilter) || undefined);
      if (res.success && res.data) {
        setSnapshot(res.data);
        const st = res.data.scanStatus;
        if (st.running) {
          pollWhileScanning();
        } else if (st.status === 'failed') {
          toast.error('链上扫描失败，已保留上一次快照（详见后端日志）');
        } else if (st.status === 'completed') {
          toast.success(
            `扫描完成：${res.data.addressCount} 个地址，总估值 ${fmtUSD(res.data.totalUsd)}`
          );
        }
      } else {
        pollWhileScanning();
      }
    }, POLL_INTERVAL_MS);
  }, [minUsdFilter]);

  useEffect(() => {
    if (scanning) pollWhileScanning();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanning]);

  // 轮询:手动归集任务进度
  const pollSweepJob = useCallback(() => {
    if (sweepPollTimer.current) clearTimeout(sweepPollTimer.current);
    sweepPollTimer.current = setTimeout(async () => {
      const res = await WalletStatsAPI.sweepStatus();
      if (res.success && res.data) {
        setSweepJob(res.data);
        if (res.data.status === 'running') {
          pollSweepJob();
        } else {
          const ok = res.data.results.filter((r) => r.status === 'swept').length;
          const skipped = res.data.results.filter((r) => r.status === 'skipped').length;
          const failed = res.data.results.filter((r) => r.status === 'failed').length;
          if (failed > 0) {
            toast.error(`归集完成：成功 ${ok}、跳过 ${skipped}、失败 ${failed}（详见任务明细）`);
          } else {
            toast.success(`归集完成：成功 ${ok}、跳过 ${skipped}`);
          }
          loadOverview(page, Number(minUsdFilter) || undefined);
        }
      } else {
        pollSweepJob();
      }
    }, POLL_INTERVAL_MS);
  }, [loadOverview, page, minUsdFilter]);

  useEffect(() => {
    return () => {
      if (pollTimer.current) clearTimeout(pollTimer.current);
      if (sweepPollTimer.current) clearTimeout(sweepPollTimer.current);
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

  // ── 归集配置卡片 ──
  const updateConfigValue = (chain: string, patch: { enabled?: boolean; minUsd?: number }) => {
    setConfig((prev) => {
      if (!prev) return prev;
      const enabled = { ...prev.sweepEnabled };
      const minGain = { ...prev.sweepMinGainUsd };
      if (patch.enabled !== undefined) enabled[chain] = patch.enabled;
      if (patch.minUsd !== undefined) minGain[chain] = patch.minUsd;
      return { sweepEnabled: enabled, sweepMinGainUsd: minGain };
    });
    setConfigDirty(true);
  };

  const saveConfig = useCallback(async () => {
    if (!config) return;
    if (!configReason.trim()) {
      toast.error('请填写变更原因（审计需要）');
      return;
    }
    setSavingConfig(true);
    const res = await WalletStatsAPI.updateDepositConfig(
      {
        sweep_enabled: Object.fromEntries(SWEEP_CHAINS.map((c) => [c, !!config.sweepEnabled[c]])),
        sweep_min_gain_usd: Object.fromEntries(
          SWEEP_CHAINS.map((c) => [c, Number(config.sweepMinGainUsd[c]) || 0])
        ),
      },
      configReason.trim()
    );
    setSavingConfig(false);
    if (res.success && res.data) {
      setConfig(res.data);
      setConfigDirty(false);
      setConfigReason('');
      toast.success('归集配置已保存（下个归集周期生效，无需重启）');
    } else {
      toast.error(res.message || '保存归集配置失败');
    }
  }, [config, configReason]);

  // ── 手动归集 ──
  const openEstimate = useCallback(async (targets: { chain: string; address: string }[]) => {
    if (!canSweep) {
      toast.error('缺少 fund:write 权限，无法执行归集');
      return;
    }
    setPendingTargets(targets);
    setEstimateOpen(true);
    setEstimateLoading(true);
    setEstimateData(null);
    setSweepReason('');
    const res = await WalletStatsAPI.estimateSweep(targets);
    setEstimateLoading(false);
    if (res.success && res.data) {
      setEstimateData(res.data);
    } else {
      toast.error(res.message || '估算归集成本失败');
    }
  }, [canSweep]);

  const confirmSweep = useCallback(async () => {
    if (!sweepReason.trim()) {
      toast.error('请填写操作原因（审计需要）');
      return;
    }
    const res = await WalletStatsAPI.executeSweep(pendingTargets, sweepReason.trim());
    if (res.success && res.data) {
      setEstimateOpen(false);
      if (res.data.started) {
        setSweepJob(res.data.job);
        pollSweepJob();
        toast.success('归集任务已启动');
      } else {
        toast.info('已有归集任务在执行，正在显示其进度');
        pollSweepJob();
      }
    } else {
      toast.error(res.message || '启动归集失败');
    }
  }, [pendingTargets, sweepReason, pollSweepJob]);

  const stats = snapshot;
  const hasData = !!stats?.scannedAt;
  const progress = stats?.scanStatus;
  const progressPct =
    progress?.running && progress.total
      ? Math.min(100, Math.round(((progress.scanned ?? 0) / progress.total) * 100))
      : 0;

  const items = useMemo(
    () => (stats?.items ?? []).filter((i) => chainFilter === 'ALL' || i.chain === chainFilter),
    [stats?.items, chainFilter]
  );

  const toggleSelected = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectedTargets = useMemo(
    () =>
      (stats?.items ?? [])
        .filter((i) => selected.has(`${i.chain}:${i.address}`))
        .map((i) => ({ chain: i.chain, address: i.address })),
    [stats?.items, selected]
  );

  const sweepJobRunning = sweepJob?.status === 'running';
  const sweepJobPct = sweepJob
    ? Math.min(100, Math.round((sweepJob.scanned / Math.max(1, sweepJob.total)) * 100))
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

      {/* 归集配置卡片 */}
      {config && (
        <Card className='mb-6'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-base'>
              <Settings2 className='h-4 w-4' />
              自动归集配置
            </CardTitle>
            <CardDescription>
              按链独立开关与最小归集额（USD）——只影响自动归集；手动归集不受限制。保存后下个归集周期生效，无需重启。
              {!canEditConfig && <span className='ml-1 text-orange-600'>（缺少 risk:write 权限，仅可查看）</span>}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid gap-4 md:grid-cols-4'>
              {SWEEP_CHAINS.map((chain) => (
                <div key={chain} className='flex flex-col gap-2 rounded-lg border p-3'>
                  <div className='flex items-center justify-between'>
                    <span className='font-medium'>{CHAIN_LABEL[chain] ?? chain}</span>
                    <Switch
                      checked={!!config.sweepEnabled[chain]}
                      disabled={!canEditConfig || savingConfig}
                      onCheckedChange={(v) => updateConfigValue(chain, { enabled: v })}
                    />
                  </div>
                  <div className='flex items-center gap-2'>
                    <Label htmlFor={`min-${chain}`} className='text-muted-foreground shrink-0 text-xs'>
                      最小归集额
                    </Label>
                    <Input
                      id={`min-${chain}`}
                      type='number'
                      min={0}
                      step='0.5'
                      disabled={!canEditConfig || savingConfig}
                      value={config.sweepMinGainUsd[chain] ?? 0}
                      onChange={(e) =>
                        updateConfigValue(chain, { minUsd: Number(e.target.value) })
                      }
                    />
                    <span className='text-muted-foreground text-xs'>USD</span>
                  </div>
                </div>
              ))}
            </div>
            {canEditConfig && (
              <div className='mt-4 flex flex-wrap items-center gap-3'>
                <Input
                  className='max-w-xs'
                  placeholder='变更原因（审计必填）'
                  value={configReason}
                  onChange={(e) => setConfigReason(e.target.value)}
                  disabled={savingConfig}
                />
                <Button onClick={saveConfig} disabled={!configDirty || savingConfig || !configReason.trim()}>
                  {savingConfig ? '保存中…' : '保存配置'}
                </Button>
                {!configDirty && <span className='text-muted-foreground text-xs'>配置与后端一致</span>}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 手动归集任务进度 */}
      {sweepJob && sweepJob.status !== 'idle' && (
        <Card className='mb-6'>
          <CardHeader>
            <CardTitle className='text-base'>手动归集任务</CardTitle>
            <CardDescription>
              {sweepJobRunning
                ? `执行中 ${sweepJob.scanned}/${sweepJob.total}（两段式垫付+转账在同一任务内完成，缺 gas 的地址需等待确认）`
                : sweepJob.status === 'completed'
                  ? `已完成 ${sweepJob.total} 个地址`
                  : `执行失败（${sweepJob.total} 个地址）`}
              {sweepJob.admin && <span className='ml-2 text-xs'>操作人 {sweepJob.admin}</span>}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='bg-muted mb-3 h-2 w-full overflow-hidden rounded-full'>
              <div
                className={`h-full rounded-full transition-all ${sweepJob.status === 'failed' ? 'bg-red-500' : 'bg-blue-600'}`}
                style={{ width: `${Math.max(sweepJobPct, 2)}%` }}
              />
            </div>
            {sweepJob.results.length > 0 && (
              <div className='space-y-1'>
                {sweepJob.results.map((r) => (
                  <div key={`${r.chain}-${r.address}`} className='flex items-center gap-2 text-xs'>
                    <Badge variant='outline'>{r.chain}</Badge>
                    <span className='max-w-[260px] truncate font-mono' title={r.address}>
                      {r.address}
                    </span>
                    <Badge
                      variant={r.status === 'swept' ? 'default' : r.status === 'failed' ? 'destructive' : 'secondary'}
                    >
                      {r.status}
                    </Badge>
                    {r.detail && <span className='text-muted-foreground truncate'>{r.detail}</span>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {scanning && (
        <Card className='mb-6'>
          <CardContent className='py-4'>
            <div className='mb-2 flex items-center justify-between text-sm'>
              <span>正在分批扫描链上余额（按链限速，地址量大时需要数分钟到数十分钟）</span>
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
            <CardHeader className='flex flex-row flex-wrap items-center justify-between gap-3'>
              <div>
                <CardTitle>地址明细</CardTitle>
                <CardDescription>
                  当前链上余额大于 0 的充值地址，按 USD 估值降序；筛选作用于全部地址（服务端过滤）
                </CardDescription>
              </div>
              <div className='flex flex-wrap items-center gap-2'>
                <Input
                  className='w-40'
                  type='number'
                  min={0}
                  placeholder='最低估值 USD'
                  value={minUsdFilter}
                  onChange={(e) => {
                    setPage(1);
                    setMinUsdFilter(e.target.value);
                  }}
                />
                <select
                  className='border-input bg-background h-9 rounded-md border px-3 text-sm'
                  value={chainFilter}
                  onChange={(e) => setChainFilter(e.target.value)}
                >
                  <option value='ALL'>全部链</option>
                  {Object.entries(CHAIN_LABEL).map(([code, label]) => (
                    <option key={code} value={code}>
                      {label}
                    </option>
                  ))}
                </select>
                {canSweep && (
                  <Button
                    variant='secondary'
                    disabled={selectedTargets.length === 0 || sweepJobRunning}
                    onClick={() => {
                      if (selectedTargets.length > SWEEP_BATCH_LIMIT) {
                        toast.error(`单次最多勾选 ${SWEEP_BATCH_LIMIT} 个地址，请分批`);
                        return;
                      }
                      openEstimate(selectedTargets);
                    }}
                  >
                    <ArrowDownToLine className='mr-2 h-4 w-4' />
                    归集选中 ({selectedTargets.length})
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    {canSweep && <TableHead className='w-10'></TableHead>}
                    <TableHead>地址</TableHead>
                    <TableHead>链</TableHead>
                    <TableHead>用户 ID</TableHead>
                    <TableHead>余额</TableHead>
                    <TableHead className='text-right'>USD 估值</TableHead>
                    {canSweep && <TableHead className='text-right'>操作</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(!items || items.length === 0) && !loading ? (
                    <TableRow>
                      <TableCell colSpan={canSweep ? 7 : 5} className='text-muted-foreground h-24 text-center'>
                        暂无余额大于 0 的地址
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item) => {
                      const key = `${item.chain}:${item.address}`;
                      return (
                        <TableRow key={key}>
                          {canSweep && (
                            <TableCell>
                              <Checkbox
                                checked={selected.has(key)}
                                onCheckedChange={() => toggleSelected(key)}
                              />
                            </TableCell>
                          )}
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
                          {canSweep && (
                            <TableCell className='text-right'>
                              <Button
                                variant='outline'
                                size='sm'
                                disabled={sweepJobRunning}
                                onClick={() => openEstimate([{ chain: item.chain, address: item.address }])}
                              >
                                归集
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })
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
                  <Button variant='link' size='sm' className='h-auto p-0' onClick={() => loadOverview(page, Number(minUsdFilter) || undefined)}>
                    手动刷新
                  </Button>
                  扫描结束后表格自动更新为最新快照
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* 归集确认弹窗:实时估算 */}
      <Dialog open={estimateOpen} onOpenChange={(v) => !estimateLoading && setEstimateOpen(v)}>
        <DialogContent className='max-w-3xl'>
          <DialogHeader>
            <DialogTitle>确认手动归集（{pendingTargets.length} 个地址）</DialogTitle>
            <DialogDescription>
              以下为点击时实时查询的链上余额与成本估算；确认后后台任务执行（垫付 gas 与转账在同一任务内完成）。
            </DialogDescription>
          </DialogHeader>
          {estimateLoading ? (
            <div className='py-8 text-center text-sm text-muted-foreground'>正在实时估算成本…</div>
          ) : (
            <div className='max-h-[45vh] overflow-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>链/地址</TableHead>
                    <TableHead>余额</TableHead>
                    <TableHead className='text-right'>估值</TableHead>
                    <TableHead className='text-right'>tx 数</TableHead>
                    <TableHead className='text-right'>成本</TableHead>
                    <TableHead>垫付</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(estimateData?.estimates ?? []).map((e) => (
                    <TableRow key={`${e.chain}-${e.address}`}>
                      <TableCell>
                        <Badge variant='outline' className='mb-1'>{e.chain}</Badge>
                        <div className='max-w-[180px] truncate font-mono text-xs' title={e.address}>
                          {e.address}
                        </div>
                      </TableCell>
                      <TableCell>
                        {Object.entries(e.balances).map(([sym, amt]) => (
                          <div key={sym} className='font-mono text-xs'>
                            {fmtAmt(amt)} {sym}
                          </div>
                        ))}
                      </TableCell>
                      <TableCell className='text-right font-mono'>{fmtUSD(e.valueUsd)}</TableCell>
                      <TableCell className='text-right font-mono'>{e.txCount}</TableCell>
                      <TableCell className='text-right font-mono'>
                        {fmtAmt(e.costNative)} {e.costSymbol}
                        <div className='text-muted-foreground text-xs'>≈ {fmtUSD(e.costUsd)}</div>
                      </TableCell>
                      <TableCell>
                        {e.needTopupNative !== null ? (
                          <span className='font-mono text-xs'>
                            {fmtAmt(e.needTopupNative)} {e.topupSymbol}
                          </span>
                        ) : (
                          <span className='text-muted-foreground text-xs'>不需要</span>
                        )}
                        {e.warnings.map((w) => (
                          <div key={w} className='mt-1 text-xs text-orange-600'>
                            ⚠ {w}
                          </div>
                        ))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <DialogFooter className='flex-col items-stretch gap-2 sm:flex-row sm:items-center'>
            <Input
              placeholder='操作原因（审计必填）'
              value={sweepReason}
              onChange={(e) => setSweepReason(e.target.value)}
            />
            <Button onClick={confirmSweep} disabled={estimateLoading || !estimateData}>
              确认归集
            </Button>
            <Button variant='outline' onClick={() => setEstimateOpen(false)} disabled={estimateLoading}>
              取消
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
