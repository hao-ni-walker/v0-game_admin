'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  RefreshCw,
  Trash2,
  Eye,
  AlertCircle,
  Info,
  AlertTriangle,
  Bug,
  BarChart3
} from 'lucide-react';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { PERMISSIONS } from '@/lib/permissions';

// shadcn/ui components
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// 表格相关组件
import {
  SearchFilter,
  DataTable,
  Pagination,
  ActionDropdown,
  PageHeader,
  formatDateTime,
  hasActiveFilters as checkActiveFilters,
  type ActionItem,
  type FilterField
} from '@/components/custom-table';

import { LogDetailDialog } from './components/log-detail-dialog';
import PageContainer from '@/components/layout/page-container';
import { LogAPI } from '@/service/request';

// 类型定义
interface LogItem {
  id: number;
  level: string;
  action: string;
  module: string;
  message: string;
  details?: any;
  userId?: number;
  username?: string;
  userAgent?: string;
  ip?: string;
  requestId?: string;
  duration?: number;
  createdAt: string;
}

interface LogStats {
  overview: {
    total: number;
    today: number;
    week: number;
  };
  levelStats: Array<{
    level: string;
    count: number;
  }>;
  moduleStats: Array<{
    module: string;
    count: number;
  }>;
}

interface FilterParams {
  level?: string;
  module?: string;
  action?: string;
  search?: string;
  dateRange?: { from: Date; to: Date } | undefined;
  page?: number;
  limit?: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const levelColors = {
  info: 'bg-blue-100 text-blue-800',
  warn: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
  debug: 'bg-gray-100 text-gray-800'
};

const levelIcons = {
  info: Info,
  warn: AlertTriangle,
  error: AlertCircle,
  debug: Bug
};

export default function LogsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // 状态管理
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // 筛选状态
  const [filters, setFilters] = useState<FilterParams>({
    level: 'all',
    module: '',
    action: '',
    search: '',
    dateRange: undefined,
    page: 1,
    limit: 20
  });

  // 弹窗状态
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LogItem | null>(null);

  // 从URL初始化筛选条件
  useEffect(() => {
    const urlFilters: FilterParams = {
      level: searchParams.get('level') || 'all',
      module: searchParams.get('module') || '',
      action: searchParams.get('action') || '',
      search: searchParams.get('search') || '',
      dateRange: undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20')
    };
    setFilters(urlFilters);
  }, [searchParams]);

