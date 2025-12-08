import { useState, useCallback } from 'react';
import { DepositOrderAPI } from '@/service/api/deposit-order';
import type {
  DepositOrder,
  DepositOrderFilters,
  DepositOrderStats,
  UserWallet,
  WalletTransaction
} from '../types';
import { toast } from 'sonner';

export function useDepositOrderManagement() {
  const [orders, setOrders] = useState<DepositOrder[]>([]);
  const [stats, setStats] = useState<DepositOrderStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0
  });

  // 获取订单列表
  const fetchOrders = useCallback(async (filters?: DepositOrderFilters) => {
    setLoading(true);
    try {
      const response = await DepositOrderAPI.getDepositOrders(filters);
      if (response.success && response.data) {
        setOrders(response.data.data);
        setStats(response.data.stats);
        setPagination({
          page: response.data.pager.page,
          pageSize: response.data.pager.limit,
          total: response.data.pager.total,
          totalPages: response.data.pager.totalPages
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
    async (filters?: DepositOrderFilters) => {
      await fetchOrders(filters);
    },
    [fetchOrders]
  );

  // 导出订单
  const exportOrders = useCallback(async (filters?: DepositOrderFilters) => {
    try {
      const response = await DepositOrderAPI.exportOrders(filters);
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

  // 更新订单备注
  const updateOrderRemark = useCallback(
    async (orderId: number, remark: string) => {
      try {
        const response = await DepositOrderAPI.updateOrderRemark(
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
    updateOrderRemark
  };
}
