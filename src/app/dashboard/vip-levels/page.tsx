'use client';

import { useEffect } from 'react';
import { Crown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/table/pagination';
import PageContainer from '@/components/layout/page-container';

import {
  VipLevelPageHeader,
  VipLevelFilters,
  VipLevelTable
} from './components';
import { useVipLevelFilters, useVipLevelManagement } from './hooks';
import { PAGE_SIZE_OPTIONS } from './constants';
import { VipLevel } from './types';

export default function VipLevelListPage() {
  // 使用自定义hooks
  const {
    filters,
    searchFilters,
    updatePagination,
    clearFilters,
    hasActiveFilters
  } = useVipLevelFilters();

  const {
    vipLevels,
    loading,
    pagination,
    fetchVipLevels,
    refreshVipLevels,
    deleteVipLevel,
    toggleVipLevelDisabled
  } = useVipLevelManagement();

  // 初始化和筛选条件变化时获取数据
  useEffect(() => {
    fetchVipLevels(filters);
  }, [filters, fetchVipLevels]);

  /**
   * 打开创建VIP等级对话框
   */
  const handleOpenCreateDialog = () => {
    // TODO: 实现创建对话框
    console.log('创建VIP等级');
  };

  /**
   * 打开编辑VIP等级对话框
   */
  const handleOpenEditDialog = (vipLevel: VipLevel) => {
    // TODO: 实现编辑对话框
    console.log('编辑VIP等级:', vipLevel);
  };

  /**
   * 打开查看VIP等级详情对话框
   */
  const handleOpenViewDialog = (vipLevel: VipLevel) => {
    // TODO: 实现查看详情对话框
    console.log('查看VIP等级:', vipLevel);
  };

  /**
   * 删除VIP等级
   */
  const handleDeleteVipLevel = async (vipLevel: VipLevel) => {
    const success = await deleteVipLevel(vipLevel.id);
    if (success) {
      fetchVipLevels(filters);
    }
  };

  /**
   * 切换禁用状态
   */
  const handleToggleDisabled = async (vipLevel: VipLevel) => {
    const success = await toggleVipLevelDisabled(vipLevel);
    if (success) {
      fetchVipLevels(filters);
    }
  };

  /**
   * 刷新数据
   */
  const handleRefresh = () => {
    refreshVipLevels(filters);
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
        <VipLevelPageHeader
          onCreateVipLevel={handleOpenCreateDialog}
          onRefresh={handleRefresh}
          loading={loading}
        />

        {/* 搜索和筛选 */}
        <VipLevelFilters
          filters={filters}
          onSearch={handleSearch}
          onReset={handleReset}
          loading={loading}
        />

        {/* 数据表格和分页 */}
        <div className='flex min-h-0 flex-1 flex-col'>
          <div className='min-h-0'>
            <VipLevelTable
              vipLevels={vipLevels}
              loading={loading}
              pagination={pagination}
              onEdit={handleOpenEditDialog}
              onView={handleOpenViewDialog}
              onDelete={handleDeleteVipLevel}
              onToggleDisabled={handleToggleDisabled}
              emptyState={{
                icon: <Crown className='h-8 w-8 text-muted-foreground' />,
                title: hasActiveFilters ? '未找到匹配的VIP等级' : '还没有VIP等级',
                description: hasActiveFilters
                  ? '请尝试调整筛选条件以查看更多结果'
                  : '开始创建VIP等级来管理用户权益',
                action: !hasActiveFilters ? (
                  <Button onClick={handleOpenCreateDialog} size='sm' className='mt-2'>
                    <Plus className='mr-2 h-4 w-4' />
                    创建等级
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

        {/* TODO: VIP等级对话框（创建/编辑/查看） */}
      </div>
    </PageContainer>
  );
}
