import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { GameFilters } from '../types';
import { DEFAULT_FILTERS } from '../constants';

/**
 * 游戏筛选逻辑 Hook
 * 负责管理筛选条件和 URL 同步
 */
export function useGameFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isUpdatingFromSearch = useRef(false);

  const [filters, setFilters] = useState<GameFilters>(DEFAULT_FILTERS);

  // 从 URL 初始化筛选条件
  useEffect(() => {
    if (isUpdatingFromSearch.current) {
      isUpdatingFromSearch.current = false;
      return;
    }

    const provider_codes = searchParams.get('provider_codes');
    const categories = searchParams.get('categories');
    const provider_code = searchParams.get('provider_code');
    const category = searchParams.get('category');

    const urlFilters: GameFilters = {
      keyword: searchParams.get('keyword') || '',
      game_id: searchParams.get('game_id') || undefined,
      name: searchParams.get('name') || undefined,
      provider_codes: provider_codes
        ? provider_codes.split(',')
        : provider_code
          ? [provider_code]
          : [],
      provider_code: provider_code || undefined,
      categories: categories
        ? categories.split(',')
        : category
          ? [category]
          : [],
      category: category || undefined,
      lang: searchParams.get('lang') || '',
      status:
        searchParams.get('status') === 'all'
          ? 'all'
          : searchParams.get('status') === 'true'
            ? true
            : searchParams.get('status') === 'false'
              ? false
              : 'all',
      disabled:
        searchParams.get('disabled') === 'all'
          ? 'all'
          : searchParams.get('disabled') === 'true'
            ? true
            : searchParams.get('disabled') === 'false'
              ? false
              : undefined,
      is_new: searchParams.get('is_new') === 'true' ? true : undefined,
      is_featured:
        searchParams.get('is_featured') === 'true' ? true : undefined,
      is_mobile_supported:
        searchParams.get('is_mobile_supported') === 'true' ? true : undefined,
      is_demo_available:
        searchParams.get('is_demo_available') === 'true' ? true : undefined,
      has_jackpot:
        searchParams.get('has_jackpot') === 'true' ? true : undefined,
      platform_id: searchParams.get('platform_id') || undefined,
      created_from:
        searchParams.get('created_from') ||
        searchParams.get('created_at_start') ||
        undefined,
      created_to:
        searchParams.get('created_to') ||
        searchParams.get('created_at_end') ||
        undefined,
      created_at_start:
        searchParams.get('created_at_start') ||
        searchParams.get('created_from') ||
        undefined,
      created_at_end:
        searchParams.get('created_at_end') ||
        searchParams.get('created_to') ||
        undefined,
      updated_from:
        searchParams.get('updated_from') ||
        searchParams.get('updated_at_start') ||
        undefined,
      updated_to:
        searchParams.get('updated_to') ||
        searchParams.get('updated_at_end') ||
        undefined,
      updated_at_start:
        searchParams.get('updated_at_start') ||
        searchParams.get('updated_from') ||
        undefined,
      updated_at_end:
        searchParams.get('updated_at_end') ||
        searchParams.get('updated_to') ||
        undefined,
      sort_by: searchParams.get('sort_by') || 'sort_order',
      sort_dir:
        (searchParams.get('sort_dir') as 'asc' | 'desc') ||
        (searchParams.get('sort_order') as 'asc' | 'desc') ||
        'desc',
      sort_order:
        (searchParams.get('sort_order') as 'asc' | 'desc') ||
        (searchParams.get('sort_dir') as 'asc' | 'desc') ||
        undefined,
      page: parseInt(searchParams.get('page') || '1'),
      page_size: parseInt(searchParams.get('page_size') || '20')
    };

    setFilters(urlFilters);
  }, [searchParams]);

  /**
   * 手动搜索（更新URL）
   */
  const searchFilters = useCallback(
    (newFilters: Partial<GameFilters>) => {
      const updatedFilters = { ...filters, ...newFilters };

      // 如果是筛选条件变化（非分页），重置到第一页
      if (
        Object.keys(newFilters).some(
          (key) => !['page', 'page_size'].includes(key)
        )
      ) {
        updatedFilters.page = 1;
      }

      setFilters(updatedFilters);

      // 标记正在从搜索更新，避免URL同步时重复触发
      isUpdatingFromSearch.current = true;

      // 更新 URL
      const params = new URLSearchParams();
      Object.entries(updatedFilters).forEach(([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          value !== '' &&
          value !== 'all'
        ) {
          if (Array.isArray(value)) {
            if (value.length > 0) {
              params.set(key, value.join(','));
            }
          } else {
            params.set(key, String(value));
          }
        }
      });

      router.push(`?${params.toString()}`);
    },
    [filters, router]
  );

  /**
   * 更新分页（仅用于分页变化）
   */
  const updatePagination = useCallback(
    (newFilters: Partial<GameFilters>) => {
      const updatedFilters = { ...filters, ...newFilters };
      setFilters(updatedFilters);

      // 标记正在从搜索更新，避免URL同步时重复触发
      isUpdatingFromSearch.current = true;

      // 更新 URL
      const params = new URLSearchParams();
      Object.entries(updatedFilters).forEach(([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          value !== '' &&
          value !== 'all'
        ) {
          if (Array.isArray(value)) {
            if (value.length > 0) {
              params.set(key, value.join(','));
            }
          } else {
            params.set(key, String(value));
          }
        }
      });

      router.push(`?${params.toString()}`);
    },
    [filters, router]
  );

  /**
   * 清空筛选条件
   */
  const clearFilters = useCallback(() => {
    searchFilters({
      keyword: '',
      game_id: undefined,
      name: undefined,
      provider_codes: [],
      provider_code: undefined,
      categories: [],
      category: undefined,
      lang: '',
      status: 'all',
      disabled: undefined,
      is_new: undefined,
      is_featured: undefined,
      is_mobile_supported: undefined,
      is_demo_available: undefined,
      has_jackpot: undefined,
      platform_id: undefined,
      created_from: undefined,
      created_to: undefined,
      created_at_start: undefined,
      created_at_end: undefined,
      updated_from: undefined,
      updated_to: undefined,
      updated_at_start: undefined,
      updated_at_end: undefined,
      page: 1
    });
  }, [searchFilters]);

  /**
   * 检查是否有激活的筛选条件
   */
  const hasActiveFilters = Boolean(
    filters.keyword ||
      filters.game_id ||
      filters.name ||
      (filters.provider_codes && filters.provider_codes.length > 0) ||
      filters.provider_code ||
      (filters.categories && filters.categories.length > 0) ||
      filters.category ||
      filters.lang ||
      (filters.status && filters.status !== 'all') ||
      (filters.disabled !== undefined && filters.disabled !== 'all') ||
      filters.is_new ||
      filters.is_featured ||
      filters.is_mobile_supported ||
      filters.is_demo_available ||
      filters.has_jackpot ||
      filters.platform_id ||
      filters.created_from ||
      filters.created_to ||
      filters.created_at_start ||
      filters.created_at_end ||
      filters.updated_from ||
      filters.updated_to ||
      filters.updated_at_start ||
      filters.updated_at_end
  );

  return {
    filters,
    searchFilters,
    updatePagination,
    clearFilters,
    hasActiveFilters
  };
}
