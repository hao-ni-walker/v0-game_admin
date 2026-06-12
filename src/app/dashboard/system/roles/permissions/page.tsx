'use client';

import { useEffect, useMemo } from 'react';
import { Pagination } from '@/components/table/pagination';
import PageContainer from '@/components/layout/page-container';
import { toast } from 'sonner';

// 导入类型和常量
import type {
  PermissionFilters,
  PermissionFormData,
  Permission
} from './types';
import { PAGE_SIZE_OPTIONS, MESSAGES } from './constants';

// 导入自定义hooks
import { usePermissionFilters, usePermissionManagement } from './hooks';

// 导入组件
import {
  PermissionPageHeader,
  PermissionFilters as PermissionFiltersComponent,
  PermissionTable,
  PermissionDialogs
} from './components';

export default function PermissionManagementPage() {
  // 使用自定义 hooks
  const { filters, searchFilters, updatePagination, clearFilters } =
    usePermissionFilters();
  const {
    permissions,
    loading,
    pagination,
    dialogState,
    fetchPermissions,
    createPermission,
    updatePermission,
    deletePermission,
    batchDeletePermissions,
    openCreateDialog,
    openEditDialog,
    closeDialog
  } = usePermissionManagement();

  // 构建父级权限映射（用于表格显示父级名称）
  const parentMap = useMemo(() => {
    const map = new Map<number, Permission>();
    permissions.forEach((perm) => {
      map.set(perm.id, perm);
    });
    return map;
  }, [permissions]);

  // 监听 filters 变化，获取权限数据
  useEffect(() => {
    fetchPermissions(filters);
  }, [filters, fetchPermissions]);

  // 业务处理函数
  const handleSearch = (newFilters: Partial<PermissionFilters>) => {
    searchFilters(newFilters);
  };

  const handleReset = () => {
    clearFilters();
  };

  const handleFormSubmit = async (data: PermissionFormData) => {
    let success = false;

    if (dialogState.type === 'create') {
      success = await createPermission(data);
    } else if (dialogState.type === 'edit' && dialogState.permission) {
      success = await updatePermission(dialogState.permission.id, data);
    }

    if (success) {
      closeDialog();
      // 重新获取数据
      fetchPermissions(filters);
    }
  };

  const handleDeletePermission = async (permission: Permission) => {
    const success = await deletePermission(permission.id);
    if (success) {
      // 重新获取数据
      fetchPermissions(filters);
    }
  };

  const handleBatchDelete = async (ids: number[]) => {
    if (ids.length === 0) {
      toast.error('请至少选择一个权限');
      return;
    }

    // 显示确认对话框
    const confirmed = window.confirm(MESSAGES.CONFIRM.BATCH_DELETE(ids.length));

    if (!confirmed) {
      return;
    }

    const success = await batchDeletePermissions(ids);
    if (success) {
      // 重新获取数据
      fetchPermissions(filters);
    }
  };

  return (
    <PageContainer scrollable={false}>
      <div className='flex h-[calc(100vh-8rem)] w-full flex-col space-y-4'>
        {/* 页面头部 */}
        <PermissionPageHeader onCreatePermission={openCreateDialog} />

        {/* 搜索和筛选 */}
        <PermissionFiltersComponent
          filters={filters}
          onSearch={handleSearch}
          onReset={handleReset}
          loading={loading}
        />

        {/* 数据表格 */}
        <div className='flex min-h-0 flex-col'>
          <PermissionTable
            permissions={permissions}
            loading={loading}
            pagination={pagination}
            onEdit={openEditDialog}
            onDelete={handleDeletePermission}
            onBatchDelete={handleBatchDelete}
            parentMap={parentMap}
          />

          {/* 分页控件 */}
          <Pagination
            pagination={pagination}
            onPageChange={(page) => updatePagination(page)}
            onPageSizeChange={(limit) => updatePagination(1, limit)}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
          />
        </div>

        {/* 对话框 */}
        <PermissionDialogs
          dialogState={dialogState}
          onClose={closeDialog}
          onSubmit={handleFormSubmit}
          loading={loading}
        />
      </div>
    </PageContainer>
  );
}
