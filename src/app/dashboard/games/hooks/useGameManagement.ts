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
   */
  const fetchGames = useCallback(async (filters: GameFilters) => {
    setLoading(true);
    try {
      // 构建查询参数
      const searchParams = new URLSearchParams();

      // 添加分页参数
      searchParams.append('page', String(filters.page || 1));
      searchParams.append('page_size', String(filters.page_size || 20));

      // 添加筛选条件
      if (filters.keyword) searchParams.append('keyword', filters.keyword);
      if (filters.provider_codes && filters.provider_codes.length > 0) {
        filters.provider_codes.forEach((code) => {
          searchParams.append('provider_codes', code);
        });
      }
      if (filters.categories && filters.categories.length > 0) {
        filters.categories.forEach((category) => {
          searchParams.append('categories', category);
        });
      }
      if (filters.lang) searchParams.append('lang', filters.lang);
      if (filters.status !== 'all' && filters.status !== undefined) {
        searchParams.append('status', String(filters.status));
      }
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
      if (filters.has_jackpot !== undefined) {
        searchParams.append('has_jackpot', String(filters.has_jackpot));
      }
      if (filters.sort_by) searchParams.append('sort_by', filters.sort_by);
      if (filters.sort_dir) searchParams.append('sort_dir', filters.sort_dir);

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
  const toggleGameStatus = useCallback(
    async (game: Game): Promise<boolean> => {
      const newStatus = !game.status;
      const success = await updateGame(game.id, { status: newStatus });
      if (success) {
        toast.success(
          newStatus ? MESSAGES.SUCCESS.ENABLE : MESSAGES.SUCCESS.DISABLE
        );
      }
      return success;
    },
    [updateGame]
  );

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
