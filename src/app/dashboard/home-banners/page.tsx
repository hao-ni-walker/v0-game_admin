'use client';

import { useEffect, useState } from 'react';
import { Image as ImageIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/table/pagination';
import PageContainer from '@/components/layout/page-container';

import {
  BannerPageHeader,
  BannerFilters,
  BannerTable
} from './components';
import { useBannerFilters, useBannerManagement } from './hooks';
import { PAGE_SIZE_OPTIONS } from './constants';
import { Banner, BannerDialogState } from './types';

export default function HomeBannersPage() {
  // 使用自定义hooks
  const {
    filters,
    searchFilters,
    updatePagination,
    clearFilters,
    hasActiveFilters
  } = useBannerFilters();

  const {
    banners,
    loading,
    pagination,
    fetchBanners,
    refreshBanners,
    deleteBanner,
    toggleBannerStatus,
    disableBanner,
    restoreBanner
  } = useBannerManagement();

  // 对话框状态
  const [dialogState, setDialogState] = useState<BannerDialogState>({
    type: null,
    banner: null,
    open: false
  });

  // 初始化和筛选条件变化时获取数据
  useEffect(() => {
    fetchBanners(filters);
  }, [filters, fetchBanners]);

  /**
   * 打开创建轮播图对话框
   */
  const handleOpenCreateDialog = () => {
    setDialogState({
      type: 'create',
      banner: null,
      open: true
    });
  };

  /**
   * 打开编辑轮播图对话框
   */
  const handleOpenEditDialog = (banner: Banner) => {
    setDialogState({
      type: 'edit',
      banner,
      open: true
    });
  };

  /**
   * 打开查看轮播图详情对话框
   */
  const handleOpenViewDialog = (banner: Banner) => {
    setDialogState({
      type: 'view',
      banner,
      open: true
    });
  };

  /**
   * 关闭对话框
   */
  const handleCloseDialog = () => {
    setDialogState({
      type: null,
      banner: null,
      open: false
    });
  };

  /**
   * 删除轮播图
   */
  const handleDeleteBanner = async (banner: Banner) => {
    const success = await deleteBanner(banner.id);
    if (success) {
      fetchBanners(filters);
    }
  };

  /**
   * 切换轮播图状态
   */
  const handleToggleStatus = async (banner: Banner) => {
    const success = await toggleBannerStatus(banner);
    if (success) {
      fetchBanners(filters);
    }
  };

  /**
   * 禁用轮播图
   */
  const handleDisableBanner = async (banner: Banner) => {
    const success = await disableBanner(banner);
    if (success) {
      fetchBanners(filters);
    }
  };

  /**
   * 恢复轮播图
   */
  const handleRestoreBanner = async (banner: Banner) => {
    const success = await restoreBanner(banner);
    if (success) {
      fetchBanners(filters);
    }
  };

  /**
   * 刷新数据
   */
  const handleRefresh = () => {
    refreshBanners(filters);
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
        <BannerPageHeader
          onCreateBanner={handleOpenCreateDialog}
          onRefresh={handleRefresh}
          loading={loading}
        />

        {/* 搜索和筛选 */}
        <BannerFilters
          filters={filters}
          onSearch={handleSearch}
          onReset={handleReset}
          loading={loading}
        />

        {/* 数据表格和分页 */}
        <div className='flex min-h-0 flex-1 flex-col'>
          <div className='min-h-0'>
            <BannerTable
              banners={banners}
              loading={loading}
              pagination={pagination}
              onEdit={handleOpenEditDialog}
              onView={handleOpenViewDialog}
              onDelete={handleDeleteBanner}
              onToggleStatus={handleToggleStatus}
              onDisable={handleDisableBanner}
              onRestore={handleRestoreBanner}
              emptyState={{
                icon: <ImageIcon className='h-8 w-8 text-muted-foreground' />,
                title: hasActiveFilters ? '未找到匹配的轮播图' : '还没有轮播图',
                description: hasActiveFilters
                  ? '请尝试调整筛选条件以查看更多结果'
                  : '开始添加轮播图来管理网站广告',
                action: !hasActiveFilters ? (
                  <Button onClick={handleOpenCreateDialog} size='sm' className='mt-2'>
                    <Plus className='mr-2 h-4 w-4' />
                    新增轮播图
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
                limit: pagination.page_size
              }}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
            />
          </div>
        </div>

        {/* TODO: 轮播图对话框（创建/编辑/查看） */}
        {/* 可以后续添加 BannerDialogs 组件 */}
      </div>
    </PageContainer>
  );
}
