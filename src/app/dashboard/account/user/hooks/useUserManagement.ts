import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  User,
  Role,
  UserFilters,
  PaginationInfo,
  UserFormData
} from '../types';
import { DEFAULT_PAGINATION, MESSAGES } from '../constants';
import { RoleAPI } from '@/service/request';
import { apiRequest, buildSearchParams } from '@/service/api/base';

/**
 * 用户管理业务逻辑 Hook
 * 负责用户数据的增删改查和角色数据获取
 */
export function useUserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] =
    useState<PaginationInfo>(DEFAULT_PAGINATION);

  /**
   * 获取角色列表
   */
  const fetchRoles = useCallback(async () => {
    try {
      const res = await RoleAPI.getAllRoles();
      if (res.code === 0) {
        setRoles(res.data || []);
      } else {
        toast.error(res.message || MESSAGES.ERROR.FETCH_ROLES);
      }
    } catch (error) {
      console.error('获取角色列表失败:', error);
      toast.error(MESSAGES.ERROR.FETCH_ROLES);
    }
  }, []);

  /**
   * 获取用户列表
   */
  const fetchUsers = useCallback(async (filters: UserFilters) => {
    try {
      setLoading(true);

      // 构建查询参数
      const params: Record<string, any> = {
        page: filters.page || 1,
        page_size: filters.limit || 10
      };

      // 处理筛选条件
      if (filters.username) {
        params.username = filters.username;
      }
      if (filters.email) {
        params.email = filters.email;
      }
      if (filters.roleId && filters.roleId !== '') {
        params.role_id = filters.roleId;
      }
      if (filters.status && filters.status !== 'all') {
        params.status = filters.status;
      }

      // 处理日期范围
      if (filters.dateRange) {
        const dateRange = filters.dateRange as { from: Date; to: Date };
        if (dateRange.from && dateRange.to) {
          params.created_at_start = dateRange.from.toISOString();
          params.created_at_end = dateRange.to.toISOString();
        }
      }

      const searchParams = buildSearchParams(params);
      const res = await apiRequest<{
        total: number;
        page: number;
        page_size: number;
        items: Array<{
          id: number;
          username: string;
          email: string;
          avatar: string | null;
          role_id: number;
          role_name: string;
          is_super_admin: boolean;
          status: string;
          last_login_at: string;
          login_error_count: number;
          lock_time: string | null;
          created_at: string;
          updated_at: string;
        }>;
      }>(`/admin/admins${searchParams ? `?${searchParams}` : ''}`);

      if (res.code === 0 && res.data) {
        // 转换数据格式：将 API 返回的字段转换为前端期望的格式
        const users: User[] = (res.data.items || []).map((item) => ({
          id: item.id,
          username: item.username,
          email: item.email,
          avatar: item.avatar,
          roleId: item.role_id,
          roleName: item.role_name,
          createdAt: item.created_at,
          lastLoginAt: item.last_login_at,
          status: item.status as 'active' | 'disabled',
          isSuperAdmin: item.is_super_admin,
          loginErrorCount: item.login_error_count,
          lockTime: item.lock_time,
          updatedAt: item.updated_at,
          role: {
            id: item.role_id,
            name: item.role_name
          }
        }));

        setUsers(users);

        // 计算总页数
        const totalPages = Math.ceil(
          res.data.total / (res.data.page_size || 10)
        );

        setPagination({
          page: res.data.page || 1,
          limit: res.data.page_size || 10,
          total: res.data.total || 0,
          totalPages
        });
      } else {
        toast.error(res.message || MESSAGES.ERROR.FETCH_USERS);
        setUsers([]);
      }
    } catch (error) {
      console.error('获取用户列表失败:', error);
      toast.error(MESSAGES.ERROR.FETCH_USERS);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 创建用户
   */
  const createUser = useCallback(
    async (data: UserFormData): Promise<boolean> => {
      try {
        const res = await UserAPI.createUser(data);
        if (res.code === 0) {
          toast.success(MESSAGES.SUCCESS.CREATE);
          return true;
        } else {
          toast.error(res.message || MESSAGES.ERROR.CREATE);
          return false;
        }
      } catch (error) {
        console.error('创建用户失败:', error);
        toast.error(MESSAGES.ERROR.CREATE);
        return false;
      }
    },
    []
  );

  /**
   * 更新用户
   */
  const updateUser = useCallback(
    async (id: number, data: Partial<UserFormData>): Promise<boolean> => {
      try {
        const res = await UserAPI.updateUser(id, data);
        if (res.code === 0) {
          toast.success(MESSAGES.SUCCESS.UPDATE);
          return true;
        } else {
          toast.error(res.message || MESSAGES.ERROR.UPDATE);
          return false;
        }
      } catch (error) {
        console.error('更新用户失败:', error);
        toast.error(MESSAGES.ERROR.UPDATE);
        return false;
      }
    },
    []
  );

  /**
   * 删除用户
   */
  const deleteUser = useCallback(async (id: number): Promise<boolean> => {
    try {
      const res = await UserAPI.deleteUser(id);
      if (res.code === 0) {
        toast.success(MESSAGES.SUCCESS.DELETE);
        return true;
      } else {
        toast.error(res.message || MESSAGES.ERROR.DELETE);
        return false;
      }
    } catch (error) {
      console.error('删除用户失败:', error);
      toast.error(MESSAGES.ERROR.DELETE);
      return false;
    }
  }, []);

  // 初始化时获取角色列表
  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return {
    // 状态
    users,
    roles,
    loading,
    pagination,

    // 方法
    fetchUsers,
    fetchRoles,
    createUser,
    updateUser,
    deleteUser
  };
}
