'use client';

import { useEffect } from 'react';
import { Package, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/table/pagination';
import PageContainer from '@/components/layout/page-container';

import {
  GiftPackPageHeader,
  GiftPackFilters,
  GiftPackTable
} from './components';
import { useGiftPackFilters, useGiftPackManagement } from './hooks';
import { PAGE_SIZE_OPTIONS } from './constants';
import { GiftPack } from './types';

export default function GiftPacksPage() {
  // 使用自定义hooks
  const {
    filters,
    searchFilters,
    updatePagination,
    clearFilters,
    hasActiveFilters
  } = useGiftPackFilters();

  const {
    giftPacks,
    loading,
    pagination,
    fetchGiftPacks,
    refreshGiftPacks,
    deleteGiftPack,
    toggleGiftPackStatus,
    archiveGiftPack
  } = useGiftPackManagement();

  // 初始化和筛选条件变化时获取数据
  useEffect(() => {
    fetchGiftPacks(filters);
  }, [filters, fetchGiftPacks]);

  /**
   * 打开创建礼包对话框
   */
  const handleOpenCreateDialog = () => {
    // TODO: 实现创建对话框
    console.log('创建礼包');
  };

  /**
   * 打开编辑礼包对话框
   */
  const handleOpenEditDialog = (giftPack: GiftPack) => {
    // TODO: 实现编辑对话框
    console.log('编辑礼包:', giftPack);
  };

  /**
   * 打开查看礼包详情对话框
   */
  const handleOpenViewDialog = (giftPack: GiftPack) => {
    // TODO: 实现查看详情对话框
    console.log('查看礼包:', giftPack);
  };

  /**
   * 删除礼包
   */
  const handleDeleteGiftPack = async (giftPack: GiftPack) => {
    const itemId = giftPack.id || giftPack.item_id;
    const success = await deleteGiftPack(itemId);
    if (success) {
      fetchGiftPacks(filters);
    }
  };

  /**
   * 切换礼包状态
   */
  const handleToggleStatus = async (giftPack: GiftPack) => {
    const success = await toggleGiftPackStatus(giftPack);
    if (success) {
      fetchGiftPacks(filters);
    }
  };

  /**
   * 归档礼包
   */
  const handleArchive = async (giftPack: GiftPack) => {
    const success = await archiveGiftPack(giftPack);
    if (success) {
      fetchGiftPacks(filters);
    }
  };

  /**
   * 刷新数据
   */
  const handleRefresh = () => {
    refreshGiftPacks(filters);
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
        <GiftPackPageHeader
          onCreateGiftPack={handleOpenCreateDialog}
          onRefresh={handleRefresh}
          loading={loading}
        />

        {/* 搜索和筛选 */}
        <GiftPackFilters
          filters={filters}
          onSearch={handleSearch}
          onReset={handleReset}
          loading={loading}
        />

        {/* 数据表格和分页 */}
        <div className='flex min-h-0 flex-1 flex-col'>
          <div className='min-h-0'>
            <GiftPackTable
              giftPacks={giftPacks}
              loading={loading}
              pagination={pagination}
              onEdit={handleOpenEditDialog}
              onView={handleOpenViewDialog}
              onDelete={handleDeleteGiftPack}
              onToggleStatus={handleToggleStatus}
              onArchive={handleArchive}
              emptyState={{
                icon: <Package className='h-8 w-8 text-muted-foreground' />,
                title: hasActiveFilters ? '未找到匹配的礼包' : '还没有礼包',
                description: hasActiveFilters
                  ? '请尝试调整筛选条件以查看更多结果'
                  : '开始添加礼包来管理您的道具库',
                action: !hasActiveFilters ? (
                  <Button onClick={handleOpenCreateDialog} size='sm' className='mt-2'>
                    <Plus className='mr-2 h-4 w-4' />
                    添加礼包
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

        {/* TODO: 礼包对话框（创建/编辑/查看） */}
        {/* 可以后续添加 GiftPackDialogs 组件 */}
      </div>
    </PageContainer>
  );
}
