'use client';

import { useEffect } from 'react';
import { Server } from 'lucide-react';
import { Pagination } from '@/components/table/pagination';
import PageContainer from '@/components/layout/page-container';

import {
  PlatformPageHeader,
  PlatformFilters,
  PlatformTable
} from './components';
import { usePlatformFilters, usePlatformManagement } from './hooks';
import { PAGE_SIZE_OPTIONS } from './constants';

export default function PlatformPage() {
  // 使用自定义hooks
  const {
    filters,
    searchFilters,
    updatePagination,
    clearFilters,
    hasActiveFilters
  } = usePlatformFilters();

  const { platforms, loading, pagination, fetchPlatforms, refreshPlatforms } =
    usePlatformManagement();

  // 初始化和筛选条件变化时获取数据
  useEffect(() => {
    fetchPlatforms(filters);
  }, [filters, fetchPlatforms]);

  // 处理查询
  const handleSearch = (newFilters: any) => {
    searchFilters(newFilters);
  };

  // 处理重置
  const handleReset = () => {
    clearFilters();
  };

  // 处理分页变化
  const handlePageChange = (page: number) => {
    updatePagination({ page });
  };

  // 处理页面大小变化
  const handlePageSizeChange = (page_size: number) => {
    updatePagination({ page_size, page: 1 });
  };

  // 处理刷新
  const handleRefresh = () => {
    refreshPlatforms(filters);
  };

  // 处理编辑
  const handleEdit = (platform: any) => {
    // TODO: 实现编辑功能
    console.log('编辑平台:', platform);
  };

  // 处理删除
  const handleDelete = async (platform: any) => {
    // TODO: 实现删除功能
    console.log('删除平台:', platform);
    // 删除成功后刷新列表
    await refreshPlatforms(filters);
  };

  // 处理切换启用状态
  const handleToggleEnabled = async (platform: any) => {
    // TODO: 实现切换启用状态功能
    console.log('切换平台启用状态:', platform);
    // 切换成功后刷新列表
    await refreshPlatforms(filters);
  };

  return (
    <PageContainer scrollable={false}>
      <div className='flex h-[calc(100vh-8rem)] w-full flex-col space-y-4'>
        {/* 页面头部 */}
        <PlatformPageHeader onRefresh={handleRefresh} loading={loading} />

        {/* 搜索和筛选 */}
        <PlatformFilters
          filters={filters}
          onSearch={handleSearch}
          onReset={handleReset}
          loading={loading}
        />

        {/* 数据表格和分页 */}
        <div className='flex min-h-0 flex-1 flex-col'>
          <div className='min-h-0'>
            <PlatformTable
              platforms={platforms}
              loading={loading}
              pagination={pagination}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleEnabled={handleToggleEnabled}
              emptyState={{
                icon: <Server className='text-muted-foreground h-8 w-8' />,
                title: hasActiveFilters ? '未找到匹配的平台' : '还没有平台数据',
                description: hasActiveFilters
                  ? '请尝试调整筛选条件以查看更多结果'
                  : '暂无平台数据'
              }}
            />
          </div>

          {/* 分页控件 */}
          {pagination && pagination.total > 0 && (
            <div className='flex-shrink-0 pt-4'>
              <Pagination
                pagination={{
                  page: pagination.page,
                  limit: pagination.page_size,
                  total: pagination.total,
                  totalPages: pagination.totalPages
                }}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                pageSizeOptions={PAGE_SIZE_OPTIONS}
              />
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
