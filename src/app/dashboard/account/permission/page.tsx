'use client';

import React, { useEffect, useState } from 'react';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { PERMISSIONS } from '@/lib/permissions';
import { Pagination } from '@/components/custom-table';
import PageContainer from '@/components/layout/page-container';

// 导入类型和常量
import type { PermissionFilters, PermissionFormData } from './types';
import { PAGE_SIZE_OPTIONS } from './constants';

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
  // 自定义hooks
  const { parseFiltersFromUrl, updatePagination, searchFilters, clearFilters } =
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
    openCreateDialog,
    openEditDialog,
    closeDialog
  } = usePermissionManagement();

  // 当前筛选条件
  const [currentFilters, setCurrentFilters] = useState<PermissionFilters>(() =>
    parseFiltersFromUrl()
  );

  // 监听URL变化，同步筛选条件
  useEffect(() => {
    const filters = parseFiltersFromUrl();
    setCurrentFilters(filters);
    fetchPermissions(filters);
  }, [parseFiltersFromUrl, fetchPermissions]);

  // 业务处理函数
  const handleSearch = (newFilters: Partial<PermissionFilters>) => {
    const updatedFilters = { ...currentFilters, ...newFilters };
    setCurrentFilters(updatedFilters);
    searchFilters(newFilters);
  };

  const handleReset = () => {
    clearFilters();
    setCurrentFilters(parseFiltersFromUrl());
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
      const filters = parseFiltersFromUrl();
      fetchPermissions(filters);
    }
  };

  const handleDeletePermission = async (permission: any) => {
    const success = await deletePermission(permission.id);
    if (success) {
      // 重新获取数据
      const filters = parseFiltersFromUrl();
      fetchPermissions(filters);
    }
  };

  return (
    <PermissionGuard permissions={PERMISSIONS.PERMISSION.READ}>
      <PageContainer scrollable={false}>
        <div className='flex h-[calc(100vh-8rem)] w-full flex-col space-y-4'>
          {/* 页面头部 */}
          <PermissionPageHeader onCreatePermission={openCreateDialog} />

          {/* 搜索和筛选 */}
          <PermissionFiltersComponent
            filters={currentFilters}
            onSearch={handleSearch}
            onReset={handleReset}
            loading={loading}
          />

          {/* 数据表格 */}
          <div className='flex min-h-0 flex-col overflow-hidden'>
            <div className='flex-1 overflow-auto'>
              <PermissionTable
                permissions={permissions}
                loading={loading}
                onEdit={openEditDialog}
                onDelete={handleDeletePermission}
              />
            </div>

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
          />
        </div>
      </PageContainer>
    </PermissionGuard>
  );
}
