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

  // 获取所有订单（用于导出）
  const fetchAllOrders = useCallback(
    async (filters?: WithdrawOrderFilters): Promise<WithdrawOrder[]> => {
      try {
        const allOrders: WithdrawOrder[] = [];
        let currentPage = 1;
        const pageSize = 100; // 每页获取100条数据
        let hasMore = true;

        while (hasMore) {
          const response = await WithdrawOrderAPI.getWithdrawOrders({
            ...filters,
            page: currentPage,
            pageSize: pageSize
          });

          if (response.success && response.data) {
            const orders = response.data.data || [];
            allOrders.push(...orders);

            const totalPages = response.data.pager.totalPages || 0;

            if (currentPage >= totalPages || orders.length === 0) {
              hasMore = false;
            } else {
              currentPage++;
            }
          } else {
            hasMore = false;
          }
        }

        return allOrders;
      } catch (err) {
        const message = err instanceof Error ? err.message : '获取数据失败';
        toast.error(message);
        return [];
      }
    },
    []
  );

  // 导出订单为 CSV
  const exportOrders = useCallback(
    async (filters?: WithdrawOrderFilters): Promise<boolean> => {
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

        // 格式化货币
        const formatCurrency = (value: number | null | undefined) => {
          if (value === null || value === undefined) return '';
          return new Intl.NumberFormat('zh-CN', {
            style: 'currency',
            currency: 'CNY',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }).format(value);
        };

        // 格式化日期时间
        const formatDateTime = (dateString: string | null | undefined) => {
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
          '提现渠道',
          '渠道类型',
          '提现金额',
          '手续费',
          '实际出款金额',
          '币种',
          '订单状态',
          '账户名',
          '账户号',
          '银行名称',
          '审核状态',
          '审核人',
          '审核时间',
          '审核备注',
          '出款状态',
          '出款方式',
          '出款时间',
          '出款失败原因',
          'IP地址',
          '备注',
          '申请时间',
          '完成时间',
          '更新时间'
        ];

        // 获取每行数据
        const getRowData = (order: WithdrawOrder, index: number) => {
          return [
            order.orderNo || '',
            order.channelOrderNo || '',
            order.userId || '',
            order.username || '',
            order.nickname || '',
            order.phone || '',
            order.email || '',
            order.paymentChannelName || '',
            order.channelType || '',
            formatCurrency(order.amount),
            formatCurrency(order.fee),
            formatCurrency(order.actualAmount),
            order.currency || 'CNY',
            ORDER_STATUS_LABELS[order.status] || order.status,
            order.accountName || '',
            order.accountNumber || '',
            order.bankName || '',
            order.auditStatus || '',
            order.auditorName || '',
            formatDateTime(order.auditAt),
            order.auditRemark || '',
            order.payoutStatus || '',
            order.payoutMethod === 'auto'
              ? '自动代付'
              : order.payoutMethod === 'manual'
                ? '手工打款'
                : '',
            formatDateTime(order.payoutAt),
            order.payoutFailureReason || '',
            order.ipAddress || '',
            order.remark || '',
            formatDateTime(order.createdAt),
            formatDateTime(order.completedAt),
            formatDateTime(order.updatedAt || order.createdAt)
          ];
        };

        // 生成文件名（包含时间戳）
        const timestamp = new Date()
          .toISOString()
          .replace(/[:.]/g, '-')
          .slice(0, -5);
        const filename = `提现订单_${timestamp}`;

        // 导出 CSV
        exportToCSV(allOrders, headers, getRowData, filename);

        toast.success(`成功导出 ${allOrders.length} 条数据`);
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : '导出失败';
        toast.error(message);
        return false;
      }
    },
    [fetchAllOrders]
  );

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
