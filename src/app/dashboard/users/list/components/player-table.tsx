'use client';

import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePlayers } from '../hooks/use-players';
import { usePlayerFilters } from '../hooks/use-player-filters';
import { formatDate } from '@/lib/format';
import { Eye, Ban, CheckCircle } from 'lucide-react';

function formatDateTime(dateStr: string): string {
  return formatDate(dateStr, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function PlayerTable() {
  const {
    players,
    loading,
    total,
    page,
    pageSize,
    fetchPlayers,
    updatePlayerStatus
  } = usePlayers();
  const { appliedFilters } = usePlayerFilters();

  useEffect(() => {
    fetchPlayers({
      ...appliedFilters,
      page,
      pageSize
    });
  }, [appliedFilters, fetchPlayers, page, pageSize]);

  const handlePageChange = (newPage: number) => {
    fetchPlayers({
      ...appliedFilters,
      page: newPage,
      pageSize
    });
  };

  const handleStatusToggle = async (id: number, currentStatus: boolean) => {
    await updatePlayerStatus(id, !currentStatus);
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
    <div className='space-y-4'>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>用户名</TableHead>
              <TableHead>邮箱</TableHead>
              <TableHead>余额</TableHead>
              <TableHead>VIP等级</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>身份类别</TableHead>
              <TableHead>注册方式</TableHead>
              <TableHead>最后登录</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className='text-right'>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={11}
                  className='text-muted-foreground text-center'
                >
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              players.map((player) => (
                <TableRow key={player.id}>
                  <TableCell className='font-medium'>{player.id}</TableCell>
                  <TableCell>{player.username}</TableCell>
                  <TableCell className='text-xs'>{player.email}</TableCell>
                  <TableCell>
                    <span className='font-mono'>
                      ${player.balance.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant='outline'>VIP {player.vipLevel}</Badge>
                  </TableCell>
                  <TableCell>
                    {player.status ? (
                      <Badge variant='default' className='bg-green-600'>
                        启用
                      </Badge>
                    ) : (
                      <Badge variant='destructive'>停用</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant='secondary'>
                      {getIdentityCategoryLabel(player.identityCategory)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant='outline'>
                      {getRegistrationMethodLabel(player.registrationMethod)}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-xs'>
                    {player.lastLogin ? formatDateTime(player.lastLogin) : '-'}
                  </TableCell>
                  <TableCell className='text-xs'>
                    {formatDateTime(player.createdAt)}
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='flex justify-end gap-2'>
                      <Button variant='ghost' size='sm' onClick={() => {}}>
                        <Eye className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() =>
                          handleStatusToggle(player.id, player.status)
                        }
                      >
                        {player.status ? (
                          <Ban className='h-4 w-4 text-red-500' />
                        ) : (
                          <CheckCircle className='h-4 w-4 text-green-500' />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* 分页 */}
      {total > 0 && (
        <div className='flex items-center justify-between'>
          <div className='text-muted-foreground text-sm'>
            共 {total} 条记录，第 {page} / {Math.ceil(total / pageSize)} 页
          </div>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              disabled={page <= 1}
              onClick={() => handlePageChange(page - 1)}
            >
              上一页
            </Button>
            <Button
              variant='outline'
              size='sm'
              disabled={page >= Math.ceil(total / pageSize)}
              onClick={() => handlePageChange(page + 1)}
            >
              下一页
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function getIdentityCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    user: '普通用户',
    agent: '代理',
    internal: '内部账号',
    test: '测试账号'
  };
  return labels[category] || category;
}

function getRegistrationMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    email: '邮箱',
    google: 'Google',
    apple: 'Apple',
    phone: '手机',
    facebook: 'Facebook',
    other: '其他'
  };
  return labels[method] || method;
}
