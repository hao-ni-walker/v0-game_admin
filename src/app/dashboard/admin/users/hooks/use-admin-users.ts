'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { AdminUserAPI } from '@/service/api/admin-user';
import {
  AdminUser,
  AdminUserDetail,
  AdminUserListResponse,
  UserStatistics,
  PaginationInfo,
  SortInfo,
  AdminUserFilters
} from '../types';

interface UseAdminUsersResult {
  users: AdminUser[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo;
  sort: SortInfo;
  statistics: UserStatistics | null;
  statisticsLoading: boolean;
  fetchUsers: (params?: {
    filters?: Partial<AdminUserFilters>;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => Promise<void>;
  fetchUserDetail: (userId: number) => Promise<AdminUserDetail | null>;
  fetchStatistics: (filters?: Partial<AdminUserFilters>) => Promise<void>;
  updateUser: (
    userId: number,
    data: {
      status?: string;
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
    userId: number,
    data: {
      field: 'balance' | 'frozen_balance' | 'bonus';
      type: 'add' | 'subtract';
      amount: number;
      reason: string;
      version: number;
    }
  ) => Promise<boolean>;
  batchOperation: (
    userIds: number[],
    operation: 'enable' | 'disable' | 'export'
  ) => Promise<boolean>;
  resetPassword: (userId: number) => Promise<boolean>;
  sendNotification: (
    userId: number,
    data: { channel: string; title: string; content: string }
  ) => Promise<boolean>;
  exportUsers: (filters?: Partial<AdminUserFilters>) => Promise<boolean>;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}

export function useAdminUsers(): UseAdminUsersResult {
  const [users, setUsers] = useState<AdminUser[]>([]);
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
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [statisticsLoading, setStatisticsLoading] = useState(false);

  // 获取用户列表
  const fetchUsers = useCallback(
    async (params?: {
      filters?: Partial<AdminUserFilters>;
      page?: number;
      pageSize?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }) => {
      try {
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

        const response = await AdminUserAPI.getUsers(requestParams);

        if (response.success && response.data) {
          setUsers(response.data.items || []);
          setPagination({
            page: response.data.page || 1,
            page_size: response.data.page_size || 20,
            total: response.data.total || 0,
            total_pages: Math.ceil(
              (response.data.total || 0) / (response.data.page_size || 20)
            )
          });
        } else {
          throw new Error(response.message || '获取用户列表失败');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : '获取用户列表失败';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [pagination.page, pagination.page_size, sort]
  );

  // 获取用户详情
  const fetchUserDetail = useCallback(
    async (userId: number): Promise<AdminUserDetail | null> => {
      try {
        setLoading(true);
        const response = await AdminUserAPI.getUser(userId);
        if (response.success && response.data) {
          return response.data;
        } else {
          throw new Error(response.message || '获取用户详情失败');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : '获取用户详情失败';
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
    async (filters?: Partial<AdminUserFilters>) => {
      try {
        setStatisticsLoading(true);
        // 过滤掉空字符串值
        const cleanedFilters = filters
          ? Object.fromEntries(
              Object.entries(filters).filter(
                ([, value]) =>
                  value !== '' && value !== undefined && value !== null
              )
            )
          : undefined;
        const response = await AdminUserAPI.getStatistics(
          cleanedFilters as any
        );
        if (response.success && response.data) {
          setStatistics(response.data);
        } else {
          throw new Error(response.message || '获取统计信息失败');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : '获取统计信息失败';
        toast.error(message);
      } finally {
        setStatisticsLoading(false);
      }
    },
    []
  );

  // 更新用户
  const updateUser = useCallback(
    async (
      userId: number,
      data: {
        status?: string;
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
        const response = await AdminUserAPI.updateUser(userId, data);
        if (response.success) {
          toast.success('用户更新成功');
          return true;
        } else {
          throw new Error(response.message || '更新用户失败');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : '更新用户失败';
        toast.error(message);
        return false;
      }
    },
    []
  );

  // 调整钱包
  const adjustWallet = useCallback(
    async (
      userId: number,
      data: {
        field: 'balance' | 'frozen_balance' | 'bonus';
        type: 'add' | 'subtract';
        amount: number;
        reason: string;
        version: number;
      }
    ): Promise<boolean> => {
      try {
        const response = await AdminUserAPI.adjustWallet(userId, data);
        if (response.success) {
          toast.success('钱包调整成功');
          return true;
        } else {
          // 处理版本冲突
          if (
            response.code === 409 ||
            response.message?.includes('VERSION_CONFLICT')
          ) {
            toast.error('钱包信息已被其他操作修改，请刷新后重试', {
              action: {
                label: '刷新',
                onClick: () => {
                  fetchUserDetail(userId);
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
    [fetchUserDetail]
  );

  // 批量操作
  const batchOperation = useCallback(
    async (
      userIds: number[],
      operation: 'enable' | 'disable' | 'export'
    ): Promise<boolean> => {
      try {
        const response = await AdminUserAPI.batchOperation(userIds, operation);
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
  const resetPassword = useCallback(
    async (userId: number): Promise<boolean> => {
      try {
        const response = await AdminUserAPI.resetPassword(userId);
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
    },
    []
  );

  // 发送通知
  const sendNotification = useCallback(
    async (
      userId: number,
      data: { channel: string; title: string; content: string }
    ): Promise<boolean> => {
      try {
        const response = await AdminUserAPI.sendNotification(userId, data);
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

  // 导出用户
  const exportUsers = useCallback(
    async (filters?: Partial<AdminUserFilters>): Promise<boolean> => {
      try {
        // 过滤掉空字符串值
        const cleanedFilters = filters
          ? Object.fromEntries(
              Object.entries(filters).filter(
                ([, value]) =>
                  value !== '' && value !== undefined && value !== null
              )
            )
          : undefined;
        const response = await AdminUserAPI.exportUsers(cleanedFilters as any);
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
    users,
    loading,
    error,
    pagination,
    sort,
    statistics,
    statisticsLoading,
    fetchUsers,
    fetchUserDetail,
    fetchStatistics,
    updateUser,
    adjustWallet,
    batchOperation,
    resetPassword,
    sendNotification,
    exportUsers,
    setPage,
    setPageSize,
    setSort
  };
}
