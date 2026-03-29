'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { AdminAPI } from '@/service/api/admin-api';
import {
  Admin,
  AdminDetail,
  AdminListResponse,
  AdminStatistics,
  PaginationInfo,
  SortInfo,
  AdminFilters,
  CreateAdminFormData,
  EditAdminFormData,
  StatusChangeData,
  PasswordResetFormData
} from '../types';

interface UseAdminManagementResult {
  admins: Admin[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo;
  sort: SortInfo;
  statistics: AdminStatistics | null;
  statisticsLoading: boolean;
  roles: any[];
  rolesLoading: boolean;
  fetchAdmins: (params?: {
    filters?: Partial<AdminFilters>;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => Promise<void>;
  fetchAdminDetail: (adminId: number) => Promise<AdminDetail | null>;
  fetchStatistics: (filters?: Partial<AdminFilters>) => Promise<void>;
  fetchRoles: () => Promise<void>;
  createAdmin: (data: CreateAdminFormData) => Promise<boolean>;
  updateAdmin: (adminId: number, data: EditAdminFormData) => Promise<boolean>;
  updateAdminStatus: (
    adminId: number,
    data: StatusChangeData
  ) => Promise<boolean>;
  updateAdminPassword: (
    adminId: number,
    data: PasswordResetFormData
  ) => Promise<boolean>;
  deleteAdmin: (adminId: number) => Promise<boolean>;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}

export function useAdminManagement(): UseAdminManagementResult {
  const [admins, setAdmins] = useState<Admin[]>([]);
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
  const [statistics, setStatistics] = useState<AdminStatistics | null>(null);
  const [statisticsLoading, setStatisticsLoading] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);

  // 获取管理员列表
  const fetchAdmins = useCallback(
    async (params?: {
      filters?: Partial<AdminFilters>;
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

        const response = await AdminAPI.getAdmins(requestParams);

        if (response.success && response.data) {
          setAdmins(response.data.items || []);
          setPagination({
            page: response.data.page || 1,
            page_size: response.data.page_size || 20,
            total: response.data.total || 0,
            total_pages: Math.ceil(
              (response.data.total || 0) / (response.data.page_size || 20)
            )
          });
        } else {
          throw new Error(response.message || '获取管理员列表失败');
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : '获取管理员列表失败';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [pagination.page, pagination.page_size, sort]
  );

  // 获取管理员详情
  const fetchAdminDetail = useCallback(
    async (adminId: number): Promise<AdminDetail | null> => {
      try {
        setLoading(true);
        const response = await AdminAPI.getAdmin(adminId);
        if (response.success && response.data) {
          return response.data;
        } else {
          throw new Error(response.message || '获取管理员详情失败');
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : '获取管理员详情失败';
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
    async (filters?: Partial<AdminFilters>) => {
      try {
        setStatisticsLoading(true);
        const response = await AdminAPI.getAdminStatistics(filters);
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

  // 获取角色列表
  const fetchRoles = useCallback(async () => {
    try {
      setRolesLoading(true);
      const response = await AdminAPI.getAdminRoles();
      if (response.success && response.data) {
        // response.data 是包含 items 的对象，需要提取 items 数组
        setRoles(response.data.items || []);
      } else {
        throw new Error(response.message || '获取角色列表失败');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '获取角色列表失败';
      toast.error(message);
    } finally {
      setRolesLoading(false);
    }
  }, []);

  // 创建管理员
  const createAdmin = useCallback(
    async (data: CreateAdminFormData): Promise<boolean> => {
      try {
        const response = await AdminAPI.createAdmin(data);
        if (response.success) {
          toast.success('创建管理员成功');
          return true;
        } else {
          throw new Error(response.message || '创建管理员失败');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : '创建管理员失败';
        toast.error(message);
        return false;
      }
    },
    []
  );

  // 更新管理员
  const updateAdmin = useCallback(
    async (adminId: number, data: EditAdminFormData): Promise<boolean> => {
      try {
        const response = await AdminAPI.updateAdmin(adminId, data);
        if (response.success) {
          toast.success('更新管理员成功');
          return true;
        } else {
          throw new Error(response.message || '更新管理员失败');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : '更新管理员失败';
        toast.error(message);
        return false;
      }
    },
    []
  );

  // 更新管理员状态
  const updateAdminStatus = useCallback(
    async (adminId: number, data: StatusChangeData): Promise<boolean> => {
      try {
        const response = await AdminAPI.updateAdminStatus(adminId, data);
        if (response.success) {
          toast.success('更新状态成功');
          return true;
        } else {
          throw new Error(response.message || '更新状态失败');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : '更新状态失败';
        toast.error(message);
        return false;
      }
    },
    []
  );

  // 更新管理员密码
  const updateAdminPassword = useCallback(
    async (adminId: number, data: PasswordResetFormData): Promise<boolean> => {
      try {
        const response = await AdminAPI.updateAdminPassword(adminId, data);
        if (response.success) {
          toast.success('重置密码成功');
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

  // 删除管理员
  const deleteAdmin = useCallback(async (adminId: number): Promise<boolean> => {
    try {
      const response = await AdminAPI.deleteAdmin(adminId);
      if (response.success) {
        toast.success('删除管理员成功');
        return true;
      } else {
        throw new Error(response.message || '删除管理员失败');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '删除管理员失败';
      toast.error(message);
      return false;
    }
  }, []);

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
    admins,
    loading,
    error,
    pagination,
    sort,
    statistics,
    statisticsLoading,
    roles,
    rolesLoading,
    fetchAdmins,
    fetchAdminDetail,
    fetchStatistics,
    fetchRoles,
    createAdmin,
    updateAdmin,
    updateAdminStatus,
    updateAdminPassword,
    deleteAdmin,
    setPage,
    setPageSize,
    setSort
  };
}
