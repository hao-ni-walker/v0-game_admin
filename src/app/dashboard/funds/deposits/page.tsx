'use client';

import { useEffect, useState } from 'react';
import { Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/table/pagination';
import PageContainer from '@/components/layout/page-container';
import {
  DepositOrderStatsCards,
  DepositOrderFilters,
  DepositOrderTable,
  DepositOrderDetailDrawer,
  DepositOrderPageHeader
} from './components';
import { useDepositOrderFilters, useDepositOrderManagement } from './hooks';
import type { DepositOrder } from './types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function DepositOrdersPage() {
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const {
    filters,
    searchFilters,
    updatePagination,
    clearFilters,
    hasActiveFilters
  } = useDepositOrderFilters();

  const {
    orders,
    stats,
    loading,
    pagination,
    fetchOrders,
    refreshOrders,
    exportOrders
  } = useDepositOrderManagement();

  // 初始化和筛选条件变化时获取数据
  useEffect(() => {
    fetchOrders(filters);
  }, [filters, fetchOrders]);

  // 处理查询
  const handleSearch = (newFilters: Partial<typeof filters>) => {
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
    refreshOrders(filters);
  };

  // 处理查看订单详情
  const handleViewOrder = (order: DepositOrder) => {
    setSelectedOrderId(order.id);
    setDrawerOpen(true);
  };

  // 处理导出
  const handleExport = () => {
    setExportDialogOpen(true);
  };

  // 确认导出
  const handleConfirmExport = async () => {
    const success = await exportOrders(filters);
    if (success) {
      setExportDialogOpen(false);
    }
  };

  // 处理订单更新
  const handleOrderUpdate = () => {
    fetchOrders(filters);
  };

  return (
    <PageContainer scrollable={false}>
      <div className='flex h-[calc(100vh-8rem)] w-full flex-col space-y-4'>
        {/* 页面头部 */}
        <DepositOrderPageHeader onRefresh={handleRefresh} loading={loading} />

        {/* 统计概览 */}
        <DepositOrderStatsCards stats={stats} loading={loading} />

        {/* 搜索和筛选 */}
        <DepositOrderFilters
          filters={filters}
          onSearch={handleSearch}
          onReset={handleReset}
          onExport={handleExport}
          loading={loading}
        />

        {/* 数据表格和分页 */}
        <div className='flex min-h-0 flex-1 flex-col'>
          <div className='min-h-0 flex-1 overflow-y-auto'>
            <DepositOrderTable
              orders={orders}
              loading={loading}
              pagination={pagination}
              onView={handleViewOrder}
              emptyState={{
                icon: <Wallet className='text-muted-foreground h-8 w-8' />,
                title: hasActiveFilters ? '未找到匹配的订单' : '还没有订单',
                description: hasActiveFilters
                  ? '请尝试调整筛选条件以查看更多结果'
                  : '暂无储值订单数据'
              }}
            />
          </div>

          {/* 分页 */}
          {pagination.total > 0 && (
            <div className='bg-card mt-auto shrink-0 border-t pt-4'>
              <Pagination
                pagination={{
                  page: pagination.page,
                  limit: pagination.pageSize,
                  total: pagination.total,
                  totalPages: pagination.totalPages
                }}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                pageSizeOptions={[20, 50, 100]}
              />
            </div>
          )}
        </div>

        {/* 订单详情抽屉 */}
        <DepositOrderDetailDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          orderId={selectedOrderId}
          onOrderUpdate={handleOrderUpdate}
        />

        {/* 导出确认对话框 */}
        <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>确认导出</DialogTitle>
              <DialogDescription>
                将导出当前筛选条件下的所有订单数据，预计导出 {pagination.total}{' '}
                条记录。CSV 文件将直接下载到您的设备。
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setExportDialogOpen(false)}
              >
                取消
              </Button>
              <Button onClick={handleConfirmExport} disabled={loading}>
                确认导出
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  );
}
