'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  UserRetentionItem,
  UserRetentionFilters,
  PaginationInfo
} from '../types';
import { DEFAULT_PAGINATION, MESSAGES } from '../constants';
import { apiRequest } from '@/service/api/base';

/**
 * 用户留存管理业务逻辑 Hook
 * 负责用户留存数据的查询
 */
export function useUserRetentionManagement() {
  const [retentionData, setRetentionData] = useState<UserRetentionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] =
    useState<PaginationInfo>(DEFAULT_PAGINATION);

  /**
   * 获取用户留存列表
   */
  const fetchRetention = useCallback(async (filters: UserRetentionFilters) => {
    try {
      setLoading(true);

      // 构建查询参数
      const params: Record<string, any> = {
        page: filters.page || 1,
        page_size: filters.page_size || 20
      };

      // 处理日期范围
      if (filters.dateRange?.from && filters.dateRange?.to) {
        const startDate = filters.dateRange.from.toISOString().split('T')[0];
        const endDate = filters.dateRange.to.toISOString().split('T')[0];
        params.start_date = startDate;
        params.end_date = endDate;
      } else {
        if (filters.start_date) {
          params.start_date = filters.start_date;
        }
        if (filters.end_date) {
          params.end_date = filters.end_date;
        }
      }

      // 构建查询字符串
      const queryString = Object.entries(params)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');

      const res = await apiRequest<{
        items: UserRetentionItem[];
        total: number;
        start_date?: string;
        end_date?: string;
      }>(`/admin/user-churn-report?${queryString}`);

      if (res.success && res.data) {
        setRetentionData(res.data.items || []);
        setPagination({
          page: filters.page || 1,
          limit: filters.page_size || 20,
          total: res.data.total || 0,
          totalPages: Math.ceil(
            (res.data.total || 0) / (filters.page_size || 20)
          )
        });
      } else {
        toast.error(res.message || MESSAGES.ERROR.FETCH_RETENTION);
        setRetentionData([]);
        setPagination(DEFAULT_PAGINATION);
      }
    } catch (error) {
      console.error('获取用户留存失败:', error);
      toast.error(MESSAGES.ERROR.FETCH_RETENTION);
      setRetentionData([]);
      setPagination(DEFAULT_PAGINATION);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 刷新数据
   */
  const refreshRetention = useCallback(
    async (filters: UserRetentionFilters) => {
      await fetchRetention(filters);
      toast.success(MESSAGES.SUCCESS.REFRESH);
    },
    [fetchRetention]
  );

  return {
    // 状态
    retentionData,
    loading,
    pagination,

    // 方法
    fetchRetention,
    refreshRetention
  };
}
