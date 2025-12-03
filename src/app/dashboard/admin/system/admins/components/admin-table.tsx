'use client';

import React, { useMemo } from 'react';
import { ArrowUpDown, Eye, Edit, MoreHorizontal, ArrowUp, ArrowDown, Key, Trash2 } from 'lucide-react';
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
import { Admin, PaginationInfo, SortInfo } from '../types';
import {
  formatDateTime,
  getAdminStatusColor,
  getAdminStatusText
} from '../utils';

interface AdminTableProps {
  admins: Admin[];
  loading: boolean;
  pagination: PaginationInfo;
  sort: SortInfo;
  selectedAdminIds: number[];
  currentUserId?: number;
  onSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSelectAdmin: (adminId: number, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onViewDetail: (admin: Admin) => void;
  onEdit: (admin: Admin) => void;
  onResetPassword: (admin: Admin) => void;
  onStatusChange: (admin: Admin) => void;
  onDelete: (admin: Admin) => void;
}

/**
 * 管理员列表表格组件
 */
export function AdminTable({
  admins,
  loading,
  pagination,
  sort,
  selectedAdminIds,
  currentUserId,
  onSort,
  onPageChange,
  onPageSizeChange,
  onSelectAdmin,
  onSelectAll,
  onViewDetail,
  onEdit,
  onResetPassword,
  onStatusChange,
  onDelete
}: AdminTableProps) {
  // 是否全选
  const isAllSelected = useMemo(() => {
    return admins.length > 0 && admins.every((admin) => selectedAdminIds.includes(admin.id));
  }, [admins, selectedAdminIds]);

  // 是否部分选中
  const isIndeterminate = useMemo(() => {
    return selectedAdminIds.length > 0 && selectedAdminIds.length < admins.length;
  }, [selectedAdminIds, admins]);

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
    const isAsc = sort.sort_order === 'asc';

    return (
      <Button
        variant='ghost'
        className='h-8 p-0 hover:bg-transparent'
        onClick={() => handleSort(column)}
      >
        {label}
        {isActive ? (
          isAsc ? (
            <ArrowUp className='ml-2 h-4 w-4' />
          ) : (
            <ArrowDown className='ml-2 h-4 w-4' />
          )
        ) : (
          <ArrowUpDown className='ml-2 h-4 w-4 opacity-50' />
        )}
      </Button>
    );
  };

  if (loading) {
    return (
      <Card>
        <div className='p-4'>
          <Skeleton className='h-10 w-full mb-2' />
          <Skeleton className='h-10 w-full mb-2' />
          <Skeleton className='h-10 w-full mb-2' />
          <Skeleton className='h-10 w-full' />
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className='overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-12'>
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={isIndeterminate}
                  onCheckedChange={onSelectAll}
                />
              </TableHead>
              <TableHead>{renderSortableHeader('id', 'ID')}</TableHead>
              <TableHead>{renderSortableHeader('username', '用户名')}</TableHead>
              <TableHead>邮箱</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>超管</TableHead>
              <TableHead>{renderSortableHeader('status', '状态')}</TableHead>
              <TableHead>{renderSortableHeader('last_login_at', '最后登录时间')}</TableHead>
              <TableHead>登录失败次数</TableHead>
              <TableHead>锁定时间</TableHead>
              <TableHead>{renderSortableHeader('created_at', '创建时间')}</TableHead>
              <TableHead className='text-right'>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className='text-center text-muted-foreground'>
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              admins.map((admin) => {
                const isCurrentUser = currentUserId === admin.id;
                return (
                  <TableRow key={admin.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedAdminIds.includes(admin.id)}
                        onCheckedChange={(checked) =>
                          onSelectAdmin(admin.id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell>{admin.id}</TableCell>
                    <TableCell className='font-medium'>{admin.username}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>
                      <Badge variant={admin.is_super_admin ? 'default' : 'secondary'}>
                        {admin.role_name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {admin.is_super_admin ? (
                        <Badge variant='default' className='bg-purple-600'>
                          是
                        </Badge>
                      ) : (
                        <Badge variant='outline'>否</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getAdminStatusColor(admin.status)}
                        variant='default'
                      >
                        {getAdminStatusText(admin.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDateTime(admin.last_login_at)}</TableCell>
                    <TableCell>{admin.login_error_count}</TableCell>
                    <TableCell>{formatDateTime(admin.lock_time)}</TableCell>
                    <TableCell>{formatDateTime(admin.created_at)}</TableCell>
                    <TableCell className='text-right'>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' size='sm'>
                            <MoreHorizontal className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem onClick={() => onViewDetail(admin)}>
                            <Eye className='mr-2 h-4 w-4' />
                            查看详情
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(admin)}>
                            <Edit className='mr-2 h-4 w-4' />
                            编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onResetPassword(admin)}>
                            <Key className='mr-2 h-4 w-4' />
                            重置密码
                          </DropdownMenuItem>
                          {!isCurrentUser && (
                            <>
                              <DropdownMenuItem onClick={() => onStatusChange(admin)}>
                                状态变更
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => onDelete(admin)}
                                className='text-red-600'
                              >
                                <Trash2 className='mr-2 h-4 w-4' />
                                删除
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* 分页 */}
      <div className='border-t p-4'>
        <Pagination
          pagination={{
            page: pagination.page,
            limit: pagination.page_size,
            total: pagination.total,
            totalPages: pagination.total_pages
          }}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </div>
    </Card>
  );
}

