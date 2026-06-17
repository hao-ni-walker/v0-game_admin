'use client';
import { useCallback, useMemo, useState } from 'react';
import { DEFAULT_FILTERS } from '../constants';
import type { CurrencyFilters } from '../types';

export function useCurrencyFilters() {
  const [filters, setFilters] = useState<CurrencyFilters>(DEFAULT_FILTERS);

  const onSearch = useCallback((next: Partial<CurrencyFilters>) => {
    setFilters((prev) => ({ ...prev, ...next }));
  }, []);

  const setSearch = useCallback((search: string) => setFilters((p) => ({ ...p, search })), []);
  const setTradeable = useCallback(
    (is_tradeable: CurrencyFilters['is_tradeable']) => setFilters((p) => ({ ...p, is_tradeable })),
    []
  );
  const clearFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const hasActiveFilters = useMemo(
    () => filters.search.trim() !== '' || filters.is_tradeable !== 'all',
    [filters]
  );

  return { filters, onSearch, setSearch, setTradeable, clearFilters, hasActiveFilters };
}
