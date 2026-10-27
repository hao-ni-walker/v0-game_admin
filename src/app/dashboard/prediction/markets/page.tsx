'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { usePermissions } from '@/hooks/use-permissions';
import { Pagination } from '@/components/table/pagination';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  MarketPageHeader,
  MarketFilters,
  MarketTable,
  MarketTableEmptyIcon,
  ConfigDialog,
  DetailDrawer,
  ManualDrawer,
  BatchActionBar,
  BatchConfigDialog,
  BatchToggleConfirmDialog,
  BatchResultDialog,
} from './components';
import { usePredictionMarkets, type BatchItemFailure } from './hooks';
import type {
  PredictionMarket,
  PredictionMarketDetail,
  PredictionMarketUpdateData,
} from '@/service/request';

export default function PredictionMarketsPage() {
  const {
    filters,
    applied,
    markets,
    total,
    loading,
    syncStatus,
    syncing,
    search,
    clearFilters,
    refresh,
    triggerSync,
    updateConfig,
    toggleListed,
    batchToggle,
    batchUpdate,
  } = usePredictionMarkets();

  const { hasPermission } = usePermissions();
  const canWrite = hasPermission('prediction:write');

  // 上架配置弹窗
  const [configOpen, setConfigOpen] = useState(false);
  const [configTarget, setConfigTarget] = useState<PredictionMarket | null>(null);

  // 详情抽屉
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);

  // 运营说明抽屉
  const [manualOpen, setManualOpen] = useState(false);

  const handleView = useCallback((m: PredictionMarket) => {
    setDetailId(m.id);
    setDetailOpen(true);
  }, []);

  // 抽屉内的「上架配置」按钮：复用配置弹窗（PredictionMarketDetail 兼容列表行类型）
  const handleConfigFromDetail = useCallback(
    (m: PredictionMarketDetail) => {
      setConfigTarget(m);
      setConfigOpen(true);
    },
    []
  );

  // 上/下架确认弹窗
  const [toggleOpen, setToggleOpen] = useState(false);
  const [toggleTarget, setToggleTarget] = useState<PredictionMarket | null>(null);
  const [toggling, setToggling] = useState(false);

  const handleConfig = useCallback((m: PredictionMarket) => {
    setConfigTarget(m);
    setConfigOpen(true);
  }, []);

  const handleToggleRequest = useCallback((m: PredictionMarket) => {
    setToggleTarget(m);
    setToggleOpen(true);
  }, []);

  const handleToggleConfirm = useCallback(async () => {
    if (!toggleTarget) return;
    setToggling(true);
    const ok = await toggleListed(toggleTarget.id, !toggleTarget.is_listed);
    setToggling(false);
    if (ok) setToggleOpen(false);
  }, [toggleTarget, toggleListed]);

  // ── 批量操作（仅进行中 tab；跨页累积，切 tab/筛选清除）──
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [batchToggleOpen, setBatchToggleOpen] = useState(false);
  const [batchListed, setBatchListed] = useState(true);
  const [batchConfigOpen, setBatchConfigOpen] = useState(false);
  const [batchBusy, setBatchBusy] = useState(false);
  const [batchResult, setBatchResult] = useState<{
    action: string;
    ok: number;
    failures: Array<{ question: string; message: string }>;
  } | null>(null);

  // tab/筛选变化时清空选择（已结算行不可上架，跨筛选集合作批量易误伤）
  useEffect(() => {
    setSelectedIds(new Set());
  }, [applied.tab, applied.q, applied.is_listed]);

  const handleToggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleToggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      const visibleIds = markets.map((m) => m.id);
      const allSelected = visibleIds.every((id) => prev.has(id));
      const next = new Set(prev);
      if (allSelected) visibleIds.forEach((id) => next.delete(id));
      else visibleIds.forEach((id) => next.add(id));
      return next;
    });
  }, [markets]);

  // 选择可跨页累积；缓存见过的行标题，批量结果里翻页前的失败项也能显示市场名
  const questionCache = useRef(new Map<number, string>());
  markets.forEach((m) => questionCache.current.set(m.id, m.question));

  const questionOf = useCallback((id: number) => {
    const q = questionCache.current.get(id);
    return q ?? `市场 #${id}`;
  }, []);

  const runBatchAction = useCallback(
    async (action: string, run: () => Promise<{ ok: number; failures: BatchItemFailure[] }>) => {
      setBatchBusy(true);
      const outcome = await run();
      setBatchBusy(false);
      setBatchToggleOpen(false);
      setBatchResult({
        action,
        ok: outcome.ok,
        failures: outcome.failures.map((f) => ({
          question: questionOf(f.id),
          message: f.message,
        })),
      });
      setSelectedIds(new Set());
    },
    [questionOf]
  );

  const handleBatchToggleConfirm = useCallback(() => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    void runBatchAction(batchListed ? '批量上架' : '批量下架', () =>
      batchToggle(ids, batchListed)
    );
  }, [selectedIds, batchListed, batchToggle, runBatchAction]);

  const handleBatchConfigSubmit = useCallback(
    async (body: PredictionMarketUpdateData) => {
      const ids = Array.from(selectedIds);
      if (!ids.length) return false;
      await runBatchAction('批量配置', () => batchUpdate(ids, body));
      return true;
    },
    [selectedIds, batchUpdate, runBatchAction]
  );

  const hasActiveFilters = Boolean(applied.q) || applied.is_listed !== 'all';

  const totalPages = Math.max(1, Math.ceil(total / Math.max(applied.pageSize, 1)));
  const isSettled = applied.tab === 'settled';

  return (
    <PermissionGuard permissions='prediction:read'>
      <PageContainer scrollable={false}>
        <div className='flex h-[calc(100vh-8rem)] w-full flex-col space-y-4'>
          <MarketPageHeader
            syncStatus={syncStatus}
            syncing={syncing}
            loading={loading}
            canWrite={canWrite}
            onRefresh={refresh}
            onSync={triggerSync}
            onManual={() => setManualOpen(true)}
          />

          <MarketFilters filters={filters} onSearch={search} onReset={clearFilters} loading={loading} />

          {canWrite && !isSettled && selectedIds.size > 0 && (
            <BatchActionBar
              count={selectedIds.size}
              busy={batchBusy}
              onBatchList={() => {
                setBatchListed(true);
                setBatchToggleOpen(true);
              }}
              onBatchDelist={() => {
                setBatchListed(false);
                setBatchToggleOpen(true);
              }}
              onBatchConfig={() => setBatchConfigOpen(true)}
              onClear={() => setSelectedIds(new Set())}
            />
          )}

          <div className='flex min-h-0 flex-1 flex-col'>
            <div className='min-h-0 flex-1 overflow-y-auto'>
              <MarketTable
                markets={markets}
                loading={loading}
                canWrite={canWrite}
                onView={handleView}
                onConfig={handleConfig}
                onToggle={handleToggleRequest}
                selectable={canWrite && !isSettled}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onToggleSelectAll={handleToggleSelectAll}
                emptyState={{
                  icon: <MarketTableEmptyIcon />,
                  title: isSettled
                    ? '暂无已结算市场'
                    : hasActiveFilters
                      ? '未找到匹配的市场'
                      : '目录为空',
                  description: isSettled
                    ? '已上架的市场结束后会归入这里'
                    : hasActiveFilters
                      ? '请尝试调整筛选条件'
                      : '等待 Gamma 同步（每小时一轮）或点击右上角手动同步',
                }}
              />
            </div>

            {total > 0 && !isSettled && (
              <div className='bg-card mt-auto shrink-0 border-t pt-4'>
                <Pagination
                  pagination={{
                    page: applied.page,
                    limit: applied.pageSize,
                    total,
                    totalPages,
                  }}
                  onPageChange={(page) => search({ page })}
                  onPageSizeChange={(pageSize) => search({ pageSize, page: 1 })}
                  pageSizeOptions={[20, 50, 100]}
                />
              </div>
            )}
          </div>

          <ConfigDialog
            open={configOpen}
            market={configTarget}
            onOpenChange={setConfigOpen}
            onSubmit={updateConfig}
          />

          <DetailDrawer
            open={detailOpen}
            onOpenChange={setDetailOpen}
            marketId={detailId}
            canWrite={canWrite}
            onConfig={handleConfigFromDetail}
          />

          <ManualDrawer open={manualOpen} onOpenChange={setManualOpen} />

          <BatchToggleConfirmDialog
            open={batchToggleOpen}
            listed={batchListed}
            count={selectedIds.size}
            busy={batchBusy}
            onConfirm={handleBatchToggleConfirm}
            onOpenChange={setBatchToggleOpen}
          />

          <BatchConfigDialog
            open={batchConfigOpen}
            count={selectedIds.size}
            onOpenChange={setBatchConfigOpen}
            onSubmit={handleBatchConfigSubmit}
          />

          {batchResult && (
            <BatchResultDialog
              open
              action={batchResult.action}
              ok={batchResult.ok}
              failures={batchResult.failures}
              onOpenChange={(o) => !o && setBatchResult(null)}
            />
          )}

          <Dialog open={toggleOpen} onOpenChange={setToggleOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{toggleTarget?.is_listed ? '确认下架' : '确认上架'}</DialogTitle>
                <DialogDescription className='line-clamp-3' title={toggleTarget?.question}>
                  {toggleTarget?.question}
                </DialogDescription>
              </DialogHeader>
              {toggleTarget && !toggleTarget.is_listed ? (
                <p className='text-muted-foreground text-sm'>
                  上架后用户可见可下注；下架始终允许。若市场不满足上架条件（已关闭/非二元/缺少定价信息），后端会拒绝并提示原因。
                </p>
              ) : (
                <p className='text-muted-foreground text-sm'>
                  下架后市场对用户不可见，已有注单不受影响；可随时重新上架（需仍满足上架条件）。
                </p>
              )}
              <DialogFooter>
                <Button variant='outline' onClick={() => setToggleOpen(false)} disabled={toggling}>
                  取消
                </Button>
                <Button onClick={handleToggleConfirm} disabled={toggling}>
                  {toggling ? '处理中…' : toggleTarget?.is_listed ? '下架' : '上架'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </PageContainer>
    </PermissionGuard>
  );
}
