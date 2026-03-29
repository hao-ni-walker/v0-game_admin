import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Banner,
  BannerFilters,
  PaginationInfo,
  BannerFormData
} from '../types';
import { DEFAULT_PAGINATION, MESSAGES } from '../constants';

/**
 * 轮播图管理逻辑 Hook
 * 负责轮播图数据的 CRUD 操作
 */
export function useBannerManagement() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] =
    useState<PaginationInfo>(DEFAULT_PAGINATION);

  /**
   * 获取轮播图列表
   */
  const fetchBanners = useCallback(async (filters: BannerFilters) => {
    setLoading(true);
    try {
      // 构建查询参数
      const queryParams = new URLSearchParams();

      // 添加分页参数
      queryParams.append('page', String(filters.page || 1));
      queryParams.append('page_size', String(filters.page_size || 20));

      // 添加筛选条件
      if (filters.keyword) queryParams.append('keyword', filters.keyword);
      if (filters.positions && filters.positions.length > 0) {
        filters.positions.forEach((position) => {
          queryParams.append('positions', position);
        });
      }
      if (filters.status !== 'all' && filters.status !== undefined) {
        queryParams.append('status', String(filters.status));
      }
      if (filters.disabled !== undefined) {
        queryParams.append('disabled', String(filters.disabled));
      }
      if (filters.show_removed !== undefined) {
        queryParams.append('show_removed', String(filters.show_removed));
      }
      if (filters.active_only !== undefined) {
        queryParams.append('active_only', String(filters.active_only));
      }
      if (filters.sort_by) queryParams.append('sort_by', filters.sort_by);
      if (filters.sort_dir) queryParams.append('sort_dir', filters.sort_dir);

      const response = await fetch(
        `/api/admin/banners?${queryParams.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        let errorMessage = '获取轮播图列表失败';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.msg || errorMessage;
        } catch (e) {
          // 如果响应不是 JSON，使用状态文本
          errorMessage = `${errorMessage} (${response.status} ${response.statusText})`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();

      // 检查响应是否表示错误（code 不为 0 或 200，且不为 success）
      if (
        result.code !== undefined &&
        result.code !== 0 &&
        result.code !== 200 &&
        !result.success
      ) {
        const errorMsg = result.message || result.msg || '获取轮播图列表失败';
        throw new Error(errorMsg);
      }

      // 处理新的响应格式: { code, msg, data: { items, total, page, page_size, total_pages } }
      if (
        (result.success || result.code === 0 || result.code === 200) &&
        result.data
      ) {
        const data = result.data;
        const items = Array.isArray(data.items) ? data.items : [];

        setBanners(items);
        setPagination({
          page: data.page || 1,
          page_size: data.page_size || 20,
          total: data.total || 0,
          totalPages:
            data.total_pages ||
            Math.ceil((data.total || 0) / (data.page_size || 20))
        });
      } else {
        // 如果响应格式不符合预期，尝试直接使用 result
        if (result.data && Array.isArray(result.data.items)) {
          setBanners(result.data.items);
          setPagination({
            page: result.data.page || 1,
            page_size: result.data.page_size || 20,
            total: result.data.total || 0,
            totalPages:
              result.data.total_pages ||
              Math.ceil(
                (result.data.total || 0) / (result.data.page_size || 20)
              )
          });
        } else {
          console.error('[轮播图管理] 响应格式错误:', result);
          throw new Error(result.message || result.msg || '获取轮播图列表失败');
        }
      }
    } catch (error) {
      console.error('获取轮播图列表失败:', error);
      toast.error(MESSAGES.ERROR.FETCH_BANNERS);
      setBanners([]);
      setPagination(DEFAULT_PAGINATION);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 刷新轮播图列表
   */
  const refreshBanners = useCallback(
    async (filters: BannerFilters) => {
      await fetchBanners(filters);
    },
    [fetchBanners]
  );

  /**
   * 创建轮播图
   */
  const createBanner = useCallback(
    async (data: BannerFormData): Promise<boolean> => {
      try {
        const response = await fetch('/api/banners', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          throw new Error('创建轮播图失败');
        }

        toast.success(MESSAGES.SUCCESS.CREATE);
        return true;
      } catch (error) {
        console.error('创建轮播图失败:', error);
        toast.error(MESSAGES.ERROR.CREATE);
        return false;
      }
    },
    []
  );

  /**
   * 更新轮播图
   */
  const updateBanner = useCallback(
    async (
      id: number,
      data: Partial<BannerFormData> & { version: number }
    ): Promise<boolean> => {
      try {
        const response = await fetch(`/api/admin/banners/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 409) {
            toast.error(MESSAGES.ERROR.VERSION_CONFLICT);
          } else {
            throw new Error('更新轮播图失败');
          }
          return false;
        }

        toast.success(MESSAGES.SUCCESS.UPDATE);
        return true;
      } catch (error) {
        console.error('更新轮播图失败:', error);
        toast.error(MESSAGES.ERROR.UPDATE);
        return false;
      }
    },
    []
  );

  /**
   * 删除轮播图
   */
  const deleteBanner = useCallback(async (id: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/banners/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('删除轮播图失败');
      }

      toast.success(MESSAGES.SUCCESS.DELETE);
      return true;
    } catch (error) {
      console.error('删除轮播图失败:', error);
      toast.error(MESSAGES.ERROR.DELETE);
      return false;
    }
  }, []);

  /**
   * 切换轮播图状态
   */
  const toggleBannerStatus = useCallback(
    async (banner: Banner): Promise<boolean> => {
      const newStatus: 0 | 1 = banner.status === 1 ? 0 : 1;
      const success = await updateBanner(banner.id, {
        status: newStatus,
        version: banner.version
      });
      if (success) {
        toast.success(
          newStatus === 1 ? MESSAGES.SUCCESS.ENABLE : MESSAGES.SUCCESS.DISABLE
        );
      }
      return success;
    },
    [updateBanner]
  );

  /**
   * 禁用轮播图
   */
  const disableBanner = useCallback(
    async (banner: Banner): Promise<boolean> => {
      const success = await updateBanner(banner.id, {
        disabled: true,
        version: banner.version
      });
      if (success) {
        toast.success('轮播图已禁用');
      }
      return success;
    },
    [updateBanner]
  );

  /**
   * 恢复轮播图
   */
  const restoreBanner = useCallback(
    async (banner: Banner): Promise<boolean> => {
      const success = await updateBanner(banner.id, {
        disabled: false,
        version: banner.version
      });
      if (success) {
        toast.success(MESSAGES.SUCCESS.RESTORE);
      }
      return success;
    },
    [updateBanner]
  );

  return {
    banners,
    loading,
    pagination,
    fetchBanners,
    refreshBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    toggleBannerStatus,
    disableBanner,
    restoreBanner
  };
}
