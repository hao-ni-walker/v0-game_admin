'use client';

import { useEffect, useState } from 'react';
import { Ticket, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/table/pagination';
import PageContainer from '@/components/layout/page-container';
import { useRouter } from 'next/navigation';
import { TicketTable, TicketFilters, TicketPageHeader } from './components';
import { useTicketFilters, useTicketManagement } from './hooks';
import type { Ticket as TicketType } from '@/repository/models';

export default function TicketsPage() {
  const router = useRouter();

  // 使用自定义hooks
  const {
    filters,
    searchFilters,
    updatePagination,
    clearFilters,
    hasActiveFilters
  } = useTicketFilters();

  const {
    tickets,
    loading,
    pagination,
    fetchTickets,
    refreshTickets,
    deleteTicket,
    assignTicket,
    changeStatus
  } = useTicketManagement();

  // 初始化和筛选条件变化时获取数据
  useEffect(() => {
    fetchTickets(filters);
  }, [filters, fetchTickets]);

  /**
   * 打开创建工单对话框
   */
  const handleCreateTicket = () => {
    router.push('/dashboard/tickets/create');
  };

  /**
   * 查看工单详情
   */
  const handleViewTicket = (ticket: TicketType) => {
    router.push(`/dashboard/tickets/${ticket.id}`);
  };

  /**
   * 删除工单
   */
  const handleDeleteTicket = async (ticket: TicketType) => {
    const success = await deleteTicket(ticket.id);
    if (success) {
      fetchTickets(filters);
    }
  };

  /**
   * 指派工单
   */
  const handleAssignTicket = async (
    ticketId: number,
    assigneeId: number | null
  ) => {
    const success = await assignTicket(ticketId, assigneeId);
    if (success) {
      fetchTickets(filters);
    }
  };

  /**
   * 更改状态
   */
  const handleChangeStatus = async (ticketId: number, status: string) => {
    const success = await changeStatus(ticketId, status as any);
    if (success) {
      fetchTickets(filters);
    }
  };

  /**
   * 刷新数据
   */
  const handleRefresh = () => {
    refreshTickets(filters);
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
  const handlePageSizeChange = (pageSize: number) => {
    updatePagination({ page_size: pageSize, page: 1 });
  };

  return (
    <PageContainer scrollable={false}>
      <div className='flex h-[calc(100vh-8rem)] w-full flex-col space-y-4'>
        {/* 页面头部 */}
        <TicketPageHeader
          onCreateTicket={handleCreateTicket}
          onRefresh={handleRefresh}
          loading={loading}
        />

        {/* 搜索和筛选 */}
        <TicketFilters
          filters={filters}
          onSearch={handleSearch}
          onReset={handleReset}
          loading={loading}
        />

        {/* 数据表格和分页 */}
        <div className='flex min-h-0 flex-1 flex-col'>
          <div className='min-h-0'>
            <TicketTable
              tickets={tickets}
              loading={loading}
              pagination={pagination}
              onView={handleViewTicket}
              onDelete={handleDeleteTicket}
              onAssign={handleAssignTicket}
              onChangeStatus={handleChangeStatus}
              emptyState={{
                icon: <Ticket className='text-muted-foreground h-8 w-8' />,
                title: hasActiveFilters ? '未找到匹配的工单' : '还没有工单',
                description: hasActiveFilters
                  ? '请尝试调整筛选条件以查看更多结果'
                  : '开始创建工单来管理客服支持',
                action: !hasActiveFilters ? (
                  <Button
                    onClick={handleCreateTicket}
                    size='sm'
                    className='mt-2'
                  >
                    <Plus className='mr-2 h-4 w-4' />
                    创建工单
                  </Button>
                ) : undefined
              }}
            />
          </div>

          {/* 分页 */}
          <div className='bg-card mt-auto border-t pt-4'>
            <Pagination
              pagination={{
                page: pagination.page,
                limit: pagination.page_size,
                total: pagination.total,
                totalPages: Math.ceil(pagination.total / pagination.page_size)
              }}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={[10, 20, 50, 100]}
            />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
