'use client';

import { useCallback, useMemo, useState } from 'react';
import { DEFAULT_FILTERS } from '../constants';
import type { BroadcastFilters } from '../types';

export function useBroadcastFilters() {
  const [filters, setFilters] = useState<BroadcastFilters>(DEFAULT_FILTERS);
  const [searchFilters, setSearchFilters] =
    useState<BroadcastFilters>(DEFAULT_FILTERS);

  const updatePagination = useCallback(
    (page: number, page_size: number) => {
      setFilters((f) => ({ ...f, page, page_size }));
    },
    []
  );

  const onSearch = useCallback((next: Partial<BroadcastFilters>) => {
    setFilters((f) => ({ ...f, ...next, page: 1 }));
    setSearchFilters((f) => ({ ...f, ...next, page: 1 }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSearchFilters(DEFAULT_FILTERS);
  }, []);

  const hasActiveFilters = useMemo(
    () => Boolean(searchFilters.status),
    [searchFilters]
  );

  return {
    filters,
    searchFilters,
    updatePagination,
    onSearch,
    clearFilters,
    hasActiveFilters,
  };
}
