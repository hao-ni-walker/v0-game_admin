'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Download, Ban, CheckCircle, RefreshCw } from 'lucide-react';
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
import { FilterBar } from './components/filter-bar';
import { StatisticsCards } from './components/statistics-cards';
import { UserTable } from './components/user-table';
import { UserDetailModal } from './components/user-detail-modal';
import { UserEditModal } from './components/user-edit-modal';
import { WalletAdjustModal } from './components/wallet-adjust-modal';
import { NotificationModal } from './components/notification-modal';
import { useAdminUsers } from './hooks/use-admin-users';
import { useAdminUserFilters } from './hooks/use-admin-user-filters';
import { AdminUser, AdminUserDetail } from './types';
import { useRouter } from 'next/navigation';

/**
 * 用户管理页面
 */
export default function AdminUserPage() {
  const router = useRouter();
  const { appliedFilters } = useAdminUserFilters();
  const {
    users,
    loading,
    pagination,
    sort,
    statistics,
    statisticsLoading,
    fetchUsers,
    fetchUserDetail,
    fetchStatistics,
    updateUser,
    adjustWallet,
    batchOperation,
    resetPassword,
    sendNotification,
    exportUsers,
    setPage,
    setPageSize,
    setSort
  } = useAdminUsers();

  // 弹窗状态
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AdminUserDetail | null>(null);
  const [batchConfirmOpen, setBatchConfirmOpen] = useState(false);
  const [batchOperationType, setBatchOperationType] = useState<
    'enable' | 'disable' | null
  >(null);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [notificationUser, setNotificationUser] = useState<AdminUser | null>(
    null
  );

  // 加载数据
  useEffect(() => {
    fetchUsers({
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
    fetchUsers
  ]);

  // 加载统计数据
  useEffect(() => {
    fetchStatistics(appliedFilters);
  }, [appliedFilters, fetchStatistics]);

  // 查看详情
  const handleViewDetail = useCallback(
    async (user: AdminUser) => {
      setCurrentUser(null);
      setDetailModalOpen(true);
      const userDetail = await fetchUserDetail(user.id);
      if (userDetail) {
        setCurrentUser(userDetail);
      }
    },
    [fetchUserDetail]
  );

  // 编辑用户
  const handleEdit = useCallback(
    async (user: AdminUser | AdminUserDetail) => {
      if ('wallet' in user && user.wallet) {
        setCurrentUser(user as AdminUserDetail);
      } else {
        const userDetail = await fetchUserDetail(user.id);
        if (userDetail) {
          setCurrentUser(userDetail);
        }
      }
      setEditModalOpen(true);
    },
    [fetchUserDetail]
  );

  // 调整钱包
  const handleAdjustWallet = useCallback(async (user: AdminUserDetail) => {
    setCurrentUser(user);
    setWalletModalOpen(true);
  }, []);

  // 保存编辑
  const handleSaveEdit = useCallback(
    async (userId: number, data: any) => {
      const success = await updateUser(userId, data);
      if (success) {
        // 刷新列表和统计
        fetchUsers({
          filters: appliedFilters,
          page: pagination.page,
          pageSize: pagination.page_size,
          sortBy: sort.sort_by,
          sortOrder: sort.sort_order
        });
        fetchStatistics(appliedFilters);
        // 如果详情弹窗打开，刷新详情
        if (currentUser && currentUser.id === userId) {
          const userDetail = await fetchUserDetail(userId);
          if (userDetail) {
            setCurrentUser(userDetail);
          }
        }
      }
      return success;
    },
    [
      updateUser,
      appliedFilters,
      pagination,
      sort,
      currentUser,
      fetchUserDetail,
      fetchUsers,
      fetchStatistics
    ]
  );

  // 保存钱包调整
  const handleSaveWalletAdjust = useCallback(
    async (userId: number, data: any) => {
      const success = await adjustWallet(userId, data);
      if (success) {
        // 刷新列表和统计
        fetchUsers({
          filters: appliedFilters,
          page: pagination.page,
          pageSize: pagination.page_size,
          sortBy: sort.sort_by,
          sortOrder: sort.sort_order
        });
        fetchStatistics(appliedFilters);
      }
      return success;
    },
    [
      adjustWallet,
      appliedFilters,
      pagination,
      sort,
      fetchUsers,
      fetchStatistics
    ]
  );

  // 刷新用户详情
  const handleRefreshUserDetail = useCallback(
    async (userId: number) => {
      const userDetail = await fetchUserDetail(userId);
      if (userDetail) {
        setCurrentUser(userDetail);
      }
      return userDetail;
    },
    [fetchUserDetail]
  );

  // 批量操作
  const handleBatchOperation = useCallback(
    async (operation: 'enable' | 'disable') => {
      if (selectedUserIds.length === 0) return;

      setBatchOperationType(operation);
      setBatchConfirmOpen(true);
    },
    [selectedUserIds]
  );

  const handleConfirmBatchOperation = useCallback(async () => {
    if (!batchOperationType || selectedUserIds.length === 0) return;

    const success = await batchOperation(selectedUserIds, batchOperationType);
    if (success) {
      setSelectedUserIds([]);
      fetchUsers({
        filters: appliedFilters,
        page: pagination.page,
        pageSize: pagination.page_size,
        sortBy: sort.sort_by,
        sortOrder: sort.sort_order
      });
      fetchStatistics(appliedFilters);
    }
    setBatchConfirmOpen(false);
    setBatchOperationType(null);
  }, [
    batchOperationType,
    selectedUserIds,
    batchOperation,
    appliedFilters,
    pagination,
    sort,
    fetchUsers,
    fetchStatistics
  ]);

  // 重置密码
  const handleResetPassword = useCallback(
    async (user: AdminUser) => {
      const confirmed = window.confirm(
        `确定要重置用户 ${user.username} 的密码吗？`
      );
      if (confirmed) {
        await resetPassword(user.id);
      }
    },
    [resetPassword]
  );

  // 发送通知
  const handleSendNotification = useCallback((user: AdminUser) => {
    setNotificationUser(user);
    setNotificationModalOpen(true);
  }, []);

  const handleSaveNotification = useCallback(
    async (
      userId: number,
      data: { channel: string; title: string; content: string }
    ) => {
      const success = await sendNotification(userId, data);
      if (success) {
        setNotificationModalOpen(false);
        setNotificationUser(null);
      }
      return success;
    },
    [sendNotification]
  );

  // 查看操作日志
  const handleViewLogs = useCallback(
    (user: AdminUser) => {
      router.push(`/dashboard/system/logs?user_id=${user.id}`);
    },
    [router]
  );

  // 导出
  const handleExport = useCallback(async () => {
    await exportUsers(appliedFilters);
  }, [exportUsers, appliedFilters]);

  // 选择用户
  const handleSelectUser = useCallback((userId: number, selected: boolean) => {
    setSelectedUserIds((prev) => {
      if (selected) {
        return [...prev, userId];
      } else {
        return prev.filter((id) => id !== userId);
      }
    });
  }, []);

  // 全选
  const handleSelectAll = useCallback(
    (selected: boolean) => {
      if (selected) {
        setSelectedUserIds(users.map((u) => u.id));
      } else {
        setSelectedUserIds([]);
      }
    },
    [users]
  );

  return (
    <PageContainer>
      <div className='space-y-4'>
        {/* 页面头部 */}
        <div className='flex items-center justify-between'>
          <Heading title='用户管理' description='查看和管理所有用户账户信息' />
          <div className='flex items-center gap-2'>
            <Button variant='outline' onClick={handleExport}>
              <Download className='mr-2 h-4 w-4' />
              导出
            </Button>
            <Button
              variant='outline'
              onClick={() => {
                fetchUsers({
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
            fetchUsers({
              filters: appliedFilters,
              page: 1,
              pageSize: pagination.page_size,
              sortBy: sort.sort_by,
              sortOrder: sort.sort_order
            });
            fetchStatistics(appliedFilters);
          }}
          loading={loading}
        />

        {/* 统计卡片 */}
        <StatisticsCards
          statistics={statistics}
          loading={statisticsLoading}
          onRetry={() => fetchStatistics(appliedFilters)}
        />

        {/* 批量操作栏 */}
        {selectedUserIds.length > 0 && (
          <div className='bg-muted/50 flex items-center gap-2 rounded-lg border p-3'>
            <span className='text-sm font-medium'>
              已选择 {selectedUserIds.length} 个用户
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
              onClick={() => setSelectedUserIds([])}
            >
              取消选择
            </Button>
          </div>
        )}

        {/* 用户列表表格 */}
        <UserTable
          users={users}
          loading={loading}
          pagination={pagination}
          sort={sort}
          selectedUserIds={selectedUserIds}
          onSort={setSort}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          onSelectUser={handleSelectUser}
          onSelectAll={handleSelectAll}
          onViewDetail={handleViewDetail}
          onEdit={handleEdit}
          onResetPassword={handleResetPassword}
          onSendNotification={handleSendNotification}
          onViewLogs={handleViewLogs}
        />

        {/* 详情弹窗 */}
        <UserDetailModal
          open={detailModalOpen}
          userId={currentUser?.id || null}
          onClose={() => {
            setDetailModalOpen(false);
            setCurrentUser(null);
          }}
          onEdit={handleEdit}
          onAdjustWallet={handleAdjustWallet}
          onRefresh={handleRefreshUserDetail}
        />

        {/* 编辑弹窗 */}
        <UserEditModal
          open={editModalOpen}
          user={currentUser}
          onClose={() => {
            setEditModalOpen(false);
            setCurrentUser(null);
          }}
          onSubmit={handleSaveEdit}
        />

        {/* 钱包调整弹窗 */}
        <WalletAdjustModal
          open={walletModalOpen}
          user={currentUser}
          onClose={() => {
            setWalletModalOpen(false);
            setCurrentUser(null);
          }}
          onSubmit={handleSaveWalletAdjust}
          onRefresh={handleRefreshUserDetail}
        />

        {/* 批量操作确认对话框 */}
        <AlertDialog open={batchConfirmOpen} onOpenChange={setBatchConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认批量操作</AlertDialogTitle>
              <AlertDialogDescription>
                确定要{batchOperationType === 'enable' ? '启用' : '禁用'}{' '}
                {selectedUserIds.length} 个用户吗？
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmBatchOperation}>
                确认
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* 通知弹窗 */}
        <NotificationModal
          open={notificationModalOpen}
          user={notificationUser}
          onClose={() => {
            setNotificationModalOpen(false);
            setNotificationUser(null);
          }}
          onSubmit={handleSaveNotification}
        />
      </div>
    </PageContainer>
  );
}
