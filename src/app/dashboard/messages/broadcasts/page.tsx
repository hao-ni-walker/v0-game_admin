'use client';

import React, { useCallback, useEffect } from 'react';
import { Megaphone } from 'lucide-react';

import { Pagination } from '@/components/table/pagination';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';

import {
  BroadcastPageHeader,
  BroadcastFilters,
  BroadcastTable,
  BroadcastComposeDialog,
} from './components';
import { useBroadcastFilters, useBroadcastManagement } from './hooks';
import { PAGE_SIZE_OPTIONS } from './constants';

export default function BroadcastsPage() {
  const {
    filters,
    onSearch,
    updatePagination,
    clearFilters,
    hasActiveFilters,
  } = useBroadcastFilters();

  const {
    items,
    loading,
    pagination,
    composeOpen,
    openCompose,
    closeCompose,
    fetchList,
    create,
    approve,
    reject,
  } = useBroadcastManagement();

  useEffect(() => {
    fetchList(filters);
  }, [filters, fetchList]);

  const handleSearch = (next: Partial<typeof filters>) => {
    onSearch(next);
  };

  const handleReset = () => {
    clearFilters();
  };

  const handlePageChange = (page: number) => {
    updatePagination(page, filters.page_size);
  };

  const handlePageSizeChange = (pageSize: number) => {
    updatePagination(1, pageSize);
  };

  const handleRefresh = () => {
    fetchList(filters);
  };

  const handleApprove = useCallback(
    async (item: (typeof items)[number]) => {
      const ok = await approve(item.broadcast_id);
      if (ok) fetchList(filters);
    },
    [approve, fetchList, filters]
  );

  const handleReject = useCallback(
    async (item: (typeof items)[number]) => {
      const ok = await reject(item.broadcast_id);
      if (ok) fetchList(filters);
    },
    [reject, fetchList, filters]
  );

  const handleSubmitCompose = async (
    data: Parameters<typeof create>[0]
  ) => {
    const ok = await create(data);
    if (ok) fetchList(filters);
    return ok;
  };

  return (
    <PageContainer>
      <div className='flex w-full flex-col space-y-4'>
        <BroadcastPageHeader
          onRefresh={handleRefresh}
          onCompose={openCompose}
          loading={loading}
        />

        <BroadcastFilters
          filters={filters}
          onSearch={handleSearch}
          onReset={handleReset}
          loading={loading}
        />

        {items.length === 0 && !loading ? (
          <div className='flex flex-col items-center justify-center space-y-3 rounded-md border p-8'>
            <Megaphone className='text-muted-foreground h-12 w-12' />
            <div className='text-center'>
              <p className='text-lg font-medium'>
                {hasActiveFilters ? '未找到匹配的群发' : '暂无群发记录'}
              </p>
              <p className='text-muted-foreground text-sm'>
                {hasActiveFilters
                  ? '请尝试调整筛选条件以查看更多结果'
                  : '点击右上角“新建群发”开始'}
              </p>
            </div>
            {hasActiveFilters && (
              <Button variant='outline' onClick={handleReset}>
                清除筛选
              </Button>
            )}
          </div>
        ) : (
          <BroadcastTable
            data={items}
            loading={loading}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        )}

        {items.length > 0 && (
          <Pagination
            pagination={{
              page: pagination.page,
              limit: pagination.size,
              total: pagination.total,
              totalPages: Math.ceil(pagination.total / pagination.size),
            }}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
          />
        )}

        <BroadcastComposeDialog
          open={composeOpen}
          onOpenChange={(open) => {
            if (!open) closeCompose();
          }}
          onSubmit={handleSubmitCompose}
        />
      </div>
    </PageContainer>
  );
}
