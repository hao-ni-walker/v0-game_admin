'use client';

import React, { useEffect } from 'react';

import PageContainer from '@/components/layout/page-container';

import {
  OperationReportFilters,
  OperationReportTable,
  OperationReportPageHeader
} from './components';
import {
  useOperationReportFilters,
  useOperationReportManagement
} from './hooks';

export default function AnalyticsReportsPage() {
  // 使用自定义hooks
  const { filters, searchFilters, clearFilters, hasActiveFilters } =
    useOperationReportFilters();

  const { reports, loading, total, fetchReports, refreshReports } =
    useOperationReportManagement();

  // 初始化和筛选条件变化时获取数据
  useEffect(() => {
    fetchReports(filters);
  }, [filters, fetchReports]);

  // 处理查询
  const handleSearch = (newFilters: any) => {
    searchFilters(newFilters);
  };

  // 处理重置
  const handleReset = () => {
    clearFilters();
  };

  // 处理刷新
  const handleRefresh = () => {
    refreshReports(filters);
  };

  return (
    <PageContainer scrollable={false}>
      <div className='flex min-h-0 flex-col gap-4'>
        {/* 页面头部 */}
        <OperationReportPageHeader
          onRefresh={handleRefresh}
          loading={loading}
        />

        {/* 搜索和筛选 */}
        <OperationReportFilters
          filters={filters}
          onSearch={handleSearch}
          onReset={handleReset}
          loading={loading}
        />

        {/* 数据表格 */}
        <div className='flex min-h-0 flex-col'>
          <OperationReportTable data={reports} loading={loading} />
        </div>
      </div>
    </PageContainer>
  );
}
