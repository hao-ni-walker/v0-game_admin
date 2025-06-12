'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Edit } from 'lucide-react';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { PERMISSIONS } from '@/lib/permissions';

// shadcn/ui components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

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

import { PermissionForm } from './components/permission-form';
import PageContainer from '@/components/layout/page-container';

// 类型定义
interface Permission {
  id: number;
  name: string;
  code: string;
  description: string;
  createdAt: string;
}

interface FilterParams {
  name?: string;
  code?: string;
  description?: string;
  dateRange?: { from: Date; to: Date } | undefined;
  page?: number;
  limit?: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function PermissionManagementPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // 状态管理
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // 筛选状态
  const [filters, setFilters] = useState<FilterParams>({
    name: '',
    code: '',
    description: '',
    dateRange: undefined,
    page: 1,
    limit: 10
  });

  // 弹窗状态
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(
    null
  );

  // 从URL初始化筛选条件
  useEffect(() => {
    const urlFilters: FilterParams = {
      name: searchParams.get('name') || '',
      code: searchParams.get('code') || '',
      description: searchParams.get('description') || '',
      dateRange: undefined, // 日期范围暂不从URL同步
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10')
    };
    setFilters(urlFilters);
  }, [searchParams]);

  // 获取权限列表
  const fetchPermissions = useCallback(async (currentFilters: FilterParams) => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (key === 'dateRange' && value) {
          // 处理日期范围
          const dateRange = value as { from: Date; to: Date };
          if (dateRange.from && dateRange.to) {
            const startDateStr = dateRange.from.toISOString().split('T')[0];
            const endDateStr = dateRange.to.toISOString().split('T')[0];
            params.append('startDate', startDateStr);
            params.append('endDate', endDateStr);
          }
        } else if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });

      const response = await fetch(`/api/permissions?${params.toString()}`);
      const result = await response.json();

      setPermissions(result.data || result || []);
      if (result.pagination) {
        setPagination({
          page: result.pagination.page || 1,
          limit: result.pagination.limit || 10,
          total: result.pagination.total || 0,
          totalPages: result.pagination.totalPages || 0
        });
      } else {
        // 如果API没有返回分页信息，手动计算
        const total = Array.isArray(result) ? result.length : 0;
        setPagination({
          page: 1,
          limit: total,
          total,
          totalPages: 1
        });
      }
    } catch (error) {
      toast.error('获取权限列表失败');
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 更新URL和获取数据
  const updateFilters = useCallback(
    (newFilters: Partial<FilterParams>) => {
      const updatedFilters = { ...filters, ...newFilters };

      // 如果是筛选条件变化，重置到第一页
      if (
        Object.keys(newFilters).some((key) => !['page', 'limit'].includes(key))
      ) {
        updatedFilters.page = 1;
      }

      setFilters(updatedFilters);

      // 更新URL
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

  // 初始化
  useEffect(() => {
    fetchPermissions(filters);
  }, [fetchPermissions, filters]);

  const handleCreatePermission = async (values: any) => {
    try {
      const response = await fetch('/api/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      if (response.ok) {
        toast.success('权限创建成功');
        setCreateDialogOpen(false);
        fetchPermissions(filters);
      } else {
        const error = await response.json();
        toast.error(error.message || '创建权限失败');
      }
    } catch (error) {
      toast.error('创建权限失败');
    }
  };

  const handleUpdatePermission = async (values: any) => {
    if (!editingPermission) return;

    try {
      const response = await fetch(`/api/permissions/${editingPermission.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      if (response.ok) {
        toast.success('权限更新成功');
        setEditDialogOpen(false);
        setEditingPermission(null);
        fetchPermissions(filters);
      } else {
        const error = await response.json();
        toast.error(error.message || '更新权限失败');
      }
    } catch (error) {
      toast.error('更新权限失败');
    }
  };

  const handleDeletePermission = async (permission: Permission) => {
    try {
      const response = await fetch(`/api/permissions/${permission.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('权限删除成功');
        fetchPermissions(filters);
      } else {
        const error = await response.json();
        toast.error(error.message || '删除权限失败');
      }
    } catch (error) {
      toast.error('删除权限失败');
    }
  };

  const clearFilters = () => {
    updateFilters({
      name: '',
      code: '',
      description: '',
      dateRange: undefined,
      page: 1
    });
  };

  const hasActiveFilters = checkActiveFilters(filters);

  // 定义筛选字段
  const filterFields: FilterField[] = [
    {
      key: 'name',
      type: 'text',
      label: '权限名称',
      placeholder: '搜索权限名称...',
      width: 'w-60'
    },
    {
      key: 'code',
      type: 'text',
      label: '权限标识',
      placeholder: '搜索权限标识...',
      width: 'w-60'
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
      title: '权限名称',
      className: 'font-medium'
    },
    {
      key: 'code',
      title: '权限标识',
      className: 'font-mono text-sm',
      render: (value: string) => (
        <Badge variant='outline' className='font-mono'>
          {value}
        </Badge>
      )
    },
    {
      key: 'description',
      title: '描述',
      className: 'text-muted-foreground max-w-xs',
      render: (value: string) => (
        <div className='truncate' title={value}>
          {value || '暂无描述'}
        </div>
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
      render: (value: any, record: Permission) => {
        const actions: ActionItem[] = [
          {
            key: 'edit',
            label: '编辑',
            icon: <Edit className='mr-2 h-4 w-4' />,
            onClick: () => {
              setEditingPermission(record);
              setEditDialogOpen(true);
            }
          }
        ];

        const deleteAction: DeleteAction = {
          description: `确定要删除权限 "${record.name}" 吗？此操作不可撤销。`,
          onConfirm: () => handleDeletePermission(record)
        };

        return <ActionDropdown actions={actions} deleteAction={deleteAction} />;
      }
    }
  ];

  return (
    <PermissionGuard permissions={PERMISSIONS.PERMISSION.READ}>
      <PageContainer scrollable={false}>
        <div className='flex h-[calc(100vh-8rem)] w-full flex-col space-y-6'>
          {/* 页面头部 */}
          <PageHeader
            title='权限管理'
            description='管理系统权限和访问控制'
            action={{
              label: '新增权限',
              onClick: () => setCreateDialogOpen(true),
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
              data={permissions}
              loading={loading}
              emptyText='暂无权限数据'
              rowKey='id'
            />

            {/* 分页控件 */}
            <Pagination
              pagination={pagination}
              onPageChange={(page) => updateFilters({ page })}
              onPageSizeChange={(limit) => updateFilters({ limit, page: 1 })}
              pageSizeOptions={[10, 20, 30, 50, 100]}
            />
          </div>

          {/* 新增权限弹窗 */}
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新增权限</DialogTitle>
              </DialogHeader>
              <PermissionForm
                onSubmit={handleCreatePermission}
                onCancel={() => setCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>

          {/* 编辑权限弹窗 */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>编辑权限</DialogTitle>
              </DialogHeader>
              {editingPermission && (
                <PermissionForm
                  initialData={editingPermission}
                  onSubmit={handleUpdatePermission}
                  onCancel={() => {
                    setEditDialogOpen(false);
                    setEditingPermission(null);
                  }}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </PageContainer>
    </PermissionGuard>
  );
}
