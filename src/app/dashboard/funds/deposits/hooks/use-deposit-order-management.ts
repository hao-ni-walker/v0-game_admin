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
            totalPages: Math.max(
              (itemsData.total_pages as number) ||
                (itemsData.totalPages as number) ||
                0,
              1
            )
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
            totalPages: Math.max(response.data.pager?.totalPages || 0, 1)
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

  // 获取所有订单（用于导出，不分页）
  const fetchAllOrders = useCallback(
    async (filters?: DepositOrderFilters): Promise<DepositOrder[]> => {
      try {
        const allOrders: DepositOrder[] = [];
        let currentPage = 1;
        const pageSize = 100; // 每次获取100条
        let hasMore = true;

        while (hasMore) {
          const response = await DepositOrderAPI.getDepositOrders({
            ...filters,
            page: currentPage,
            pageSize
          });

          if (response.success && response.data) {
            // API 返回的是 DepositOrderListResponse，包含 data 和 pager
            let ordersList: DepositOrder[] = [];

            // 检查数据结构
            if ('data' in response.data && Array.isArray(response.data.data)) {
              // 标准格式：{ data: [], pager: {}, stats: {} }
              ordersList = response.data.data;
            } else if (
              'items' in response.data &&
              Array.isArray((response.data as any).items)
            ) {
              // 兼容 items 格式
              const itemsData = response.data as any;
              const transformedOrders = transformDepositOrderList(
                itemsData.items
              );
              ordersList = transformedOrders as DepositOrder[];
            }

            allOrders.push(...ordersList);

            // 检查是否还有更多数据
            const pager = response.data.pager;
            const total = pager?.total || 0;
            const totalPages = pager?.totalPages || 0;

            if (currentPage >= totalPages || allOrders.length >= total) {
              hasMore = false;
            } else {
              currentPage++;
            }
          } else {
            hasMore = false;
          }
        }

        return allOrders;
      } catch (error) {
        console.error('获取所有订单失败:', error);
        return [];
      }
    },
    []
  );

  // 导出订单为 CSV
  const exportOrders = useCallback(
    async (filters?: DepositOrderFilters): Promise<boolean> => {
      try {
        toast.info('正在准备导出数据...');

        // 获取所有符合筛选条件的数据
        const allOrders = await fetchAllOrders(filters);

        if (allOrders.length === 0) {
          toast.warning('没有可导出的数据');
          return false;
        }

        // 动态导入 CSV 导出工具和格式化函数
        const { exportToCSV } = await import('@/lib/csv-export');
        const { format } = await import('date-fns');
        const { zhCN } = await import('date-fns/locale');
        const { ORDER_STATUS_LABELS } = await import('../constants');

        // 格式化金额
        const formatCurrency = (value: number): string => {
          return new Intl.NumberFormat('zh-CN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }).format(value);
        };

        // 格式化日期时间
        const formatDateTime = (
          dateString: string | null | undefined
        ): string => {
          if (!dateString) return '';
          try {
            return format(new Date(dateString), 'yyyy-MM-dd HH:mm:ss', {
              locale: zhCN
            });
          } catch {
            return dateString;
          }
        };

        // 定义 CSV 表头
        const headers = [
          '订单号',
          '渠道订单号',
          '用户ID',
          '用户名',
          '昵称',
          '手机号',
          '邮箱',
          '支付渠道',
          '充值金额',
          '手续费',
          '赠送金额',
          '实收金额',
          '状态',
          '币种',
          'IP地址',
          '备注',
          '创建时间',
          '完成时间'
        ];

        // 获取每行数据
        const getRowData = (order: DepositOrder, index: number) => {
          return [
            order.orderNo || '',
            order.channelOrderNo || '',
            order.userId || '',
            order.username || '',
            order.nickname || '',
            order.phone || '',
            order.email || '',
            order.paymentChannelName || '',
            formatCurrency(order.amount),
            formatCurrency(order.fee),
            formatCurrency(order.bonusAmount),
            order.actualAmount !== null && order.actualAmount !== undefined
              ? formatCurrency(order.actualAmount)
              : '',
            ORDER_STATUS_LABELS[order.status] || order.status,
            order.currency || 'CNY',
            order.ipAddress || '',
            order.remark || '',
            formatDateTime(order.createdAt),
            formatDateTime(order.completedAt)
          ];
        };

        // 生成文件名（包含时间戳）
        const timestamp = new Date()
          .toISOString()
          .replace(/[:.]/g, '-')
          .slice(0, -5);
        const filename = `充值订单_${timestamp}`;

        // 导出 CSV
        exportToCSV(allOrders, headers, getRowData, filename);

        toast.success(`成功导出 ${allOrders.length} 条数据`);
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : '导出失败';
        console.error('导出订单失败:', err);
        toast.error(message);
        return false;
      }
    },
    [fetchAllOrders]
  );

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
