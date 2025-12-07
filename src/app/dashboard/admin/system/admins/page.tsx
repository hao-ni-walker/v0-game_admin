'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw, CheckCircle, Ban } from 'lucide-react';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/shared/heading';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { PermissionGuard } from '@/components/auth/permission-guard';
import {
  FilterBar,
  StatisticsCards,
  AdminTable,
  AdminDetailDrawer,
  AdminEditModal,
  PasswordResetModal,
  StatusChangeConfirmModal
} from './components';
import { useAdminManagement } from './hooks/use-admin-management';
import { useAdminFilters } from './hooks/use-admin-filters';
import {
  Admin,
  AdminDetail,
  CreateAdminFormData,
  EditAdminFormData,
  StatusChangeData,
  PasswordResetFormData
} from './types';
import { useAuthStore } from '@/stores/auth';

/**
 * 管理员用户管理页面
 */
export default function AdminManagementPage() {
  const { session } = useAuthStore();
  const currentUserId = session?.user?.id;
  const { appliedFilters } = useAdminFilters();
  const {
    admins,
    loading,
    pagination,
    sort,
    statistics,
    statisticsLoading,
    roles,
    rolesLoading,
    fetchAdmins,
    fetchAdminDetail,
    fetchStatistics,
    fetchRoles,
    createAdmin,
    updateAdmin,
    updateAdminStatus,
    updateAdminPassword,
    deleteAdmin,
    setPage,
    setPageSize,
    setSort
  } = useAdminManagement();

  // 弹窗状态
  const [selectedAdminIds, setSelectedAdminIds] = useState<number[]>([]);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<AdminDetail | null>(null);
  const [currentAdminForAction, setCurrentAdminForAction] =
    useState<Admin | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);

  // 加载角色列表
  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // 加载数据
  useEffect(() => {
    fetchAdmins({
      filters: appliedFilters,
      page: pagination.page,
      pageSize: pagination.page_size,
      sortBy: sort.sort_by,
      sortOrder: sort.sort_order
    });
  }, [
    appliedFilters,
    pagination.page,
    pagination.page_size,
    sort.sort_by,
    sort.sort_order,
    fetchAdmins
  ]);

  // 加载统计数据
  useEffect(() => {
    fetchStatistics(appliedFilters);
  }, [appliedFilters, fetchStatistics]);

  // 查看详情
  const handleViewDetail = useCallback(
    async (admin: Admin) => {
      setCurrentAdmin(null);
      setDetailDrawerOpen(true);
      const adminDetail = await fetchAdminDetail(admin.id);
      if (adminDetail) {
        setCurrentAdmin(adminDetail);
      }
    },
    [fetchAdminDetail]
  );

  // 编辑管理员
  const handleEdit = useCallback(
    async (admin: Admin | AdminDetail) => {
      if ('role' in admin && admin.role) {
        setCurrentAdmin(admin as AdminDetail);
      } else {
        const adminDetail = await fetchAdminDetail(admin.id);
        if (adminDetail) {
          setCurrentAdmin(adminDetail);
        }
      }
      setIsCreateMode(false);
      setEditModalOpen(true);
    },
    [fetchAdminDetail]
  );

  // 新建管理员
  const handleCreate = useCallback(() => {
    setCurrentAdmin(null);
    setIsCreateMode(true);
    setEditModalOpen(true);
  }, []);

  // 保存编辑/创建
  const handleSaveEdit = useCallback(
    async (
      data: CreateAdminFormData | EditAdminFormData,
      isCreate: boolean
    ): Promise<boolean> => {
      let success = false;

      if (isCreate) {
        success = await createAdmin(data as CreateAdminFormData);
      } else if (currentAdmin) {
        success = await updateAdmin(currentAdmin.id, data as EditAdminFormData);
      }

      if (success) {
        // 刷新列表和统计
        fetchAdmins({
          filters: appliedFilters,
          page: pagination.page,
          pageSize: pagination.page_size,
          sortBy: sort.sort_by,
          sortOrder: sort.sort_order
        });
        fetchStatistics(appliedFilters);
        // 如果详情抽屉打开，刷新详情
        if (currentAdmin && !isCreate) {
          const adminDetail = await fetchAdminDetail(currentAdmin.id);
          if (adminDetail) {
            setCurrentAdmin(adminDetail);
          }
        }
      }

      return success;
    },
    [
      createAdmin,
      updateAdmin,
      currentAdmin,
      appliedFilters,
      pagination,
      sort,
      fetchAdmins,
      fetchStatistics,
      fetchAdminDetail
    ]
  );

  // 刷新管理员详情
  const handleRefreshAdminDetail = useCallback(async () => {
    if (currentAdmin) {
      const adminDetail = await fetchAdminDetail(currentAdmin.id);
      if (adminDetail) {
        setCurrentAdmin(adminDetail);
      }
    }
  }, [currentAdmin, fetchAdminDetail]);

  // 重置密码
  const handleResetPassword = useCallback((admin: Admin) => {
    setCurrentAdminForAction(admin);
    setPasswordModalOpen(true);
  }, []);

  // 保存密码重置
  const handleSavePasswordReset = useCallback(
    async (adminId: number, data: PasswordResetFormData): Promise<boolean> => {
      const success = await updateAdminPassword(adminId, data);
      if (success) {
        // 刷新列表和统计
        fetchAdmins({
          filters: appliedFilters,
          page: pagination.page,
          pageSize: pagination.page_size,
          sortBy: sort.sort_by,
          sortOrder: sort.sort_order
        });
        fetchStatistics(appliedFilters);
        // 如果详情抽屉打开，刷新详情
        if (currentAdmin && currentAdmin.id === adminId) {
          const adminDetail = await fetchAdminDetail(adminId);
          if (adminDetail) {
            setCurrentAdmin(adminDetail);
          }
        }
      }
      return success;
    },
    [
      updateAdminPassword,
      appliedFilters,
      pagination,
      sort,
      currentAdmin,
      fetchAdmins,
      fetchStatistics,
      fetchAdminDetail
    ]
  );

  // 状态变更
  const handleStatusChange = useCallback((admin: Admin) => {
    setCurrentAdminForAction(admin);
    setStatusModalOpen(true);
  }, []);

  // 保存状态变更
  const handleSaveStatusChange = useCallback(
    async (adminId: number, data: StatusChangeData): Promise<boolean> => {
      const success = await updateAdminStatus(adminId, data);
      if (success) {
        // 刷新列表和统计
        fetchAdmins({
          filters: appliedFilters,
          page: pagination.page,
          pageSize: pagination.page_size,
          sortBy: sort.sort_by,
          sortOrder: sort.sort_order
        });
        fetchStatistics(appliedFilters);
        // 如果详情抽屉打开，刷新详情
        if (currentAdmin && currentAdmin.id === adminId) {
          const adminDetail = await fetchAdminDetail(adminId);
          if (adminDetail) {
            setCurrentAdmin(adminDetail);
          }
        }
      }
      return success;
    },
    [
      updateAdminStatus,
      appliedFilters,
      pagination,
      sort,
      currentAdmin,
      fetchAdmins,
      fetchStatistics,
      fetchAdminDetail
    ]
  );

  // 删除管理员
  const handleDelete = useCallback((admin: Admin) => {
    setCurrentAdminForAction(admin);
    setDeleteConfirmOpen(true);
  }, []);

  // 确认删除
  const handleConfirmDelete = useCallback(async () => {
    if (!currentAdminForAction) return;

    const success = await deleteAdmin(currentAdminForAction.id);
    if (success) {
      // 刷新列表和统计
      fetchAdmins({
        filters: appliedFilters,
        page: pagination.page,
        pageSize: pagination.page_size,
        sortBy: sort.sort_by,
        sortOrder: sort.sort_order
      });
      fetchStatistics(appliedFilters);
      // 关闭详情抽屉（如果打开）
      if (currentAdmin && currentAdmin.id === currentAdminForAction.id) {
        setDetailDrawerOpen(false);
        setCurrentAdmin(null);
      }
    }
    setDeleteConfirmOpen(false);
    setCurrentAdminForAction(null);
  }, [
    currentAdminForAction,
    deleteAdmin,
    appliedFilters,
    pagination,
    sort,
    currentAdmin,
    fetchAdmins,
    fetchStatistics
  ]);

  // 选择管理员
  const handleSelectAdmin = useCallback(
    (adminId: number, selected: boolean) => {
      setSelectedAdminIds((prev) => {
        if (selected) {
          return [...prev, adminId];
        } else {
          return prev.filter((id) => id !== adminId);
        }
      });
    },
    []
  );

  // 全选
  const handleSelectAll = useCallback(
    (selected: boolean) => {
      if (selected) {
        setSelectedAdminIds(admins.map((a) => a.id));
      } else {
        setSelectedAdminIds([]);
      }
    },
    [admins]
  );

  // 批量操作
  const handleBatchOperation = useCallback(
    async (operation: 'enable' | 'disable') => {
      if (selectedAdminIds.length === 0) return;

      // 这里可以实现批量操作逻辑
      // 目前先清空选择
      setSelectedAdminIds([]);
    },
    [selectedAdminIds]
  );

  return (
    <PermissionGuard permissions='admins:read'>
      <PageContainer>
        <div className='space-y-4'>
          {/* 页面头部 */}
          <div className='flex items-center justify-between'>
            <Heading
              title='管理员管理'
              description='查看和管理所有管理员账号信息'
            />
            <div className='flex items-center gap-2'>
              <PermissionGuard permissions='admins:write'>
                <Button onClick={handleCreate}>
                  <Plus className='mr-2 h-4 w-4' />
                  新建管理员
                </Button>
              </PermissionGuard>
              <Button
                variant='outline'
                onClick={() => {
                  fetchAdmins({
                    filters: appliedFilters,
                    page: pagination.page,
                    pageSize: pagination.page_size,
                    sortBy: sort.sort_by,
                    sortOrder: sort.sort_order
                  });
                  fetchStatistics(appliedFilters);
                }}
              >
                <RefreshCw className='mr-2 h-4 w-4' />
                刷新
              </Button>
            </div>
          </div>

          {/* 筛选区 */}
          <FilterBar
            onSearch={() => {
              fetchAdmins({
                filters: appliedFilters,
                page: 1,
                pageSize: pagination.page_size,
                sortBy: sort.sort_by,
                sortOrder: sort.sort_order
              });
              fetchStatistics(appliedFilters);
            }}
            loading={loading}
            roles={roles}
          />

          {/* 统计卡片 */}
          <StatisticsCards
            statistics={statistics}
            loading={statisticsLoading}
            onRetry={() => fetchStatistics(appliedFilters)}
          />

          {/* 批量操作栏 */}
          {selectedAdminIds.length > 0 && (
            <div className='bg-muted/50 flex items-center gap-2 rounded-lg border p-3'>
              <span className='text-sm font-medium'>
                已选择 {selectedAdminIds.length} 个管理员
              </span>
              <Button
                variant='outline'
                size='sm'
                onClick={() => handleBatchOperation('enable')}
              >
                <CheckCircle className='mr-2 h-4 w-4' />
                批量启用
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => handleBatchOperation('disable')}
              >
                <Ban className='mr-2 h-4 w-4' />
                批量禁用
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setSelectedAdminIds([])}
              >
                取消选择
              </Button>
            </div>
          )}

          {/* 管理员列表表格 */}
          <AdminTable
            admins={admins}
            loading={loading}
            pagination={pagination}
            sort={sort}
            selectedAdminIds={selectedAdminIds}
            currentUserId={currentUserId}
            onSort={setSort}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            onSelectAdmin={handleSelectAdmin}
            onSelectAll={handleSelectAll}
            onViewDetail={handleViewDetail}
            onEdit={handleEdit}
            onResetPassword={handleResetPassword}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
          />

          {/* 详情抽屉 */}
          <AdminDetailDrawer
            open={detailDrawerOpen}
            adminId={currentAdmin?.id || null}
            admin={currentAdmin}
            loading={false}
            currentUserId={currentUserId}
            onClose={() => {
              setDetailDrawerOpen(false);
              setCurrentAdmin(null);
            }}
            onEdit={handleEdit}
            onResetPassword={(admin) => handleResetPassword(admin)}
            onStatusChange={(admin) => handleStatusChange(admin)}
            onRefresh={handleRefreshAdminDetail}
          />

          {/* 编辑/创建弹窗 */}
          <AdminEditModal
            open={editModalOpen}
            admin={currentAdmin}
            isCreate={isCreateMode}
            roles={roles}
            currentUserId={currentUserId}
            onClose={() => {
              setEditModalOpen(false);
              setCurrentAdmin(null);
              setIsCreateMode(false);
            }}
            onSubmit={handleSaveEdit}
          />

          {/* 密码重置弹窗 */}
          <PasswordResetModal
            open={passwordModalOpen}
            adminId={currentAdminForAction?.id || null}
            adminName={currentAdminForAction?.username}
            onClose={() => {
              setPasswordModalOpen(false);
              setCurrentAdminForAction(null);
            }}
            onSubmit={handleSavePasswordReset}
          />

          {/* 状态变更确认弹窗 */}
          <StatusChangeConfirmModal
            open={statusModalOpen}
            admin={currentAdminForAction}
            onClose={() => {
              setStatusModalOpen(false);
              setCurrentAdminForAction(null);
            }}
            onSubmit={handleSaveStatusChange}
          />

          {/* 删除确认对话框 */}
          <AlertDialog
            open={deleteConfirmOpen}
            onOpenChange={setDeleteConfirmOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确认删除</AlertDialogTitle>
                <AlertDialogDescription>
                  {currentAdminForAction && (
                    <div className='mt-4 space-y-2'>
                      <p>
                        确定要删除管理员{' '}
                        <strong>{currentAdminForAction.username}</strong>（ID：
                        {currentAdminForAction.id}）吗？
                      </p>
                      {currentAdminForAction.is_super_admin && (
                        <p className='text-yellow-600 dark:text-yellow-400'>
                          注意：该账号为超级管理员
                        </p>
                      )}
                      <p className='text-muted-foreground text-sm'>
                        该操作通常为逻辑删除/禁用，不会删除历史日志。
                      </p>
                    </div>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmDelete}>
                  确认删除
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </PageContainer>
    </PermissionGuard>
  );
}
