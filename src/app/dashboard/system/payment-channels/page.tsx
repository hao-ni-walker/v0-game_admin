'use client';

import { useEffect, useState } from 'react';
import { CreditCard, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/table/pagination';
import PageContainer from '@/components/layout/page-container';

import {
  PaymentChannelPageHeader,
  PaymentChannelFilters,
  PaymentChannelTable
} from './components';
import { usePaymentChannelFilters, usePaymentChannelManagement } from './hooks';
import { PAGE_SIZE_OPTIONS } from './constants';
import { PaymentChannel, PaymentChannelDialogState } from './types';

export default function PaymentChannelsPage() {
  // 使用自定义hooks
  const {
    filters,
    searchFilters,
    updatePagination,
    clearFilters,
    hasActiveFilters
  } = usePaymentChannelFilters();

  const {
    channels,
    loading,
    pagination,
    fetchChannels,
    refreshChannels,
    deleteChannel,
    toggleChannelStatus,
    disableChannel
  } = usePaymentChannelManagement();

  // 对话框状态
  const [dialogState, setDialogState] = useState<PaymentChannelDialogState>({
    type: null,
    channel: null,
    open: false
  });

  // 初始化和筛选条件变化时获取数据
  useEffect(() => {
    fetchChannels(filters);
  }, [filters, fetchChannels]);

  /**
   * 打开创建对话框
   */
  const handleOpenCreateDialog = () => {
    setDialogState({
      type: 'create',
      channel: null,
      open: true
    });
  };

  /**
   * 打开编辑对话框
   */
  const handleOpenEditDialog = (channel: PaymentChannel) => {
    setDialogState({
      type: 'edit',
      channel,
      open: true
    });
  };

  /**
   * 打开查看详情对话框
   */
  const handleOpenViewDialog = (channel: PaymentChannel) => {
    setDialogState({
      type: 'view',
      channel,
      open: true
    });
  };

  /**
   * 关闭对话框
   */
  const handleCloseDialog = () => {
    setDialogState({
      type: null,
      channel: null,
      open: false
    });
  };

  /**
   * 删除渠道
   */
  const handleDeleteChannel = async (channel: PaymentChannel) => {
    const success = await deleteChannel(channel.id);
    if (success) {
      fetchChannels(filters);
    }
  };

  /**
   * 切换渠道状态
   */
  const handleToggleStatus = async (channel: PaymentChannel) => {
    const success = await toggleChannelStatus(channel);
    if (success) {
      fetchChannels(filters);
    }
  };

  /**
   * 禁用渠道
   */
  const handleDisableChannel = async (channel: PaymentChannel) => {
    const success = await disableChannel(channel);
    if (success) {
      fetchChannels(filters);
    }
  };

  /**
   * 刷新数据
   */
  const handleRefresh = () => {
    refreshChannels(filters);
  };

  /**
   * 处理查询
   */
  const handleSearch = (newFilters: any) => {
    searchFilters(newFilters);
  };

  /**
   * 处理重置
   */
  const handleReset = () => {
    clearFilters();
  };

  /**
   * 处理分页变化
   */
  const handlePageChange = (page: number) => {
    updatePagination({ page });
  };

  /**
   * 处理页面大小变化
   */
  const handlePageSizeChange = (page_size: number) => {
    updatePagination({ page_size, page: 1 });
  };

  return (
    <PageContainer scrollable={false}>
      <div className='flex h-[calc(100vh-8rem)] w-full flex-col space-y-4'>
        {/* 页面头部 */}
        <PaymentChannelPageHeader
          onCreateChannel={handleOpenCreateDialog}
          onRefresh={handleRefresh}
          loading={loading}
        />

        {/* 搜索和筛选 */}
        <PaymentChannelFilters
          filters={filters}
          onSearch={handleSearch}
          onReset={handleReset}
          loading={loading}
        />

        {/* 数据表格和分页 */}
        <div className='flex min-h-0 flex-1 flex-col'>
          <div className='min-h-0'>
            <PaymentChannelTable
              channels={channels}
              loading={loading}
              pagination={pagination}
              onEdit={handleOpenEditDialog}
              onView={handleOpenViewDialog}
              onDelete={handleDeleteChannel}
              onToggleStatus={handleToggleStatus}
              onDisable={handleDisableChannel}
              emptyState={{
                icon: <CreditCard className='text-muted-foreground h-8 w-8' />,
                title: hasActiveFilters
                  ? '未找到匹配的支付渠道'
                  : '还没有支付渠道',
                description: hasActiveFilters
                  ? '请尝试调整筛选条件以查看更多结果'
                  : '开始添加支付渠道来管理充值和提现',
                action: !hasActiveFilters ? (
                  <Button
                    onClick={handleOpenCreateDialog}
                    size='sm'
                    className='mt-2'
                  >
                    <Plus className='mr-2 h-4 w-4' />
                    新增支付渠道
                  </Button>
                ) : undefined
              }}
            />
          </div>

          {/* 分页控件 */}
          <div className='flex-shrink-0 pt-4'>
            <Pagination
              pagination={{
                ...pagination,
                limit: pagination.page_size,
                totalPages: Math.ceil(pagination.total / pagination.page_size)
              }}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
            />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
