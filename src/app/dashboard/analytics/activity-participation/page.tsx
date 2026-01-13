'use client';

import React, { useEffect } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Pagination } from '@/components/table/pagination';

import {
  ActivityParticipationFilters,
  ActivityParticipationTable,
  ActivityParticipationPageHeader
} from './components';
import {
  useActivityParticipationFilters,
  useActivityParticipationManagement
} from './hooks';

export default function ActivityParticipationPage() {
  const { filters, updateFilters, resetFilters } =
    useActivityParticipationFilters();
  const { data, loading, fetchRecords } = useActivityParticipationManagement();

  useEffect(() => {
    fetchRecords(filters);
  }, [filters, fetchRecords]);

  const handleSearch = (newFilters: any) => {
    updateFilters({ ...newFilters, page: 1 });
  };

  const handleReset = () => {
    resetFilters();
  };

  const handleRefresh = () => {
    fetchRecords(filters);
  };

  const handlePageChange = (page: number) => {
    updateFilters({ page });
  };

  const handlePageSizeChange = (limit: number) => {
    updateFilters({ page_size: limit, page: 1 });
  };

  return (
    <PageContainer scrollable={false}>
      <div className='flex min-h-0 flex-col gap-4'>
        <ActivityParticipationPageHeader
          onRefresh={handleRefresh}
          loading={loading}
        />

        <ActivityParticipationFilters
          filters={filters}
          onSearch={handleSearch}
          onReset={handleReset}
          loading={loading}
        />

        <div className='flex min-h-0 flex-col gap-4'>
          <ActivityParticipationTable data={data.list} loading={loading} />

          {data.total > 0 && (
            <Pagination
              total={data.total}
              page={data.page}
              limit={data.page_size}
              onPageChange={handlePageChange}
              onLimitChange={handlePageSizeChange}
            />
          )}
        </div>
      </div>
    </PageContainer>
  );
}
