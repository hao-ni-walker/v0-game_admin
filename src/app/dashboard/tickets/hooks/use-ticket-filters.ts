import { useState, useCallback } from 'react';
import type { TicketListParams } from '@/service/api/ticket';

export function useTicketFilters() {
  const [filters, setFilters] = useState<TicketListParams>({
    page: 1,
    pageSize: 20
  });

  const searchFilters = useCallback((newFilters: Partial<TicketListParams>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1 // 重置到第一页
    }));
  }, []);

  const updatePagination = useCallback(
    (pagination: { page?: number; page_size?: number }) => {
      setFilters((prev) => ({
        ...prev,
        page: pagination.page ?? prev.page,
        pageSize: pagination.page_size ?? prev.pageSize
      }));
    },
    []
  );

  const clearFilters = useCallback(() => {
    setFilters({
      page: 1,
      pageSize: 20
    });
  }, []);

  const hasActiveFilters = Object.keys(filters).some(
    (key) =>
      !['page', 'pageSize'].includes(key) && (filters as any)[key] !== undefined
  );

  return {
    filters,
    searchFilters,
    updatePagination,
    clearFilters,
    hasActiveFilters
  };
}
