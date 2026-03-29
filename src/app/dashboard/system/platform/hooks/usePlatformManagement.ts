import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Platform, PlatformFilters, PaginationInfo } from '../types';
import { DEFAULT_PAGINATION, MESSAGES } from '../constants';
import { PlatformAPI } from '@/service/request';

/**
 * 平台管理逻辑 Hook
 * 负责平台数据的获取操作
 */
export function usePlatformManagement() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] =
    useState<PaginationInfo>(DEFAULT_PAGINATION);

  /**
   * 获取平台列表
   */
  const fetchPlatforms = useCallback(async (filters: PlatformFilters) => {
    setLoading(true);
    try {
      const res = await PlatformAPI.getList({
        page: filters.page || 1,
        page_size: filters.page_size || 20,
        keyword: filters.keyword,
        sort_by: filters.sort_by,
        sort_dir: filters.sort_dir
      });

      if (res.code === 0 && res.data) {
        // 远程API返回的数据结构: { items: [], total, page, page_size, total_pages }
        const data = res.data;
        setPlatforms(data.items || []);
        setPagination({
          page: data.page || 1,
          page_size: data.page_size || 20,
          total: data.total || 0,
          totalPages: data.total_pages || 1
        });
      } else {
        toast.error(res.message || MESSAGES.ERROR.FETCH_PLATFORMS);
        setPlatforms([]);
        setPagination(DEFAULT_PAGINATION);
      }
    } catch (error) {
      console.error('获取平台列表失败:', error);
      toast.error(MESSAGES.ERROR.FETCH_PLATFORMS);
      setPlatforms([]);
      setPagination(DEFAULT_PAGINATION);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 刷新平台列表
   */
  const refreshPlatforms = useCallback(
    async (filters: PlatformFilters) => {
      await fetchPlatforms(filters);
      toast.success(MESSAGES.SUCCESS.REFRESH);
    },
    [fetchPlatforms]
  );

  return {
    platforms,
    loading,
    pagination,
    fetchPlatforms,
    refreshPlatforms
  };
}
