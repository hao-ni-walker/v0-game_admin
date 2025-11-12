'use client';

import React, { useEffect } from 'react';
import { FileText } from 'lucide-react';

import { Pagination } from '@/components/table/pagination';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';

import {
  OperationLogFilters,
  OperationLogTable,
  OperationLogPageHeader,
  OperationLogDetailDialog
} from '../components';
import { useOperationLogFilters, useOperationLogManagement } from '../hooks';
import { PAGE_SIZE_OPTIONS } from '../constants';

export default function OperationLogsPage() {
  // 使用自定义hooks
  const {
    filters,
    searchFilters,
    updatePagination,
    clearFilters,
    hasActiveFilters
  } = useOperationLogFilters();

  const {
    logs,
    loading,
    pagination,
    dialogState,
    fetchLogs,
    refreshLogs,
    exportLogs,
    openDetailDialog,
    closeDialog
  } = useOperationLogManagement();

  // 初始化和筛选条件变化时获取数据
  useEffect(() => {
    fetchLogs(filters);
  }, [filters, fetchLogs]);

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
  const handlePageSizeChange = (pageSize: number) => {
    updatePagination({ pageSize, page: 1 });
  };

  // 处理刷新
  const handleRefresh = () => {
    refreshLogs(filters);
  };

  // 处理导出
  const handleExport = () => {
    exportLogs(filters);
  };

  return (
    <PageContainer scrollable={false}>
      <div className='flex h-[calc(100vh-8rem)] w-full flex-col space-y-4'>
        {/* 页面头部 */}
        <OperationLogPageHeader
          onRefresh={handleRefresh}
          onExport={handleExport}
          loading={loading}
        />

        {/* 搜索和筛选 */}
        <OperationLogFilters
          filters={filters}
          onSearch={handleSearch}
          onReset={handleReset}
          loading={loading}
        />

        {/* 数据表格和分页 */}
        <div className='flex min-h-0 flex-1 flex-col'>
          <div className='min-h-0 flex-1'>
            {logs.length === 0 && !loading ? (
              <div className='flex h-full flex-col items-center justify-center space-y-3 p-8'>
                <FileText className='text-muted-foreground h-12 w-12' />
                <div className='text-center'>
                  <p className='text-lg font-medium'>
                    {hasActiveFilters
                      ? '未找到匹配的操作日志'
                      : '暂无操作日志'}
                  </p>
                  <p className='text-muted-foreground text-sm'>
                    {hasActiveFilters
                      ? '请尝试调整筛选条件以查看更多结果'
                      : '系统暂无用户操作审计记录'}
                  </p>
                </div>
                {hasActiveFilters && (
                  <Button variant='outline' onClick={handleReset}>
                    清除筛选
                  </Button>
                )}
              </div>
            ) : (
              <OperationLogTable
                data={logs}
                loading={loading}
                pagination={pagination}
                onView={openDetailDialog}
              />
            )}
          </div>

          {/* 分页控件 */}
          {logs.length > 0 && (
            <div className='flex-shrink-0 pt-4'>
              <Pagination
                pagination={{
                  ...pagination,
                  limit: pagination.limit
                }}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                pageSizeOptions={PAGE_SIZE_OPTIONS}
              />
            </div>
          )}
        </div>

        {/* 日志详情弹窗 */}
        <OperationLogDetailDialog
          log={dialogState.log}
          open={dialogState.open}
          onOpenChange={(open) => {
            if (!open) {
              closeDialog();
            }
          }}
        />
      </div>
    </PageContainer>
  );
}
