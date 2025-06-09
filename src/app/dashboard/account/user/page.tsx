'use client';

import { DataTable } from '@/components/table/data-table';
import { columns as baseColumns } from './columns';
import React, { useEffect, useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/common/heading';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Suspense } from 'react';
import { SearchParams } from 'nuqs/server';
import { searchParamsCache, serialize } from '@/lib/searchparams';
import { DataTableSkeleton } from '@/components/table/data-table-skeleton';
import { toast } from 'sonner';
import { UserForm } from './components/user-form';
import { DataTableToolbar } from '@/components/table/data-table-toolbar';
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  ColumnFiltersState
} from '@tanstack/react-table';

type pageProps = {
  searchParams: Promise<SearchParams>;
};

export default function UserManagementPage(props: pageProps) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [roles, setRoles] = useState([]);

  // 创建动态列定义
  const columns = React.useMemo(() => {
    const roleOptions = roles.map((role: any) => ({
      label: role.name,
      value: role.name
    }));

    return baseColumns.map((column: any) => {
      if (column.accessorKey === 'roleName' && column.meta) {
        return {
          ...column,
          meta: {
            ...column.meta,
            options: roleOptions
          }
        };
      }
      return column;
    });
  }, [roles]);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/roles');
      const data = await response.json();
      setRoles(data);
    } catch (error) {
      console.error('获取角色列表失败:', error);
    }
  };

  const handleCreateOrUpdateUser = async (values: any) => {
    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
      const method = editingUser ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      });

      if (response.ok) {
        toast.success(editingUser ? '用户更新成功' : '用户创建成功');
        setOpen(false);
        fetchUsers();
        setEditingUser(null);
      } else {
        toast.error(editingUser ? '更新用户失败' : '创建用户失败');
      }
    } catch (error) {
      toast.error(editingUser ? '更新用户失败' : '创建用户失败');
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users'); // 修改 API 请求，包含角色信息
      const data = await response.json();
      setUsers(
        data.map((user: any) => ({
          ...user,
          roleName: user.role?.name || '未分配' // 添加角色名称显示
        }))
      );
    } catch (error) {
      toast.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setOpen(true);
  };

  const handleDelete = async (user: any) => {
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('用户删除成功');
        fetchUsers();
      } else {
        toast.error('删除用户失败');
      }
    } catch (error) {
      toast.error('删除用户失败');
    }
  };

  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading title='用户管理' description='管理所有用户' />
          <Button
            onClick={() => {
              setEditingUser(null);
              setOpen(true);
            }}
            className={cn(buttonVariants(), 'text-xs md:text-sm')}
          >
            <Plus className='mr-2 h-4 w-4' />
            新增用户
          </Button>
        </div>
        <Separator />
        {loading ? (
          <DataTableSkeleton columnCount={5} rowCount={8} filterCount={2} />
        ) : (
          <UserDataTable
            columns={columns}
            data={users}
            totalItems={users.length}
            meta={{
              onEdit: handleEdit,
              onDelete: handleDelete
            }}
          />
        )}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? '编辑用户' : '新增用户'}</DialogTitle>
          </DialogHeader>
          <UserForm
            initialData={editingUser}
            onSubmit={handleCreateOrUpdateUser}
            onCancel={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

// 用户数据表格组件（集成了工具栏和筛选功能）
function UserDataTable({ columns, data, totalItems, meta }: any) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters
    },
    onColumnFiltersChange: setColumnFilters,
    meta
  });

  return (
    <div className='flex flex-1 flex-col space-y-4'>
      <DataTableToolbar table={table} />
      <div className='flex flex-1 flex-col'>
        <DataTable
          columns={columns}
          data={data}
          totalItems={totalItems}
          meta={meta}
        />
      </div>
    </div>
  );
}
