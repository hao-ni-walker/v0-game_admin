'use client';

import React, { useState, useMemo } from 'react';
import {
  ArrowUpDown,
  Eye,
  Edit,
  MoreHorizontal,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Pagination } from '@/components/table/pagination';
import { Player, PaginationInfo, SortInfo } from '../types';
import {
  formatCurrency,
  formatDateTime,
  maskEmail,
  getPlayerStatusColor,
  getPlayerStatusText,
  getVipLevelColor,
  getRegistrationMethodText,
  getIdentityCategoryText
} from '../utils';

interface PlayerTableEnhancedProps {
  players: Player[];
  loading: boolean;
  pagination: PaginationInfo;
  sort: SortInfo;
  selectedPlayerIds: number[];
  onSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSelectPlayer: (playerId: number, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onViewDetail: (player: Player) => void;
  onEdit: (player: Player) => void;
  onResetPassword: (player: Player) => void;
  onSendNotification: (player: Player) => void;
  onViewLogs: (player: Player) => void;
  onStatusChange?: (playerId: number, status: boolean) => void;
  onViewSpinQuota?: (player: Player) => void;
  onViewSignRecords?: (player: Player) => void;
  onViewActivities?: (player: Player) => void;
  onModifyRTP?: (player: Player) => void;
}

/**
 * 玩家列表表格组件（增强版）
 */
export function PlayerTableEnhanced({
  players,
  loading,
  pagination,
  sort,
  selectedPlayerIds,
  onSort,
  onPageChange,
  onPageSizeChange,
  onSelectPlayer,
  onSelectAll,
  onViewDetail,
  onEdit,
  onResetPassword,
  onSendNotification,
  onViewLogs,
  onStatusChange,
  onViewSpinQuota,
  onViewSignRecords,
  onViewActivities,
  onModifyRTP
}: PlayerTableEnhancedProps) {
  // 是否全选
  const isAllSelected = useMemo(() => {
    return (
      players.length > 0 &&
      players.every((player) => selectedPlayerIds.includes(player.id))
    );
  }, [players, selectedPlayerIds]);

  // 是否部分选中
  const isIndeterminate = useMemo(() => {
    return (
      selectedPlayerIds.length > 0 && selectedPlayerIds.length < players.length
    );
  }, [selectedPlayerIds, players]);

  /**
   * 处理排序
   */
  const handleSort = (column: string) => {
    if (sort.sort_by === column) {
      // 切换排序方向
      onSort(column, sort.sort_order === 'asc' ? 'desc' : 'asc');
    } else {
      // 新列，默认升序
      onSort(column, 'asc');
    }
  };

  /**
   * 判断状态是否为启用
   */
  const isStatusActive = (status: string | boolean): boolean => {
    if (typeof status === 'boolean') {
      return status;
    }
    return status === 'active';
  };

  /**
   * 处理状态切换
   */
  const handleStatusChange = (
    playerId: number,
    currentStatus: string | boolean
  ) => {
    if (onStatusChange) {
      const newStatus = !isStatusActive(currentStatus);
      onStatusChange(playerId, newStatus);
    }
  };

  /**
   * 渲染排序列头
   */
  const renderSortableHeader = (column: string, label: string) => {
    const isActive = sort.sort_by === column;
    return (
      <TableHead className='cursor-pointer' onClick={() => handleSort(column)}>
        <div className='flex items-center gap-2'>
          {label}
          {isActive ? (
            sort.sort_order === 'asc' ? (
              <ArrowUp className='h-4 w-4' />
            ) : (
              <ArrowDown className='h-4 w-4' />
            )
          ) : (
            <ArrowUpDown className='text-muted-foreground h-4 w-4' />
          )}
        </div>
      </TableHead>
    );
  };

  if (loading && players.length === 0) {
    return (
      <Card>
        <div className='space-y-3 p-4'>
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className='h-12 w-full' />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <div className='flex flex-1 flex-col space-y-4'>
      <Card className='flex-1 overflow-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-12'>
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={onSelectAll}
                  aria-label='全选'
                />
              </TableHead>
              {renderSortableHeader('id', '玩家ID')}
              <TableHead>用户名</TableHead>
              <TableHead>邮箱</TableHead>
              <TableHead>账户状态</TableHead>
              {renderSortableHeader('vip_level', 'VIP等级')}
              <TableHead>可用余额</TableHead>
              {renderSortableHeader('total_deposit', '总存款')}
              {renderSortableHeader('total_bet', '总投注')}
              <TableHead>代理商</TableHead>
              {renderSortableHeader('created_at', '注册时间')}
              {renderSortableHeader('last_login', '最后登录')}
              <TableHead className='text-right'>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={13}
                  className='text-muted-foreground text-center'
                >
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              players.map((player) => (
                <TableRow key={player.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedPlayerIds.includes(player.id)}
                      onCheckedChange={(checked) =>
                        onSelectPlayer(player.id, checked === true)
                      }
                      aria-label={`选择玩家 ${player.username}`}
                    />
                  </TableCell>
                  <TableCell className='font-medium'>{player.id}</TableCell>
                  <TableCell>{player.username}</TableCell>
                  <TableCell className='text-xs'>
                    {maskEmail(player.email)}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={isStatusActive(player.status)}
                      onCheckedChange={() =>
                        handleStatusChange(player.id, player.status)
                      }
                      disabled={!onStatusChange}
                    />
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant='outline'
                      className={getVipLevelColor(player.vip_level)}
                    >
                      VIP {player.vip_level}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className='font-mono'>
                      {formatCurrency(player.wallet?.balance || 0)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className='font-mono'>
                      {formatCurrency(player.wallet?.total_deposit || 0)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className='font-mono'>
                      {formatCurrency(player.wallet?.total_bet || 0)}
                    </span>
                  </TableCell>
                  <TableCell>{player.agent || '-'}</TableCell>
                  <TableCell className='text-xs'>
                    {formatDateTime(player.created_at)}
                  </TableCell>
                  <TableCell className='text-xs'>
                    {formatDateTime(player.last_login)}
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='flex justify-end gap-2'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => onViewDetail(player)}
                      >
                        <Eye className='h-4 w-4' />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' size='sm'>
                            <MoreHorizontal className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem onClick={() => onEdit(player)}>
                            编辑
                          </DropdownMenuItem>
                          {onViewSpinQuota && (
                            <DropdownMenuItem
                              onClick={() => onViewSpinQuota(player)}
                            >
                              查看大转盘次数
                            </DropdownMenuItem>
                          )}
                          {onViewLogs && (
                            <DropdownMenuItem
                              onClick={() => onViewLogs(player)}
                            >
                              查看操作记录
                            </DropdownMenuItem>
                          )}
                          {onSendNotification && (
                            <DropdownMenuItem
                              onClick={() => onSendNotification(player)}
                            >
                              发送通知
                            </DropdownMenuItem>
                          )}
                          {onViewSignRecords && (
                            <DropdownMenuItem
                              onClick={() => onViewSignRecords(player)}
                            >
                              查看签到记录
                            </DropdownMenuItem>
                          )}
                          {onViewActivities && (
                            <DropdownMenuItem
                              onClick={() => onViewActivities(player)}
                            >
                              查看参与的活动
                            </DropdownMenuItem>
                          )}
                          {onModifyRTP && (
                            <DropdownMenuItem
                              onClick={() => onModifyRTP(player)}
                            >
                              修改RTP
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* 分页 */}
      {pagination.total > 0 && (
        <Pagination
          pagination={{
            page: pagination.page,
            limit: pagination.page_size,
            total: pagination.total,
            totalPages: pagination.total_pages
          }}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          pageSizeOptions={[10, 20, 50, 100]}
        />
      )}
    </div>
  );
}
