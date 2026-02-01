'use client';

import { useEffect, useState } from 'react';
import { CreditCard, Plus, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/table/pagination';
import PageContainer from '@/components/layout/page-container';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

import {
  PaymentChannelPageHeader,
  PaymentChannelFilters,
  PaymentPlatformTable
} from './components';
import { usePaymentChannelFilters, usePaymentChannelManagement } from './hooks';
import { PAGE_SIZE_OPTIONS } from './constants';
import {
  PaymentPlatform,
  PaymentChannel,
  PaymentPlatformDialogState,
  PaymentChannelDialogState
} from './types';

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
    platforms,
    loading,
    pagination,
    fetchPlatforms,
    refreshPlatforms,
    togglePlatformStatus,
    toggleChannelDisabled,
    deleteChannel
  } = usePaymentChannelManagement();

  // 平台对话框状态
  const [platformDialogState, setPlatformDialogState] =
    useState<PaymentPlatformDialogState>({
      type: null,
      platform: null,
      open: false
    });

  // 渠道对话框状态
  const [channelDialogState, setChannelDialogState] =
    useState<PaymentChannelDialogState>({
      type: null,
      channel: null,
      open: false
    });

  // 初始化和筛选条件变化时获取数据
  useEffect(() => {
    fetchPlatforms(filters);
  }, [filters, fetchPlatforms]);

  /**
   * 打开创建平台对话框
   */
  const handleOpenCreatePlatformDialog = () => {
    setPlatformDialogState({
      type: 'create',
      platform: null,
      open: true
    });
  };

  /**
   * 打开编辑平台对话框
   */
  const handleOpenEditPlatformDialog = (platform: PaymentPlatform) => {
    setPlatformDialogState({
      type: 'edit',
      platform,
      open: true
    });
  };

  /**
   * 打开查看平台配置对话框
   */
  const handleOpenViewPlatformDialog = (platform: PaymentPlatform) => {
    setPlatformDialogState({
      type: 'view',
      platform,
      open: true
    });
  };

  /**
   * 关闭平台对话框
   */
  const handleClosePlatformDialog = () => {
    setPlatformDialogState({
      type: null,
      platform: null,
      open: false
    });
  };

  /**
   * 打开编辑渠道对话框
   */
  const handleOpenEditChannelDialog = (
    channel: PaymentChannel,
    platform: PaymentPlatform
  ) => {
    setChannelDialogState({
      type: 'edit',
      channel,
      platformId: platform.id,
      open: true
    });
  };

  /**
   * 打开查看渠道对话框
   */
  const handleOpenViewChannelDialog = (
    channel: PaymentChannel,
    platform: PaymentPlatform
  ) => {
    setChannelDialogState({
      type: 'view',
      channel,
      platformId: platform.id,
      open: true
    });
  };

  /**
   * 关闭渠道对话框
   */
  const handleCloseChannelDialog = () => {
    setChannelDialogState({
      type: null,
      channel: null,
      open: false
    });
  };

  /**
   * 切换平台状态
   */
  const handleTogglePlatformStatus = async (platform: PaymentPlatform) => {
    const success = await togglePlatformStatus(platform);
    if (success) {
      fetchPlatforms(filters);
    }
  };

  /**
   * 切换渠道禁用状态
   */
  const handleToggleChannelDisabled = async (channel: PaymentChannel) => {
    const success = await toggleChannelDisabled(channel);
    if (success) {
      fetchPlatforms(filters);
    }
  };

  /**
   * 删除渠道
   */
  const handleDeleteChannel = async (channel: PaymentChannel) => {
    const success = await deleteChannel(channel.id);
    if (success) {
      fetchPlatforms(filters);
    }
  };

  /**
   * 刷新数据
   */
  const handleRefresh = () => {
    refreshPlatforms(filters);
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
          onCreateChannel={handleOpenCreatePlatformDialog}
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
        <div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
          <div className='min-h-0 flex-1 overflow-auto'>
            <PaymentPlatformTable
              platforms={platforms}
              loading={loading}
              pagination={pagination}
              onEditPlatform={handleOpenEditPlatformDialog}
              onViewPlatform={handleOpenViewPlatformDialog}
              onTogglePlatformStatus={handleTogglePlatformStatus}
              onEditChannel={handleOpenEditChannelDialog}
              onViewChannel={handleOpenViewChannelDialog}
              onToggleChannelDisabled={handleToggleChannelDisabled}
              onDeleteChannel={handleDeleteChannel}
              emptyState={{
                icon: <Wallet className='text-muted-foreground h-8 w-8' />,
                title: hasActiveFilters
                  ? '未找到匹配的支付平台'
                  : '还没有支付平台',
                description: hasActiveFilters
                  ? '请尝试调整筛选条件以查看更多结果'
                  : '开始添加支付平台来管理充值和提现渠道',
                action: !hasActiveFilters ? (
                  <Button
                    onClick={handleOpenCreatePlatformDialog}
                    size='sm'
                    className='mt-2'
                  >
                    <Plus className='mr-2 h-4 w-4' />
                    新增支付平台
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
                totalPages:
                  pagination.total_pages ||
                  Math.ceil(pagination.total / pagination.page_size)
              }}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
            />
          </div>
        </div>
      </div>

      {/* 平台配置查看对话框 */}
      <Dialog
        open={platformDialogState.open && platformDialogState.type === 'view'}
        onOpenChange={handleClosePlatformDialog}
      >
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>
              平台配置 - {platformDialogState.platform?.name}
            </DialogTitle>
            <DialogDescription>查看支付平台的详细配置信息</DialogDescription>
          </DialogHeader>
          {platformDialogState.platform && (
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='text-muted-foreground text-sm'>
                    平台ID
                  </label>
                  <p className='font-medium'>
                    {platformDialogState.platform.id}
                  </p>
                </div>
                <div>
                  <label className='text-muted-foreground text-sm'>
                    平台名称
                  </label>
                  <p className='font-medium'>
                    {platformDialogState.platform.name}
                  </p>
                </div>
                <div>
                  <label className='text-muted-foreground text-sm'>状态</label>
                  <p className='font-medium'>
                    {platformDialogState.platform.enabled ? '启用' : '停用'}
                  </p>
                </div>
                <div>
                  <label className='text-muted-foreground text-sm'>
                    平台地址
                  </label>
                  <p className='font-medium break-all'>
                    {platformDialogState.platform.url}
                  </p>
                </div>
              </div>
              <div>
                <label className='text-muted-foreground text-sm'>
                  平台配置
                </label>
                <pre className='bg-muted mt-2 overflow-auto rounded-md p-4 text-sm'>
                  {JSON.stringify(
                    platformDialogState.platform.platform_config,
                    null,
                    2
                  )}
                </pre>
              </div>
              <div>
                <label className='text-muted-foreground text-sm'>
                  渠道数量
                </label>
                <p className='font-medium'>
                  {platformDialogState.platform.channels.length} 个渠道
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 渠道详情查看对话框 */}
      <Dialog
        open={channelDialogState.open && channelDialogState.type === 'view'}
        onOpenChange={handleCloseChannelDialog}
      >
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>
              渠道详情 - {channelDialogState.channel?.name}
            </DialogTitle>
            <DialogDescription>查看支付渠道的详细配置信息</DialogDescription>
          </DialogHeader>
          {channelDialogState.channel && (
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='text-muted-foreground text-sm'>
                    渠道ID
                  </label>
                  <p className='font-medium'>{channelDialogState.channel.id}</p>
                </div>
                <div>
                  <label className='text-muted-foreground text-sm'>
                    渠道名称
                  </label>
                  <p className='font-medium'>
                    {channelDialogState.channel.name}
                  </p>
                </div>
                <div>
                  <label className='text-muted-foreground text-sm'>
                    渠道代码
                  </label>
                  <p className='font-medium'>
                    {channelDialogState.channel.code}
                  </p>
                </div>
                <div>
                  <label className='text-muted-foreground text-sm'>类型</label>
                  <p className='font-medium'>
                    {channelDialogState.channel.type === 'collection'
                      ? '充值'
                      : '提现'}
                  </p>
                </div>
                <div>
                  <label className='text-muted-foreground text-sm'>
                    渠道类型
                  </label>
                  <p className='font-medium'>
                    {channelDialogState.channel.channel_type}
                  </p>
                </div>
                <div>
                  <label className='text-muted-foreground text-sm'>状态</label>
                  <p className='font-medium'>
                    {channelDialogState.channel.disabled ? '已禁用' : '正常'}
                  </p>
                </div>
                <div>
                  <label className='text-muted-foreground text-sm'>
                    最小金额
                  </label>
                  <p className='font-medium'>
                    ${channelDialogState.channel.min_amount}
                  </p>
                </div>
                <div>
                  <label className='text-muted-foreground text-sm'>
                    最大金额
                  </label>
                  <p className='font-medium'>
                    ${channelDialogState.channel.max_amount}
                  </p>
                </div>
                <div>
                  <label className='text-muted-foreground text-sm'>
                    每日限额
                  </label>
                  <p className='font-medium'>
                    {channelDialogState.channel.daily_limit
                      ? `$${channelDialogState.channel.daily_limit}`
                      : '-'}
                  </p>
                </div>
                <div>
                  <label className='text-muted-foreground text-sm'>费率</label>
                  <p className='font-medium'>
                    {parseFloat(channelDialogState.channel.fee_rate) * 100}%
                  </p>
                </div>
                <div>
                  <label className='text-muted-foreground text-sm'>
                    固定费用
                  </label>
                  <p className='font-medium'>
                    ${channelDialogState.channel.fixed_fee}
                  </p>
                </div>
                <div>
                  <label className='text-muted-foreground text-sm'>排序</label>
                  <p className='font-medium'>
                    {channelDialogState.channel.sort_order}
                  </p>
                </div>
              </div>
              {channelDialogState.channel.config && (
                <div>
                  <label className='text-muted-foreground text-sm'>
                    渠道配置
                  </label>
                  <pre className='bg-muted mt-2 overflow-auto rounded-md p-4 text-sm'>
                    {JSON.stringify(channelDialogState.channel.config, null, 2)}
                  </pre>
                </div>
              )}
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='text-muted-foreground text-sm'>
                    创建时间
                  </label>
                  <p className='font-medium'>
                    {new Date(
                      channelDialogState.channel.created_at
                    ).toLocaleString('zh-CN')}
                  </p>
                </div>
                <div>
                  <label className='text-muted-foreground text-sm'>
                    更新时间
                  </label>
                  <p className='font-medium'>
                    {new Date(
                      channelDialogState.channel.updated_at
                    ).toLocaleString('zh-CN')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
