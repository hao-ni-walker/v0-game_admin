import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { PaymentChannel, PaymentChannelFilters, PaymentChannelPagination } from '../types';

/**
 * 支付渠道管理hooks
 */
export function usePaymentChannelManagement() {
  const [channels, setChannels] = useState<PaymentChannel[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaymentChannelPagination>({
    page: 1,
    page_size: 20,
    total: 0
  });

  /**
   * 获取支付渠道列表
   */
  const fetchChannels = useCallback(async (filters: PaymentChannelFilters) => {
    setLoading(true);
    try {
      const response = await fetch('/api/payment-channels/list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(filters)
      });

      if (!response.ok) {
        throw new Error('获取支付渠道列表失败');
      }

      const data = await response.json();
      setChannels(data.list || []);
      setPagination({
        page: data.page,
        page_size: data.page_size,
        total: data.total
      });
    } catch (error) {
      console.error('获取支付渠道列表失败:', error);
      toast.error('获取支付渠道列表失败');
      setChannels([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 刷新支付渠道列表
   */
  const refreshChannels = useCallback(
    async (filters: PaymentChannelFilters) => {
      await fetchChannels(filters);
      toast.success('数据已刷新');
    },
    [fetchChannels]
  );

  /**
   * 删除支付渠道
   */
  const deleteChannel = useCallback(async (id: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/payment-channels/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('删除支付渠道失败');
      }

      toast.success('支付渠道已删除');
      return true;
    } catch (error) {
      console.error('删除支付渠道失败:', error);
      toast.error('删除支付渠道失败');
      return false;
    }
  }, []);

  /**
   * 切换支付渠道状态
   */
  const toggleChannelStatus = useCallback(
    async (channel: PaymentChannel): Promise<boolean> => {
      try {
        const newStatus = channel.status === 1 ? 0 : 1;
        const response = await fetch(`/api/payment-channels/${channel.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: newStatus,
            version: channel.version
          })
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || '切换状态失败');
        }

        toast.success(newStatus === 1 ? '渠道已启用' : '渠道已停用');
        return true;
      } catch (error: any) {
        console.error('切换渠道状态失败:', error);
        toast.error(error.message || '切换渠道状态失败');
        return false;
      }
    },
    []
  );

  /**
   * 禁用支付渠道
   */
  const disableChannel = useCallback(
    async (channel: PaymentChannel): Promise<boolean> => {
      try {
        const newDisabled = !channel.disabled;
        const response = await fetch(`/api/payment-channels/${channel.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            disabled: newDisabled,
            version: channel.version
          })
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || '操作失败');
        }

        toast.success(newDisabled ? '渠道已紧急禁用' : '渠道已解除禁用');
        return true;
      } catch (error: any) {
        console.error('禁用渠道失败:', error);
        toast.error(error.message || '禁用渠道失败');
        return false;
      }
    },
    []
  );

  return {
    channels,
    loading,
    pagination,
    fetchChannels,
    refreshChannels,
    deleteChannel,
    toggleChannelStatus,
    disableChannel
  };
}
