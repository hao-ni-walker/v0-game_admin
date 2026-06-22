'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import PageContainer from '@/components/layout/page-container';
import { PageHeader } from '@/components/table/page-header';
import { Ban, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiRequest } from '@/service/api/base';
import { toast } from 'sonner';

const PAGE_SIZE = 20;

interface BlacklistRecord {
  id: string;
  userId: string;
  telegramId?: string;
  displayName?: string;
  reason: string;
  addedBy: string;
  addedAt: number;
  status: 'active' | 'removed';
}

interface BlacklistResult {
  items: BlacklistRecord[];
  pagination: { page: number; size: number; total: number };
}

function fmtTs(ts: number): string {
  if (!ts) return '—';
  return new Date(ts * 1000).toLocaleString();
}

export default function BlacklistPage() {
  const [records, setRecords] = useState<BlacklistRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [composeOpen, setComposeOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ userId: '', reason: '' });

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiRequest<BlacklistResult>(`/admin/users/blacklist?page=${page}&size=${PAGE_SIZE}`);
      if (res.success && res.data) {
        setRecords(res.data.items ?? []);
        setTotal(res.data.pagination?.total ?? 0);
      } else {
        toast.error(res.message || '获取黑名单失败');
      }
    } catch {
      toast.error('获取黑名单失败');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleSubmit = useCallback(async () => {
    if (!form.userId.trim()) {
      toast.error('请输入用户 ID');
      return;
    }
    if (form.reason.trim().length < 10) {
      toast.error('原因至少 10 个字符');
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiRequest(`/admin/users/${form.userId.trim()}/blacklist`, {
        method: 'POST',
        body: JSON.stringify({ reason: form.reason.trim() }),
      });
      if (res.success) {
        toast.success('已加入黑名单');
        setComposeOpen(false);
        setForm({ userId: '', reason: '' });
        setPage(1);
        refresh();
      } else {
        toast.error(res.message || '加入黑名单失败');
      }
    } catch {
      toast.error('加入黑名单失败');
    } finally {
      setSubmitting(false);
    }
  }, [form, refresh]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <PageContainer>
      <PageHeader
        title='黑名单管理'
        description='管理被永久禁止的用户账户（立即生效，无需双人复核）'
        action={{
          label: '加入黑名单',
          onClick: () => setComposeOpen(true),
          icon: <Ban className='mr-2 h-4 w-4' />
        }}
      />

      <div className='mb-4 flex items-center gap-3'>
        <Button variant='outline' onClick={refresh} disabled={loading}>
          {loading ? '查询中...' : '刷新'}
        </Button>
        <span className='text-muted-foreground text-sm'>共 {total} 条</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>黑名单列表</CardTitle>
          <CardDescription>
            加入黑名单后用户立即被禁用：禁止下单、充值、提现
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>用户 ID</TableHead>
                <TableHead>Telegram ID</TableHead>
                <TableHead>昵称</TableHead>
                <TableHead>加入原因</TableHead>
                <TableHead>操作人</TableHead>
                <TableHead>加入时间</TableHead>
                <TableHead>状态</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className='text-muted-foreground h-32 text-center'
                  >
                    {loading ? '加载中...' : '暂无黑名单记录'}
                  </TableCell>
                </TableRow>
              ) : (
                records.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className='font-mono text-xs'>{r.userId}</TableCell>
                    <TableCell className='font-mono text-xs'>{r.telegramId || '—'}</TableCell>
                    <TableCell>{r.displayName || '—'}</TableCell>
                    <TableCell className='max-w-xs truncate' title={r.reason}>
                      {r.reason || '—'}
                    </TableCell>
                    <TableCell>{r.addedBy || '—'}</TableCell>
                    <TableCell className='text-xs'>{fmtTs(r.addedAt)}</TableCell>
                    <TableCell>
                      <Badge variant='outline' className='bg-red-50 text-red-700'>
                        已禁用
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {total > PAGE_SIZE && (
            <div className='mt-4 flex items-center justify-end gap-2'>
              <Button
                variant='outline'
                size='sm'
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className='h-4 w-4' />
              </Button>
              <span className='text-muted-foreground text-sm'>
                {page} / {totalPages}
              </span>
              <Button
                variant='outline'
                size='sm'
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>加入黑名单</DialogTitle>
            <DialogDescription>
              操作立即生效，用户将被禁止下单、充值、提现。操作记录写入审计日志。
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-2'>
            <div className='space-y-2'>
              <Label htmlFor='bl-user-id'>用户 ID</Label>
              <Input
                id='bl-user-id'
                placeholder='输入用户 ID'
                value={form.userId}
                onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='bl-reason'>原因</Label>
              <Input
                id='bl-reason'
                placeholder='至少 10 个字符'
                value={form.reason}
                onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setComposeOpen(false)} disabled={submitting}>
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? '提交中...' : '确认加入'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
