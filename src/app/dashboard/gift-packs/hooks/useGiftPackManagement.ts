import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { GiftPack, GiftPackFilters, PaginationInfo, GiftPackFormData } from '../types';
import { DEFAULT_PAGINATION, MESSAGES } from '../constants';

/**
 * 礼包管理逻辑 Hook
 * 负责礼包数据的 CRUD 操作
 */
export function useGiftPackManagement() {
  const [giftPacks, setGiftPacks] = useState<GiftPack[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>(DEFAULT_PAGINATION);

  /**
   * 获取礼包列表
   */
  const fetchGiftPacks = useCallback(async (filters: GiftPackFilters) => {
    setLoading(true);
    try {
      // 构建请求体
      const requestBody: any = {
        page: filters.page || 1,
        page_size: filters.page_size || 20
      };

      // 添加筛选条件
      if (filters.keyword) requestBody.keyword = filters.keyword;
      if (filters.locale && filters.locale !== 'default') requestBody.locale = filters.locale;
      if (filters.categories && filters.categories.length > 0) {
        requestBody.categories = filters.categories;
      }
      if (filters.rarities && filters.rarities.length > 0) {
        requestBody.rarities = filters.rarities;
      }
      if (filters.statuses && filters.statuses.length > 0) {
        requestBody.statuses = filters.statuses;
      }
      if (filters.is_consumable !== undefined) requestBody.is_consumable = filters.is_consumable;
      if (filters.bind_flag !== undefined) requestBody.bind_flag = filters.bind_flag;
      if (filters.vip_min !== undefined) requestBody.vip_min = filters.vip_min;
      if (filters.vip_max !== undefined) requestBody.vip_max = filters.vip_max;
      if (filters.level_min !== undefined) requestBody.level_min = filters.level_min;
      if (filters.level_max !== undefined) requestBody.level_max = filters.level_max;
      if (filters.expire_days_max !== undefined) requestBody.expire_days_max = filters.expire_days_max;
      if (filters.usage_limit_max !== undefined) requestBody.usage_limit_max = filters.usage_limit_max;
      if (filters.created_from) requestBody.created_from = filters.created_from;
      if (filters.created_to) requestBody.created_to = filters.created_to;
      if (filters.updated_from) requestBody.updated_from = filters.updated_from;
      if (filters.updated_to) requestBody.updated_to = filters.updated_to;
      if (filters.sort_by) requestBody.sort_by = filters.sort_by;
      if (filters.sort_dir) requestBody.sort_dir = filters.sort_dir;

      const response = await fetch('/api/items/list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('获取礼包列表失败');
      }

      const data = await response.json();
      
      setGiftPacks(data.list || []);
      setPagination({
        page: data.page || 1,
        page_size: data.page_size || 20,
        total: data.total || 0,
        totalPages: Math.ceil((data.total || 0) / (data.page_size || 20))
      });
    } catch (error) {
      console.error('获取礼包列表失败:', error);
      toast.error(MESSAGES.ERROR.FETCH);
      setGiftPacks([]);
      setPagination(DEFAULT_PAGINATION);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 刷新礼包列表
   */
  const refreshGiftPacks = useCallback(
    async (filters: GiftPackFilters) => {
      await fetchGiftPacks(filters);
    },
    [fetchGiftPacks]
  );

  /**
   * 创建礼包
   */
  const createGiftPack = useCallback(async (data: GiftPackFormData): Promise<boolean> => {
    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('创建礼包失败');
      }

      toast.success(MESSAGES.SUCCESS.CREATE);
      return true;
    } catch (error) {
      console.error('创建礼包失败:', error);
      toast.error(MESSAGES.ERROR.CREATE);
      return false;
    }
  }, []);

  /**
   * 更新礼包
   */
  const updateGiftPack = useCallback(
    async (id: number, data: Partial<GiftPackFormData>): Promise<boolean> => {
      try {
        const response = await fetch(`/api/items/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          throw new Error('更新礼包失败');
        }

        toast.success(MESSAGES.SUCCESS.UPDATE);
        return true;
      } catch (error) {
        console.error('更新礼包失败:', error);
        toast.error(MESSAGES.ERROR.UPDATE);
        return false;
      }
    },
    []
  );

  /**
   * 删除礼包
   */
  const deleteGiftPack = useCallback(async (id: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/items/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('删除礼包失败');
      }

      toast.success(MESSAGES.SUCCESS.DELETE);
      return true;
    } catch (error) {
      console.error('删除礼包失败:', error);
      toast.error(MESSAGES.ERROR.DELETE);
      return false;
    }
  }, []);

  /**
   * 切换礼包状态
   */
  const toggleGiftPackStatus = useCallback(
    async (giftPack: GiftPack): Promise<boolean> => {
      const newStatus = giftPack.status === 'active' ? 'disabled' : 'active';
      const success = await updateGiftPack(giftPack.id, { status: newStatus });
      if (success) {
        toast.success(newStatus === 'active' ? MESSAGES.SUCCESS.ENABLE : MESSAGES.SUCCESS.DISABLE);
      }
      return success;
    },
    [updateGiftPack]
  );

  /**
   * 归档礼包
   */
  const archiveGiftPack = useCallback(
    async (giftPack: GiftPack): Promise<boolean> => {
      const success = await updateGiftPack(giftPack.id, { status: 'archived' });
      if (success) {
        toast.success(MESSAGES.SUCCESS.ARCHIVE);
      }
      return success;
    },
    [updateGiftPack]
  );

  return {
    giftPacks,
    loading,
    pagination,
    fetchGiftPacks,
    refreshGiftPacks,
    createGiftPack,
    updateGiftPack,
    deleteGiftPack,
    toggleGiftPackStatus,
    archiveGiftPack
  };
}
