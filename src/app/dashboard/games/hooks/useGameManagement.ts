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
  const [pagination, setPagination] = useState<PaginationInfo>(DEFAULT_PAGINATION);

  /**
   * 获取游戏列表
   */
  const fetchGames = useCallback(async (filters: GameFilters) => {
    setLoading(true);
    try {
      // 构建请求体
      const requestBody: any = {
        page: filters.page || 1,
        page_size: filters.page_size || 20
      };

      // 添加筛选条件
      if (filters.keyword) requestBody.keyword = filters.keyword;
      if (filters.provider_codes && filters.provider_codes.length > 0) {
        requestBody.provider_codes = filters.provider_codes;
      }
      if (filters.categories && filters.categories.length > 0) {
        requestBody.categories = filters.categories;
      }
      if (filters.lang) requestBody.lang = filters.lang;
      if (filters.status !== 'all' && filters.status !== undefined) {
        requestBody.status = filters.status;
      }
      if (filters.is_new !== undefined) requestBody.is_new = filters.is_new;
      if (filters.is_featured !== undefined) requestBody.is_featured = filters.is_featured;
      if (filters.is_mobile_supported !== undefined) {
        requestBody.is_mobile_supported = filters.is_mobile_supported;
      }
      if (filters.is_demo_available !== undefined) {
        requestBody.is_demo_available = filters.is_demo_available;
      }
      if (filters.has_jackpot !== undefined) requestBody.has_jackpot = filters.has_jackpot;
      if (filters.sort_by) requestBody.sort_by = filters.sort_by;
      if (filters.sort_dir) requestBody.sort_dir = filters.sort_dir;

      const response = await fetch('/api/games/list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('获取游戏列表失败');
      }

      const data = await response.json();
      
      setGames(data.list || []);
      setPagination({
        page: data.page || 1,
        page_size: data.page_size || 20,
        total: data.total || 0,
        totalPages: Math.ceil((data.total || 0) / (data.page_size || 20))
      });
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
  const createGame = useCallback(async (data: GameFormData): Promise<boolean> => {
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
  }, []);

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
        toast.success(newStatus ? MESSAGES.SUCCESS.ENABLE : MESSAGES.SUCCESS.DISABLE);
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
        toast.success(newFeatured ? MESSAGES.SUCCESS.FEATURE : MESSAGES.SUCCESS.UNFEATURE);
      }
      return success;
    },
    [updateGame]
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
    toggleFeatured
  };
}
