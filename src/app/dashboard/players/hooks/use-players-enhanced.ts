'use client';

import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { PlayerAPI } from '@/service/api/player';
import {
  Player,
  PlayerDetail,
  PlayerStatistics,
  PaginationInfo,
  SortInfo,
  PlayerFilters
} from '../types';

interface UsePlayersEnhancedResult {
  players: Player[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo;
  sort: SortInfo;
  statistics: PlayerStatistics | null;
  statisticsLoading: boolean;
  fetchPlayers: (params?: {
    filters?: Partial<PlayerFilters>;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => Promise<void>;
  fetchPlayerDetail: (playerId: number) => Promise<PlayerDetail | null>;
  fetchStatistics: (filters?: Partial<PlayerFilters>) => Promise<void>;
  updatePlayer: (
    playerId: number,
    data: {
      status?: boolean | string;
      vip_level?: number;
      agent?: string;
      direct_superior_id?: number;
      lock?: {
        action: 'lock' | 'unlock';
        lock_time?: string;
      };
    }
  ) => Promise<boolean>;
  adjustWallet: (
    playerId: number,
    data: {
      field: 'balance' | 'frozen_balance' | 'bonus';
      type: 'add' | 'subtract';
      amount: number;
      reason: string;
      version: number;
    }
  ) => Promise<boolean>;
  batchOperation: (
    playerIds: number[],
    operation: 'enable' | 'disable' | 'export'
  ) => Promise<boolean>;
  resetPassword: (playerId: number) => Promise<boolean>;
  sendNotification: (
    playerId: number,
    data: { channel: string; title: string; content: string }
  ) => Promise<boolean>;
  exportPlayers: (filters?: Partial<PlayerFilters>) => Promise<boolean>;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}

export function usePlayersEnhanced(): UsePlayersEnhancedResult {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    page_size: 20,
    total: 0,
    total_pages: 0
  });
  const [sort, setSortState] = useState<SortInfo>({
    sort_by: undefined,
    sort_order: undefined
  });
  const [statistics, setStatistics] = useState<PlayerStatistics | null>(null);
  const [statisticsLoading, setStatisticsLoading] = useState(false);

  // 请求锁，防止重复请求
  const isFetchingPlayersRef = useRef(false);
  const isFetchingStatsRef = useRef(false);

  // 获取玩家列表
  const fetchPlayers = useCallback(
    async (params?: {
      filters?: Partial<PlayerFilters>;
      page?: number;
      pageSize?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }) => {
      // 如果正在请求，直接返回
      if (isFetchingPlayersRef.current) {
        return;
      }

      try {
        isFetchingPlayersRef.current = true;
        setLoading(true);
        setError(null);

        const requestParams: any = {
          ...params?.filters,
          page: params?.page || pagination.page,
          page_size: params?.pageSize || pagination.page_size
        };

        if (params?.sortBy) {
          requestParams.sort_by = params.sortBy;
          requestParams.sort_order = params.sortOrder || 'asc';
        } else if (sort.sort_by) {
          requestParams.sort_by = sort.sort_by;
          requestParams.sort_order = sort.sort_order;
        }

        const response = await PlayerAPI.getPlayers(requestParams);

        if (response.success && response.data) {
          setPlayers(response.data.list || response.data.items || []);
          setPagination({
            page: response.data.page || 1,
            page_size: response.data.page_size || 20,
            total: response.data.total || 0,
            total_pages: Math.ceil(
              (response.data.total || 0) / (response.data.page_size || 20)
            )
          });
        } else {
          throw new Error(response.message || '获取玩家列表失败');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : '获取玩家列表失败';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
        isFetchingPlayersRef.current = false;
      }
    },
    [pagination.page, pagination.page_size, sort]
  );

  // 获取玩家详情
  const fetchPlayerDetail = useCallback(
    async (playerId: number): Promise<PlayerDetail | null> => {
      try {
        setLoading(true);
        const response = await PlayerAPI.getPlayer(playerId);
        if (response.success && response.data) {
          return response.data;
        } else {
          throw new Error(response.message || '获取玩家详情失败');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : '获取玩家详情失败';
        toast.error(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // 获取统计信息
  const fetchStatistics = useCallback(
    async (filters?: Partial<PlayerFilters>) => {
      // 如果正在请求，直接返回
      if (isFetchingStatsRef.current) {
        return;
      }

      try {
        isFetchingStatsRef.current = true;
        setStatisticsLoading(true);
        const response = await PlayerAPI.getStatistics(filters);
        if (response.success && response.data) {
          // 适配统计数据结构
          const stats = response.data;
          setStatistics({
            total_players: stats.total_players || stats.total_users || 0,
            active_players: stats.active_players || stats.active_users || 0,
            disabled_players: stats.disabled_players || stats.disabled_users || 0,
            total_balance: stats.total_balance || 0,
            today_new_players: stats.today_new_players || stats.today_new_users || 0
          });
        } else {
          throw new Error(response.message || '获取统计信息失败');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : '获取统计信息失败';
        toast.error(message);
      } finally {
        setStatisticsLoading(false);
        isFetchingStatsRef.current = false;
      }
    },
    []
  );

  // 更新玩家
  const updatePlayer = useCallback(
    async (
      playerId: number,
      data: {
        status?: boolean | string;
        vip_level?: number;
        agent?: string;
        direct_superior_id?: number;
        lock?: {
          action: 'lock' | 'unlock';
          lock_time?: string;
        };
      }
    ): Promise<boolean> => {
      try {
        const response = await PlayerAPI.updatePlayer(playerId, data);
        if (response.success) {
          toast.success('玩家更新成功');
          return true;
        } else {
          throw new Error(response.message || '更新玩家失败');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : '更新玩家失败';
        toast.error(message);
        return false;
      }
    },
    []
  );

  // 调整钱包
  const adjustWallet = useCallback(
    async (
      playerId: number,
      data: {
        field: 'balance' | 'frozen_balance' | 'bonus';
        type: 'add' | 'subtract';
        amount: number;
        reason: string;
        version: number;
      }
    ): Promise<boolean> => {
      try {
        const response = await PlayerAPI.adjustWallet(playerId, data);
        if (response.success) {
          toast.success('钱包调整成功');
          return true;
        } else {
          // 处理版本冲突
          if (response.code === 409 || response.message?.includes('VERSION_CONFLICT')) {
            toast.error('钱包信息已被其他操作修改，请刷新后重试', {
              action: {
                label: '刷新',
                onClick: () => {
                  fetchPlayerDetail(playerId);
                }
              }
            });
          } else {
            throw new Error(response.message || '钱包调整失败');
          }
          return false;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : '钱包调整失败';
        toast.error(message);
        return false;
      }
    },
    [fetchPlayerDetail]
  );

  // 批量操作
  const batchOperation = useCallback(
    async (
      playerIds: number[],
      operation: 'enable' | 'disable' | 'export'
    ): Promise<boolean> => {
      try {
        const response = await PlayerAPI.batchOperation(playerIds, operation);
        if (response.success) {
          toast.success('批量操作成功');
          return true;
        } else {
          throw new Error(response.message || '批量操作失败');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : '批量操作失败';
        toast.error(message);
        return false;
      }
    },
    []
  );

  // 重置密码
  const resetPassword = useCallback(async (playerId: number): Promise<boolean> => {
    try {
      const response = await PlayerAPI.resetPassword(playerId);
      if (response.success) {
        toast.success('重置链接已发送');
        return true;
      } else {
        throw new Error(response.message || '重置密码失败');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '重置密码失败';
      toast.error(message);
      return false;
    }
  }, []);

  // 发送通知
  const sendNotification = useCallback(
    async (
      playerId: number,
      data: { channel: string; title: string; content: string }
    ): Promise<boolean> => {
      try {
        const response = await PlayerAPI.sendNotification(playerId, data);
        if (response.success) {
          toast.success('通知发送成功');
          return true;
        } else {
          throw new Error(response.message || '发送通知失败');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : '发送通知失败';
        toast.error(message);
        return false;
      }
    },
    []
  );

  // 导出玩家
  const exportPlayers = useCallback(
    async (filters?: Partial<PlayerFilters>): Promise<boolean> => {
      try {
        const response = await PlayerAPI.exportPlayers(filters);
        if (response.success) {
          toast.success('导出任务创建成功');
          // 如果返回了下载链接，可以触发下载
          if (response.data?.download_url) {
            window.open(response.data.download_url, '_blank');
          }
          return true;
        } else {
          throw new Error(response.message || '导出失败');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : '导出失败';
        toast.error(message);
        return false;
      }
    },
    []
  );

  // 设置分页
  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setPagination((prev) => ({ ...prev, page_size: pageSize, page: 1 }));
  }, []);

  // 设置排序
  const setSort = useCallback((sortBy: string, sortOrder: 'asc' | 'desc') => {
    setSortState({ sort_by: sortBy, sort_order: sortOrder });
  }, []);

  return {
    players,
    loading,
    error,
    pagination,
    sort,
    statistics,
    statisticsLoading,
    fetchPlayers,
    fetchPlayerDetail,
    fetchStatistics,
    updatePlayer,
    adjustWallet,
    batchOperation,
    resetPassword,
    sendNotification,
    exportPlayers,
    setPage,
    setPageSize,
    setSort
  };
}

