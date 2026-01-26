import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Game, GameFilters, PaginationInfo, GameFormData } from '../types';
import { DEFAULT_PAGINATION, MESSAGES } from '../constants';

/**
 * 游戏管理逻辑 Hook
 * 负责游戏数据的 CRUD 操作
 */
export function useGameManagement() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] =
    useState<PaginationInfo>(DEFAULT_PAGINATION);

  /**
   * 获取游戏列表
   * 将内部筛选条件映射到 API 期望的参数名称
   */
  const fetchGames = useCallback(async (filters: GameFilters) => {
    setLoading(true);
    try {
      // 构建查询参数
      const searchParams = new URLSearchParams();

      // 添加分页参数
      searchParams.append('page', String(filters.page || 1));
      searchParams.append('page_size', String(filters.page_size || 20));

      // 游戏标识和名称（优先使用 game_id，否则使用 keyword 作为 name）
      if (filters.game_id) {
        searchParams.append('game_id', filters.game_id);
      } else if (filters.name) {
        searchParams.append('name', filters.name);
      } else if (filters.keyword) {
        // keyword 可以匹配 game_id 或 name，优先作为 name 搜索
        searchParams.append('name', filters.keyword);
      }

      // 分类（API 使用单个 category，取第一个）
      if (filters.category) {
        searchParams.append('category', filters.category);
      } else if (filters.categories && filters.categories.length > 0) {
        searchParams.append('category', filters.categories[0]);
      }

      // 供应商（API 使用单个 provider_code，取第一个）
      if (filters.provider_code) {
        searchParams.append('provider_code', filters.provider_code);
      } else if (filters.provider_codes && filters.provider_codes.length > 0) {
        searchParams.append('provider_code', filters.provider_codes[0]);
      }

      // 语言
      if (filters.lang) searchParams.append('lang', filters.lang);

      // 状态
      if (filters.status !== 'all' && filters.status !== undefined) {
        searchParams.append('status', String(filters.status));
      }

      // 禁用状态
      if (filters.disabled !== 'all' && filters.disabled !== undefined) {
        searchParams.append('disabled', String(filters.disabled));
      }

      // 布尔特性
      if (filters.is_new !== undefined) {
        searchParams.append('is_new', String(filters.is_new));
      }
      if (filters.is_featured !== undefined) {
        searchParams.append('is_featured', String(filters.is_featured));
      }
      if (filters.is_mobile_supported !== undefined) {
        searchParams.append(
          'is_mobile_supported',
          String(filters.is_mobile_supported)
        );
      }
      if (filters.is_demo_available !== undefined) {
        searchParams.append(
          'is_demo_available',
          String(filters.is_demo_available)
        );
      }

      // 平台ID
      if (filters.platform_id) {
        searchParams.append('platform_id', filters.platform_id);
      }

      // 排序（API 使用 sort_by 和 sort_order）
      if (filters.sort_by) searchParams.append('sort_by', filters.sort_by);
      if (filters.sort_order) {
        searchParams.append('sort_order', filters.sort_order);
      } else if (filters.sort_dir) {
        searchParams.append('sort_order', filters.sort_dir);
      }

      // 时间范围（API 使用 created_at_start/created_at_end）
      if (filters.created_at_start) {
        searchParams.append('created_at_start', filters.created_at_start);
      } else if (filters.created_from) {
        searchParams.append('created_at_start', filters.created_from);
      }
      if (filters.created_at_end) {
        searchParams.append('created_at_end', filters.created_at_end);
      } else if (filters.created_to) {
        searchParams.append('created_at_end', filters.created_to);
      }

      // 更新时间范围（API 使用 updated_at_start/updated_at_end）
      if (filters.updated_at_start) {
        searchParams.append('updated_at_start', filters.updated_at_start);
      } else if (filters.updated_from) {
        searchParams.append('updated_at_start', filters.updated_from);
      }
      if (filters.updated_at_end) {
        searchParams.append('updated_at_end', filters.updated_at_end);
      } else if (filters.updated_to) {
        searchParams.append('updated_at_end', filters.updated_to);
      }

      const response = await fetch(
        `/api/admin/games?${searchParams.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('获取游戏列表失败');
      }

      const result = await response.json();

      // 适配返回的数据结构：{ code, message, success, data: { items, total, page, page_size, total_pages } }
      if (result.success && result.data) {
        // 转换数据格式，将字符串类型的数字转换为数字类型
        const games = (result.data.items || []).map((game: any) => ({
          ...game,
          min_bet: game.min_bet
            ? typeof game.min_bet === 'string'
              ? parseFloat(game.min_bet)
              : game.min_bet
            : undefined,
          max_bet: game.max_bet
            ? typeof game.max_bet === 'string'
              ? parseFloat(game.max_bet)
              : game.max_bet
            : undefined,
          rtp: game.rtp
            ? typeof game.rtp === 'string'
              ? parseFloat(game.rtp)
              : game.rtp
            : null,
          popularity_score: game.popularity_score
            ? typeof game.popularity_score === 'string'
              ? parseFloat(game.popularity_score)
              : game.popularity_score
            : undefined,
          supported_languages: game.supported_languages || [],
          supported_currencies: game.supported_currencies || [],
          removed: game.removed ?? game.disabled ?? false
        }));

        setGames(games);
        setPagination({
          page: result.data.page || 1,
          page_size: result.data.page_size || 20,
          total: result.data.total || 0,
          totalPages:
            result.data.total_pages ||
            Math.ceil((result.data.total || 0) / (result.data.page_size || 20))
        });
      } else {
        throw new Error(result.message || '获取游戏列表失败');
      }
    } catch (error) {
      console.error('获取游戏列表失败:', error);
      toast.error(MESSAGES.ERROR.FETCH_GAMES);
      setGames([]);
      setPagination(DEFAULT_PAGINATION);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 刷新游戏列表
   */
  const refreshGames = useCallback(
    async (filters: GameFilters) => {
      await fetchGames(filters);
    },
    [fetchGames]
  );

  /**
   * 创建游戏
   */
  const createGame = useCallback(
    async (data: GameFormData): Promise<boolean> => {
      try {
        const response = await fetch('/api/games', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          throw new Error('创建游戏失败');
        }

        toast.success(MESSAGES.SUCCESS.CREATE);
        return true;
      } catch (error) {
        console.error('创建游戏失败:', error);
        toast.error(MESSAGES.ERROR.CREATE);
        return false;
      }
    },
    []
  );

  /**
   * 更新游戏
   */
  const updateGame = useCallback(
    async (id: number, data: Partial<GameFormData>): Promise<boolean> => {
      try {
        const response = await fetch(`/api/games/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          throw new Error('更新游戏失败');
        }

        toast.success(MESSAGES.SUCCESS.UPDATE);
        return true;
      } catch (error) {
        console.error('更新游戏失败:', error);
        toast.error(MESSAGES.ERROR.UPDATE);
        return false;
      }
    },
    []
  );

  /**
   * 删除游戏
   */
  const deleteGame = useCallback(async (id: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/games/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('删除游戏失败');
      }

      toast.success(MESSAGES.SUCCESS.DELETE);
      return true;
    } catch (error) {
      console.error('删除游戏失败:', error);
      toast.error(MESSAGES.ERROR.DELETE);
      return false;
    }
  }, []);

  /**
   * 切换游戏状态
   */
  const toggleGameStatus = useCallback(async (game: Game): Promise<boolean> => {
    try {
      const newStatus = !game.status;
      const response = await fetch(`/api/admin/games/${game.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('更新游戏状态失败');
      }

      const result = await response.json();

      if (result.success) {
        toast.success(
          newStatus ? MESSAGES.SUCCESS.ENABLE : MESSAGES.SUCCESS.DISABLE
        );
        return true;
      } else {
        throw new Error(result.message || '更新游戏状态失败');
      }
    } catch (error) {
      console.error('切换游戏状态失败:', error);
      toast.error(error instanceof Error ? error.message : '切换游戏状态失败');
      return false;
    }
  }, []);

  /**
   * 切换推荐状态
   */
  const toggleFeatured = useCallback(
    async (game: Game): Promise<boolean> => {
      const newFeatured = !game.is_featured;
      const success = await updateGame(game.id, { is_featured: newFeatured });
      if (success) {
        toast.success(
          newFeatured ? MESSAGES.SUCCESS.FEATURE : MESSAGES.SUCCESS.UNFEATURE
        );
      }
      return success;
    },
    [updateGame]
  );

  /**
   * 切换新游状态
   */
  const toggleNew = useCallback(
    async (game: Game): Promise<boolean> => {
      const newIsNew = !game.is_new;
      const success = await updateGame(game.id, { is_new: newIsNew });
      if (success) {
        toast.success(newIsNew ? '设置新游成功' : '取消新游成功');
      }
      return success;
    },
    [updateGame]
  );

  /**
   * 同步平台游戏
   */
  const syncGames = useCallback(
    async (providerCode: string): Promise<boolean> => {
      setLoading(true);
      try {
        const response = await fetch('/api/admin/games/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ provider_code: providerCode })
        });

        if (!response.ok) {
          throw new Error('同步游戏失败');
        }

        const result = await response.json();

        if (result.success) {
          toast.success(`成功同步 ${providerCode} 平台的游戏`);
          return true;
        } else {
          throw new Error(result.message || '同步游戏失败');
        }
      } catch (error) {
        console.error('同步游戏失败:', error);
        toast.error(error instanceof Error ? error.message : '同步游戏失败');
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * 批量启用游戏
   */
  const batchEnableGames = useCallback(
    async (gameIds: number[]): Promise<boolean> => {
      try {
        const promises = gameIds.map((id) => updateGame(id, { status: true }));
        await Promise.all(promises);
        toast.success(MESSAGES.SUCCESS.BATCH_ENABLE);
        return true;
      } catch (error) {
        console.error('批量启用游戏失败:', error);
        toast.error('批量启用游戏失败');
        return false;
      }
    },
    [updateGame]
  );

  /**
   * 批量停用游戏
   */
  const batchDisableGames = useCallback(
    async (gameIds: number[]): Promise<boolean> => {
      try {
        const promises = gameIds.map((id) => updateGame(id, { status: false }));
        await Promise.all(promises);
        toast.success(MESSAGES.SUCCESS.BATCH_DISABLE);
        return true;
      } catch (error) {
        console.error('批量停用游戏失败:', error);
        toast.error('批量停用游戏失败');
        return false;
      }
    },
    [updateGame]
  );

  /**
   * 批量推荐游戏
   */
  const batchFeatureGames = useCallback(
    async (gameIds: number[]): Promise<boolean> => {
      try {
        const promises = gameIds.map((id) =>
          updateGame(id, { is_featured: true })
        );
        await Promise.all(promises);
        toast.success(MESSAGES.SUCCESS.BATCH_FEATURE);
        return true;
      } catch (error) {
        console.error('批量推荐游戏失败:', error);
        toast.error('批量推荐游戏失败');
        return false;
      }
    },
    [updateGame]
  );

  /**
   * 批量取消推荐游戏
   */
  const batchUnfeatureGames = useCallback(
    async (gameIds: number[]): Promise<boolean> => {
      try {
        const promises = gameIds.map((id) =>
          updateGame(id, { is_featured: false })
        );
        await Promise.all(promises);
        toast.success(MESSAGES.SUCCESS.BATCH_UNFEATURE);
        return true;
      } catch (error) {
        console.error('批量取消推荐游戏失败:', error);
        toast.error('批量取消推荐游戏失败');
        return false;
      }
    },
    [updateGame]
  );

  /**
   * 批量删除游戏
   */
  const batchDeleteGames = useCallback(
    async (gameIds: number[]): Promise<boolean> => {
      try {
        const promises = gameIds.map((id) => deleteGame(id));
        await Promise.all(promises);
        toast.success(`成功删除 ${gameIds.length} 个游戏`);
        return true;
      } catch (error) {
        console.error('批量删除游戏失败:', error);
        toast.error('批量删除游戏失败');
        return false;
      }
    },
    [deleteGame]
  );

  return {
    games,
    loading,
    pagination,
    fetchGames,
    refreshGames,
    createGame,
    updateGame,
    deleteGame,
    toggleGameStatus,
    toggleFeatured,
    toggleNew,
    syncGames,
    batchEnableGames,
    batchDisableGames,
    batchFeatureGames,
    batchUnfeatureGames,
    batchDeleteGames
  };
}
