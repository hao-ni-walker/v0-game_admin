import { useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { VipLevelFilters } from '../types';
import { DEFAULT_FILTERS } from '../constants';

/**
 * VIP等级筛选器 Hook
 * 负责管理筛选条件与URL参数的同步
 */
export function useVipLevelFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 从URL参数初始化筛选条件
  const getFiltersFromURL = useCallback((): VipLevelFilters => {
    const keyword = searchParams.get('keyword') || '';
    const level_min = searchParams.get('level_min');
    const level_max = searchParams.get('level_max');
    const required_exp_min = searchParams.get('required_exp_min');
    const required_exp_max = searchParams.get('required_exp_max');
    const disabled = searchParams.get('disabled');
    const show_removed = searchParams.get('show_removed');
    const created_from = searchParams.get('created_from') || undefined;
    const created_to = searchParams.get('created_to') || undefined;
    const updated_from = searchParams.get('updated_from') || undefined;
    const updated_to = searchParams.get('updated_to') || undefined;
    const sort_by = searchParams.get('sort_by') || 'default';
    const sort_dir = (searchParams.get('sort_dir') as 'asc' | 'desc') || 'asc';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const page_size = parseInt(searchParams.get('page_size') || '20', 10);

    return {
      keyword,
      level_min: level_min ? parseInt(level_min, 10) : undefined,
      level_max: level_max ? parseInt(level_max, 10) : undefined,
      required_exp_min: required_exp_min ? parseInt(required_exp_min, 10) : undefined,
      required_exp_max: required_exp_max ? parseInt(required_exp_max, 10) : undefined,
      disabled: disabled === 'true',
      show_removed: show_removed === 'true',
      created_from,
      created_to,
      updated_from,
      updated_to,
      sort_by,
      sort_dir,
      page,
      page_size
    };
  }, [searchParams]);

  const [filters, setFilters] = useState<VipLevelFilters>(getFiltersFromURL);

  // 更新URL参数
  const updateURLParams = useCallback(
    (newFilters: VipLevelFilters) => {
      const params = new URLSearchParams();

      if (newFilters.keyword) params.set('keyword', newFilters.keyword);
      if (newFilters.level_min !== undefined) params.set('level_min', String(newFilters.level_min));
      if (newFilters.level_max !== undefined) params.set('level_max', String(newFilters.level_max));
      if (newFilters.required_exp_min !== undefined)
        params.set('required_exp_min', String(newFilters.required_exp_min));
      if (newFilters.required_exp_max !== undefined)
        params.set('required_exp_max', String(newFilters.required_exp_max));
      if (newFilters.disabled) params.set('disabled', 'true');
      if (newFilters.show_removed) params.set('show_removed', 'true');
      if (newFilters.created_from) params.set('created_from', newFilters.created_from);
      if (newFilters.created_to) params.set('created_to', newFilters.created_to);
      if (newFilters.updated_from) params.set('updated_from', newFilters.updated_from);
      if (newFilters.updated_to) params.set('updated_to', newFilters.updated_to);
      if (newFilters.sort_by && newFilters.sort_by !== 'default')
        params.set('sort_by', newFilters.sort_by);
      if (newFilters.sort_dir) params.set('sort_dir', newFilters.sort_dir);
      if (newFilters.page && newFilters.page > 1) params.set('page', String(newFilters.page));
      if (newFilters.page_size && newFilters.page_size !== 20)
        params.set('page_size', String(newFilters.page_size));

      router.push(`?${params.toString()}`);
    },
    [router]
  );

  // 搜索筛选
  const searchFilters = useCallback(
    (newFilters: Partial<VipLevelFilters>) => {
      const updatedFilters = { ...filters, ...newFilters, page: 1 };
      setFilters(updatedFilters);
      updateURLParams(updatedFilters);
    },
    [filters, updateURLParams]
  );

  // 更新分页
  const updatePagination = useCallback(
    (pagination: { page?: number; page_size?: number }) => {
      const updatedFilters = { ...filters, ...pagination };
      setFilters(updatedFilters);
      updateURLParams(updatedFilters);
    },
    [filters, updateURLParams]
  );

  // 清空筛选
  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    updateURLParams(DEFAULT_FILTERS);
  }, [updateURLParams]);

  // 判断是否有激活的筛选条件
  const hasActiveFilters =
    filters.keyword ||
    filters.level_min !== undefined ||
    filters.level_max !== undefined ||
    filters.required_exp_min !== undefined ||
    filters.required_exp_max !== undefined ||
    filters.disabled ||
    filters.show_removed ||
    filters.created_from ||
    filters.created_to ||
    filters.updated_from ||
    filters.updated_to;

  return {
    filters,
    searchFilters,
    updatePagination,
    clearFilters,
    hasActiveFilters
  };
}
