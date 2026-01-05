'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  DepositDistributionFilters,
  DepositDistributionResponse
} from '../types';
import { MESSAGES } from '../constants';
import { apiRequest, buildSearchParams } from '@/service/api/base';

/**
 * 储值分布管理业务逻辑 Hook
 * 负责储值分布数据的查询
 */
export function useDepositDistributionManagement() {
  const [distributionData, setDistributionData] =
    useState<DepositDistributionResponse | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * 获取储值分布数据
   */
  const fetchDistribution = useCallback(
    async (filters: DepositDistributionFilters) => {
      try {
        setLoading(true);

        // 构建查询参数
        const params: Record<string, any> = {};

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
        const queryString = buildSearchParams(params);

        const res = await apiRequest<DepositDistributionResponse>(
          `/admin/deposit-distribution${queryString ? `?${queryString}` : ''}`
        );

        if (res.success && res.data) {
          setDistributionData(res.data);
        } else {
          toast.error(res.message || MESSAGES.ERROR.FETCH_DISTRIBUTION);
          setDistributionData(null);
        }
      } catch (error) {
        console.error('获取储值分布失败:', error);
        toast.error(MESSAGES.ERROR.FETCH_DISTRIBUTION);
        setDistributionData(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * 刷新数据
   */
  const refreshDistribution = useCallback(
    async (filters: DepositDistributionFilters) => {
      await fetchDistribution(filters);
      toast.success(MESSAGES.SUCCESS.REFRESH);
    },
    [fetchDistribution]
  );

  return {
    // 状态
    distributionData,
    loading,

    // 方法
    fetchDistribution,
    refreshDistribution
  };
}
