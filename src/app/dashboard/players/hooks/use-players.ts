'use client';

import { useEffect, useState } from 'react';
import { PlayerAPI } from '@/service/api/player';
import { toast } from 'sonner';

interface Player {
  id: number;
  idname: string;
  username: string;
  email: string;
  balance: number;
  vipLevel: number;
  status: boolean;
  agent?: string | null;
  directSuperiorId?: number | null;
  registrationMethod: string;
  registrationSource?: string | null;
  loginSource?: string | null;
  identityCategory: string;
  lastLogin?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UsePlayersResult {
  players: Player[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  pageSize: number;
  fetchPlayers: (params?: any) => Promise<void>;
  updatePlayerStatus: (id: number, status: boolean) => Promise<void>;
}

export function usePlayers(): UsePlayersResult {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const fetchPlayers = async (params: any = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await PlayerAPI.getPlayers({
        page: params.page || 1,
        pageSize: params.pageSize || 20,
        ...params
      });

      if (response.success && response.data) {
        setPlayers(response.data.list || []);
        setTotal(response.data.total || 0);
        setPage(response.data.page || 1);
        setPageSize(response.data.page_size || 20);
      } else {
        throw new Error(response.message || '获取玩家列表失败');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '获取玩家列表失败';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const updatePlayerStatus = async (id: number, status: boolean) => {
    try {
      const response = await PlayerAPI.updatePlayerStatus(id, status);
      if (response.success) {
        toast.success('状态更新成功');
        fetchPlayers({ page, pageSize });
      } else {
        throw new Error(response.message || '状态更新失败');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '状态更新失败';
      toast.error(message);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  return {
    players,
    loading,
    error,
    total,
    page,
    pageSize,
    fetchPlayers,
    updatePlayerStatus
  };
}
