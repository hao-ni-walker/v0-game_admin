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

import { UserForm } from './components/user-form';
import PageContainer from '@/components/layout/page-container';
import { RoleAPI, UserAPI } from '@/service/request';

// 类型定义
interface User {
  id: number;
  username: string;
  email: string;
  roleId: string;
  createdAt: string;
  role?: {
    id: number;
    name: string;
  };
}

interface FilterParams {
  username?: string;
  email?: string;
  roleId?: string;
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

export default function UserManagementPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // 状态管理
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // 筛选状态
  const [filters, setFilters] = useState<FilterParams>({
    username: '',
    email: '',
    roleId: '',
    dateRange: undefined,
    page: 1,
    limit: 10
  });

  // 弹窗状态
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // 从URL初始化筛选条件
  useEffect(() => {
    const urlFilters: FilterParams = {
      username: searchParams.get('username') || '',
      email: searchParams.get('email') || '',
      roleId: searchParams.get('roleId') || '',
      dateRange: undefined, // 日期范围暂不从URL同步
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10')
    };
    setFilters(urlFilters);
  }, [searchParams]);

  // 获取角色列表
  const fetchRoles = async () => {
    try {
      const res = await RoleAPI.getAllRoles();
      if (res.code === 0) {
        setRoles(res.data);
      } else {
        toast.error(res.message || '获取角色列表失败');
      }
    } catch (error) {
      console.error('获取角色列表失败:', error);
    }
  };

  // 获取用户列表
  const fetchUsers = useCallback(async (currentFilters: FilterParams) => {
    try {
      setLoading(true);

      const params: Record<string, any> = {};
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (key === 'dateRange' && value) {
          // 处理日期范围
          const dateRange = value as { from: Date; to: Date };
          if (dateRange.from && dateRange.to) {
            const startDateStr = dateRange.from.toISOString().split('T')[0];
            const endDateStr = dateRange.to.toISOString().split('T')[0];
            params.startDate = startDateStr;
            params.endDate = endDateStr;
          }
        } else if (value !== undefined && value !== null && value !== '') {
          params[key] = value;
        }
      });

      const res = await UserAPI.getUsers(params);
      if (res.code === 0) {
        setUsers(res.data || []);
      } else {
        toast.error(res.message || '获取用户列表失败');
      }
      setPagination({
        page: res.pager?.page || 1,
        limit: res.pager?.limit || 10,
        total: res.pager?.total || 0,
        totalPages: res.pager?.totalPages || 0
      });
    } catch (error) {
      toast.error('获取用户列表失败');
      setUsers([]);
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
    fetchRoles();
  }, []);

  // 监听filters变化
  useEffect(() => {
    fetchUsers(filters);
  }, [fetchUsers, filters]);

  const handleCreateUser = async (values: any) => {
    try {
      const res = await UserAPI.createUser(values);

      if (res.code === 0) {
        toast.success('用户创建成功');
        setCreateDialogOpen(false);
        fetchUsers(filters);
      } else {
        toast.error(res.message || '创建用户失败');
      }
    } catch (error) {
      toast.error('创建用户失败');
    }
  };

  const handleUpdateUser = async (values: any) => {
    if (!editingUser) return;

    try {
      const res = await UserAPI.updateUser(editingUser.id, values);

      if (res.code === 0) {
        toast.success('用户更新成功');
        setEditDialogOpen(false);
        setEditingUser(null);
        fetchUsers(filters);
      } else {
        toast.error(res.message || '更新用户失败');
      }
    } catch (error) {
      toast.error('更新用户失败');
    }
  };

  const handleDeleteUser = async (user: User) => {
    try {
      const res = await UserAPI.deleteUser(user.id);

      if (res.code === 0) {
        toast.success('用户删除成功');
        fetchUsers(filters);
      } else {
        toast.error(res.message || '删除用户失败');
      }
    } catch (error) {
      toast.error('删除用户失败');
    }
  };

  const clearFilters = () => {
    updateFilters({
      username: '',
      email: '',
      roleId: '',
      dateRange: undefined,
      page: 1
    });
  };

  const hasActiveFilters = checkActiveFilters(filters);

  // 定义筛选字段
  const filterFields: FilterField[] = [
    {
      key: 'username',
      type: 'text',
      label: '用户名',
      placeholder: '搜索用户名...',
      width: 'w-80'
    },
    {
      key: 'roleId',
      type: 'select',
      label: '角色',
      placeholder: '全部角色',
      options: roles.map((role) => ({
        label: role.name,
        value: String(role.id)
      })),
      width: 'w-40'
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
      key: 'username',
      title: '用户名',
      className: 'font-medium'
    },
    {
      key: 'email',
      title: '邮箱',
      className: 'text-muted-foreground'
    },
    {
      key: 'role',
      title: '角色',
      render: (value: any, record: User) =>
        record.role?.name ? (
          <Badge variant='secondary'>{record.role.name}</Badge>
        ) : (
          <span className='text-muted-foreground'>未分配</span>
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
      render: (value: any, record: User) => {
        const actions: ActionItem[] = [
          {
            key: 'edit',
            label: '编辑',
            icon: <Edit className='mr-2 h-4 w-4' />,
            onClick: () => {
              setEditingUser(record);
              setEditDialogOpen(true);
            }
          }
        ];

        const deleteAction: DeleteAction = {
          description: `确定要删除用户 "${record.username}" 吗？此操作不可撤销。`,
          onConfirm: () => handleDeleteUser(record)
        };

        return <ActionDropdown actions={actions} deleteAction={deleteAction} />;
      }
    }
  ];

  return (
    <PermissionGuard permissions={PERMISSIONS.USER.READ}>
      <PageContainer scrollable={false}>
        <div className='flex h-[calc(100vh-8rem)] w-full flex-col space-y-6'>
          {/* 页面头部 */}
          <PageHeader
            title='用户管理'
            description='管理系统用户账户和权限'
            action={{
              label: '新增用户',
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
              data={users}
              loading={loading}
              emptyText='暂无用户数据'
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

          {/* 新增用户弹窗 */}
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新增用户</DialogTitle>
              </DialogHeader>
              <UserForm
                onSubmit={handleCreateUser}
                onCancel={() => setCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>

          {/* 编辑用户弹窗 */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>编辑用户</DialogTitle>
              </DialogHeader>
              {editingUser && (
                <UserForm
                  initialData={editingUser}
                  onSubmit={handleUpdateUser}
                  onCancel={() => {
                    setEditDialogOpen(false);
                    setEditingUser(null);
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
