'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { PermissionAPI } from '@/service/request';
import { AdminAPI } from '@/service/api/admin-api';
import type {
  Role,
  Permission,
  RoleFilters,
  RoleFormData,
  PaginationInfo,
  RoleDialogState,
  PermissionDialogState
} from '../types';
import { DEFAULT_PAGINATION, MESSAGES } from '../constants';

export function useRoleManagement() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] =
    useState<PaginationInfo>(DEFAULT_PAGINATION);

  const [dialogState, setDialogState] = useState<RoleDialogState>({
    type: null,
    role: null,
    open: false
  });

  const [permissionDialogState, setPermissionDialogState] =
    useState<PermissionDialogState>({
      open: false,
      role: null,
      permissions: [],
      selectedPermissions: []
    });

  // 获取角色列表
  const fetchRoles = useCallback(async (filters: RoleFilters) => {
    try {
      setLoading(true);

      // 构建 API 请求参数
      const params: {
        page?: number;
        page_size?: number;
      } = {
        page: filters.page || 1,
        page_size: filters.limit || 10
      };

      const res = await AdminAPI.getAdminRoles(params);

      if (res.success && res.data) {
        // 转换数据格式：将 AdminRole 转换为 Role
        const roles: Role[] = (res.data.items || []).map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          userCount: item.admin_count,
          isSuper: item.is_super || false
        }));

        setRoles(roles);

        // 处理分页信息
        setPagination({
          page: res.data.page || 1,
          limit: res.data.page_size || 10,
          total: res.data.total || 0,
          totalPages: Math.ceil(
            (res.data.total || 0) / (res.data.page_size || 10)
          )
        });
      } else {
        toast.error(res.message || MESSAGES.ERROR.FETCH_ROLES);
        setRoles([]);
      }
    } catch (error) {
      console.error('获取角色列表失败:', error);
      toast.error(MESSAGES.ERROR.FETCH_ROLES);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 创建角色
  const createRole = useCallback(
    async (data: RoleFormData): Promise<boolean> => {
      try {
        const res = await RoleAPI.createRole(data);
        if (res.code === 0) {
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

  // 更新角色
  const updateRole = useCallback(
    async (id: number, data: RoleFormData): Promise<boolean> => {
      try {
        const res = await RoleAPI.updateRole(id, data);
        if (res.code === 0) {
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

  // 删除角色
  const deleteRole = useCallback(async (id: number): Promise<boolean> => {
    try {
      const res = await RoleAPI.deleteRole(id);
      if (res.code === 0) {
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

  // 获取所有权限
  const fetchAllPermissions = useCallback(async (): Promise<Permission[]> => {
    try {
      const res = await PermissionAPI.getAllPermissions();
      if (res.code === 0) {
        return res.data || [];
      } else {
        toast.error(res.message || MESSAGES.ERROR.FETCH_PERMISSIONS);
        return [];
      }
    } catch (error) {
      toast.error(MESSAGES.ERROR.FETCH_PERMISSIONS);
      return [];
    }
  }, []);

  // 获取角色权限
  const fetchRolePermissions = useCallback(
    async (roleId: number): Promise<number[]> => {
      try {
        const res = await RoleAPI.getRolePermissions(roleId);
        if (res.code === 0) {
          const permissions = res.data || [];

          // 检查返回的数据格式
          if (Array.isArray(permissions) && permissions.length > 0) {
            const firstItem = permissions[0];

            if (typeof firstItem === 'object' && firstItem.id !== undefined) {
              // 后端返回的是权限对象数组，需要提取ID
              return permissions.map((perm: any) => perm.id);
            } else if (
              typeof firstItem === 'number' ||
              typeof firstItem === 'string'
            ) {
              // 后端返回的是ID数组，确保转换为数字
              return permissions
                .map((id: any) => {
                  const numberId =
                    typeof id === 'string' ? parseInt(id, 10) : Number(id);
                  return isNaN(numberId) ? 0 : numberId;
                })
                .filter((id) => id > 0);
            }
          }

          return [];
        } else {
          toast.error(res.message || MESSAGES.ERROR.FETCH_PERMISSIONS);
          return [];
        }
      } catch (error) {
        toast.error(MESSAGES.ERROR.FETCH_PERMISSIONS);
        return [];
      }
    },
    []
  );

  // 分配权限
  const assignPermissions = useCallback(
    async (roleId: number, permissionIds: number[]): Promise<boolean> => {
      try {
        const res = await RoleAPI.updateRolePermissions(roleId, permissionIds);
        if (res.code === 0) {
          toast.success(MESSAGES.SUCCESS.ASSIGN_PERMISSIONS);
          return true;
        } else {
          toast.error(res.message || MESSAGES.ERROR.ASSIGN_PERMISSIONS);
          return false;
        }
      } catch (error) {
        toast.error(MESSAGES.ERROR.ASSIGN_PERMISSIONS);
        return false;
      }
    },
    []
  );

  // 打开创建对话框
  const openCreateDialog = useCallback(() => {
    setDialogState({
      type: 'create',
      role: null,
      open: true
    });
  }, []);

  // 打开编辑对话框
  const openEditDialog = useCallback((role: Role) => {
    // 超级管理员角色不能编辑
    if (role.isSuper) {
      toast.error(MESSAGES.INFO.SUPER_ADMIN_PROTECTED);
      return;
    }

    setDialogState({
      type: 'edit',
      role,
      open: true
    });
  }, []);

  // 打开权限分配对话框
  const openPermissionDialog = useCallback(
    async (role: Role) => {
      // 超级管理员角色不能进行权限分配
      if (role.isSuper) {
        toast.error(MESSAGES.INFO.SUPER_ADMIN_PROTECTED);
        return;
      }

      const [permissions, rolePermissions] = await Promise.all([
        fetchAllPermissions(),
        fetchRolePermissions(role.id)
      ]);

      setPermissionDialogState({
        open: true,
        role,
        permissions,
        selectedPermissions: rolePermissions
      });
    },
    [fetchAllPermissions, fetchRolePermissions]
  );

  // 关闭对话框
  const closeDialog = useCallback(() => {
    setDialogState({
      type: null,
      role: null,
      open: false
    });
  }, []);

  // 关闭权限对话框
  const closePermissionDialog = useCallback(() => {
    setPermissionDialogState({
      open: false,
      role: null,
      permissions: [],
      selectedPermissions: []
    });
  }, []);

  return {
    // 状态
    roles,
    loading,
    pagination,
    dialogState,
    permissionDialogState,

    // 操作
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
    assignPermissions,
    openCreateDialog,
    openEditDialog,
    openPermissionDialog,
    closeDialog,
    closePermissionDialog,
    setPermissionDialogState
  };
}
