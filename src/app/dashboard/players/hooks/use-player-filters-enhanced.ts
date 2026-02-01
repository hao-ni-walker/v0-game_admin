'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { PlayerFilters } from '../types';

/**
 * 管理玩家筛选条件的 Hook（增强版）
 * 将筛选条件同步到 URL query 参数
 */
export function usePlayerFiltersEnhanced() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 从 URL 读取初始筛选条件
  const getInitialFilters = useCallback((): PlayerFilters => {
    const filters: PlayerFilters = {};

    // 用户基本信息
    if (searchParams.get('id')) {
      filters.id = Number(searchParams.get('id'));
    }
    if (searchParams.get('id_min')) {
      filters.id_min = Number(searchParams.get('id_min'));
    }
    if (searchParams.get('id_max')) {
      filters.id_max = Number(searchParams.get('id_max'));
    }
    if (searchParams.get('username')) {
      filters.username = searchParams.get('username') || undefined;
    }
    if (searchParams.get('email')) {
      filters.email = searchParams.get('email') || undefined;
    }
    if (searchParams.get('idname')) {
      filters.idname = searchParams.get('idname') || undefined;
    }
    if (searchParams.get('keyword')) {
      filters.keyword = searchParams.get('keyword') || undefined;
    }

    // 账户状态
    const status = searchParams.get('status');
    if (status && status !== '') {
      if (status === 'true' || status === 'false') {
        filters.status = status === 'true';
      } else {
        filters.status = status as any;
      }
    }
    if (searchParams.get('vip_level')) {
      filters.vip_level = Number(searchParams.get('vip_level'));
    }
    if (searchParams.get('vip_level_min')) {
      filters.vip_level_min = Number(searchParams.get('vip_level_min'));
    }
    if (searchParams.get('vip_level_max')) {
      filters.vip_level_max = Number(searchParams.get('vip_level_max'));
    }
    const isLocked = searchParams.get('is_locked');
    if (isLocked !== null) {
      filters.is_locked =
        isLocked === 'true' ? true : isLocked === 'false' ? false : '';
    }

    // 代理关系
    if (searchParams.get('agent')) {
      filters.agent = searchParams.get('agent') || undefined;
    }
    if (searchParams.get('direct_superior_id')) {
      filters.direct_superior_id = Number(
        searchParams.get('direct_superior_id')
      );
    }

    // 注册信息
    const registrationMethod = searchParams.get('registration_method');
    if (registrationMethod && registrationMethod !== '') {
      filters.registration_method = registrationMethod as any;
    }
    if (searchParams.get('registration_source')) {
      filters.registration_source =
        searchParams.get('registration_source') || undefined;
    }
    const identityCategory = searchParams.get('identity_category');
    if (identityCategory && identityCategory !== '') {
      filters.identity_category = identityCategory as any;
    }

    // 钱包信息范围
    if (searchParams.get('balance_min')) {
      filters.balance_min = Number(searchParams.get('balance_min'));
    }
    if (searchParams.get('balance_max')) {
      filters.balance_max = Number(searchParams.get('balance_max'));
    }
    if (searchParams.get('total_deposit_min')) {
      filters.total_deposit_min = Number(searchParams.get('total_deposit_min'));
    }
    if (searchParams.get('total_deposit_max')) {
      filters.total_deposit_max = Number(searchParams.get('total_deposit_max'));
    }
    if (searchParams.get('total_withdraw_min')) {
      filters.total_withdraw_min = Number(
        searchParams.get('total_withdraw_min')
      );
    }
    if (searchParams.get('total_withdraw_max')) {
      filters.total_withdraw_max = Number(
        searchParams.get('total_withdraw_max')
      );
    }

    // 时间范围
    if (searchParams.get('created_at_start')) {
      filters.created_at_start =
        searchParams.get('created_at_start') || undefined;
    }
    if (searchParams.get('created_at_end')) {
      filters.created_at_end = searchParams.get('created_at_end') || undefined;
    }
    if (searchParams.get('last_login_start')) {
      filters.last_login_start =
        searchParams.get('last_login_start') || undefined;
    }
    if (searchParams.get('last_login_end')) {
      filters.last_login_end = searchParams.get('last_login_end') || undefined;
    }

    return filters;
  }, [searchParams]);

  const [filters, setFilters] = useState<PlayerFilters>(getInitialFilters);

  // 监听 URL 参数变化，同步更新 filters
  useEffect(() => {
    setFilters(getInitialFilters());
  }, [getInitialFilters]);

  // 更新筛选条件并同步到 URL
  const updateFilters = useCallback(
    (newFilters: Partial<PlayerFilters>) => {
      setFilters((prev) => {
        // 合并筛选条件，undefined 值会删除对应的键
        const updated: PlayerFilters = { ...prev };
        Object.entries(newFilters).forEach(([key, value]) => {
          if (value === undefined || value === null || value === '') {
            delete updated[key as keyof PlayerFilters];
          } else {
            updated[key as keyof PlayerFilters] = value;
          }
        });
        // 同步到 URL
        const params = new URLSearchParams();
        Object.entries(updated).forEach(([key, value]) => {
          params.set(key, String(value));
        });
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        return updated;
      });
    },
    [router, pathname]
  );

  // 更新单个筛选字段
  const updateFilter = useCallback(
    (key: keyof PlayerFilters, value: any) => {
      updateFilters({ [key]: value });
    },
    [updateFilters]
  );

  // 重置筛选条件
  const resetFilters = useCallback(() => {
    setFilters({});
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  // 应用筛选条件（触发查询）
  const applyFilters = useCallback(() => {
    // 筛选条件已通过 URL 同步，这里可以触发数据刷新
  }, []);

  // 获取用于 API 请求的筛选参数（过滤空值）
  // 使用 useMemo 稳定引用，避免每次渲染都创建新对象
  const appliedFilters = useMemo((): Partial<PlayerFilters> => {
    const apiFilters: Partial<PlayerFilters> = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        apiFilters[key as keyof PlayerFilters] = value;
      }
    });
    return apiFilters;
  }, [filters]);

  // 检查是否有活跃的筛选条件
  const hasActiveFilters = useMemo(() => {
    return Object.keys(appliedFilters).length > 0;
  }, [appliedFilters]);

  return {
    filters,
    appliedFilters,
    updateFilter,
    updateFilters,
    resetFilters,
    applyFilters,
    hasActiveFilters
  };
}
