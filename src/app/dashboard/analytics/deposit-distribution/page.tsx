'use client';

import React, { useEffect } from 'react';

import PageContainer from '@/components/layout/page-container';

import {
  DepositDistributionFilters,
  DepositDistributionTable,
  DepositDistributionPageHeader
} from './components';
import {
  useDepositDistributionFilters,
  useDepositDistributionManagement
} from './hooks';

export default function DepositDistributionPage() {
  // 使用自定义hooks
  const { filters, searchFilters, clearFilters, hasActiveFilters } =
    useDepositDistributionFilters();

  const { distributionData, loading, fetchDistribution, refreshDistribution } =
    useDepositDistributionManagement();

  // 初始化和筛选条件变化时获取数据
  useEffect(() => {
    fetchDistribution(filters);
  }, [filters, fetchDistribution]);

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
    refreshDistribution(filters);
  };

  return (
    <PageContainer scrollable={false}>
      <div className='flex h-[calc(100vh-8rem)] w-full flex-col space-y-4'>
        {/* 页面头部 */}
        <DepositDistributionPageHeader
          onRefresh={handleRefresh}
          loading={loading}
        />

        {/* 搜索和筛选 */}
        <DepositDistributionFilters
          filters={filters}
          onSearch={handleSearch}
          onReset={handleReset}
          loading={loading}
        />

        {/* 数据表格 */}
        <div className='flex min-h-0 flex-col'>
          <DepositDistributionTable data={distributionData} loading={loading} />
        </div>
      </div>
    </PageContainer>
  );
}