  // 获取日志列表
  const fetchLogs = useCallback(async (currentFilters: FilterParams) => {
    try {
      setLoading(true);

      const params: Record<string, any> = {};
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (key === 'dateRange' && value) {
          const dateRange = value as { from: Date; to: Date };
          if (dateRange.from && dateRange.to) {
            const startDateStr = dateRange.from.toISOString().split('T')[0];
            const endDateStr = dateRange.to.toISOString().split('T')[0];
            params.startDate = startDateStr;
            params.endDate = endDateStr;
          }
        } else if (
          value !== undefined &&
          value !== null &&
          value !== '' &&
          (key !== 'level' || value !== 'all')
        ) {
          params[key] = value;
        }
      });

      const res = await LogAPI.getLogs(params);
      if (res.code === 0) {
        setLogs(res.data || []);
      } else {
        toast.error(res.message || '获取日志列表失败');
      }

      if (res.pager) {
        setPagination({
          page: res.pager?.page || 1,
          limit: res.pager?.limit || 20,
          total: res.pager?.total || 0,
          totalPages: res.pager?.totalPages || 0
        });
      } else {
        // 如果API没有返回分页信息，手动计算
        const total = Array.isArray(res.data) ? res.data.length : 0;
        setPagination({
          page: 1,
          limit: total,
          total,
          totalPages: 1
        });
      }
    } catch (error) {
      toast.error('获取日志列表失败');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 更新URL和获取数据
  const updateFilters = useCallback(
    (newFilters: Partial<FilterParams>) => {
      const updatedFilters = { ...filters, ...newFilters };

      // 如果是筛选条件变化，重置到第一页
      if (
        Object.keys(newFilters).some((key) => !['page', 'limit'].includes(key))
      ) {
        updatedFilters.page = 1;
      }

      setFilters(updatedFilters);

      // 更新URL
      const params = new URLSearchParams();
      Object.entries(updatedFilters).forEach(([key, value]) => {
        if (key === 'dateRange') {
          return;
        }
        if (
          value !== undefined &&
          value !== null &&
          value !== '' &&
          (key !== 'level' || value !== 'all')
        ) {
          params.set(key, String(value));
        }
      });

      router.push(`?${params.toString()}`);

      // 获取数据
      fetchLogs(updatedFilters);
    },
    [filters, router, fetchLogs]
  );

  // 初始化
  useEffect(() => {
    fetchLogs(filters);
  }, [fetchLogs, filters]);

  const clearFilters = () => {
    updateFilters({
      level: 'all',
      module: '',
      action: '',
      search: '',
      dateRange: undefined,
      page: 1
    });
  };

  const hasActiveFilters = checkActiveFilters(filters);

  // 定义筛选字段
  const filterFields: FilterField[] = [
    {
      key: 'search',
      type: 'text',
      label: '搜索',
      placeholder: '搜索消息内容...',
      width: 'w-80'
    },
    {
      key: 'level',
      type: 'select',
      label: '级别',
      placeholder: '全部级别',
      options: [
        { label: '信息', value: 'info' },
        { label: '警告', value: 'warn' },
        { label: '错误', value: 'error' },
        { label: '调试', value: 'debug' }
      ],
      width: 'w-32'
    },
    {
      key: 'module',
      type: 'text',
      label: '模块',
      placeholder: '模块名称...',
      width: 'w-40'
    },
    {
      key: 'action',
      type: 'text',
      label: '操作',
      placeholder: '操作类型...',
      width: 'w-40'
    },
    {
      key: 'dateRange',
      type: 'dateRange',
      label: '时间范围',
      placeholder: '选择时间范围',
      width: 'w-60'
    }
  ];

  // 定义表格列
  const columns = [
    {
      key: 'id',
      title: 'ID',
      className: 'text-center w-[60px] font-mono text-sm text-muted-foreground'
    },
    {
      key: 'level',
      title: '级别',
      className: 'w-[80px]',
      render: (value: string) => {
        const LevelIcon = levelIcons[value as keyof typeof levelIcons] || Info;
        return (
          <div className='flex items-center gap-2'>
            <LevelIcon className='h-4 w-4' />
            <Badge className={levelColors[value as keyof typeof levelColors]}>
              {value.toUpperCase()}
            </Badge>
          </div>
        );
      }
    },
    {
      key: 'module',
      title: '模块',
      className: 'w-[100px] text-muted-foreground'
    },
    {
      key: 'action',
      title: '操作',
      className: 'w-[120px] font-medium'
    },
    {
      key: 'message',
      title: '消息',
      className: 'min-w-0 flex-1',
      render: (value: string) => (
        <div className='max-w-md truncate' title={value}>
          {value}
        </div>
      )
    },
    {
      key: 'username',
      title: '用户',
      className: 'w-[100px] text-muted-foreground',
      render: (value: string) => value || '-'
    },
    {
      key: 'duration',
      title: '耗时',
      className: 'w-[80px] text-center text-muted-foreground',
      render: (value: number) => (value ? `${value}ms` : '-')
    },
    {
      key: 'createdAt',
      title: '时间',
      className: 'w-[160px] text-muted-foreground',
      render: (value: string) => formatDateTime(value)
    },
    {
      key: 'actions',
      title: '操作',
      className: 'text-center w-[80px]',
      render: (value: any, record: LogItem) => {
        const actions: ActionItem[] = [
          {
            key: 'view',
            label: '查看详情',
            icon: <Eye className='mr-2 h-4 w-4' />,
            onClick: () => {
              setSelectedLog(record);
              setDetailDialogOpen(true);
            }
          }
        ];

        return <ActionDropdown actions={actions} />;
      }
    }
  ];

  return (
    <PermissionGuard permissions={PERMISSIONS.LOG.READ}>
      <PageContainer scrollable={false}>
        <div className='flex h-[calc(100vh-8rem)] w-full flex-col space-y-6'>
          {/* 页面头部 */}
          <PageHeader
            title='日志管理'
            description='查看和管理系统运行日志'
            action={{
              label: '刷新数据',
              onClick: () => {
                fetchLogs(filters);
              },
              icon: <RefreshCw className='mr-2 h-4 w-4' />
            }}
          />

          {/* 搜索和筛选 */}
          <div className='space-y-4'>
            <SearchFilter
              fields={filterFields}
              values={filters}
              onValuesChange={updateFilters}
              debounceDelay={500}
            />

            {/* 操作按钮 */}
            <div className='flex justify-end'></div>
          </div>

          {/* 数据表格 */}
          <div className='flex min-h-0 flex-1 flex-col'>
            <DataTable
              columns={columns}
              data={logs}
              loading={loading}
              emptyText='暂无日志数据'
              rowKey='id'
            />

            {/* 分页控件 */}
            <Pagination
              pagination={pagination}
              onPageChange={(page) => updateFilters({ page })}
              onPageSizeChange={(limit) => updateFilters({ limit, page: 1 })}
              pageSizeOptions={[20, 50, 100, 200]}
            />
          </div>

          {/* 日志详情弹窗 */}
          <LogDetailDialog
            log={selectedLog}
            open={detailDialogOpen}
            onOpenChange={setDetailDialogOpen}
          />
        </div>
      </PageContainer>
    </PermissionGuard>
  );
}
