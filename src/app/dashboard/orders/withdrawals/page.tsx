'use client';

import { useEffect, useState } from 'react';
import { ArrowDownCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/table/pagination';
import PageContainer from '@/components/layout/page-container';
import {
  WithdrawOrderStatsCards,
  WithdrawOrderFilters,
  WithdrawOrderTable,
  WithdrawOrderDetailDrawer,
  WithdrawOrderPageHeader
} from './components';
import { useWithdrawOrderFilters, useWithdrawOrderManagement } from './hooks';
import type { WithdrawOrder } from './types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function WithdrawOrdersPage() {
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [batchAuditDialogOpen, setBatchAuditDialogOpen] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);
  const [batchAuditAction, setBatchAuditAction] = useState<
    'approve' | 'reject'
  >('approve');
  const [batchAuditRemark, setBatchAuditRemark] = useState('');

  const {
    filters,
    searchFilters,
    updatePagination,
    clearFilters,
    hasActiveFilters
  } = useWithdrawOrderFilters();

  const {
    orders,
    stats,
    loading,
    pagination,
    fetchOrders,
    refreshOrders,
    exportOrders,
    auditOrder,
    batchAuditOrders
  } = useWithdrawOrderManagement();

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

  // 处理状态 Tab 变化
  const handleStatusTabChange = (status: string) => {
    if (status === 'all') {
      searchFilters({ statuses: undefined });
    } else {
      searchFilters({ statuses: [status as any] });
    }
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
  const handleViewOrder = (order: WithdrawOrder) => {
    setSelectedOrderId(order.id);
    setDrawerOpen(true);
  };

  // 处理审核订单
  const handleAuditOrder = (order: WithdrawOrder) => {
    setSelectedOrderId(order.id);
    setDrawerOpen(true);
    // 详情抽屉中会处理审核操作
  };

  // 处理选择变化
  const handleSelectChange = (selectedIds: number[]) => {
    setSelectedOrderIds(selectedIds);
  };

  // 处理批量审核
  const handleBatchAudit = () => {
    if (selectedOrderIds.length === 0) {
      toast.error('请先选择要审核的订单');
      return;
    }
    setBatchAuditDialogOpen(true);
  };

  // 确认批量审核
  const handleConfirmBatchAudit = async () => {
    if (!batchAuditRemark.trim() && batchAuditAction === 'reject') {
      toast.error('拒绝时必须填写原因');
      return;
    }

    const success = await batchAuditOrders(
      selectedOrderIds,
      batchAuditAction,
      batchAuditRemark
    );
    if (success) {
      setBatchAuditDialogOpen(false);
      setBatchAuditRemark('');
      setSelectedOrderIds([]);
      fetchOrders(filters);
    }
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
    setSelectedOrderIds([]);
  };

  return (
    <PageContainer scrollable={false}>
      <div className='flex h-[calc(100vh-8rem)] w-full flex-col space-y-4'>
        {/* 页面头部 */}
        <WithdrawOrderPageHeader
          onRefresh={handleRefresh}
          onBatchAudit={handleBatchAudit}
          selectedCount={selectedOrderIds.length}
          loading={loading}
        />

        {/* 统计概览 */}
        <WithdrawOrderStatsCards stats={stats} loading={loading} />

        {/* 搜索和筛选 */}
        <WithdrawOrderFilters
          filters={filters}
          onSearch={handleSearch}
          onReset={handleReset}
          onExport={handleExport}
          onStatusTabChange={handleStatusTabChange}
          loading={loading}
        />

        {/* 数据表格和分页 */}
        <div className='flex min-h-0 flex-1 flex-col'>
          <div className='min-h-0 flex-1'>
            <WithdrawOrderTable
              orders={orders}
              loading={loading}
              pagination={pagination}
              onView={handleViewOrder}
              onAudit={handleAuditOrder}
              onSelectChange={handleSelectChange}
              emptyState={{
                icon: (
                  <ArrowDownCircle className='text-muted-foreground h-8 w-8' />
                ),
                title: hasActiveFilters ? '未找到匹配的订单' : '还没有订单',
                description: hasActiveFilters
                  ? '请尝试调整筛选条件以查看更多结果'
                  : '暂无提现订单数据'
              }}
            />
          </div>

          {/* 分页 */}
          <div className='bg-card mt-auto border-t pt-4'>
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
        </div>

        {/* 订单详情抽屉 */}
        <WithdrawOrderDetailDrawer
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
                将导出当前筛选条件下的所有订单数据为 CSV 文件，预计导出{' '}
                {pagination.total} 条记录。文件将自动下载到您的设备。
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
                {loading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    导出中...
                  </>
                ) : (
                  '确认导出'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 批量审核对话框 */}
        <Dialog
          open={batchAuditDialogOpen}
          onOpenChange={setBatchAuditDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>批量审核</DialogTitle>
              <DialogDescription>
                将对选中的 {selectedOrderIds.length} 条订单进行批量审核操作
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-4 py-4'>
              <div className='space-y-2'>
                <Label>审核操作</Label>
                <div className='flex gap-2'>
                  <Button
                    variant={
                      batchAuditAction === 'approve' ? 'default' : 'outline'
                    }
                    size='sm'
                    onClick={() => setBatchAuditAction('approve')}
                  >
                    审核通过
                  </Button>
                  <Button
                    variant={
                      batchAuditAction === 'reject' ? 'destructive' : 'outline'
                    }
                    size='sm'
                    onClick={() => setBatchAuditAction('reject')}
                  >
                    审核拒绝
                  </Button>
                </div>
              </div>
              <div className='space-y-2'>
                <Label>
                  {batchAuditAction === 'approve' ? '审核备注' : '拒绝原因'} *
                </Label>
                <Textarea
                  value={batchAuditRemark}
                  onChange={(e) => setBatchAuditRemark(e.target.value)}
                  placeholder={
                    batchAuditAction === 'approve'
                      ? '输入审核备注（可选）'
                      : '请输入拒绝原因'
                  }
                  rows={4}
                  required={batchAuditAction === 'reject'}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => {
                  setBatchAuditDialogOpen(false);
                  setBatchAuditRemark('');
                }}
              >
                取消
              </Button>
              <Button onClick={handleConfirmBatchAudit} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    提交中...
                  </>
                ) : (
                  '确认'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  );
}
