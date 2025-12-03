import { useState, useCallback, useMemo } from 'react';
import type { PaymentChannelFilters } from '../types';
import { DEFAULT_PAGE_SIZE } from '../constants';

/**
 * 支付渠道筛选hooks
 */
export function usePaymentChannelFilters() {
  const [filters, setFilters] = useState<PaymentChannelFilters>({
    page: 1,
    page_size: DEFAULT_PAGE_SIZE,
    status: 'all'
  });

  /**
   * 更新筛选条件
   */
  const searchFilters = useCallback(
    (newFilters: Partial<PaymentChannelFilters>) => {
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
      status: 'all'
    });
  }, []);

  /**
   * 是否有激活的筛选条件
   */
  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.keyword ||
      (filters.types && filters.types.length > 0) ||
      (filters.channel_types && filters.channel_types.length > 0) ||
      (filters.status !== undefined && filters.status !== 'all') ||
      filters.disabled !== undefined ||
      filters.show_removed ||
      filters.min_amount_maxlte !== undefined ||
      filters.max_amount_mingte !== undefined ||
      filters.fee_rate_min !== undefined ||
      filters.fee_rate_max !== undefined ||
      filters.fixed_fee_min !== undefined ||
      filters.fixed_fee_max !== undefined ||
      filters.daily_limit_min !== undefined ||
      filters.daily_limit_max !== undefined ||
      filters.created_from ||
      filters.created_to ||
      filters.updated_from ||
      filters.updated_to
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
