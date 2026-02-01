import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type {
  PaymentPlatform,
  PaymentChannel,
  PaymentPlatformFilters,
  PaymentChannelPagination
} from '../types';

/**
 * 支付平台管理hooks
 */
export function usePaymentChannelManagement() {
  const [platforms, setPlatforms] = useState<PaymentPlatform[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaymentChannelPagination>({
    page: 1,
    page_size: 20,
    total: 0,
    total_pages: 0
  });

  /**
   * 获取支付平台列表
   */
  const fetchPlatforms = useCallback(
    async (filters: PaymentPlatformFilters) => {
      setLoading(true);
      try {
        // 构建查询参数
        const params = new URLSearchParams();
        params.append('page', String(filters.page || 1));
        params.append('page_size', String(filters.page_size || 20));
        if (filters.keyword) {
          params.append('keyword', filters.keyword);
        }
        if (filters.enabled !== undefined && filters.enabled !== 'all') {
          params.append('enabled', String(filters.enabled));
        }

        const response = await fetch(
          `/api/admin/payment-platforms?${params.toString()}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error('获取支付平台列表失败');
        }

        const result = await response.json();

        if (result.success && result.data) {
          setPlatforms(result.data.items || []);
          setPagination({
            page: result.data.page || 1,
            page_size: result.data.page_size || 20,
            total: result.data.total || 0,
            total_pages: result.data.total_pages || 0
          });
        } else {
          throw new Error(result.message || '获取支付平台列表失败');
        }
      } catch (error) {
        console.error('获取支付平台列表失败:', error);
        toast.error('获取支付平台列表失败');
        setPlatforms([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * 刷新支付平台列表
   */
  const refreshPlatforms = useCallback(
    async (filters: PaymentPlatformFilters) => {
      await fetchPlatforms(filters);
      toast.success('数据已刷新');
    },
    [fetchPlatforms]
  );

  /**
   * 切换平台启用状态
   */
  const togglePlatformStatus = useCallback(
    async (platform: PaymentPlatform): Promise<boolean> => {
      try {
        const newEnabled = !platform.enabled;
        const response = await fetch(
          `/api/admin/payment-platforms/${platform.id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              enabled: newEnabled
            })
          }
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || '切换状态失败');
        }

        toast.success(newEnabled ? '平台已启用' : '平台已停用');
        return true;
      } catch (error: any) {
        console.error('切换平台状态失败:', error);
        toast.error(error.message || '切换平台状态失败');
        return false;
      }
    },
    []
  );

  /**
   * 切换渠道禁用状态
   */
  const toggleChannelDisabled = useCallback(
    async (channel: PaymentChannel): Promise<boolean> => {
      try {
        const newDisabled = !channel.disabled;
        const response = await fetch(
          `/api/admin/payment-channels/${channel.id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              disabled: newDisabled,
              version: channel.version
            })
          }
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || '操作失败');
        }

        toast.success(newDisabled ? '渠道已禁用' : '渠道已启用');
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
   * 删除渠道
   */
  const deleteChannel = useCallback(
    async (channelId: number): Promise<boolean> => {
      try {
        const response = await fetch(
          `/api/admin/payment-channels/${channelId}`,
          {
            method: 'DELETE'
          }
        );

        if (!response.ok) {
          throw new Error('删除渠道失败');
        }

        toast.success('渠道已删除');
        return true;
      } catch (error) {
        console.error('删除渠道失败:', error);
        toast.error('删除渠道失败');
        return false;
      }
    },
    []
  );

  // 兼容旧接口 - 将平台下的所有渠道展平
  const channels = platforms.flatMap((platform) =>
    platform.channels.map((channel) => ({
      ...channel,
      platformName: platform.name,
      platformEnabled: platform.enabled
    }))
  );

  return {
    platforms,
    channels,
    loading,
    pagination,
    fetchPlatforms,
    refreshPlatforms,
    togglePlatformStatus,
    toggleChannelDisabled,
    deleteChannel,
    // 兼容旧接口
    fetchChannels: fetchPlatforms,
    refreshChannels: refreshPlatforms
  };
}
