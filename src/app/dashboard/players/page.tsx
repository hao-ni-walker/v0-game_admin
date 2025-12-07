'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Download, Ban, CheckCircle, RefreshCw } from 'lucide-react';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/shared/heading';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { PlayerFilterBar } from './components/player-filter-bar';
import { PlayerStatisticsCards } from './components/player-statistics-cards';
import { PlayerTableEnhanced } from './components/player-table-enhanced';
import { PlayerDetailModal } from './components/player-detail-modal';
import { PlayerEditModal } from './components/player-edit-modal';
import { PlayerWalletAdjustModal } from './components/player-wallet-adjust-modal';
import { PlayerNotificationModal } from './components/player-notification-modal';
import { usePlayersEnhanced } from './hooks/use-players-enhanced';
import { usePlayerFiltersEnhanced } from './hooks/use-player-filters-enhanced';
import { Player, PlayerDetail } from './types';
import { useRouter } from 'next/navigation';

/**
 * 玩家管理页面
 */
export default function PlayersPage() {
  const router = useRouter();
  const { appliedFilters } = usePlayerFiltersEnhanced();
  const {
    players,
    loading,
    pagination,
    sort,
    statistics,
    statisticsLoading,
    fetchPlayers,
    fetchPlayerDetail,
    fetchStatistics,
    updatePlayer,
    adjustWallet,
    batchOperation,
    resetPassword,
    sendNotification,
    exportPlayers,
    setPage,
    setPageSize,
    setSort
  } = usePlayersEnhanced();

  // 弹窗状态
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<number[]>([]);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState<PlayerDetail | null>(null);
  const [batchConfirmOpen, setBatchConfirmOpen] = useState(false);
  const [batchOperationType, setBatchOperationType] = useState<'enable' | 'disable' | null>(null);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [notificationPlayer, setNotificationPlayer] = useState<Player | null>(null);

  // 使用 useMemo 稳定 appliedFilters 的引用，通过 JSON.stringify 比较内容
  const appliedFiltersKey = useMemo(
    () => JSON.stringify(appliedFilters),
    [appliedFilters]
  );

  // 加载数据
  useEffect(() => {
    fetchPlayers({
      filters: appliedFilters,
      page: pagination.page,
      pageSize: pagination.page_size,
      sortBy: sort.sort_by,
      sortOrder: sort.sort_order
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFiltersKey, pagination.page, pagination.page_size, sort.sort_by, sort.sort_order]);

  // 加载统计数据 - 使用防抖避免频繁请求
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStatistics(appliedFilters);
    }, 300); // 300ms 防抖

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFiltersKey]);

  // 查看详情
  const handleViewDetail = useCallback(
    async (player: Player) => {
      setCurrentPlayer(null);
      setDetailModalOpen(true);
      const playerDetail = await fetchPlayerDetail(player.id);
      if (playerDetail) {
        setCurrentPlayer(playerDetail);
      }
    },
    [fetchPlayerDetail]
  );

  // 编辑玩家
  const handleEdit = useCallback(
    async (player: Player | PlayerDetail) => {
      if ('wallet' in player && player.wallet) {
        setCurrentPlayer(player as PlayerDetail);
      } else {
        const playerDetail = await fetchPlayerDetail(player.id);
        if (playerDetail) {
          setCurrentPlayer(playerDetail);
        }
      }
      setEditModalOpen(true);
    },
    [fetchPlayerDetail]
  );

  // 调整钱包
  const handleAdjustWallet = useCallback(
    async (player: PlayerDetail) => {
      setCurrentPlayer(player);
      setWalletModalOpen(true);
    },
    []
  );

  // 保存编辑
  const handleSaveEdit = useCallback(
    async (playerId: number, data: any) => {
      const success = await updatePlayer(playerId, data);
      if (success) {
        // 刷新列表和统计
        fetchPlayers({
          filters: appliedFilters,
          page: pagination.page,
          pageSize: pagination.page_size,
          sortBy: sort.sort_by,
          sortOrder: sort.sort_order
        });
        fetchStatistics(appliedFilters);
        // 如果详情弹窗打开，刷新详情
        if (currentPlayer && currentPlayer.id === playerId) {
          const playerDetail = await fetchPlayerDetail(playerId);
          if (playerDetail) {
            setCurrentPlayer(playerDetail);
          }
        }
      }
      return success;
    },
    [updatePlayer, appliedFilters, pagination, sort, currentPlayer, fetchPlayerDetail, fetchPlayers, fetchStatistics]
  );

  // 保存钱包调整
  const handleSaveWalletAdjust = useCallback(
    async (playerId: number, data: any) => {
      const success = await adjustWallet(playerId, data);
      if (success) {
        // 刷新列表和统计
        fetchPlayers({
          filters: appliedFilters,
          page: pagination.page,
          pageSize: pagination.page_size,
          sortBy: sort.sort_by,
          sortOrder: sort.sort_order
        });
        fetchStatistics(appliedFilters);
      }
      return success;
    },
    [adjustWallet, appliedFilters, pagination, sort, fetchPlayers, fetchStatistics]
  );

  // 刷新玩家详情
  const handleRefreshPlayerDetail = useCallback(
    async (playerId: number) => {
      const playerDetail = await fetchPlayerDetail(playerId);
      if (playerDetail) {
        setCurrentPlayer(playerDetail);
      }
      return playerDetail;
    },
    [fetchPlayerDetail]
  );

  // 批量操作
  const handleBatchOperation = useCallback(
    async (operation: 'enable' | 'disable') => {
      if (selectedPlayerIds.length === 0) return;

      setBatchOperationType(operation);
      setBatchConfirmOpen(true);
    },
    [selectedPlayerIds]
  );

  const handleConfirmBatchOperation = useCallback(async () => {
    if (!batchOperationType || selectedPlayerIds.length === 0) return;

    const success = await batchOperation(selectedPlayerIds, batchOperationType);
    if (success) {
      setSelectedPlayerIds([]);
      fetchPlayers({
        filters: appliedFilters,
        page: pagination.page,
        pageSize: pagination.page_size,
        sortBy: sort.sort_by,
        sortOrder: sort.sort_order
      });
      fetchStatistics(appliedFilters);
    }
    setBatchConfirmOpen(false);
    setBatchOperationType(null);
  }, [batchOperationType, selectedPlayerIds, batchOperation, appliedFilters, pagination, sort, fetchPlayers, fetchStatistics]);

  // 重置密码
  const handleResetPassword = useCallback(
    async (player: Player) => {
      const confirmed = window.confirm(`确定要重置玩家 ${player.username} 的密码吗？`);
      if (confirmed) {
        await resetPassword(player.id);
      }
    },
    [resetPassword]
  );

  // 发送通知
  const handleSendNotification = useCallback((player: Player) => {
    setNotificationPlayer(player);
    setNotificationModalOpen(true);
  }, []);

  const handleSaveNotification = useCallback(
    async (playerId: number, data: { channel: string; title: string; content: string }) => {
      const success = await sendNotification(playerId, data);
      if (success) {
        setNotificationModalOpen(false);
        setNotificationPlayer(null);
      }
      return success;
    },
    [sendNotification]
  );

  // 查看操作日志
  const handleViewLogs = useCallback(
    (player: Player) => {
      router.push(`/dashboard/system/logs?user_id=${player.id}`);
    },
    [router]
  );

  // 导出
  const handleExport = useCallback(async () => {
    await exportPlayers(appliedFilters);
  }, [exportPlayers, appliedFilters]);

  // 选择玩家
  const handleSelectPlayer = useCallback((playerId: number, selected: boolean) => {
    setSelectedPlayerIds((prev) => {
      if (selected) {
        return [...prev, playerId];
      } else {
        return prev.filter((id) => id !== playerId);
      }
    });
  }, []);

  // 全选
  const handleSelectAll = useCallback((selected: boolean) => {
    if (selected) {
      setSelectedPlayerIds(players.map((p) => p.id));
    } else {
      setSelectedPlayerIds([]);
    }
  }, [players]);

  return (
    <PageContainer>
      <div className='flex w-full flex-1 flex-col space-y-4'>
        {/* 页面头部 */}
        <div className='flex items-center justify-between'>
          <Heading
            title='玩家管理'
            description='查看和管理所有玩家账户信息'
          />
          <div className='flex items-center gap-2'>
            <Button variant='outline' onClick={handleExport}>
              <Download className='mr-2 h-4 w-4' />
              导出
            </Button>
            <Button
              variant='outline'
              onClick={() => {
                fetchPlayers({
                  filters: appliedFilters,
                  page: pagination.page,
                  pageSize: pagination.page_size,
                  sortBy: sort.sort_by,
                  sortOrder: sort.sort_order
                });
                fetchStatistics(appliedFilters);
              }}
            >
              <RefreshCw className='mr-2 h-4 w-4' />
              刷新
            </Button>
          </div>
        </div>

        {/* 筛选区 */}
        <PlayerFilterBar
          onSearch={() => {
            fetchPlayers({
              filters: appliedFilters,
              page: 1,
              pageSize: pagination.page_size,
              sortBy: sort.sort_by,
              sortOrder: sort.sort_order
            });
            fetchStatistics(appliedFilters);
          }}
          loading={loading}
        />

        {/* 统计卡片 */}
        <PlayerStatisticsCards
          statistics={statistics}
          loading={statisticsLoading}
          onRetry={() => fetchStatistics(appliedFilters)}
        />

        {/* 批量操作栏 */}
        {selectedPlayerIds.length > 0 && (
          <div className='flex items-center gap-2 rounded-lg border bg-muted/50 p-3'>
            <span className='text-sm font-medium'>
              已选择 {selectedPlayerIds.length} 个玩家
            </span>
            <Button
              variant='outline'
              size='sm'
              onClick={() => handleBatchOperation('enable')}
            >
              <CheckCircle className='mr-2 h-4 w-4' />
              批量启用
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => handleBatchOperation('disable')}
            >
              <Ban className='mr-2 h-4 w-4' />
              批量禁用
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setSelectedPlayerIds([])}
            >
              取消选择
            </Button>
          </div>
        )}

        {/* 玩家列表表格 */}
        <PlayerTableEnhanced
          players={players}
          loading={loading}
          pagination={pagination}
          sort={sort}
          selectedPlayerIds={selectedPlayerIds}
          onSort={setSort}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          onSelectPlayer={handleSelectPlayer}
          onSelectAll={handleSelectAll}
          onViewDetail={handleViewDetail}
          onEdit={handleEdit}
          onResetPassword={handleResetPassword}
          onSendNotification={handleSendNotification}
          onViewLogs={handleViewLogs}
        />

        {/* 详情弹窗 */}
        <PlayerDetailModal
          open={detailModalOpen}
          playerId={currentPlayer?.id || null}
          onClose={() => {
            setDetailModalOpen(false);
            setCurrentPlayer(null);
          }}
          onEdit={handleEdit}
          onAdjustWallet={handleAdjustWallet}
          onRefresh={handleRefreshPlayerDetail}
        />

        {/* 编辑弹窗 */}
        <PlayerEditModal
          open={editModalOpen}
          player={currentPlayer}
          onClose={() => {
            setEditModalOpen(false);
            setCurrentPlayer(null);
          }}
          onSubmit={handleSaveEdit}
        />

        {/* 钱包调整弹窗 */}
        <PlayerWalletAdjustModal
          open={walletModalOpen}
          player={currentPlayer}
          onClose={() => {
            setWalletModalOpen(false);
            setCurrentPlayer(null);
          }}
          onSubmit={handleSaveWalletAdjust}
          onRefresh={handleRefreshPlayerDetail}
        />

        {/* 批量操作确认对话框 */}
        <AlertDialog open={batchConfirmOpen} onOpenChange={setBatchConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认批量操作</AlertDialogTitle>
              <AlertDialogDescription>
                确定要{batchOperationType === 'enable' ? '启用' : '禁用'}{' '}
                {selectedPlayerIds.length} 个玩家吗？
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmBatchOperation}>
                确认
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* 通知弹窗 */}
        <PlayerNotificationModal
          open={notificationModalOpen}
          player={notificationPlayer}
          onClose={() => {
            setNotificationModalOpen(false);
            setNotificationPlayer(null);
          }}
          onSubmit={handleSaveNotification}
        />
      </div>
    </PageContainer>
  );
}

