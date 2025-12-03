'use client';

import React, { useState, useEffect } from 'react';
import { X, Edit, Key, RefreshCw } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AdminDetail } from '../types';
import {
  formatDateTime,
  getAdminStatusColor,
  getAdminStatusText
} from '../utils';

interface AdminDetailDrawerProps {
  open: boolean;
  adminId: number | null;
  admin: AdminDetail | null;
  loading: boolean;
  currentUserId?: number;
  onClose: () => void;
  onEdit: (admin: AdminDetail) => void;
  onResetPassword: (admin: AdminDetail) => void;
  onStatusChange: (admin: AdminDetail) => void;
  onRefresh: () => void;
}

/**
 * 管理员详情抽屉组件
 */
export function AdminDetailDrawer({
  open,
  adminId,
  admin,
  loading,
  currentUserId,
  onClose,
  onEdit,
  onResetPassword,
  onStatusChange,
  onRefresh
}: AdminDetailDrawerProps) {
  const isCurrentUser = currentUserId === admin?.id;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className='w-full sm:max-w-2xl overflow-y-auto'>
        <SheetHeader>
          <SheetTitle>管理员详情</SheetTitle>
        </SheetHeader>

        <div className='mt-6 space-y-6'>
          {loading ? (
            <div className='space-y-4'>
              <Skeleton className='h-20 w-full' />
              <Skeleton className='h-20 w-full' />
              <Skeleton className='h-20 w-full' />
            </div>
          ) : !admin ? (
            <div className='text-center text-muted-foreground py-8'>
              <p>暂无数据</p>
            </div>
          ) : (
            <>
              {/* 基本信息块 */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold'>基本信息</h3>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <p className='text-sm text-muted-foreground'>ID</p>
                    <p className='mt-1 font-medium'>{admin.id}</p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>用户名</p>
                    <p className='mt-1 font-medium'>{admin.username}</p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>邮箱</p>
                    <p className='mt-1 font-medium'>{admin.email}</p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>状态</p>
                    <div className='mt-1'>
                      <Badge
                        className={getAdminStatusColor(admin.status)}
                        variant='default'
                      >
                        {getAdminStatusText(admin.status)}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>超管标识</p>
                    <div className='mt-1'>
                      {admin.is_super_admin ? (
                        <Badge variant='default' className='bg-purple-600'>
                          是
                        </Badge>
                      ) : (
                        <Badge variant='outline'>否</Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>角色</p>
                    <p className='mt-1 font-medium'>{admin.role_name}</p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>创建时间</p>
                    <p className='mt-1 font-medium'>{formatDateTime(admin.created_at)}</p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>更新时间</p>
                    <p className='mt-1 font-medium'>{formatDateTime(admin.updated_at)}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* 登录信息块 */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold'>登录信息</h3>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <p className='text-sm text-muted-foreground'>最后登录时间</p>
                    <p className='mt-1 font-medium'>{formatDateTime(admin.last_login_at)}</p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>登录失败次数</p>
                    <p className='mt-1 font-medium'>{admin.login_error_count}</p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>锁定时间</p>
                    <p className='mt-1 font-medium'>{formatDateTime(admin.lock_time)}</p>
                  </div>
                </div>
              </div>

              {/* 角色信息块 */}
              {admin.role && (
                <>
                  <Separator />
                  <div className='space-y-4'>
                    <h3 className='text-lg font-semibold'>角色信息</h3>
                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <p className='text-sm text-muted-foreground'>角色名称</p>
                        <p className='mt-1 font-medium'>{admin.role.name}</p>
                      </div>
                      <div>
                        <p className='text-sm text-muted-foreground'>是否超管角色</p>
                        <div className='mt-1'>
                          {admin.role.is_super ? (
                            <Badge variant='default' className='bg-purple-600'>
                              是
                            </Badge>
                          ) : (
                            <Badge variant='outline'>否</Badge>
                          )}
                        </div>
                      </div>
                      {admin.role.description && (
                        <div className='col-span-2'>
                          <p className='text-sm text-muted-foreground'>描述</p>
                          <p className='mt-1 font-medium'>{admin.role.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* 权限摘要块 */}
              {admin.permissions && admin.permissions.length > 0 && (
                <>
                  <Separator />
                  <div className='space-y-4'>
                    <h3 className='text-lg font-semibold'>权限摘要</h3>
                    <div className='space-y-2'>
                      {admin.permissions.map((permission, index) => (
                        <div key={index} className='flex items-center gap-2'>
                          <Badge variant='outline'>{permission.code}</Badge>
                          <span className='text-sm text-muted-foreground'>
                            {permission.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* 快捷操作 */}
              <Separator />
              <div className='flex gap-2'>
                <Button variant='outline' onClick={() => onEdit(admin)}>
                  <Edit className='mr-2 h-4 w-4' />
                  编辑
                </Button>
                <Button variant='outline' onClick={() => onResetPassword(admin)}>
                  <Key className='mr-2 h-4 w-4' />
                  重置密码
                </Button>
                {!isCurrentUser && (
                  <Button variant='outline' onClick={() => onStatusChange(admin)}>
                    状态变更
                  </Button>
                )}
                <Button variant='outline' onClick={onRefresh}>
                  <RefreshCw className='mr-2 h-4 w-4' />
                  刷新
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

