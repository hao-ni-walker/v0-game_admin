'use client';

import React, { useEffect } from 'react';

import { Pagination } from '@/components/table/pagination';
import PageContainer from '@/components/layout/page-container';

import {
  OperationLogFilters,
  OperationLogTable,
  OperationLogPageHeader,
  OperationLogDetailDialog,
} from './components';
import { useOperationLogFilters, useOperationLogManagement } from './hooks';
import { PAGE_SIZE_OPTIONS } from './constants';

export default function LogsPage() {
  const {
    filters,
    searchFilters,
    updatePagination,
    clearFilters,
    hasActiveFilters,
  } = useOperationLogFilters();

  const {
    logs,
    loading,
    pagination,
    dialogState,
    fetchLogs,
    refreshLogs,
    openDetailDialog,
    closeDialog,
  } = useOperationLogManagement();

  useEffect(() => {
    fetchLogs(filters);
  }, [filters, fetchLogs]);

  const handleSearch = (newFilters: any) => {
    searchFilters(newFilters);
  };

  const handleReset = () => {
    clearFilters();
  };

  const handlePageChange = (page: number) => {
    updatePagination({ page });
  };

  const handlePageSizeChange = (limit: number) => {
    updatePagination({ pageSize: limit, page: 1 });
  };

  const handleRefresh = () => {
    refreshLogs(filters);
  };

  return (
    <PageContainer>
      <div className='flex w-full flex-col space-y-4'>
        <OperationLogPageHeader
          onRefresh={handleRefresh}
          loading={loading}
        />

        <OperationLogFilters
          filters={filters}
          onSearch={handleSearch}
          onReset={handleReset}
          loading={loading}
        />

        <OperationLogTable
          data={logs}
          loading={loading}
          pagination={pagination}
          onView={openDetailDialog}
        />

        <Pagination
          pagination={pagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
        />

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
