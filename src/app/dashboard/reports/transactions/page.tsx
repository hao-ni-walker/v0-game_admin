'use client';

import React, { useEffect } from 'react';

import { Pagination } from '@/components/table/pagination';
import PageContainer from '@/components/layout/page-container';

import {
  GameFlowFilters,
  GameFlowTable,
  GameFlowPageHeader
} from './components';
import { useGameFlowFilters, useGameFlowManagement } from './hooks';
import { PAGE_SIZE_OPTIONS } from './constants';

export default function AnalyticsFlowsPage() {
  // 使用自定义hooks
  const {
    filters,
    searchFilters,
    updatePagination,
    clearFilters,
    hasActiveFilters
  } = useGameFlowFilters();

  const { flows, loading, pagination, fetchFlows, refreshFlows } =
    useGameFlowManagement();

  // 初始化和筛选条件变化时获取数据
  useEffect(() => {
    fetchFlows(filters);
  }, [filters, fetchFlows]);

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
  const handlePageSizeChange = (limit: number) => {
    updatePagination({ page_size: limit, page: 1 });
  };

  // 处理刷新
  const handleRefresh = () => {
    refreshFlows(filters);
  };

  return (
    <PageContainer scrollable={false}>
      <div className='flex h-[calc(100vh-8rem)] w-full flex-col space-y-4'>
        {/* 页面头部 */}
        <GameFlowPageHeader
          filters={filters}
          onRefresh={handleRefresh}
          loading={loading}
        />

        {/* 搜索和筛选 */}
        <GameFlowFilters
          filters={filters}
          onSearch={handleSearch}
          onReset={handleReset}
          loading={loading}
        />

        {/* 数据表格 */}
        <div className='flex min-h-0 flex-col'>
          <GameFlowTable
            data={flows}
            loading={loading}
            pagination={pagination}
          />

          {/* 分页控件 */}
          <Pagination
            pagination={pagination}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
          />
        </div>
      </div>
    </PageContainer>
  );
}
