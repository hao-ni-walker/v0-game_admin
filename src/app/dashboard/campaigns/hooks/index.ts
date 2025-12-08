'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Activity } from '@/repository/models';
import { ActivityAPI, ActivityListParams } from '@/service/api/activities';
import type { ActivityFilters } from '../types';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/use-permissions';

// 将前端筛选条件转换为后端 API 参数
const convertFiltersToApiParams = (
  filters: ActivityFilters
): ActivityListParams => {
  const params: ActivityListParams = {
    page: filters.page || 1,
    page_size: filters.page_size || 20
  };

  if (filters.id) params.id = filters.id;
  if (filters.activity_code) params.activity_code = filters.activity_code;
  if (filters.name) params.name = filters.name;
  if (filters.activity_type) params.activity_type = filters.activity_type;
  if (filters.statuses && filters.statuses.length > 0) {
    params.status_in = filters.statuses.join(',');
  }
  if (filters.start_time_start)
    params.start_time_start = filters.start_time_start;
  if (filters.start_time_end) params.start_time_end = filters.start_time_end;
  if (filters.end_time_start) params.end_time_start = filters.end_time_start;
  if (filters.end_time_end) params.end_time_end = filters.end_time_end;
  if (filters.display_time_active !== undefined) {
    params.display_time_active = filters.display_time_active;
  }
  if (filters.has_active_trigger !== undefined) {
    params.has_active_trigger = filters.has_active_trigger;
  }
  if (filters.sort_by) params.sort_by = filters.sort_by;
  if (filters.sort_order) params.sort_order = filters.sort_order;

  return params;
};

// 从 URL 查询参数构建筛选条件
const buildFiltersFromSearchParams = (
  searchParams: URLSearchParams
): ActivityFilters => {
  const filters: ActivityFilters = {
    page: parseInt(searchParams.get('page') || '1', 10),
    page_size: parseInt(searchParams.get('page_size') || '20', 10)
  };

  const id = searchParams.get('id');
  if (id) filters.id = parseInt(id, 10);

  const activity_code = searchParams.get('activity_code');
  if (activity_code) filters.activity_code = activity_code;

  const name = searchParams.get('name');
  if (name) filters.name = name;

  const activity_type = searchParams.get('activity_type');
  if (activity_type) filters.activity_type = activity_type;

  const statuses = searchParams.get('statuses');
  if (statuses) filters.statuses = statuses.split(',');

  const start_time_start = searchParams.get('start_time_start');
  if (start_time_start) filters.start_time_start = start_time_start;

  const start_time_end = searchParams.get('start_time_end');
  if (start_time_end) filters.start_time_end = start_time_end;

  const end_time_start = searchParams.get('end_time_start');
  if (end_time_start) filters.end_time_start = end_time_start;

  const end_time_end = searchParams.get('end_time_end');
  if (end_time_end) filters.end_time_end = end_time_end;

  const display_time_active = searchParams.get('display_time_active');
  if (display_time_active) {
    filters.display_time_active = display_time_active === 'true';
  }

  const has_active_trigger = searchParams.get('has_active_trigger');
  if (has_active_trigger) {
    filters.has_active_trigger = has_active_trigger === 'true';
  }

  const sort_by = searchParams.get('sort_by');
  if (sort_by) filters.sort_by = sort_by;

  const sort_order = searchParams.get('sort_order') as 'asc' | 'desc' | null;
  if (sort_order) filters.sort_order = sort_order;

  return filters;
};

// 将筛选条件同步到 URL
const syncFiltersToUrl = (
  filters: ActivityFilters,
  router: ReturnType<typeof useRouter>,
  pathname: string
) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          params.set(key, value.join(','));
        }
      } else {
        params.set(key, String(value));
      }
    }
  });

  router.push(`${pathname}?${params.toString()}`);
};

