'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { GameFlowItem, GameFlowFilters, PaginationInfo } from '../types';
import { DEFAULT_PAGINATION, MESSAGES } from '../constants';
import { apiRequest } from '@/service/api/base';

/**
 * 游戏流水管理业务逻辑 Hook
 * 负责游戏流水数据的查询
 */
export function useGameFlowManagement() {
  const [flows, setFlows] = useState<GameFlowItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] =
    useState<PaginationInfo>(DEFAULT_PAGINATION);

  /**
   * 获取游戏流水列表
   */
  const fetchFlows = useCallback(async (filters: GameFlowFilters) => {
    try {
      setLoading(true);

      // 构建查询参数
      const params: Record<string, any> = {
        page: filters.page || 1,
        page_size: filters.page_size || 10
      };

      // 处理日期范围
      if (filters.dateRange?.from && filters.dateRange?.to) {
        const startDate = filters.dateRange.from.toISOString().split('T')[0];
        const endDate = filters.dateRange.to.toISOString().split('T')[0];
        params.bet_time_start = startDate;
        params.bet_time_end = endDate;
      } else {
        if (filters.bet_time_start) {
          params.bet_time_start = filters.bet_time_start;
        }
        if (filters.bet_time_end) {
          params.bet_time_end = filters.bet_time_end;
        }
      }

      // 处理游戏ID
      if (filters.game_id) {
        params.game_id = filters.game_id;
      }

      // 处理平台ID
      if (filters.platform_id) {
        params.platform_id = filters.platform_id;
      }

      // 处理排序
      if (filters.sort_by) {
        params.sort_by = filters.sort_by;
      }
      if (filters.sort_order) {
        params.sort_order = filters.sort_order;
      }

      // 构建查询字符串
      const queryString = Object.entries(params)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');

      const res = await apiRequest<{
        items: GameFlowItem[];
        total: number;
        page: number;
        page_size: number;
        has_more: boolean;
      }>(`/admin/bet-records/game-flow?${queryString}`);

      if (res.success && res.data) {
        setFlows(res.data.items || []);
        setPagination({
          page: res.data.page || 1,
          limit: res.data.page_size || 10,
          total: res.data.total || 0,
          totalPages: Math.ceil(
            (res.data.total || 0) / (res.data.page_size || 10)
          )
        });
      } else {
        toast.error(res.message || MESSAGES.ERROR.FETCH_FLOWS);
        setFlows([]);
        setPagination(DEFAULT_PAGINATION);
      }
    } catch (error) {
      console.error('获取游戏流水失败:', error);
      toast.error(MESSAGES.ERROR.FETCH_FLOWS);
      setFlows([]);
      setPagination(DEFAULT_PAGINATION);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 刷新数据
   */
  const refreshFlows = useCallback(
    async (filters: GameFlowFilters) => {
      await fetchFlows(filters);
      toast.success(MESSAGES.SUCCESS.REFRESH);
    },
    [fetchFlows]
  );

  return {
    // 状态
    flows,
    loading,
    pagination,

    // 方法
    fetchFlows,
    refreshFlows
  };
}
