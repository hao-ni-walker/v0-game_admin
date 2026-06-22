'use client';

import React, { useCallback, useEffect } from 'react';
import { Mail } from 'lucide-react';

import { Pagination } from '@/components/table/pagination';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';

import {
  MessagePageHeader,
  MessageFilters,
  MessageTable,
  MessageDetailDialog,
  MessageComposeDialog,
} from './components';
import { useMessageFilters, useMessageManagement } from './hooks';
import { PAGE_SIZE_OPTIONS } from './constants';

export default function MessagesPage() {
  const {
    filters,
    onSearch,
    updatePagination,
    clearFilters,
    hasActiveFilters,
  } = useMessageFilters();

  const {
    messages,
    loading,
    pagination,
    fetchMessages,
    sendMessage,
    recallMessage,
    detailMessage,
    detailOpen,
    openDetail,
    closeDetail,
    composeOpen,
    openCompose,
    closeCompose,
  } = useMessageManagement();

  useEffect(() => {
    fetchMessages(filters);
  }, [filters, fetchMessages]);

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
    fetchMessages(filters);
  };

  const handleRecall = useCallback(
    async (msg: (typeof messages)[number]) => {
      const ok = await recallMessage(msg.message_id);
      if (ok) fetchMessages(filters);
    },
    [recallMessage, fetchMessages, filters]
  );

  const handleSubmitCompose = async (
    data: Parameters<typeof sendMessage>[0]
  ) => {
    const ok = await sendMessage(data);
    if (ok) fetchMessages(filters);
    return ok;
  };

  return (
    <PageContainer scrollable={false}>
      <div className='flex h-[calc(100vh-8rem)] w-full flex-col space-y-4'>
        <MessagePageHeader
          onRefresh={handleRefresh}
          onCompose={openCompose}
          loading={loading}
        />

        <MessageFilters
          filters={filters}
          onSearch={handleSearch}
          onReset={handleReset}
          loading={loading}
        />

        <div className='flex min-h-0 flex-1 flex-col'>
          <div className='min-h-0 flex-1'>
            {messages.length === 0 && !loading ? (
              <div className='flex h-full flex-col items-center justify-center space-y-3 p-8'>
                <Mail className='text-muted-foreground h-12 w-12' />
                <div className='text-center'>
                  <p className='text-lg font-medium'>
                    {hasActiveFilters ? '未找到匹配的消息' : '暂无消息记录'}
                  </p>
                  <p className='text-muted-foreground text-sm'>
                    {hasActiveFilters
                      ? '请尝试调整筛选条件以查看更多结果'
                      : '系统会按发送时间倒序展示所有站内信'}
                  </p>
                </div>
                {hasActiveFilters && (
                  <Button variant='outline' onClick={handleReset}>
                    清除筛选
                  </Button>
                )}
              </div>
            ) : (
              <MessageTable
                data={messages}
                loading={loading}
                pagination={pagination}
                onView={openDetail}
                onRecall={handleRecall}
              />
            )}
          </div>

          {messages.length > 0 && (
            <div className='flex-shrink-0 pt-4'>
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
            </div>
          )}
        </div>

        <MessageDetailDialog
          message={detailMessage}
          open={detailOpen}
          onOpenChange={(open) => {
            if (!open) closeDetail();
          }}
        />

        <MessageComposeDialog
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
