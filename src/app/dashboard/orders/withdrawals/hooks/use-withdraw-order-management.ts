import { useState, useCallback } from 'react';
import { WithdrawOrderAPI } from '@/service/api/withdraw-order';
import type {
  WithdrawOrder,
  WithdrawOrderFilters,
  WithdrawOrderStats,
  AuditOrderParams,
  MarkPayoutParams
} from '../types';
import { toast } from 'sonner';

export function useWithdrawOrderManagement() {
  const [orders, setOrders] = useState<WithdrawOrder[]>([]);
  const [stats, setStats] = useState<WithdrawOrderStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0
  });

  // 获取订单列表
  const fetchOrders = useCallback(async (filters?: WithdrawOrderFilters) => {
    setLoading(true);
    try {
      const response = await WithdrawOrderAPI.getWithdrawOrders(filters);
      if (response.success && response.data) {
        setOrders(response.data.data);
        setStats(response.data.stats);
        setPagination({
          page: response.data.pager.page,
          pageSize: response.data.pager.limit,
          total: response.data.pager.total,
          totalPages: Math.max(response.data.pager.totalPages || 0, 1)
        });
      } else {
        toast.error(response.message || '获取订单列表失败');
        setOrders([]);
        setStats(null);
      }
    } catch (error) {
      console.error('获取订单列表失败:', error);
      toast.error('获取订单列表失败');
      setOrders([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // 刷新订单列表
  const refreshOrders = useCallback(
    async (filters?: WithdrawOrderFilters) => {
      await fetchOrders(filters);
    },
    [fetchOrders]
  );

  // 导出订单
  const exportOrders = useCallback(async (filters?: WithdrawOrderFilters) => {
    try {
      const response = await WithdrawOrderAPI.exportOrders(filters);
      if (response.success && response.data) {
        toast.success(response.data.message || '导出任务已创建');
        return true;
      } else {
        toast.error(response.message || '导出失败');
        return false;
      }
    } catch (error) {
      console.error('导出订单失败:', error);
      toast.error('导出订单失败');
      return false;
    }
  }, []);

  // 审核订单
  const auditOrder = useCallback(async (params: AuditOrderParams) => {
    try {
      const response = await WithdrawOrderAPI.auditOrder(params);
      if (response.success && response.data) {
        // 更新本地订单列表
        setOrders((prev) =>
          prev.map((order) =>
            order.id === params.orderId ? response.data! : order
          )
        );
        toast.success(params.action === 'approve' ? '审核通过' : '审核拒绝');
        return true;
      } else {
        toast.error(response.message || '审核失败');
        return false;
      }
    } catch (error) {
      console.error('审核订单失败:', error);
      toast.error('审核订单失败');
      return false;
    }
  }, []);

  // 批量审核订单
  const batchAuditOrders = useCallback(
    async (
      orderIds: number[],
      action: 'approve' | 'reject',
      remark: string
    ) => {
      try {
        const response = await WithdrawOrderAPI.batchAuditOrders(
          orderIds,
          action,
          remark
        );
        if (response.success && response.data) {
          toast.success(
            `批量审核完成：成功 ${response.data.successCount} 条，失败 ${response.data.failedCount} 条`
          );
          return true;
        } else {
          toast.error(response.message || '批量审核失败');
          return false;
        }
      } catch (error) {
        console.error('批量审核订单失败:', error);
        toast.error('批量审核订单失败');
        return false;
      }
    },
    []
  );

  // 标记出款结果
  const markPayoutResult = useCallback(async (params: MarkPayoutParams) => {
    try {
      const response = await WithdrawOrderAPI.markPayoutResult(params);
      if (response.success && response.data) {
        // 更新本地订单列表
        setOrders((prev) =>
          prev.map((order) =>
            order.id === params.orderId ? response.data! : order
          )
        );
        toast.success(
          params.action === 'success' ? '标记出款成功' : '标记出款失败'
        );
        return true;
      } else {
        toast.error(response.message || '标记出款结果失败');
        return false;
      }
    } catch (error) {
      console.error('标记出款结果失败:', error);
      toast.error('标记出款结果失败');
      return false;
    }
  }, []);

  // 更新订单备注
  const updateOrderRemark = useCallback(
    async (orderId: number, remark: string) => {
      try {
        const response = await WithdrawOrderAPI.updateOrderRemark(
          orderId,
          remark
        );
        if (response.success && response.data) {
          // 更新本地订单列表中的备注
          setOrders((prev) =>
            prev.map((order) =>
              order.id === orderId ? { ...order, remark } : order
            )
          );
          toast.success('备注更新成功');
          return true;
        } else {
          toast.error(response.message || '更新备注失败');
          return false;
        }
      } catch (error) {
        console.error('更新备注失败:', error);
        toast.error('更新备注失败');
        return false;
      }
    },
    []
  );

  return {
    orders,
    stats,
    loading,
    pagination,
    fetchOrders,
    refreshOrders,
    exportOrders,
    auditOrder,
    batchAuditOrders,
    markPayoutResult,
    updateOrderRemark
  };
}
