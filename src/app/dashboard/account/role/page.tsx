'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Edit, Users, Settings } from 'lucide-react';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { PERMISSIONS } from '@/lib/permissions';

// 组件导入
import {
  RoleFormDialog,
  PermissionAssignDialog,
  useRoleManagement,
  type Role,
  type FilterParams,
  type PaginationInfo
} from './components';

// 表格相关组件
import {
  SearchFilter,
  DataTable,
  Pagination,
  ActionDropdown,
  PageHeader,
  formatDateTime,
  hasActiveFilters as checkActiveFilters,
  type ActionItem,
  type DeleteAction,
  type FilterField
} from '@/components/custom-table';
import { Badge } from '@/components/ui/badge';

import PageContainer from '@/components/layout/page-container';
import { RoleAPI } from '@/service/request';

export default function RoleManagementPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const [filters, setFilters] = useState<FilterParams>({
    name: '',
    dateRange: undefined,
    page: 1,
    limit: 10
  });

  // 使用自定义 Hook 管理角色相关状态
  const roleManagement = useRoleManagement();

  // 从URL初始化筛选条件
  useEffect(() => {
    const urlFilters: FilterParams = {
      name: searchParams.get('name') || '',
      dateRange: undefined, // 日期范围暂不从URL同步
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10')
    };
    setFilters(urlFilters);
  }, [searchParams]);

  // 获取角色列表
  const fetchRoles = useCallback(async (currentFilters: FilterParams) => {
    try {
      setLoading(true);

      const params: Record<string, any> = {};
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (key === 'dateRange' && value) {
          // 处理日期范围
          const dateRange = value as { from: Date; to: Date };
          if (dateRange.from && dateRange.to) {
            params.startDate = dateRange.from.toISOString().split('T')[0];
            params.endDate = dateRange.to.toISOString().split('T')[0];
          }
        } else if (value !== undefined && value !== null && value !== '') {
          params[key] = value;
        }
      });

      const res = await RoleAPI.getRoles(params);
      if (res.code === 0) {
        setRoles(res.data || []);
      } else {
        toast.error(res.message || '获取角色列表失败');
      }

      if (res.pager) {
        setPagination({
          page: res.pager.page || 1,
          limit: res.pager.limit || 10,
          total: res.pager.total || 0,
          totalPages: res.pager.totalPages || 0
        });
      } else {
        // 如果API没有返回分页信息，手动计算
        const total = res.data.length || 0;
        setPagination({
          page: 1,
          limit: total,
          total,
          totalPages: 1
        });
      }
    } catch {
      toast.error('获取角色列表失败');
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 更新筛选条件
  const updateFilters = useCallback(
    (newFilters: Partial<FilterParams>) => {
      const updatedFilters = { ...filters, ...newFilters };

      if (
        Object.keys(newFilters).some((key) => !['page', 'limit'].includes(key))
      ) {
        updatedFilters.page = 1;
      }

      setFilters(updatedFilters);

      const params = new URLSearchParams();
      Object.entries(updatedFilters).forEach(([key, value]) => {
        if (key === 'dateRange') {
          // 日期范围不同步到URL，避免复杂性
          return;
        }
        if (value !== undefined && value !== null && value !== '') {
          params.set(key, String(value));
        }
      });

      router.push(`?${params.toString()}`);
    },
    [filters, router]
  );

  useEffect(() => {
    fetchRoles(filters);
  }, [fetchRoles, filters]);

  // 定义筛选字段
  const filterFields: FilterField[] = [
    {
      key: 'name',
      type: 'text',
      label: '角色名称',
      placeholder: '搜索角色名称...',
      width: 'w-80'
    },
    {
      key: 'dateRange',
      type: 'dateRange',
      label: '创建时间',
      placeholder: '选择时间范围',
      width: 'w-60'
    }
  ];

  // 定义表格列
  const columns = [
    {
      key: 'id',
      title: 'ID',
      className: 'text-center w-[60px] font-mono text-sm text-muted-foreground'
    },
    {
      key: 'name',
      title: '角色名称',
      className: 'font-medium'
    },
    {
      key: 'description',
      title: '描述',
      className: 'text-muted-foreground'
    },
    {
      key: 'userCount',
      title: '用户数量',
      render: (value: number) => (
        <Badge variant='outline' className='flex w-fit items-center gap-1'>
          <Users className='h-3 w-3' />
          {value || 0}
        </Badge>
      )
    },
    {
      key: 'createdAt',
      title: '创建时间',
      className: 'text-muted-foreground',
      render: (value: string) => formatDateTime(value)
    },
    {
      key: 'actions',
      title: '操作',
      className: 'text-center w-[100px]',
      render: (value: unknown, record: Role) => {
        const actions: ActionItem[] = [
          {
            key: 'edit',
            label: '编辑',
            icon: <Edit className='mr-2 h-4 w-4' />,
            onClick: () => roleManagement.openEditDialog(record)
          },
          {
            key: 'permissions',
            label: '权限分配',
            icon: <Settings className='mr-2 h-4 w-4' />,
            onClick: () => roleManagement.openPermissionDialog(record)
          }
        ];

        const deleteAction: DeleteAction = {
          description: `确定要删除角色 "${record.name}" 吗？此操作不可撤销。`,
          onConfirm: () =>
            roleManagement.handleDeleteRole(record, () => fetchRoles(filters))
        };

        return <ActionDropdown actions={actions} deleteAction={deleteAction} />;
      }
    }
  ];

  return (
    <PermissionGuard permissions={PERMISSIONS.ROLE.READ}>
      <PageContainer scrollable={false}>
        <div className='flex h-[calc(100vh-8rem)] w-full flex-col space-y-6'>
          {/* 页面头部 */}
          <PageHeader
            title='角色管理'
            description='管理系统角色和权限'
            action={{
              label: '新增角色',
              onClick: roleManagement.openCreateDialog,
              icon: <Plus className='mr-2 h-4 w-4' />
            }}
          />

          {/* 搜索和筛选 */}
          <SearchFilter
            fields={filterFields}
            values={filters}
            onValuesChange={updateFilters}
            debounceDelay={500}
          />

          {/* 数据表格 */}
          <div className='flex min-h-0 flex-1 flex-col'>
            <DataTable
              columns={columns}
              data={roles}
              loading={loading}
              emptyText='暂无角色数据'
              rowKey='id'
            />

            {/* 分页控件 */}
            <Pagination
              pagination={pagination}
              onPageChange={(page) => updateFilters({ page })}
              onPageSizeChange={(limit) => updateFilters({ limit, page: 1 })}
              pageSizeOptions={[10, 20, 30, 50]}
            />
          </div>

          {/* 新增/编辑角色弹窗 */}
          <RoleFormDialog
            open={roleManagement.createDialogOpen}
            onOpenChange={roleManagement.setCreateDialogOpen}
            mode='create'
            formData={roleManagement.formData}
            onFormDataChange={roleManagement.setFormData}
            onSubmit={() =>
              roleManagement.handleCreateRole(() => fetchRoles(filters))
            }
            loading={roleManagement.formLoading}
          />

          <RoleFormDialog
            open={roleManagement.editDialogOpen}
            onOpenChange={roleManagement.setEditDialogOpen}
            mode='edit'
            role={roleManagement.editingRole}
            formData={roleManagement.formData}
            onFormDataChange={roleManagement.setFormData}
            onSubmit={() =>
              roleManagement.handleEditRole(() => fetchRoles(filters))
            }
            loading={roleManagement.formLoading}
          />

          {/* 权限分配弹窗 */}
          <PermissionAssignDialog
            open={roleManagement.permissionDialogOpen}
            onOpenChange={roleManagement.setPermissionDialogOpen}
            role={roleManagement.editingRole}
            permissions={roleManagement.allPermissions}
            selectedPermissions={roleManagement.rolePermissions}
            onPermissionsChange={roleManagement.setRolePermissions}
            onSave={() =>
              roleManagement.handleSavePermissions(() => fetchRoles(filters))
            }
            loading={roleManagement.formLoading}
          />
        </div>
      </PageContainer>
    </PermissionGuard>
  );
}
