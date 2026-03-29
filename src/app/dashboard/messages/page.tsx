'use client';

import { useState, useEffect, useCallback } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
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
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Pencil, Trash2, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: number;
  title: string | null;
  content: string;
  image_url: string | null;
  button_text: string | null;
  button_url: string | null;
  scheduled_at: string | null;
  status: string;
  created_at: string;
  sent_at: string | null;
}

interface Pager {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: '草稿', variant: 'secondary' },
  pending: { label: '待发送', variant: 'outline' },
  scheduled: { label: '已排期', variant: 'outline' },
  sending: { label: '发送中', variant: 'default' },
  sent: { label: '已发送', variant: 'default' },
  failed: { label: '发送失败', variant: 'destructive' }
};

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [pager, setPager] = useState<Pager>({ page: 1, page_size: 20, total: 0, total_pages: 0 });
  
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image_url: '',
    button_text: '',
    button_url: '',
    scheduled_at: '',
    status: 'draft'
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchMessages = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: '20'
      });
      if (keyword) params.append('keyword', keyword);
      if (statusFilter) params.append('status', statusFilter);

      const res = await fetch(`/api/admin/messages?${params}`);
      const data = await res.json();
      
      if (data.code === 0) {
        setMessages(data.data || []);
        setPager(data.pager || { page: 1, page_size: 20, total: 0, total_pages: 0 });
      } else {
        toast.error(data.message || '获取消息列表失败');
      }
    } catch (error) {
      toast.error('获取消息列表失败');
    } finally {
      setLoading(false);
    }
  }, [keyword, statusFilter]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleSearch = () => {
    fetchMessages(1);
  };

  const handleReset = () => {
    setKeyword('');
    setStatusFilter('');
    setTimeout(() => fetchMessages(1), 0);
  };

  const openCreateDialog = () => {
    setEditingMessage(null);
    setFormData({
      title: '',
      content: '',
      image_url: '',
      button_text: '',
      button_url: '',
      scheduled_at: '',
      status: 'draft'
    });
    setDialogOpen(true);
  };

  const openEditDialog = (message: Message) => {
    setEditingMessage(message);
    setFormData({
      title: message.title || '',
      content: message.content,
      image_url: message.image_url || '',
      button_text: message.button_text || '',
      button_url: message.button_url || '',
      scheduled_at: message.scheduled_at ? message.scheduled_at.slice(0, 16) : '',
      status: message.status
    });
    setDialogOpen(true);
  };

  const openDeleteDialog = (id: number) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.content.trim()) {
      toast.error('消息内容不能为空');
      return;
    }

    setSubmitting(true);
    try {
      const method = editingMessage ? 'PUT' : 'POST';
      const body = editingMessage 
        ? { ...formData, id: editingMessage.id }
        : formData;

      const res = await fetch('/api/admin/messages', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (data.code === 0) {
        toast.success(editingMessage ? '更新成功' : '创建成功');
        setDialogOpen(false);
        fetchMessages(pager.page);
      } else {
        toast.error(data.message || '操作失败');
      }
    } catch (error) {
      toast.error('操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      const res = await fetch(`/api/admin/messages?id=${deletingId}`, {
        method: 'DELETE'
      });
      const data = await res.json();

      if (data.code === 0) {
        toast.success('删除成功');
        setDeleteDialogOpen(false);
        fetchMessages(pager.page);
      } else {
        toast.error(data.message || '删除失败');
      }
    } catch (error) {
      toast.error('删除失败');
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">消息管理</h1>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          新建消息
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>搜索筛选</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="搜索标题或内容..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="状态筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="draft">草稿</SelectItem>
                <SelectItem value="pending">待发送</SelectItem>
                <SelectItem value="scheduled">已排期</SelectItem>
                <SelectItem value="sending">发送中</SelectItem>
                <SelectItem value="sent">已发送</SelectItem>
                <SelectItem value="failed">发送失败</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" />
              搜索
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="mr-2 h-4 w-4" />
              重置
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">ID</TableHead>
                <TableHead className="w-[150px]">标题</TableHead>
                <TableHead className="min-w-[200px]">内容</TableHead>
                <TableHead className="w-[100px]">状态</TableHead>
                <TableHead className="w-[160px]">排期时间</TableHead>
                <TableHead className="w-[160px]">创建时间</TableHead>
                <TableHead className="w-[160px]">发送时间</TableHead>
                <TableHead className="w-[120px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : messages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                messages.map((msg) => (
                  <TableRow key={msg.id}>
                    <TableCell>{msg.id}</TableCell>
                    <TableCell className="font-medium">{msg.title || '-'}</TableCell>
                    <TableCell>
                      <div className="max-w-[300px] truncate" title={msg.content}>
                        {msg.content}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_MAP[msg.status]?.variant || 'secondary'}>
                        {STATUS_MAP[msg.status]?.label || msg.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(msg.scheduled_at)}</TableCell>
                    <TableCell>{formatDate(msg.created_at)}</TableCell>
                    <TableCell>{formatDate(msg.sent_at)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(msg)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(msg.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
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

      {pager.total_pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            共 {pager.total} 条记录
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchMessages(pager.page - 1)}
              disabled={pager.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              上一页
            </Button>
            <span className="text-sm">
              {pager.page} / {pager.total_pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchMessages(pager.page + 1)}
              disabled={pager.page >= pager.total_pages}
            >
              下一页
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* 新建/编辑对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingMessage ? '编辑消息' : '新建消息'}</DialogTitle>
            <DialogDescription>
              {editingMessage ? '修改消息内容' : '创建一条新消息'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">标题</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="消息标题（可选）"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">内容 *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="消息内容"
                rows={4}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image_url">图片 URL</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="图片链接（可选）"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="button_text">按钮文字</Label>
                <Input
                  id="button_text"
                  value={formData.button_text}
                  onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                  placeholder="按钮文字（可选）"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="button_url">按钮链接</Label>
                <Input
                  id="button_url"
                  value={formData.button_url}
                  onChange={(e) => setFormData({ ...formData, button_url: e.target.value })}
                  placeholder="按钮链接（可选）"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="scheduled_at">排期时间</Label>
                <Input
                  id="scheduled_at"
                  type="datetime-local"
                  value={formData.scheduled_at}
                  onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">状态</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">草稿</SelectItem>
                    <SelectItem value="pending">立即发送</SelectItem>
                    <SelectItem value="scheduled">已排期</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? '提交中...' : '确定'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除这条消息吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>确定删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
