'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { Role, Permission, FormData } from './types';
import { PermissionAPI, RoleAPI } from '@/service/request';

export function useRoleManagement() {
  // 弹窗状态
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // 权限相关状态
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<number[]>([]);

  // 表单数据
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: ''
  });

  // 获取所有权限
  const fetchAllPermissions = useCallback(async () => {
    try {
      const res = await PermissionAPI.getAllPermissions();
      if (res.code === 0) {
        setAllPermissions(res.data || []);
      } else {
        toast.error(res.message || '获取权限列表失败');
      }
    } catch (error) {
      console.error('获取权限列表失败:', error);
    }
  }, []);

  // 获取角色的权限
  const fetchRolePermissions = useCallback(async (roleId: number) => {
    try {
      const res = await RoleAPI.getRolePermissions(roleId);
      if (res.code === 0) {
        setRolePermissions(res.data.map((p: Permission) => p.id));
      } else {
        toast.error(res.message || '获取角色权限失败');
      }
    } catch (error) {
      console.error('获取角色权限失败:', error);
    }
  }, []);

  // 创建角色
  const handleCreateRole = useCallback(
    async (onSuccess?: () => void) => {
      if (!formData.name.trim()) {
        toast.error('角色名称不能为空');
        return;
      }

      try {
        setFormLoading(true);
        const res = await RoleAPI.createRole(formData);

        if (res.code === 0) {
          toast.success('角色创建成功');
          setCreateDialogOpen(false);
          setFormData({ name: '', description: '' });
          onSuccess?.();
        } else {
          toast.error(res.message || '创建角色失败');
        }
      } catch {
        toast.error('创建角色失败');
      } finally {
        setFormLoading(false);
      }
    },
    [formData]
  );

  // 编辑角色
  const handleEditRole = useCallback(
    async (onSuccess?: () => void) => {
      if (!editingRole || !formData.name.trim()) {
        toast.error('角色名称不能为空');
        return;
      }

      try {
        setFormLoading(true);
        const res = await RoleAPI.updateRole(editingRole.id, formData);

        if (res.code === 0) {
          toast.success('角色更新成功');
          setEditDialogOpen(false);
          setEditingRole(null);
          setFormData({ name: '', description: '' });
          onSuccess?.();
        } else {
          toast.error(res.message || '更新角色失败');
        }
      } catch {
        toast.error('更新角色失败');
      } finally {
        setFormLoading(false);
      }
    },
    [editingRole, formData]
  );

  // 保存权限分配
  const handleSavePermissions = useCallback(
    async (onSuccess?: () => void) => {
      if (!editingRole) return;

      try {
        setFormLoading(true);
        console.log('保存权限:', {
          roleId: editingRole.id,
          permissions: rolePermissions
        });

        const res = await RoleAPI.updateRolePermissions(
          editingRole.id,
          rolePermissions
        );

        if (res.code === 0) {
          toast.success(
            `权限分配成功！已为角色"${editingRole.name}"分配${rolePermissions.length}个权限`
          );
          setPermissionDialogOpen(false);
          setEditingRole(null);
          setRolePermissions([]);
          onSuccess?.();
        } else {
          toast.error(res.message || '权限分配失败');
        }
      } catch {
        toast.error('权限分配失败');
      } finally {
        setFormLoading(false);
      }
    },
    [editingRole, rolePermissions]
  );

  // 删除角色
  const handleDeleteRole = useCallback(
    async (role: Role, onSuccess?: () => void) => {
      try {
        const res = await RoleAPI.deleteRole(role.id);

        if (res.code === 0) {
          toast.success('角色删除成功');
          onSuccess?.();
        } else {
          toast.error(res.message || '删除角色失败');
        }
      } catch {
        toast.error('删除角色失败');
      }
    },
    []
  );

  // 打开新增弹窗
  const openCreateDialog = useCallback(() => {
    setFormData({ name: '', description: '' });
    setCreateDialogOpen(true);
  }, []);

  // 打开编辑弹窗
  const openEditDialog = useCallback((role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || ''
    });
    setEditDialogOpen(true);
  }, []);

  // 打开权限分配弹窗
  const openPermissionDialog = useCallback(
    async (role: Role) => {
      setEditingRole(role);
      await fetchAllPermissions();
      await fetchRolePermissions(role.id);
      setPermissionDialogOpen(true);
    },
    [fetchAllPermissions, fetchRolePermissions]
  );

  // 关闭权限分配弹窗时重置状态
  const closePermissionDialog = useCallback(() => {
    setPermissionDialogOpen(false);
    setEditingRole(null);
    setRolePermissions([]);
  }, []);

  return {
    // 状态
    createDialogOpen,
    editDialogOpen,
    permissionDialogOpen,
    editingRole,
    formLoading,
    allPermissions,
    rolePermissions,
    formData,

    // 设置器
    setCreateDialogOpen,
    setEditDialogOpen,
    setPermissionDialogOpen: closePermissionDialog,
    setRolePermissions,
    setFormData,

    // 操作函数
    handleCreateRole,
    handleEditRole,
    handleSavePermissions,
    handleDeleteRole,
    openCreateDialog,
    openEditDialog,
    openPermissionDialog
  };
}
