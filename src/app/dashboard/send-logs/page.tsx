'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, RefreshCw, ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { apiRequest } from '@/service/api/base';

interface SendLog {
  id: number;
  message_id: number;
  telegram_id: number;
  status: string;
  error_message: string;
  retry_count: number;
  sent_at: string;
}

interface Pager {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

// 状态颜色映射
const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  'pending': { label: '待发送', variant: 'secondary' },
  'sent': { label: '已发送', variant: 'default' },
  'delivered': { label: '已送达', variant: 'default' },
  'failed': { label: '失败', variant: 'destructive' },
  'FAILED': { label: '失败', variant: 'destructive' },
  'retry': { label: '重试中', variant: 'outline' },
  'SUCCESS': { label: '成功', variant: 'default' },
  'COMPLETED': { label: '已完成', variant: 'default' },
};

export default function SendLogsPage() {
  const [logs, setLogs] = useState<SendLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  const [pager, setPager] = useState<Pager>({
    page: 1,
    page_size: 20,
    total: 0,
    total_pages: 0,
  });

  const fetchLogs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        page_size: String(pager.page_size),
      });

      if (keyword) params.append('keyword', keyword);
      if (status && status !== 'all') params.append('status', status);

      const response = await apiRequest<SendLog[]>(`/admin/send-logs?${params.toString()}`);

      if (response.code === 0) {
        setLogs(response.data || []);
        if (response.pager) {
          setPager(response.pager);
        }
      }
    } catch (error) {
      console.error('获取发送日志失败:', error);
    } finally {
      setLoading(false);
    }
  }, [keyword, status, pager.page_size]);

  useEffect(() => {
    fetchLogs(1);
  }, []);

  const handleSearch = () => {
    fetchLogs(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleReset = () => {
    setKeyword('');
    setStatus('');
    fetchLogs(1);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getStatusBadge = (logStatus: string) => {
    const config = statusConfig[logStatus] || { label: logStatus, variant: 'secondary' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            发送日志
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* 搜索栏 */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="搜索 Telegram ID、消息 ID 或错误信息..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full"
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="状态筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="pending">待发送</SelectItem>
                <SelectItem value="sent">已发送</SelectItem>
                <SelectItem value="delivered">已送达</SelectItem>
                <SelectItem value="failed">失败</SelectItem>
                <SelectItem value="retry">重试中</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              搜索
            </Button>
            <Button variant="outline" onClick={handleReset} disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              重置
            </Button>
          </div>

          {/* 表格 */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead className="w-[100px]">消息 ID</TableHead>
                  <TableHead className="w-[150px]">Telegram ID</TableHead>
                  <TableHead className="w-[100px]">状态</TableHead>
                  <TableHead className="w-[80px]">重试次数</TableHead>
                  <TableHead>错误信息</TableHead>
                  <TableHead className="w-[180px]">发送时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        加载中...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono">{log.id}</TableCell>
                      <TableCell className="font-mono">{log.message_id}</TableCell>
                      <TableCell className="font-mono">{log.telegram_id}</TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell>{log.retry_count}</TableCell>
                      <TableCell className="max-w-[300px] truncate text-muted-foreground" title={log.error_message}>
                        {log.error_message || '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(log.sent_at)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* 分页 */}
          {pager.total > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                共 {pager.total} 条记录，第 {pager.page} / {pager.total_pages} 页
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchLogs(pager.page - 1)}
                  disabled={pager.page <= 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  上一页
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchLogs(pager.page + 1)}
                  disabled={pager.page >= pager.total_pages || loading}
                >
                  下一页
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
