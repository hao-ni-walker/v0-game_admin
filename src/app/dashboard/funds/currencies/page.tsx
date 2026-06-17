'use client';
import { useEffect, useMemo, useCallback } from 'react';
import { Coins } from 'lucide-react';
import PageContainer from '@/components/layout/page-container';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { usePermissions } from '@/hooks/use-permissions';
import {
  CurrencyPageHeader,
  CurrencyFilters,
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
    createCurrency,
    updateCurrency,
    deleteCurrency,
    toggleCurrency,
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

  const handleRefresh = () => fetchCurrencies();

  const handleEdit = useCallback((c: Currency) => openEdit(c), [openEdit]);

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
      if (ok) fetchCurrencies();
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
          <CurrencyPageHeader onRefresh={handleRefresh} onCreate={openCreate} loading={loading} canWrite={canWrite} />
          <CurrencyFilters
            filters={filters}
            setSearch={setSearch}
            setTradeable={setTradeable}
            onReset={clearFilters}
            loading={loading}
          />
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
        </div>
      </PageContainer>
    </PermissionGuard>
  );
}
