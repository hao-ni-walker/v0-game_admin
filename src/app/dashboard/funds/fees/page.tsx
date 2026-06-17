'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Receipt } from 'lucide-react';
import PageContainer from '@/components/layout/page-container';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { usePermissions } from '@/hooks/use-permissions';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CurrencyAPI } from '@/service/request';
import {
  FeePageHeader,
  FeeTable,
  FeeComposeDialog,
  FeePreviewDialog,
} from './components';
import { useFeeManagement } from './hooks';
import { SCOPE_OPTIONS, MESSAGES } from './constants';
import type { Currency, FeeConfig, FeeCreateData, FeeUpdateData, FeeScope } from './types';

export default function FeesPage() {
  const [scope, setScope] = useState<FeeScope | 'all'>('all');
  const [currencies, setCurrencies] = useState<Currency[]>([]);

  const {
    fees, loading, fetchFees,
    createFee, updateFee, deleteFee, preview,
    compose, openCreate, openEdit, closeCompose,
    previewOpen, openPreview, closePreview,
  } = useFeeManagement();

  const { hasPermission } = usePermissions();
  const canWrite = hasPermission('fee:write');

  useEffect(() => {
    (async () => {
      const res = await CurrencyAPI.getList();
      if (res.success && res.data) setCurrencies(res.data.items);
    })();
  }, []);

  useEffect(() => {
    fetchFees(scope === 'all' ? undefined : scope);
  }, [scope, fetchFees]);

  const handleRefresh = () => fetchFees(scope === 'all' ? undefined : scope);

  const handleDelete = useCallback(
    async (f: FeeConfig) => {
      const ok = await deleteFee(f.id);
      if (ok) fetchFees(scope === 'all' ? undefined : scope);
    },
    [deleteFee, fetchFees, scope]
  );

  const handleSubmit = useCallback(
    async (data: FeeCreateData | FeeUpdateData) => {
      if (compose.mode === 'edit' && compose.editing) {
        const ok = await updateFee(compose.editing.id, data as FeeUpdateData);
        if (ok) fetchFees(scope === 'all' ? undefined : scope);
        return ok;
      }
      const ok = await createFee(data as FeeCreateData);
      if (ok) fetchFees(scope === 'all' ? undefined : scope);
      return ok;
    },
    [compose, createFee, updateFee, fetchFees, scope]
  );

  const visible = useMemo(() => fees, [fees]);

  return (
    <PermissionGuard permissions='fee:read'>
      <PageContainer scrollable={false}>
        <div className='flex h-[calc(100vh-8rem)] w-full flex-col space-y-4'>
          <FeePageHeader onRefresh={handleRefresh} onCreate={openCreate} onPreview={openPreview} loading={loading} canWrite={canWrite} />

          <Tabs value={scope} onValueChange={(v) => setScope(v as FeeScope | 'all')}>
            <TabsList>
              <TabsTrigger value='all' className='cursor-pointer'>全部</TabsTrigger>
              {SCOPE_OPTIONS.map((o) => (
                <TabsTrigger key={o.value} value={o.value} className='cursor-pointer'>{o.label}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className='flex min-h-0 flex-1 flex-col'>
            <div className='min-h-0 flex-1'>
              {visible.length === 0 && !loading ? (
                <div className='flex h-full flex-col items-center justify-center space-y-3 p-8'>
                  <Receipt className='text-muted-foreground h-12 w-12' />
                  <p className='text-lg font-medium'>{MESSAGES.EMPTY}</p>
                </div>
              ) : (
                <FeeTable data={visible} loading={loading} canWrite={canWrite} currencies={currencies} onEdit={openEdit} onDelete={handleDelete} />
              )}
            </div>
          </div>

          <FeeComposeDialog
            open={compose.open}
            mode={compose.mode}
            editing={compose.editing}
            currencies={currencies}
            onOpenChange={(open) => { if (!open) closeCompose(); }}
            onSubmit={handleSubmit}
          />

          <FeePreviewDialog
            open={previewOpen}
            currencies={currencies}
            onOpenChange={(open) => { if (!open) closePreview(); }}
            onPreview={preview}
          />
        </div>
      </PageContainer>
    </PermissionGuard>
  );
}
