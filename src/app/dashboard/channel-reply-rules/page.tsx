'use client';

import { useCallback, useEffect, useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

type ReplyRule = {
  id: number;
  name: string | null;
  keywords: string;
  match_mode: string;
  reply_text: string;
  priority: number;
  is_enabled: boolean;
  created_at?: string;
  updated_at?: string;
};

const emptyForm = () => ({
  name: '',
  keywords: '',
  match_mode: 'contains' as 'contains' | 'equals',
  reply_text: '',
  priority: 0,
  is_enabled: true
});

export default function ChannelReplyRulesPage() {
  const [rules, setRules] = useState<ReplyRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<ReplyRule | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/channel-reply-rules');
      const data = await res.json();
      if (data.code === 0) {
        setRules(Array.isArray(data.data) ? data.data : []);
      } else {
        toast.error(data.message || '获取规则失败');
      }
    } catch {
      toast.error('获取规则失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (r: ReplyRule) => {
    setEditing(r);
    setForm({
      name: r.name || '',
      keywords: r.keywords,
      match_mode: r.match_mode === 'equals' ? 'equals' : 'contains',
      reply_text: r.reply_text,
      priority: Number.isFinite(Number(r.priority)) ? Number(r.priority) : 0,
      is_enabled: Boolean(r.is_enabled)
    });
    setDialogOpen(true);
  };

  const submit = async () => {
    if (!form.keywords.trim()) {
      toast.error('请填写关键词');
      return;
    }
    if (!form.reply_text.trim()) {
      toast.error('请填写回复内容');
      return;
    }
    setSubmitting(true);
    try {
      const body = editing
        ? { id: editing.id, ...form }
        : { ...form };
      const res = await fetch('/api/admin/channel-reply-rules', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.code === 0) {
        toast.success(editing ? '已更新' : '已创建');
        setDialogOpen(false);
        fetchRules();
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
      const res = await fetch(`/api/admin/channel-reply-rules?id=${deletingId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.code === 0) {
        toast.success('已删除');
        setDeleteOpen(false);
        fetchRules();
      } else {
        toast.error(data.message || '删除失败');
      }
    } catch {
      toast.error('删除失败');
    }
  };

  const formatDate = (s?: string) => (s ? new Date(s).toLocaleString('zh-CN') : '-');

  return (
    <PageContainer scrollable>
      <div className='space-y-6 p-4 md:p-6'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div>
            <h1 className='text-2xl font-bold'>规则配置</h1>
            <p className='text-muted-foreground mt-1 text-sm'>
              配置用户对话中的关键词与自动回复文案；机器人通过接口匹配后回复用户。
            </p>
          </div>
          <div className='flex gap-2'>
            <Button variant='outline' onClick={fetchRules} disabled={loading}>
              <RefreshCw className='mr-2 h-4 w-4' />
              刷新
            </Button>
            <Button onClick={openCreate}>
              <Plus className='mr-2 h-4 w-4' />
              新建规则
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>对接说明</CardTitle>
            <p className='text-muted-foreground text-sm font-normal'>
              POST{' '}
              <code className='bg-muted rounded px-1 py-0.5 text-xs'>
                /api/bot/channel-reply-rules/match
              </code>
              ，请求体{' '}
              <code className='bg-muted rounded px-1 py-0.5 text-xs'>{`{ "text": "用户原文" }`}</code>
              。生产环境请配置环境变量{' '}
              <code className='bg-muted rounded px-1 py-0.5 text-xs'>CHANNEL_REPLY_RULES_BOT_SECRET</code>
              ，并携带{' '}
              <code className='bg-muted rounded px-1 py-0.5 text-xs'>Authorization: Bearer …</code>
              或{' '}
              <code className='bg-muted rounded px-1 py-0.5 text-xs'>x-bot-secret</code>
              。
            </p>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>关键词规则</CardTitle>
            <p className='text-muted-foreground text-sm font-normal'>
              多个关键词用英文或中文逗号分隔；「包含」指消息中出现任一关键词即命中，「完全相等」指整段消息与某一关键词一致（忽略首尾空格，大小写不敏感）。优先级数字越大越先匹配。
            </p>
          </CardHeader>
          <CardContent className='p-0'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-[56px]'>ID</TableHead>
                  <TableHead className='w-[120px]'>名称</TableHead>
                  <TableHead>关键词</TableHead>
                  <TableHead className='w-[100px]'>匹配</TableHead>
                  <TableHead className='min-w-[200px]'>回复内容</TableHead>
                  <TableHead className='w-[72px]'>优先级</TableHead>
                  <TableHead className='w-[80px]'>启用</TableHead>
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
                ) : rules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className='py-10 text-center text-muted-foreground'>
                      暂无规则，请先执行库表脚本{' '}
                      <code className='bg-muted rounded px-1 text-xs'>scripts/sql/channel_reply_rules.sql</code>
                    </TableCell>
                  </TableRow>
                ) : (
                  rules.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.id}</TableCell>
                      <TableCell className='max-w-[120px] truncate'>{r.name || '—'}</TableCell>
                      <TableCell className='max-w-[220px] truncate font-mono text-xs' title={r.keywords}>
                        {r.keywords}
                      </TableCell>
                      <TableCell>
                        <Badge variant='outline'>{r.match_mode === 'equals' ? '完全相等' : '包含'}</Badge>
                      </TableCell>
                      <TableCell className='max-w-[280px] truncate text-sm' title={r.reply_text}>
                        {r.reply_text}
                      </TableCell>
                      <TableCell>{r.priority}</TableCell>
                      <TableCell>
                        {r.is_enabled ? (
                          <Badge>开</Badge>
                        ) : (
                          <Badge variant='secondary'>关</Badge>
                        )}
                      </TableCell>
                      <TableCell className='text-muted-foreground text-xs'>{formatDate(r.updated_at)}</TableCell>
                      <TableCell>
                        <div className='flex gap-1'>
                          <Button size='sm' variant='outline' onClick={() => openEdit(r)}>
                            <Pencil className='h-3 w-3' />
                          </Button>
                          <Button
                            size='sm'
                            variant='destructive'
                            onClick={() => {
                              setDeletingId(r.id);
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
            <DialogTitle>{editing ? '编辑规则' : '新建规则'}</DialogTitle>
            <DialogDescription>保存后立即对机器人匹配接口生效。</DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-2'>
            <div className='grid gap-2'>
              <Label htmlFor='rule-name'>名称（选填）</Label>
              <Input
                id='rule-name'
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder='便于后台识别'
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='rule-kw'>关键词</Label>
              <Textarea
                id='rule-kw'
                value={form.keywords}
                onChange={(e) => setForm((f) => ({ ...f, keywords: e.target.value }))}
                placeholder='例：你好,hello,客服'
                rows={2}
              />
            </div>
            <div className='grid gap-2'>
              <Label>匹配方式</Label>
              <Select
                value={form.match_mode}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, match_mode: v as 'contains' | 'equals' }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='contains'>包含任一关键词</SelectItem>
                  <SelectItem value='equals'>与某一关键词完全相等</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='rule-reply'>回复内容</Label>
              <Textarea
                id='rule-reply'
                value={form.reply_text}
                onChange={(e) => setForm((f) => ({ ...f, reply_text: e.target.value }))}
                placeholder='机器人将发送给用户的文本'
                rows={4}
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='rule-prio'>优先级</Label>
              <Input
                id='rule-prio'
                type='number'
                value={form.priority}
                onChange={(e) =>
                  setForm((f) => ({ ...f, priority: parseInt(e.target.value, 10) || 0 }))
                }
              />
            </div>
            <div className='flex items-center gap-2'>
              <Switch
                id='rule-on'
                checked={form.is_enabled}
                onCheckedChange={(v) => setForm((f) => ({ ...f, is_enabled: v }))}
              />
              <Label htmlFor='rule-on'>启用</Label>
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
            <AlertDialogTitle>删除规则？</AlertDialogTitle>
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
