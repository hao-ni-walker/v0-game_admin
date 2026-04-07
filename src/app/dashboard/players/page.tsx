'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/shared/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Pagination } from '@/components/table/pagination';
import { PlayerAPI } from '@/service/api/player';

// 简化的用户类型，适配 bot_1.users 表结构
interface TelegramUser {
  id: number;
  telegram_id: number;
  username: string;
  first_name: string;
  last_name: string;
  display_name: string;
  created_at: string;
}

interface PaginationInfo {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

/**
 * 玩家管理页面 - 简化版（只读）
 */
export default function PlayersPage() {
  const [users, setUsers] = useState<TelegramUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    page_size: 20,
    total: 0,
    total_pages: 0
  });
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // 获取用户列表
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await PlayerAPI.getPlayers({
        page: pagination.page,
        page_size: pagination.page_size,
        keyword: keyword || undefined
      });

      if (response.code === 0) {
        // API 直接返回数组作为 data
        const users = Array.isArray(response.data) ? response.data : (response.data?.list || []);
        setUsers(users);

        if (response.pager) {
          setPagination({
            page: response.pager.page,
            page_size: response.pager.page_size,
            total: response.pager.total,
            total_pages: response.pager.total_pages
          });
        } else if (response.data?.total !== undefined) {
          // 备用: 如果 pager 不存在,从 data 中获取分页信息
          setPagination({
            page: response.data.page || 1,
            page_size: response.data.page_size || 20,
            total: response.data.total || 0,
            total_pages: Math.ceil((response.data.total || 0) / (response.data.page_size || 20))
          });
        }
      }
    } catch (error) {
      console.error('获取用户列表失败:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.page_size, keyword]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // 搜索
  const handleSearch = () => {
    setKeyword(searchInput);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // 刷新
  const handleRefresh = () => {
    fetchUsers();
  };

  // 分页
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setPagination(prev => ({ ...prev, page_size: pageSize, page: 1 }));
  };

  // 格式化时间
  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <PageContainer>
      <div className='flex w-full flex-1 flex-col space-y-4'>
        {/* 页面头部 */}
        <div className='flex items-center justify-between'>
          <Heading title='用户管理' description='查看 Telegram Bot 用户列表' />
          <Button variant='outline' onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
        </div>

        {/* 搜索栏 */}
        <div className='flex items-center gap-2'>
          <div className='relative flex-1 max-w-md'>
            <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
            <Input
              placeholder='搜索用户名、姓名或 Telegram ID...'
              className='pl-9'
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
          </div>
          <Button onClick={handleSearch} disabled={loading}>
            <Search className='mr-2 h-4 w-4' />
            搜索
          </Button>
          {keyword && (
            <Button 
              variant='ghost' 
              onClick={() => {
                setKeyword('');
                setSearchInput('');
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
            >
              清空
            </Button>
          )}
        </div>

        {/* 用户列表表格 */}
        <Card className='flex-1 overflow-auto'>
          {loading && users.length === 0 ? (
            <div className='space-y-3 p-4'>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className='h-12 w-full' />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Telegram ID</TableHead>
                  <TableHead>用户名</TableHead>
                  <TableHead>名字</TableHead>
                  <TableHead>姓氏</TableHead>
                  <TableHead>显示名称</TableHead>
                  <TableHead>注册时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className='text-muted-foreground text-center py-8'>
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className='font-medium'>{user.id}</TableCell>
                      <TableCell className='font-mono text-sm'>{user.telegram_id}</TableCell>
                      <TableCell>{user.username || '-'}</TableCell>
                      <TableCell>{user.first_name || '-'}</TableCell>
                      <TableCell>{user.last_name || '-'}</TableCell>
                      <TableCell>{user.display_name || '-'}</TableCell>
                      <TableCell className='text-sm text-muted-foreground'>
                        {formatDateTime(user.created_at)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
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
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={[10, 20, 50, 100]}
          />
        )}
      </div>
    </PageContainer>
  );
}
