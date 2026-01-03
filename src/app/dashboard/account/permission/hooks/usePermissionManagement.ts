'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { PermissionAPI } from '@/service/api/permission';
import {
  Permission,
  PermissionFilters,
  PermissionFormData,
  PaginationInfo,
  PermissionDialogState
} from '../types';
import { DEFAULT_PAGINATION, MESSAGES } from '../constants';

export function usePermissionManagement() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] =
    useState<PaginationInfo>(DEFAULT_PAGINATION);
  const [dialogState, setDialogState] = useState<PermissionDialogState>({
    type: null,
    permission: null,
    open: false
  });

  // 获取权限列表
  const fetchPermissions = useCallback(async (filters: PermissionFilters) => {
    try {
      setLoading(true);

      const params: Record<string, any> = {
        page: filters.page || 1,
        page_size: filters.limit || 10
      };

      // 处理筛选条件
      if (filters.name) params.name = filters.name;
      if (filters.code) params.code = filters.code;
      if (filters.parent_id !== undefined && filters.parent_id !== null) {
        params.parent_id = filters.parent_id;
      }
      if (filters.sort_by) params.sort_by = filters.sort_by;
      if (filters.sort_dir) params.sort_dir = filters.sort_dir;

      // 处理日期范围
      if (filters.dateRange && filters.dateRange.from && filters.dateRange.to) {
        const startDateStr = filters.dateRange.from.toISOString().split('T')[0];
        const endDateStr = filters.dateRange.to.toISOString().split('T')[0];
        params.startDate = startDateStr;
        params.endDate = endDateStr;
      }

      const res = await PermissionAPI.getPermissions(params);
      // code === 200 表示成功
      if (res.code === 200) {
        // 处理响应格式：data 是对象 { items, page, page_size, total }
        if (res.data && typeof res.data === 'object' && 'items' in res.data) {
          const data = res.data as {
            items: Permission[];
            page: number;
            page_size: number;
            total: number;
          };

          const permissionsList = data.items || [];
          const pageSize = data.page_size || 10;
          const total = data.total || 0;
          const totalPages = Math.ceil(total / pageSize);

          setPermissions(permissionsList);
          setPagination({
            page: data.page || 1,
            limit: pageSize,
            total,
            totalPages
          });
        } else {
          console.error('[Permission API] 响应数据格式不正确:', res.data);
          toast.error('响应数据格式错误');
          setPermissions([]);
        }
      } else {
        toast.error(res.message || MESSAGES.ERROR.FETCH_PERMISSIONS);
        setPermissions([]);
      }
    } catch (error) {
      toast.error(MESSAGES.ERROR.FETCH_PERMISSIONS);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 创建权限
  const createPermission = useCallback(
    async (data: PermissionFormData): Promise<boolean> => {
      try {
        const res = await PermissionAPI.createPermission(data);
        if (res.code === 200) {
          toast.success(MESSAGES.SUCCESS.CREATE);
          return true;
        } else {
          toast.error(res.message || MESSAGES.ERROR.CREATE);
          return false;
        }
      } catch (error) {
        toast.error(MESSAGES.ERROR.CREATE);
        return false;
      }
    },
    []
  );

  // 更新权限
  const updatePermission = useCallback(
    async (id: number, data: PermissionFormData): Promise<boolean> => {
      try {
        const res = await PermissionAPI.updatePermission(id, data);
        if (res.code === 200) {
          toast.success(MESSAGES.SUCCESS.UPDATE);
          return true;
        } else {
          toast.error(res.message || MESSAGES.ERROR.UPDATE);
          return false;
        }
      } catch (error) {
        toast.error(MESSAGES.ERROR.UPDATE);
        return false;
      }
    },
    []
  );

  // 删除权限
  const deletePermission = useCallback(async (id: number): Promise<boolean> => {
    try {
      const res = await PermissionAPI.deletePermission(id);
      if (res.code === 200) {
        toast.success(MESSAGES.SUCCESS.DELETE);
        return true;
      } else {
        toast.error(res.message || MESSAGES.ERROR.DELETE);
        return false;
      }
    } catch (error) {
      toast.error(MESSAGES.ERROR.DELETE);
      return false;
    }
  }, []);

  // 批量删除权限
  const batchDeletePermissions = useCallback(
    async (ids: number[]): Promise<boolean> => {
      if (ids.length === 0) {
        toast.error('请至少选择一个权限');
        return false;
      }

      try {
        const res = await PermissionAPI.batchDeletePermissions(ids);
        if (res.code === 200) {
          toast.success(MESSAGES.SUCCESS.BATCH_DELETE);
          return true;
        } else {
          toast.error(res.message || MESSAGES.ERROR.BATCH_DELETE);
          return false;
        }
      } catch (error) {
        toast.error(MESSAGES.ERROR.BATCH_DELETE);
        return false;
      }
    },
    []
  );

  // 打开创建对话框
  const openCreateDialog = useCallback(() => {
    setDialogState({
      type: 'create',
      permission: null,
      open: true
    });
  }, []);

  // 打开编辑对话框
  const openEditDialog = useCallback((permission: Permission) => {
    setDialogState({
      type: 'edit',
      permission,
      open: true
    });
  }, []);

  // 关闭对话框
  const closeDialog = useCallback(() => {
    setDialogState({
      type: null,
      permission: null,
      open: false
    });
  }, []);

  return {
    // 状态
    permissions,
    loading,
    pagination,
    dialogState,

    // 操作
    fetchPermissions,
    createPermission,
    updatePermission,
    deletePermission,
    batchDeletePermissions,
    openCreateDialog,
    openEditDialog,
    closeDialog
  };
}
