'use client';

import { useState, useCallback } from 'react';

interface PlayerFiltersType {
  keyword?: string;
  status?: boolean;
  vipMin?: number;
  vipMax?: number;
  balanceMin?: number;
  balanceMax?: number;
  identityCategory?: string;
  registrationMethod?: string;
}

export function usePlayerFilters() {
  const [filters, setFilters] = useState<PlayerFiltersType>({});
  const [appliedFilters, setAppliedFilters] = useState<PlayerFiltersType>({});

  const updateFilter = useCallback((key: keyof PlayerFiltersType, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({});
    setAppliedFilters({});
  }, []);

  const applyFilters = useCallback(() => {
    setAppliedFilters(filters);
  }, [filters]);

  return {
    filters,
    appliedFilters,
    updateFilter,
    resetFilters,
    applyFilters
  };
}
