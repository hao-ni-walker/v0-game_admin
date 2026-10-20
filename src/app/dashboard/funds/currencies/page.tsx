'use client';
import { useEffect, useMemo, useCallback, useState } from 'react';
import { Coins } from 'lucide-react';
import PageContainer from '@/components/layout/page-container';
import { PermissionGuard } from '@/components/auth/permission-guard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { usePermissions } from '@/hooks/use-permissions';
import {
  CurrencyPageHeader,
  CurrencyFilters,
  CurrencyBatchBar,
  CurrencyTable,
  CurrencyComposeDialog,
} from './components';
import { useCurrencyFilters, useCurrencyManagement } from './hooks';
import { MESSAGES } from './constants';
import type { Currency, CurrencyFormData, CurrencyUpdateData } from './types';

export default function CurrenciesPage() {
  const { filters, setSearch, setTradeable, clearFilters, hasActiveFilters } = useCurrencyFilters();
  const {
    currencies,
    loading,
    fetchCurrencies,
    syncStatus,
    syncing,
    triggerSync,
    createCurrency,
    updateCurrency,
    deleteCurrency,
    toggleCurrency,
    batchToggle,
    batchDelete,
    compose,
    openCreate,
    openEdit,
    closeCompose,
  } = useCurrencyManagement();

  const { hasPermission } = usePermissions();
  const canWrite = hasPermission('currency:write');

  useEffect(() => {
    fetchCurrencies();
  }, [fetchCurrencies]);

  const visible = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return currencies.filter((c) => {
      if (filters.is_tradeable !== 'all') {
        const want = filters.is_tradeable === 'true';
        if (c.is_tradeable !== want) return false;
      }
      if (q && !`${c.code} ${c.name}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [currencies, filters]);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [batchBusy, setBatchBusy] = useState(false);
  const [batchDeleteOpen, setBatchDeleteOpen] = useState(false);

  const selectedItems = useMemo(
    () => currencies.filter((c) => selectedIds.includes(c.id)),
    [currencies, selectedIds]
  );

  // 列表中已消失的币种（被删除/同步移除）不留在选择集里
  useEffect(() => {
    setSelectedIds((prev) => {
      const next = prev.filter((id) => currencies.some((c) => c.id === id));
      return next.length === prev.length ? prev : next;
    });
  }, [currencies]);

  const handleRefresh = () => fetchCurrencies();

  const handleEdit = useCallback((c: Currency) => openEdit(c), [openEdit]);

  const handleSelect = useCallback((c: Currency, checked: boolean) => {
    setSelectedIds((prev) => {
      if (checked) return prev.includes(c.id) ? prev : [...prev, c.id];
      return prev.filter((id) => id !== c.id);
    });
  }, []);

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      const visibleIds = visible.map((c) => c.id);
      setSelectedIds((prev) =>
        checked
          ? Array.from(new Set([...prev, ...visibleIds]))
          : prev.filter((id) => !visibleIds.includes(id))
      );
    },
    [visible]
  );

  const handleBatchToggle = useCallback(
    async (isTradeable: boolean) => {
      if (selectedItems.length === 0 || batchBusy) return;
      setBatchBusy(true);
      try {
        await batchToggle(selectedItems, isTradeable);
        setSelectedIds([]);
        await fetchCurrencies();
      } finally {
        setBatchBusy(false);
      }
    },
    [selectedItems, batchBusy, batchToggle, fetchCurrencies]
  );

  const handleConfirmBatchDelete = useCallback(async () => {
    if (selectedItems.length === 0) return;
    setBatchBusy(true);
    try {
      await batchDelete(selectedItems);
      setSelectedIds([]);
      await fetchCurrencies();
    } finally {
      setBatchBusy(false);
      setBatchDeleteOpen(false);
    }
  }, [selectedItems, batchDelete, fetchCurrencies]);

  const handleToggle = useCallback(
    async (c: Currency) => {
      const ok = await toggleCurrency(c.id, !c.is_tradeable);
      if (ok) fetchCurrencies();
    },
    [toggleCurrency, fetchCurrencies]
  );

  const handleDelete = useCallback(
    async (c: Currency) => {
      const ok = await deleteCurrency(c.id);
      if (ok) {
        setSelectedIds((prev) => prev.filter((id) => id !== c.id));
        fetchCurrencies();
      }
    },
    [deleteCurrency, fetchCurrencies]
  );

  const handleSubmit = useCallback(
    async (data: CurrencyFormData | CurrencyUpdateData) => {
      if (compose.mode === 'edit' && compose.editing) {
        const ok = await updateCurrency(compose.editing.id, data as CurrencyUpdateData);
        if (ok) fetchCurrencies();
        return ok;
      }
      const ok = await createCurrency(data as CurrencyFormData);
      if (ok) fetchCurrencies();
      return ok;
    },
    [compose, createCurrency, updateCurrency, fetchCurrencies]
  );

  return (
    <PermissionGuard permissions='currency:read'>
      <PageContainer scrollable={false}>
        <div className='flex h-[calc(100vh-8rem)] w-full flex-col space-y-4'>
          <CurrencyPageHeader
            onRefresh={handleRefresh}
            onCreate={openCreate}
            onSync={() => { void triggerSync(); }}
            loading={loading}
            syncing={syncing}
            syncStatus={syncStatus}
            canWrite={canWrite}
          />
          <CurrencyFilters
            filters={filters}
            setSearch={setSearch}
            setTradeable={setTradeable}
            onReset={clearFilters}
            loading={loading}
          />
          {canWrite && selectedItems.length > 0 && (
            <CurrencyBatchBar
              count={selectedItems.length}
              busy={batchBusy}
              onActivate={() => { void handleBatchToggle(true); }}
              onDeactivate={() => { void handleBatchToggle(false); }}
              onDelete={() => setBatchDeleteOpen(true)}
              onClear={() => setSelectedIds([])}
            />
          )}
          <div className='flex min-h-0 flex-1 flex-col'>
            <div className='min-h-0 flex-1'>
              {visible.length === 0 && !loading ? (
                <div className='flex h-full flex-col items-center justify-center space-y-3 p-8'>
                  <Coins className='text-muted-foreground h-12 w-12' />
                  <p className='text-lg font-medium'>
                    {hasActiveFilters ? '未找到匹配的币种' : MESSAGES.EMPTY}
                  </p>
                </div>
              ) : (
                <CurrencyTable
                  data={visible}
                  loading={loading}
                  canWrite={canWrite}
                  selectedIds={selectedIds}
                  onSelect={handleSelect}
                  onSelectAll={handleSelectAll}
                  onEdit={handleEdit}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                />
              )}
            </div>
          </div>
          <CurrencyComposeDialog
            open={compose.open}
            mode={compose.mode}
            editing={compose.editing}
            onOpenChange={(open) => { if (!open) closeCompose(); }}
            onSubmit={handleSubmit}
          />
          <AlertDialog open={batchDeleteOpen} onOpenChange={setBatchDeleteOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确认批量删除</AlertDialogTitle>
                <AlertDialogDescription>
                  将删除选中的 {selectedItems.length} 个币种，删除后不可恢复；已有交易记录的币种会被后端拒绝并保留。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={batchBusy}>取消</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    void handleConfirmBatchDelete();
                  }}
                  disabled={batchBusy}
                >
                  {batchBusy ? '删除中…' : '确认删除'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </PageContainer>
    </PermissionGuard>
  );
}
