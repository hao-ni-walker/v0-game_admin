import { useState, useCallback, useMemo } from 'react';
import type { PaymentPlatformFilters } from '../types';
import { DEFAULT_PAGE_SIZE } from '../constants';

/**
 * 支付平台筛选hooks
 */
export function usePaymentChannelFilters() {
  const [filters, setFilters] = useState<PaymentPlatformFilters>({
    page: 1,
    page_size: DEFAULT_PAGE_SIZE,
    enabled: 'all'
  });

  /**
   * 更新筛选条件
   */
  const searchFilters = useCallback(
    (newFilters: Partial<PaymentPlatformFilters>) => {
      setFilters((prev) => ({
        ...prev,
        ...newFilters,
        page: 1 // 重置到第一页
      }));
    },
    []
  );

  /**
   * 更新分页
   */
  const updatePagination = useCallback(
    (pagination: { page?: number; page_size?: number }) => {
      setFilters((prev) => ({
        ...prev,
        ...pagination
      }));
    },
    []
  );

  /**
   * 清空筛选条件
   */
  const clearFilters = useCallback(() => {
    setFilters({
      page: 1,
      page_size: DEFAULT_PAGE_SIZE,
      enabled: 'all'
    });
  }, []);

  /**
   * 是否有激活的筛选条件
   */
  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.keyword ||
      (filters.enabled !== undefined && filters.enabled !== 'all')
    );
  }, [filters]);

  return {
    filters,
    searchFilters,
    updatePagination,
    clearFilters,
    hasActiveFilters
  };
}
