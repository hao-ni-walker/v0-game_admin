'use client';

import { useCallback, useState } from 'react';
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
} from './components';
import { usePredictionMarkets } from './hooks';
import type { PredictionMarket } from '@/service/request';

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
  } = usePredictionMarkets();

  const { hasPermission } = usePermissions();
  const canWrite = hasPermission('prediction:write');

  // 上架配置弹窗
  const [configOpen, setConfigOpen] = useState(false);
  const [configTarget, setConfigTarget] = useState<PredictionMarket | null>(null);

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

  const hasActiveFilters =
    Boolean(applied.q) || applied.is_listed !== 'all' || applied.closed !== 'all';

  const totalPages = Math.max(1, Math.ceil(total / Math.max(applied.pageSize, 1)));

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
          />

          <MarketFilters filters={filters} onSearch={search} onReset={clearFilters} loading={loading} />

          <div className='flex min-h-0 flex-1 flex-col'>
            <div className='min-h-0 flex-1 overflow-y-auto'>
              <MarketTable
                markets={markets}
                loading={loading}
                canWrite={canWrite}
                onConfig={handleConfig}
                onToggle={handleToggleRequest}
                emptyState={{
                  icon: <MarketTableEmptyIcon />,
                  title: hasActiveFilters ? '未找到匹配的市场' : '目录为空',
                  description: hasActiveFilters
                    ? '请尝试调整筛选条件'
                    : '等待 Gamma 同步（每 5 分钟一轮）或点击右上角手动同步',
                }}
              />
            </div>

            {total > 0 && (
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
