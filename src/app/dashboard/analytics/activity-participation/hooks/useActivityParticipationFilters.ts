'use client';

import { useState, useCallback } from 'react';
import { ActivityParticipationFilters } from '../types';
import { DEFAULT_PAGE_SIZE } from '../constants';

export function useActivityParticipationFilters() {
  const [filters, setFilters] = useState<ActivityParticipationFilters>({
    page: 1,
    page_size: DEFAULT_PAGE_SIZE
  });

  const updateFilters = useCallback(
    (newFilters: Partial<ActivityParticipationFilters>) => {
      setFilters((prev) => ({ ...prev, ...newFilters }));
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters({
      page: 1,
      page_size: DEFAULT_PAGE_SIZE
    });
  }, []);

  return {
    filters,
    updateFilters,
    resetFilters
  };
}
