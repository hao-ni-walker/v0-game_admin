'use client';

import { useEffect, useState } from 'react';
import { Gamepad2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/table/pagination';
import PageContainer from '@/components/layout/page-container';

import {
  GamePageHeader,
  GameFilters,
  GameTable,
  SyncGameDialog,
  EditGameDialog
} from './components';
import { useGameFilters, useGameManagement } from './hooks';
import { PAGE_SIZE_OPTIONS } from './constants';
import { Game, GameFormData } from './types';

export default function GamesPage() {
  // 使用自定义hooks
  const {
    filters,
    searchFilters,
    updatePagination,
    clearFilters,
    hasActiveFilters
  } = useGameFilters();

  const {
    games,
    loading,
    pagination,
    fetchGames,
    refreshGames,
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
  } = useGameManagement();

  // 同步游戏对话框状态
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);

  // 编辑游戏对话框状态
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);

  // 选中的游戏ID列表
  const [selectedGameIds, setSelectedGameIds] = useState<number[]>([]);

  // 初始化和筛选条件变化时获取数据
  useEffect(() => {
    fetchGames(filters);
  }, [filters, fetchGames]);

  /**
   * 打开同步游戏对话框
   */
  const handleOpenSyncDialog = () => {
    setSyncDialogOpen(true);
  };

  /**
   * 处理同步游戏
   */
  const handleSyncGames = async (providerCode: string) => {
    const success = await syncGames(providerCode);
    if (success) {
      // 同步成功后刷新游戏列表
      fetchGames(filters);
    }
  };

  /**
   * 打开编辑游戏对话框
   */
  const handleOpenEditDialog = (game: Game) => {
    setEditingGame(game);
    setEditDialogOpen(true);
  };

  /**
   * 处理更新游戏
   */
  const handleUpdateGame = async (id: number, data: Partial<GameFormData>) => {
    const success = await updateGame(id, data);
    if (success) {
      fetchGames(filters);
    }
    return success;
  };

  /**
   * 删除游戏
   */
  const handleDeleteGame = async (game: Game) => {
    const success = await deleteGame(game.id);
    if (success) {
      fetchGames(filters);
    }
  };

  /**
   * 切换游戏状态
   */
  const handleToggleStatus = async (game: Game) => {
    const success = await toggleGameStatus(game);
    if (success) {
      fetchGames(filters);
    }
  };

  /**
   * 切换推荐状态
   */
  const handleToggleFeatured = async (game: Game) => {
    const success = await toggleFeatured(game);
    if (success) {
      fetchGames(filters);
    }
  };

  /**
   * 切换新游状态
   */
  const handleToggleNew = async (game: Game) => {
    const success = await toggleNew(game);
    if (success) {
      fetchGames(filters);
    }
  };

  /**
   * 刷新数据
   */
  const handleRefresh = () => {
    refreshGames(filters);
  };

  /**
   * 处理查询
   */
  const handleSearch = (newFilters: any) => {
    searchFilters(newFilters);
  };

  /**
   * 处理重置
   */
  const handleReset = () => {
    clearFilters();
  };

  /**
   * 处理分页变化
   */
  const handlePageChange = (page: number) => {
    updatePagination({ page });
  };

  /**
   * 处理页面大小变化
   */
  const handlePageSizeChange = (page_size: number) => {
    updatePagination({ page_size, page: 1 });
  };

  /**
   * 处理选择游戏
   */
  const handleSelectGame = (gameId: number, checked: boolean) => {
    if (checked) {
      setSelectedGameIds((prev) => [...prev, gameId]);
    } else {
      setSelectedGameIds((prev) => prev.filter((id) => id !== gameId));
    }
  };

  /**
   * 处理全选/取消全选
   */
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedGameIds(games.map((game) => game.id));
    } else {
      setSelectedGameIds([]);
    }
  };

  /**
   * 处理批量启用
   */
  const handleBatchEnable = async (gameIds: number[]) => {
    const success = await batchEnableGames(gameIds);
    if (success) {
      setSelectedGameIds([]);
      fetchGames(filters);
    }
  };

  /**
   * 处理批量停用
   */
  const handleBatchDisable = async (gameIds: number[]) => {
    const success = await batchDisableGames(gameIds);
    if (success) {
      setSelectedGameIds([]);
      fetchGames(filters);
    }
  };

  /**
   * 处理批量推荐
   */
  const handleBatchFeature = async (gameIds: number[]) => {
    const success = await batchFeatureGames(gameIds);
    if (success) {
      setSelectedGameIds([]);
      fetchGames(filters);
    }
  };

  /**
   * 处理批量取消推荐
   */
  const handleBatchUnfeature = async (gameIds: number[]) => {
    const success = await batchUnfeatureGames(gameIds);
    if (success) {
      setSelectedGameIds([]);
      fetchGames(filters);
    }
  };

  /**
   * 处理批量删除
   */
  const handleBatchDelete = async (gameIds: number[]) => {
    if (
      !confirm(`确定要删除选中的 ${gameIds.length} 个游戏吗？此操作不可撤销。`)
    ) {
      return;
    }
    const success = await batchDeleteGames(gameIds);
    if (success) {
      setSelectedGameIds([]);
      fetchGames(filters);
    }
  };

  return (
    <PageContainer scrollable={false}>
      <div className='flex h-[calc(100vh-8rem)] w-full flex-col space-y-4'>
        {/* 页面头部 */}
        <GamePageHeader
          onSyncGames={handleOpenSyncDialog}
          onRefresh={handleRefresh}
          loading={loading}
        />

        {/* 搜索和筛选 */}
        <GameFilters
          filters={filters}
          onSearch={handleSearch}
          onReset={handleReset}
          loading={loading}
        />

        {/* 数据表格和分页 */}
        <div className='flex min-h-0 flex-1 flex-col'>
          <div className='min-h-0'>
            <GameTable
              games={games}
              loading={loading}
              pagination={pagination}
              selectedGameIds={selectedGameIds}
              onEdit={handleOpenEditDialog}
              onDelete={handleDeleteGame}
              onToggleStatus={handleToggleStatus}
              onToggleFeatured={handleToggleFeatured}
              onToggleNew={handleToggleNew}
              onSelectGame={handleSelectGame}
              onSelectAll={handleSelectAll}
              onBatchEnable={handleBatchEnable}
              onBatchDisable={handleBatchDisable}
              onBatchFeature={handleBatchFeature}
              onBatchUnfeature={handleBatchUnfeature}
              onBatchDelete={handleBatchDelete}
              emptyState={{
                icon: <Gamepad2 className='text-muted-foreground h-8 w-8' />,
                title: hasActiveFilters ? '未找到匹配的游戏' : '还没有游戏',
                description: hasActiveFilters
                  ? '请尝试调整筛选条件以查看更多结果'
                  : '开始添加游戏来管理您的游戏库',
                action: !hasActiveFilters ? (
                  <Button
                    onClick={handleOpenSyncDialog}
                    size='sm'
                    className='mt-2'
                  >
                    <Plus className='mr-2 h-4 w-4' />
                    同步平台游戏
                  </Button>
                ) : undefined
              }}
            />
          </div>

          {/* 分页控件 */}
          <div className='flex-shrink-0 pt-4'>
            <Pagination
              pagination={{
                ...pagination,
                limit: pagination.page_size
              }}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
            />
          </div>
        </div>

        {/* 同步游戏对话框 */}
        <SyncGameDialog
          open={syncDialogOpen}
          onOpenChange={setSyncDialogOpen}
          onSync={handleSyncGames}
          loading={loading}
        />

        {/* 编辑游戏对话框 */}
        <EditGameDialog
          open={editDialogOpen}
          game={editingGame}
          onClose={() => setEditDialogOpen(false)}
          onSubmit={handleUpdateGame}
        />
      </div>
    </PageContainer>
  );
}
