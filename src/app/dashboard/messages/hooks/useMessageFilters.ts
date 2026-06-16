'use client';

import { useCallback, useMemo, useState } from 'react';
import { DEFAULT_FILTERS } from '../constants';
import type { MessageFilters } from '../types';

export function useMessageFilters() {
  const [filters, setFilters] = useState<MessageFilters>(DEFAULT_FILTERS);
  const [searchFilters, setSearchFilters] = useState<MessageFilters>(DEFAULT_FILTERS);

  const updatePagination = useCallback(
    (page: number, page_size: number) => {
      setFilters((f) => ({ ...f, page, page_size }));
    },
    []
  );

  const onSearch = useCallback((next: Partial<MessageFilters>) => {
    setFilters((f) => ({ ...f, ...next, page: 1 }));
    setSearchFilters((f) => ({ ...f, ...next, page: 1 }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSearchFilters(DEFAULT_FILTERS);
  }, []);

  const hasActiveFilters = useMemo(
    () => Boolean(searchFilters.user_id || searchFilters.category),
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
