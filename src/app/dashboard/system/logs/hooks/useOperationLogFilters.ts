'use client';

import { useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { UserOperationLogFilters } from '../types';
import { DEFAULT_OPERATION_LOG_FILTERS } from '../constants';

/**
 * 操作日志筛选条件管理 Hook
 */
export function useOperationLogFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 初始化筛选条件（从URL参数读取）
  const [filters, setFilters] = useState<UserOperationLogFilters>(() => {
    const keyword =
      searchParams.get('keyword') || DEFAULT_OPERATION_LOG_FILTERS.keyword;
    const operations = searchParams.get('operations')?.split(',') as any;
    const tables = searchParams.get('tables')?.split(',');
    const objectId =
      searchParams.get('objectId') || DEFAULT_OPERATION_LOG_FILTERS.objectId;
    const ipAddress =
      searchParams.get('ipAddress') || DEFAULT_OPERATION_LOG_FILTERS.ipAddress;
    const from = searchParams.get('from') || DEFAULT_OPERATION_LOG_FILTERS.from;
    const to = searchParams.get('to') || DEFAULT_OPERATION_LOG_FILTERS.to;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const sortBy =
      searchParams.get('sortBy') || DEFAULT_OPERATION_LOG_FILTERS.sortBy;
    const sortDir = (searchParams.get('sortDir') ||
      DEFAULT_OPERATION_LOG_FILTERS.sortDir) as 'asc' | 'desc';

    return {
      keyword,
      operations: operations || DEFAULT_OPERATION_LOG_FILTERS.operations,
      tables: tables || DEFAULT_OPERATION_LOG_FILTERS.tables,
      objectId,
      ipAddress,
      from,
      to,
      sortBy,
      sortDir,
      page,
      pageSize
    };
  });

  /**
   * 更新URL参数
   */
  const updateURLParams = useCallback(
    (newFilters: UserOperationLogFilters) => {
      const params = new URLSearchParams();

      // 添加非空参数
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value) && value.length > 0) {
            params.set(key, value.join(','));
          } else if (!Array.isArray(value)) {
            params.set(key, String(value));
          }
        }
      });

      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router]
  );

  /**
   * 搜索筛选
   */
  const searchFilters = useCallback(
    (newFilters: Partial<UserOperationLogFilters>) => {
      const updatedFilters = {
        ...filters,
        ...newFilters,
        page: 1 // 重置到第一页
      };
      setFilters(updatedFilters);
      updateURLParams(updatedFilters);
    },
    [filters, updateURLParams]
  );

  /**
   * 更新分页
   */
  const updatePagination = useCallback(
    (pagination: { page?: number; pageSize?: number }) => {
      const updatedFilters = {
        ...filters,
        ...pagination
      };
      setFilters(updatedFilters);
      updateURLParams(updatedFilters);
    },
    [filters, updateURLParams]
  );

  /**
   * 更新排序
   */
  const updateSort = useCallback(
    (sortBy: string, sortDir: 'asc' | 'desc') => {
      const updatedFilters = {
        ...filters,
        sortBy,
        sortDir
      };
      setFilters(updatedFilters);
      updateURLParams(updatedFilters);
    },
    [filters, updateURLParams]
  );

  /**
   * 清空筛选条件
   */
  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_OPERATION_LOG_FILTERS);
    updateURLParams(DEFAULT_OPERATION_LOG_FILTERS);
  }, [updateURLParams]);

  /**
   * 检查是否有激活的筛选条件
   */
  const hasActiveFilters = Boolean(
    filters.keyword ||
      filters.objectId ||
      filters.ipAddress ||
      (filters.operations && filters.operations.length > 0) ||
      (filters.tables && filters.tables.length > 0) ||
      filters.from ||
      filters.to ||
      filters.hasDiff
  );

  return {
    filters,
    searchFilters,
    updatePagination,
    updateSort,
    clearFilters,
    hasActiveFilters
  };
}
