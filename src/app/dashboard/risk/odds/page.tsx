'use client';
import { useCallback } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import PageContainer from '@/components/layout/page-container';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { usePermissions } from '@/hooks/use-permissions';
import {
  OddsPageHeader,
  CurrencyTabs,
  BaseOddsTable,
  WindowedOddsList,
  OddsBaseEditDialog,
  OddsWindowDialog,
} from './components';
import { useOddsManagement } from './hooks';
import { MESSAGES } from './constants';
import type { OddsConfig } from './types';

export default function OddsPage() {
  const {
    currencies,
    activeCurrency,
    setActiveCurrency,
    resolved,
    configs,
    loading,
    refresh,
    updateBase,
    createWindow,
    deleteConfig,
    baseEdit,
    openBaseEdit,
    closeBaseEdit,
    windowCompose,
    openWindowCompose,
    closeWindowCompose,
  } = useOddsManagement();

  const { hasPermission } = usePermissions();
  const canWrite = hasPermission('odds:write');

  const handleRefresh = () => refresh();

  const handleSubmitBase = useCallback(
    async (period: string, payout: number) => updateBase(period, payout),
    [updateBase]
  );

  const handleSubmitWindow = useCallback(
    async (data: Parameters<typeof createWindow>[0]) => createWindow(data),
    [createWindow]
  );

  const handleDeleteWindow = useCallback(
    async (cfg: OddsConfig) => { await deleteConfig(cfg.id); },
    [deleteConfig]
  );

  const baseConfigForEdit = baseEdit.period
    ? configs.find((c) => c.is_base && c.period === baseEdit.period) ?? null
    : null;

  return (
    <PermissionGuard permissions='odds:read'>
      <PageContainer scrollable={false}>
        <div className='flex h-[calc(100vh-8rem)] w-full flex-col space-y-4'>
          <OddsPageHeader onRefresh={handleRefresh} loading={loading} />

          {currencies.length === 0 && !loading ? (
            <div className='flex h-full flex-col items-center justify-center space-y-3 p-8'>
              <SlidersHorizontal className='text-muted-foreground h-12 w-12' />
              <p className='text-lg font-medium'>{MESSAGES.EMPTY}</p>
            </div>
          ) : (
            <>
              <CurrencyTabs currencies={currencies} active={activeCurrency} onChange={setActiveCurrency} />

              {activeCurrency && (
                <div className='flex min-h-0 flex-1 flex-col gap-6 overflow-auto'>
                  <section>
                    <h2 className='mb-3 text-lg font-semibold'>基础赔率</h2>
                    <BaseOddsTable
                      resolved={resolved}
                      configs={configs}
                      loading={loading}
                      canWrite={canWrite}
                      onEditBase={openBaseEdit}
                    />
                  </section>

                  <section>
                    <WindowedOddsList
                      configs={configs}
                      loading={loading}
                      canWrite={canWrite}
                      onAdd={openWindowCompose}
                      onDelete={handleDeleteWindow}
                    />
                  </section>
                </div>
              )}
            </>
          )}

          <OddsBaseEditDialog
            open={baseEdit.open}
            period={baseEdit.period}
            baseConfig={baseConfigForEdit}
            onOpenChange={(open) => { if (!open) closeBaseEdit(); }}
            onSubmit={handleSubmitBase}
          />

          <OddsWindowDialog
            open={windowCompose.open}
            onOpenChange={(open) => { if (!open) closeWindowCompose(); }}
            onSubmit={handleSubmitWindow}
          />
        </div>
      </PageContainer>
    </PermissionGuard>
  );
}
