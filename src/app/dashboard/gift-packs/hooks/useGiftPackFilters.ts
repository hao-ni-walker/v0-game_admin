import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { GiftPackFilters } from '../types';
import { DEFAULT_FILTERS } from '../constants';

/**
 * 礼包筛选逻辑 Hook
 * 负责管理筛选条件和 URL 同步
 */
export function useGiftPackFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isUpdatingFromSearch = useRef(false);

  const [filters, setFilters] = useState<GiftPackFilters>(DEFAULT_FILTERS);

  // 从 URL 初始化筛选条件
  useEffect(() => {
    if (isUpdatingFromSearch.current) {
      isUpdatingFromSearch.current = false;
      return;
    }

    const categories = searchParams.get('categories');
    const rarities = searchParams.get('rarities');
    const statuses = searchParams.get('statuses');
    
    const urlFilters: GiftPackFilters = {
      keyword: searchParams.get('keyword') || '',
      locale: searchParams.get('locale') || 'default',
      categories: categories ? categories.split(',') : [],
      rarities: rarities ? rarities.split(',') : [],
      statuses: statuses ? statuses.split(',') : ['active'],
      is_consumable: searchParams.get('is_consumable') === 'true' ? true : searchParams.get('is_consumable') === 'false' ? false : undefined,
      bind_flag: searchParams.get('bind_flag') === 'true' ? true : searchParams.get('bind_flag') === 'false' ? false : undefined,
      vip_min: searchParams.get('vip_min') ? parseInt(searchParams.get('vip_min')!) : undefined,
      vip_max: searchParams.get('vip_max') ? parseInt(searchParams.get('vip_max')!) : undefined,
      level_min: searchParams.get('level_min') ? parseInt(searchParams.get('level_min')!) : undefined,
      level_max: searchParams.get('level_max') ? parseInt(searchParams.get('level_max')!) : undefined,
      expire_days_max: searchParams.get('expire_days_max') ? parseInt(searchParams.get('expire_days_max')!) : undefined,
      usage_limit_max: searchParams.get('usage_limit_max') ? parseInt(searchParams.get('usage_limit_max')!) : undefined,
      created_from: searchParams.get('created_from') || undefined,
      created_to: searchParams.get('created_to') || undefined,
      updated_from: searchParams.get('updated_from') || undefined,
      updated_to: searchParams.get('updated_to') || undefined,
      sort_by: searchParams.get('sort_by') || 'sort_weight',
      sort_dir: (searchParams.get('sort_dir') as 'asc' | 'desc') || 'desc',
      page: parseInt(searchParams.get('page') || '1'),
      page_size: parseInt(searchParams.get('page_size') || '20')
    };
    
    setFilters(urlFilters);
  }, [searchParams]);

  /**
   * 手动搜索（更新URL）
   */
  const searchFilters = useCallback(
    (newFilters: Partial<GiftPackFilters>) => {
      const updatedFilters = { ...filters, ...newFilters };

      // 如果是筛选条件变化（非分页），重置到第一页
      if (
        Object.keys(newFilters).some((key) => !['page', 'page_size'].includes(key))
      ) {
        updatedFilters.page = 1;
      }

      setFilters(updatedFilters);

      // 标记正在从搜索更新，避免URL同步时重复触发
      isUpdatingFromSearch.current = true;

      // 更新 URL
      const params = new URLSearchParams();
      Object.entries(updatedFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '' && value !== 'default') {
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
    (newFilters: Partial<GiftPackFilters>) => {
      const updatedFilters = { ...filters, ...newFilters };
      setFilters(updatedFilters);

      // 标记正在从搜索更新，避免URL同步时重复触发
      isUpdatingFromSearch.current = true;

      // 更新 URL
      const params = new URLSearchParams();
      Object.entries(updatedFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '' && value !== 'default') {
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
      locale: 'default',
      categories: [],
      rarities: [],
      statuses: ['active'],
      is_consumable: undefined,
      bind_flag: undefined,
      vip_min: undefined,
      vip_max: undefined,
      level_min: undefined,
      level_max: undefined,
      expire_days_max: undefined,
      usage_limit_max: undefined,
      created_from: undefined,
      created_to: undefined,
      updated_from: undefined,
      updated_to: undefined,
      page: 1
    });
  }, [searchFilters]);

  /**
   * 检查是否有激活的筛选条件
   */
  const hasActiveFilters = Boolean(
    filters.keyword ||
      (filters.locale && filters.locale !== 'default') ||
      (filters.categories && filters.categories.length > 0) ||
      (filters.rarities && filters.rarities.length > 0) ||
      (filters.statuses && filters.statuses.length > 0 && !(filters.statuses.length === 1 && filters.statuses[0] === 'active')) ||
      filters.is_consumable !== undefined ||
      filters.bind_flag !== undefined ||
      filters.vip_min !== undefined ||
      filters.vip_max !== undefined ||
      filters.level_min !== undefined ||
      filters.level_max !== undefined ||
      filters.expire_days_max !== undefined ||
      filters.usage_limit_max !== undefined ||
      filters.created_from ||
      filters.created_to ||
      filters.updated_from ||
      filters.updated_to
  );

  return {
    filters,
    searchFilters,
    updatePagination,
    clearFilters,
    hasActiveFilters
  };
}
