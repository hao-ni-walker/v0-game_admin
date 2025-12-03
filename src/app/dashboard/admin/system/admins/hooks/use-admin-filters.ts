'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { AdminFilters } from '../types';

/**
 * 管理管理员筛选条件的 Hook
 * 将筛选条件同步到 URL query 参数
 */
export function useAdminFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 从 URL 读取初始筛选条件
  const getInitialFilters = useCallback((): AdminFilters => {
    const filters: AdminFilters = {};

    // 管理员基本信息
    if (searchParams.get('id')) {
      filters.id = Number(searchParams.get('id'));
    }
    if (searchParams.get('username')) {
      filters.username = searchParams.get('username') || undefined;
    }
    if (searchParams.get('email')) {
      filters.email = searchParams.get('email') || undefined;
    }

    // 状态
    const status = searchParams.get('status');
    if (status && status !== '') {
      filters.status = status as any;
    }

    // 角色
    if (searchParams.get('role_id')) {
      filters.role_id = Number(searchParams.get('role_id'));
    }

    // 超管标识
    const isSuperAdmin = searchParams.get('is_super_admin');
    if (isSuperAdmin !== null && isSuperAdmin !== '') {
      filters.is_super_admin =
        isSuperAdmin === 'true' ? true : isSuperAdmin === 'false' ? false : '';
    }

    // 时间范围
    if (searchParams.get('created_at_start')) {
      filters.created_at_start = searchParams.get('created_at_start') || undefined;
    }
    if (searchParams.get('created_at_end')) {
      filters.created_at_end = searchParams.get('created_at_end') || undefined;
    }
    if (searchParams.get('last_login_start')) {
      filters.last_login_start = searchParams.get('last_login_start') || undefined;
    }
    if (searchParams.get('last_login_end')) {
      filters.last_login_end = searchParams.get('last_login_end') || undefined;
    }

    return filters;
  }, [searchParams]);

  const [filters, setFilters] = useState<AdminFilters>(getInitialFilters);

  // 更新筛选条件并同步到 URL
  const updateFilters = useCallback(
    (newFilters: Partial<AdminFilters>) => {
      setFilters((prev) => {
        const updated = { ...prev, ...newFilters };
        // 同步到 URL
        const params = new URLSearchParams();
        Object.entries(updated).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.set(key, String(value));
          }
        });
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        return updated;
      });
    },
    [router, pathname]
  );

  // 更新单个筛选字段
  const updateFilter = useCallback(
    (key: keyof AdminFilters, value: any) => {
      updateFilters({ [key]: value });
    },
    [updateFilters]
  );

  // 重置筛选条件
  const resetFilters = useCallback(() => {
    setFilters({});
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  // 获取用于 API 请求的筛选参数（过滤空值）
  const getApiFilters = useCallback((): Partial<AdminFilters> => {
    const apiFilters: Partial<AdminFilters> = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        apiFilters[key as keyof AdminFilters] = value;
      }
    });
    return apiFilters;
  }, [filters]);

  // 检查是否有活跃的筛选条件
  const hasActiveFilters = useCallback(() => {
    return Object.keys(getApiFilters()).length > 0;
  }, [getApiFilters]);

  return {
    filters,
    appliedFilters: getApiFilters(),
    updateFilter,
    updateFilters,
    resetFilters,
    hasActiveFilters: hasActiveFilters()
  };
}

