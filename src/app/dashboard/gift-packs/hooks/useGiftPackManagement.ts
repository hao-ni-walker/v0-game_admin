import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  GiftPack,
  GiftPackFilters,
  PaginationInfo,
  GiftPackFormData
} from '../types';
import { DEFAULT_PAGINATION, MESSAGES } from '../constants';

/**
 * 礼包管理逻辑 Hook
 * 负责礼包数据的 CRUD 操作
 */
export function useGiftPackManagement() {
  const [giftPacks, setGiftPacks] = useState<GiftPack[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] =
    useState<PaginationInfo>(DEFAULT_PAGINATION);

  /**
   * 获取礼包列表
   */
  const fetchGiftPacks = useCallback(async (filters: GiftPackFilters) => {
    setLoading(true);
    try {
      // 构建查询参数
      const page = filters.page || 1;
      const page_size = filters.page_size || 20;
      const params = new URLSearchParams();

      // 分页参数（转换为 limit 和 offset）
      params.append('limit', String(page_size));
      params.append('offset', String((page - 1) * page_size));

      // 添加筛选条件
      if (filters.keyword) params.append('keyword', filters.keyword);
      if (filters.locale && filters.locale !== 'default') {
        params.append('locale', filters.locale);
      }
      if (filters.categories && filters.categories.length > 0) {
        filters.categories.forEach((cat) => params.append('category', cat));
      }
      if (filters.rarities && filters.rarities.length > 0) {
        filters.rarities.forEach((rarity) => params.append('rarity', rarity));
      }
      if (filters.statuses && filters.statuses.length > 0) {
        filters.statuses.forEach((status) => params.append('status', status));
      }
      if (filters.is_consumable !== undefined) {
        params.append('is_consumable', String(filters.is_consumable));
      }
      if (filters.bind_flag !== undefined) {
        params.append('bind_flag', String(filters.bind_flag));
      }
      if (filters.vip_min !== undefined) {
        params.append('vip_required_min', String(filters.vip_min));
      }
      if (filters.vip_max !== undefined) {
        params.append('vip_required_max', String(filters.vip_max));
      }
      if (filters.level_min !== undefined) {
        params.append('level_required_min', String(filters.level_min));
      }
      if (filters.level_max !== undefined) {
        params.append('level_required_max', String(filters.level_max));
      }
      if (filters.expire_days_max !== undefined) {
        params.append('expire_days_max', String(filters.expire_days_max));
      }
      if (filters.usage_limit_max !== undefined) {
        params.append('usage_limit_max', String(filters.usage_limit_max));
      }
      if (filters.created_from)
        params.append('created_from', filters.created_from);
      if (filters.created_to) params.append('created_to', filters.created_to);
      if (filters.updated_from)
        params.append('updated_from', filters.updated_from);
      if (filters.updated_to) params.append('updated_to', filters.updated_to);
      if (filters.sort_by) params.append('sort_by', filters.sort_by);
      if (filters.sort_dir) params.append('sort_dir', filters.sort_dir);

      const response = await fetch(`/api/items?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          (result as { message?: string }).message || MESSAGES.ERROR.FETCH
        );
      }

      // 处理响应格式：{ code: 0, data: { total, page, page_size, list: [...] } }
      if (result.code === 0 && result.data) {
        const {
          total,
          page: responsePage,
          page_size: responsePageSize,
          list
        } = result.data;

        // 为每个礼包添加 id 字段（如果没有的话，使用 item_id）
        const giftPacksWithId = (list || []).map((item: GiftPack) => ({
          ...item,
          id: item.id || item.item_id
        }));

        setGiftPacks(giftPacksWithId);
        setPagination({
          page: responsePage || page,
          page_size: responsePageSize || page_size,
          total: total || 0,
          totalPages: Math.ceil((total || 0) / (responsePageSize || page_size))
        });
      } else {
        throw new Error(result.message || MESSAGES.ERROR.FETCH);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : MESSAGES.ERROR.FETCH;
      console.error('获取礼包列表失败:', message, error);
      toast.error(message);
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
  const createGiftPack = useCallback(
    async (data: GiftPackFormData): Promise<boolean> => {
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
    },
    []
  );

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
      const itemId = giftPack.id || giftPack.item_id;
      const success = await updateGiftPack(itemId, { status: newStatus });
      if (success) {
        toast.success(
          newStatus === 'active'
            ? MESSAGES.SUCCESS.ENABLE
            : MESSAGES.SUCCESS.DISABLE
        );
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
      const itemId = giftPack.id || giftPack.item_id;
      const success = await updateGiftPack(itemId, { status: 'archived' });
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
