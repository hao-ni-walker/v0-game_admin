'use client';

import { DataTable } from '@/components/table/data-table';
import { columns } from './columns';
import React, { useEffect, useState } from 'react';
import {
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  ColumnFiltersState
} from '@tanstack/react-table';
import { DataTableToolbar } from '@/components/table/data-table-toolbar';
import PageContainer from '@/components/layout/page-container';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/common/heading';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { DataTableSkeleton } from '@/components/table/data-table-skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { PermissionForm } from './components/permission-form';

export default function PermissionManagementPage() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<any>(null);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = React.useCallback(
    async (filters?: Record<string, any>) => {
      try {
        setLoading(true);

        // 构建查询参数
        const params = new URLSearchParams();
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value && value !== '') {
              // 处理日期范围
              if (key === 'createdAt' && Array.isArray(value)) {
                if (value[0]) params.append('startDate', value[0]);
                if (value[1]) params.append('endDate', value[1]);
              } else {
                params.append(key, value);
              }
            }
          });
        }

        const url = `/api/permissions${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await fetch(url);
        const data = await response.json();
        setPermissions(data);
      } catch (error) {
        toast.error('获取权限列表失败');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleCreateOrUpdatePermission = async (values: any) => {
    try {
      const url = editingPermission
        ? `/api/permissions/${editingPermission.id}`
        : '/api/permissions';
      const method = editingPermission ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      if (response.ok) {
        toast.success(editingPermission ? '权限更新成功' : '权限创建成功');
        setOpen(false);
        fetchPermissions();
        setEditingPermission(null);
      }
    } catch (error) {
      toast.error(editingPermission ? '更新权限失败' : '创建权限失败');
    }
  };

  const handleDelete = async (permission: any) => {
    try {
      const response = await fetch(`/api/permissions/${permission.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('权限删除成功');
        fetchPermissions();
      }
    } catch (error) {
      toast.error('删除权限失败');
    }
  };

  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading title='权限管理' description='管理系统权限' />
          <Button
            onClick={() => {
              setEditingPermission(null);
              setOpen(true);
            }}
          >
            <Plus className='mr-2 h-4 w-4' />
            新增权限
          </Button>
        </div>
        <Separator />
        {loading ? (
          <DataTableSkeleton columnCount={5} rowCount={8} filterCount={2} />
        ) : (
          <PermissionDataTable
            columns={columns}
            data={permissions}
            totalItems={permissions.length}
            meta={{
              onEdit: (permission: any) => {
                setEditingPermission(permission);
                setOpen(true);
              },
              onDelete: handleDelete
            }}
            onFiltersChange={fetchPermissions}
          />
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPermission ? '编辑权限' : '新增权限'}
            </DialogTitle>
          </DialogHeader>
          <PermissionForm
            initialData={editingPermission}
            onSubmit={handleCreateOrUpdatePermission}
            onCancel={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

// 权限数据表格组件（集成了工具栏和筛选功能）
function PermissionDataTable({
  columns,
  data,
  totalItems,
  meta,
  onFiltersChange
}: any) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  // 使用 ref 存储回调函数，避免依赖变化
  const onFiltersChangeRef = React.useRef(onFiltersChange);
  onFiltersChangeRef.current = onFiltersChange;

  // 监听筛选条件变化，触发API请求
  React.useEffect(() => {
    const filters: Record<string, any> = {};
    columnFilters.forEach((filter) => {
      filters[filter.id] = filter.value;
    });

    // 如果没有任何筛选条件，立即请求
    const hasFilters = Object.values(filters).some(
      (value) => value && value !== ''
    );

    const timeoutId = setTimeout(
      () => {
        onFiltersChangeRef.current?.(hasFilters ? filters : undefined);
      },
      hasFilters ? 800 : 0
    ); // 有筛选条件时延迟800ms

    return () => clearTimeout(timeoutId);
  }, [columnFilters]); // 移除 onFiltersChange 依赖

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      columnFilters
    },
    onColumnFiltersChange: setColumnFilters,
    meta,
    // 禁用前端筛选，因为我们使用后端筛选
    manualFiltering: true
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
