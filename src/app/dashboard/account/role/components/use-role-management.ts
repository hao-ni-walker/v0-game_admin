'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { Role, Permission, FormData } from './types';

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
      const response = await fetch('/api/permissions/all');
      const result = await response.json();
      setAllPermissions(result.data || result || []);
    } catch (error) {
      console.error('获取权限列表失败:', error);
    }
  }, []);

  // 获取角色的权限
  const fetchRolePermissions = useCallback(async (roleId: number) => {
    try {
      const response = await fetch(`/api/roles/${roleId}/permissions`);
      const permissions = await response.json();
      setRolePermissions(permissions.map((p: Permission) => p.id));
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
        const response = await fetch('/api/roles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          toast.success('角色创建成功');
          setCreateDialogOpen(false);
          setFormData({ name: '', description: '' });
          onSuccess?.();
        } else {
          const error = await response.json();
          toast.error(error.message || '创建角色失败');
        }
      } catch (error) {
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
        const response = await fetch(`/api/roles/${editingRole.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          toast.success('角色更新成功');
          setEditDialogOpen(false);
          setEditingRole(null);
          setFormData({ name: '', description: '' });
          onSuccess?.();
        } else {
          const error = await response.json();
          toast.error(error.message || '更新角色失败');
        }
      } catch (error) {
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

        const response = await fetch(
          `/api/roles/${editingRole.id}/permissions`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ permissionIds: rolePermissions })
          }
        );

        if (response.ok) {
          toast.success(
            `权限分配成功！已为角色"${editingRole.name}"分配${rolePermissions.length}个权限`
          );
          setPermissionDialogOpen(false);
          setEditingRole(null);
          setRolePermissions([]);
          onSuccess?.();
        } else {
          const error = await response.json();
          toast.error(error.message || '权限分配失败');
        }
      } catch (error) {
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
        const response = await fetch(`/api/roles/${role.id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          toast.success('角色删除成功');
          onSuccess?.();
        } else {
          const error = await response.json();
          toast.error(error.message || '删除角色失败');
        }
      } catch (error) {
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
