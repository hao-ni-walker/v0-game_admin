'use client';

import React, { useState, useMemo } from 'react';
import { ArrowUpDown, Eye, Edit, MoreHorizontal, ArrowUp, ArrowDown } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Pagination } from '@/components/table/pagination';
import { AdminUser, PaginationInfo, SortInfo } from '../types';
import {
  formatCurrency,
  formatDateTime,
  maskEmail,
  getUserStatusColor,
  getUserStatusText,
  getVipLevelColor,
  getRegistrationMethodText,
  getIdentityCategoryText
} from '../utils';
interface UserTableProps {
  users: AdminUser[];
  loading: boolean;
  pagination: PaginationInfo;
  sort: SortInfo;
  selectedUserIds: number[];
  onSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSelectUser: (userId: number, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onViewDetail: (user: AdminUser) => void;
  onEdit: (user: AdminUser) => void;
  onResetPassword: (user: AdminUser) => void;
  onSendNotification: (user: AdminUser) => void;
  onViewLogs: (user: AdminUser) => void;
}

/**
 * 用户列表表格组件
 */
export function UserTable({
  users,
  loading,
  pagination,
  sort,
  selectedUserIds,
  onSort,
  onPageChange,
  onPageSizeChange,
  onSelectUser,
  onSelectAll,
  onViewDetail,
  onEdit,
  onResetPassword,
  onSendNotification,
  onViewLogs
}: UserTableProps) {
  // 是否全选
  const isAllSelected = useMemo(() => {
    return users.length > 0 && users.every((user) => selectedUserIds.includes(user.id));
  }, [users, selectedUserIds]);

  // 是否部分选中
  const isIndeterminate = useMemo(() => {
    return selectedUserIds.length > 0 && selectedUserIds.length < users.length;
  }, [selectedUserIds, users]);

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
            <ArrowUpDown className='h-4 w-4 text-muted-foreground' />
          )}
        </div>
      </TableHead>
    );
  };

  if (loading && users.length === 0) {
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
              <TableHead className='w-12'>
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={onSelectAll}
                  aria-label='全选'
                />
              </TableHead>
              {renderSortableHeader('id', '用户ID')}
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
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={13} className='text-center text-muted-foreground'>
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedUserIds.includes(user.id)}
                      onCheckedChange={(checked) =>
                        onSelectUser(user.id, checked === true)
                      }
                      aria-label={`选择用户 ${user.username}`}
                    />
                  </TableCell>
                  <TableCell className='font-medium'>{user.id}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell className='text-xs'>{maskEmail(user.email)}</TableCell>
                  <TableCell>
                    <Badge
                      variant='default'
                      className={getUserStatusColor(user.status)}
                    >
                      {getUserStatusText(user.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant='outline'
                      className={getVipLevelColor(user.vip_level)}
                    >
                      VIP {user.vip_level}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className='font-mono'>
                      {formatCurrency(user.wallet?.balance || 0)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className='font-mono'>
                      {formatCurrency(user.wallet?.total_deposit || 0)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className='font-mono'>
                      {formatCurrency(user.wallet?.total_bet || 0)}
                    </span>
                  </TableCell>
                  <TableCell>{user.agent || '-'}</TableCell>
                  <TableCell className='text-xs'>
                    {formatDateTime(user.created_at)}
                  </TableCell>
                  <TableCell className='text-xs'>
                    {formatDateTime(user.last_login)}
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='flex justify-end gap-2'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => onViewDetail(user)}
                      >
                        <Eye className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => onEdit(user)}
                      >
                        <Edit className='h-4 w-4' />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' size='sm'>
                            <MoreHorizontal className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem onClick={() => onResetPassword(user)}>
                            重置密码
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onSendNotification(user)}>
                            发送通知
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onViewLogs(user)}>
                            查看操作日志
                          </DropdownMenuItem>
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

