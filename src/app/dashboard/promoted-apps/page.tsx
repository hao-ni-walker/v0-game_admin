'use client';

import { useCallback, useEffect, useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2, RefreshCw, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

type PromotedApp = {
  id: number;
  name: string | null;
  image_url: string;
  target_url: string;
  page_ranking: number;
  page_key: string | null;
  is_enabled: boolean;
  created_at?: string;
  updated_at?: string;
};

const emptyForm = () => ({
  name: '',
  image_url: '',
  target_url: '',
  page_ranking: 0,
  page_key: '',
  is_enabled: true
});

function truncateUrl(s: string, max = 36) {
  if (s.length <= max) return s;
  return `${s.slice(0, max)}…`;
}

export default function PromotedAppsPage() {
  const [items, setItems] = useState<PromotedApp[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<PromotedApp | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/channel-promoted-apps');
      const data = await res.json();
      if (data.code === 0) {
        setItems(Array.isArray(data.data) ? data.data : []);
      } else {
        toast.error(data.message || '获取列表失败');
      }
    } catch {
      toast.error('获取列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (row: PromotedApp) => {
    setEditing(row);
    setForm({
      name: row.name || '',
      image_url: row.image_url,
      target_url: row.target_url,
      page_ranking: Number.isFinite(Number(row.page_ranking)) ? Number(row.page_ranking) : 0,
      page_key: row.page_key || '',
      is_enabled: Boolean(row.is_enabled)
    });
    setDialogOpen(true);
  };

  const submit = async () => {
    if (!form.image_url.trim()) {
      toast.error('请填写图片 URL');
      return;
    }
    if (!form.target_url.trim()) {
      toast.error('请填写推广链接');
      return;
    }
    setSubmitting(true);
    try {
      const body = editing ? { id: editing.id, ...form } : { ...form };
      const res = await fetch('/api/admin/channel-promoted-apps', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.code === 0) {
        toast.success(editing ? '已更新' : '已创建');
        setDialogOpen(false);
        fetchItems();
      } else {
        toast.error(data.message || '保存失败');
      }
    } catch {
      toast.error('保存失败');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (deletingId == null) return;
    try {
      const res = await fetch(`/api/admin/channel-promoted-apps?id=${deletingId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.code === 0) {
        toast.success('已删除');
        setDeleteOpen(false);
        fetchItems();
      } else {
        toast.error(data.message || '删除失败');
      }
    } catch {
      toast.error('删除失败');
    }
  };

  const toggleEnabled = async (row: PromotedApp, enabled: boolean) => {
    setTogglingId(row.id);
    try {
      const res = await fetch('/api/admin/channel-promoted-apps', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: row.id,
          name: row.name,
          image_url: row.image_url,
          target_url: row.target_url,
          page_ranking: row.page_ranking,
          page_key: row.page_key,
          is_enabled: enabled
        })
      });
      const data = await res.json();
      if (data.code === 0) {
        toast.success(enabled ? '已启用' : '已停用');
        fetchItems();
      } else {
        toast.error(data.message || '更新失败');
      }
    } catch {
      toast.error('更新失败');
    } finally {
      setTogglingId(null);
    }
  };

  const formatDate = (s?: string) => (s ? new Date(s).toLocaleString('zh-CN') : '-');

  return (
    <PageContainer scrollable>
      <div className='space-y-6 p-4 md:p-6'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div>
            <h1 className='text-2xl font-bold'>推广 App</h1>
            <p className='text-muted-foreground mt-1 text-sm'>
              维护频道侧展示的推广应用：图标、跳转链接与排序。图片可先通过「存储管理」上传后粘贴 URL。
            </p>
          </div>
          <div className='flex gap-2'>
            <Button variant='outline' onClick={fetchItems} disabled={loading}>
              <RefreshCw className='mr-2 h-4 w-4' />
              刷新
            </Button>
            <Button onClick={openCreate}>
              <Plus className='mr-2 h-4 w-4' />
              新建
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>排序说明</CardTitle>
            <p className='text-muted-foreground text-sm font-normal'>
              「页面排序」数值越大越靠前。可选「页面标识」用于区分不同展示位；留空表示不区分。
            </p>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>推广列表</CardTitle>
          </CardHeader>
          <CardContent className='p-0'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-[56px]'>ID</TableHead>
                  <TableHead className='w-[56px]' />
                  <TableHead className='min-w-[120px]'>名称</TableHead>
                  <TableHead className='min-w-[200px]'>推广链接</TableHead>
                  <TableHead className='w-[88px]'>排序</TableHead>
                  <TableHead className='w-[120px]'>页面标识</TableHead>
                  <TableHead className='w-[88px]'>启用</TableHead>
                  <TableHead className='w-[160px]'>更新</TableHead>
                  <TableHead className='w-[140px]'>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className='py-10 text-center text-muted-foreground'>
                      加载中…
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className='py-10 text-center text-muted-foreground'>
                      暂无数据。请先在数据库执行{' '}
                      <code className='bg-muted rounded px-1 text-xs'>
                        scripts/sql/channel_promoted_apps.sql
                      </code>
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.id}</TableCell>
                      <TableCell>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={row.image_url}
                          alt=''
                          className='h-10 w-10 rounded-md border object-cover'
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.visibility = 'hidden';
                          }}
                        />
                      </TableCell>
                      <TableCell className='max-w-[160px] truncate font-medium'>
                        {row.name || '—'}
                      </TableCell>
                      <TableCell>
                        <div className='flex max-w-[280px] items-center gap-1'>
                          <a
                            href={row.target_url}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-primary truncate text-sm underline-offset-4 hover:underline'
                            title={row.target_url}
                          >
                            {truncateUrl(row.target_url)}
                          </a>
                          <a
                            href={row.target_url}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-muted-foreground shrink-0 hover:text-foreground'
                            aria-label='打开链接'
                          >
                            <ExternalLink className='h-3.5 w-3.5' />
                          </a>
                        </div>
                      </TableCell>
                      <TableCell>{row.page_ranking}</TableCell>
                      <TableCell className='max-w-[120px] truncate font-mono text-xs'>
                        {row.page_key || '—'}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={Boolean(row.is_enabled)}
                          disabled={togglingId === row.id}
                          onCheckedChange={(v) => toggleEnabled(row, v)}
                        />
                      </TableCell>
                      <TableCell className='text-muted-foreground text-xs'>
                        {formatDate(row.updated_at)}
                      </TableCell>
                      <TableCell>
                        <div className='flex gap-1'>
                          <Button size='sm' variant='outline' onClick={() => openEdit(row)}>
                            <Pencil className='h-3 w-3' />
                          </Button>
                          <Button
                            size='sm'
                            variant='destructive'
                            onClick={() => {
                              setDeletingId(row.id);
                              setDeleteOpen(true);
                            }}
                          >
                            <Trash2 className='h-3 w-3' />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>{editing ? '编辑推广 App' : '新建推广 App'}</DialogTitle>
            <DialogDescription>保存后立即写入数据库。</DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-2'>
            <div className='grid gap-2'>
              <Label htmlFor='app-name'>名称（选填）</Label>
              <Input
                id='app-name'
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder='便于后台识别'
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='app-image'>图片 URL</Label>
              <Input
                id='app-image'
                value={form.image_url}
                onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                placeholder='https://…'
              />
              {form.image_url.trim() ? (
                <div className='flex items-center gap-2'>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.image_url}
                    alt='预览'
                    className='h-16 w-16 rounded-md border object-cover'
                  />
                  <span className='text-muted-foreground text-xs'>预览</span>
                </div>
              ) : null}
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='app-target'>推广链接</Label>
              <Input
                id='app-target'
                value={form.target_url}
                onChange={(e) => setForm((f) => ({ ...f, target_url: e.target.value }))}
                placeholder='https://…'
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='app-rank'>页面排序</Label>
              <Input
                id='app-rank'
                type='number'
                value={form.page_ranking}
                onChange={(e) =>
                  setForm((f) => ({ ...f, page_ranking: parseInt(e.target.value, 10) || 0 }))
                }
              />
              <p className='text-muted-foreground text-xs'>数值越大越靠前</p>
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='app-page-key'>页面标识（选填）</Label>
              <Input
                id='app-page-key'
                value={form.page_key}
                onChange={(e) => setForm((f) => ({ ...f, page_key: e.target.value }))}
                placeholder='如 default、channel_home'
              />
            </div>
            <div className='flex items-center gap-2'>
              <Switch
                id='app-on'
                checked={form.is_enabled}
                onCheckedChange={(v) => setForm((f) => ({ ...f, is_enabled: v }))}
              />
              <Label htmlFor='app-on'>启用</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={submit} disabled={submitting}>
              {submitting ? '保存中…' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除该推广 App？</AlertDialogTitle>
            <AlertDialogDescription>删除后无法恢复。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
