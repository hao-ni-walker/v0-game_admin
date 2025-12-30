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
import { transformDepositOrderList } from '../utils/transform';

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
        // 处理实际返回的数据结构
        // 后端返回: { code: 0, data: { items: [], total, page, page_size, total_pages } }
        // 或者期望的结构: { data: { data: [], stats: {}, pager: {} } }

        let ordersList: any[] = [];
        let paginationData: any = {};
        let statsData: DepositOrderStats | null = null;

        // 检查是否是新的数据结构（items 格式）
        if ('items' in response.data && Array.isArray(response.data.items)) {
          ordersList = response.data.items;
          // Type-safe access to pagination fields in the items format
          const itemsData = response.data as Record<string, unknown>;
          paginationData = {
            page: (itemsData.page as number) || 1,
            pageSize:
              (itemsData.page_size as number) ||
              (itemsData.pageSize as number) ||
              20,
            total: (itemsData.total as number) || 0,
            totalPages:
              (itemsData.total_pages as number) ||
              (itemsData.totalPages as number) ||
              0
          };
          // 如果没有 stats，尝试单独获取或设置为默认值
          if (response.data.stats) {
            statsData = response.data.stats;
          } else {
            // 如果没有 stats，可以尝试单独调用 stats API
            try {
              const statsResponse = await DepositOrderAPI.getStats(filters);
              if (statsResponse.success && statsResponse.data) {
                statsData = statsResponse.data;
              }
            } catch (statsError) {
              console.warn('获取统计数据失败:', statsError);
              // 设置默认值
              statsData = {
                orderCount: ordersList.length,
                totalAmount: 0,
                totalActualAmount: 0,
                totalBonusAmount: 0
              };
            }
          }
        } else if (
          'data' in response.data &&
          Array.isArray(response.data.data)
        ) {
          // 旧的数据结构（期望的格式）
          ordersList = response.data.data;
          statsData = response.data.stats || null;
          // pager type has 'limit' not 'pageSize'
          paginationData = {
            page: response.data.pager?.page || 1,
            pageSize: response.data.pager?.limit || 20,
            total: response.data.pager?.total || 0,
            totalPages: response.data.pager?.totalPages || 0
          };
        } else {
          // 如果都不匹配，尝试直接使用 response.data
          console.warn('未知的数据结构:', response.data);
          ordersList = Array.isArray(response.data) ? response.data : [];
        }

        // 转换订单数据（下划线转驼峰）
        const transformedOrders = transformDepositOrderList(ordersList);

        setOrders(transformedOrders as DepositOrder[]);
        setStats(statsData);
        setPagination(paginationData);
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