export const useActivityFilters = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [filters, setFilters] = useState<ActivityFilters>(() =>
    buildFiltersFromSearchParams(searchParams)
  );

  // 当 URL 变化时更新筛选条件
  useEffect(() => {
    const newFilters = buildFiltersFromSearchParams(searchParams);
    setFilters(newFilters);
  }, [searchParams]);

  const updateFilters = useCallback(
    (newFilters: Partial<ActivityFilters>) => {
      const updatedFilters = { ...filters, ...newFilters };
      setFilters(updatedFilters);
      syncFiltersToUrl(updatedFilters, router, pathname);
    },
    [filters, router, pathname]
  );

  const updatePagination = useCallback(
    (pagination: { page?: number; pageSize?: number }) => {
      const updatedFilters = {
        ...filters,
        page: pagination.page || filters.page || 1,
        page_size: pagination.pageSize || filters.page_size || 20
      };
      setFilters(updatedFilters);
      syncFiltersToUrl(updatedFilters, router, pathname);
    },
    [filters, router, pathname]
  );

  const clearFilters = useCallback(() => {
    const defaultFilters: ActivityFilters = {
      page: 1,
      page_size: 20,
      sort_by: 'created_at',
      sort_order: 'desc'
    };
    setFilters(defaultFilters);
    syncFiltersToUrl(defaultFilters, router, pathname);
  }, [router, pathname]);

  const hasActiveFilters = useCallback(() => {
    return Object.keys(filters).some(
      (key) =>
        key !== 'page' &&
        key !== 'page_size' &&
        key !== 'sort_by' &&
        key !== 'sort_order' &&
        filters[key as keyof ActivityFilters] !== undefined &&
        filters[key as keyof ActivityFilters] !== '' &&
        (!Array.isArray(filters[key as keyof ActivityFilters]) ||
          (filters[key as keyof ActivityFilters] as any[]).length > 0)
    );
  }, [filters]);

  return {
    filters,
    updateFilters,
    updatePagination,
    clearFilters,
    hasActiveFilters: hasActiveFilters()
  };
};

export const useActivityManagement = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 20,
    total: 0
  });
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const { hasPermission } = usePermissions();

  const fetchActivities = useCallback(
    async (filters: ActivityFilters) => {
      setLoading(true);
      try {
        const apiParams = convertFiltersToApiParams(filters);
        // 合并排序参数
        if (filters.sort_by) {
          apiParams.sort_by = filters.sort_by;
          apiParams.sort_order = filters.sort_order || 'desc';
        } else {
          apiParams.sort_by = sortBy;
          apiParams.sort_order = sortOrder;
        }

        const response = await ActivityAPI.getActivities(apiParams);
        if (response.code === 0 && response.data) {
          setActivities(response.data.items || []);
          setPagination({
            page: response.data.page || 1,
            page_size: response.data.page_size || 20,
            total: response.data.total || 0
          });
        } else {
          toast.error(response.message || '获取活动列表失败');
          setActivities([]);
        }
      } catch (error) {
        console.error('获取活动列表失败:', error);
        toast.error('获取活动列表失败');
        setActivities([]);
      } finally {
        setLoading(false);
      }
    },
    [sortBy, sortOrder]
  );

  const refreshActivities = useCallback(
    async (filters: ActivityFilters) => {
      await fetchActivities({ ...filters, page: 1 });
    },
    [fetchActivities]
  );

  const changeActivityStatus = useCallback(
    async (id: number, status: string): Promise<boolean> => {
      try {
        const response = await ActivityAPI.updateActivityStatus(id, status);
        if (response.code === 0) {
          toast.success('状态更新成功');
          return true;
        } else {
          toast.error(response.message || '状态更新失败');
          return false;
        }
      } catch (error) {
        console.error('状态更新失败:', error);
        toast.error('状态更新失败');
        return false;
      }
    },
    []
  );

  const handleSort = useCallback(
    (newSortBy: string, newSortOrder: 'asc' | 'desc') => {
      setSortBy(newSortBy);
      setSortOrder(newSortOrder);
    },
    []
  );

  // 权限检查
  const canWrite = hasPermission('activities:write');
  const canChangeStatus = hasPermission('activities:status');
  const canManageTriggers = hasPermission('activities:trigger');

  return {
    activities,
    loading,
    pagination,
    sortBy,
    sortOrder,
    fetchActivities,
    refreshActivities,
    changeActivityStatus,
    handleSort,
    // 权限
    canWrite,
    canChangeStatus,
    canManageTriggers
  };
};
