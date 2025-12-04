'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Edit2, Save, X as XIcon } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { TicketAPI } from '@/service/api/ticket';
import { TicketCommentList } from './ticket-comment-list';
import { TicketAttachmentList } from './ticket-attachment-list';
import { TicketEventTimeline } from './ticket-event-timeline';
import { toast } from 'sonner';
import { formatDistanceToNow, format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { Ticket, TicketStatus, TicketPriority } from '@/repository/models';

interface TicketDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketId: number | null;
  onTicketUpdate?: () => void;
}

const STATUS_OPTIONS: { value: TicketStatus; label: string }[] = [
  { value: 'open', label: '待处理' },
  { value: 'in_progress', label: '处理中' },
  { value: 'pending', label: '挂起' },
  { value: 'resolved', label: '已解决' },
  { value: 'closed', label: '已关闭' },
  { value: 'canceled', label: '已取消' }
];

const PRIORITY_OPTIONS: { value: TicketPriority; label: string }[] = [
  { value: 'low', label: '低' },
  { value: 'normal', label: '普通' },
  { value: 'high', label: '高' },
  { value: 'urgent', label: '紧急' }
];

const CATEGORY_OPTIONS = [
  { value: 'payment', label: '支付问题' },
  { value: 'account', label: '账户问题' },
  { value: 'game', label: '游戏问题' },
  { value: 'technical', label: '技术问题' },
  { value: 'other', label: '其他' }
];

export function TicketDetailDrawer({
  open,
  onOpenChange,
  ticketId,
  onTicketUpdate
}: TicketDetailDrawerProps) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // 编辑表单状态
  const [editForm, setEditForm] = useState({
    status: 'open' as TicketStatus,
    priority: 'normal' as TicketPriority,
    category: '',
    assigneeId: '',
    dueAt: '',
    tags: [] as string[]
  });

  // 获取工单详情
  const fetchTicket = async () => {
    if (!ticketId) return;

    setLoading(true);
    try {
      const response = await TicketAPI.getTicket(ticketId);
      if (response.success && response.data) {
        const ticketData = response.data as Ticket;
        setTicket(ticketData);
        setEditForm({
          status: ticketData.status,
          priority: ticketData.priority,
          category: ticketData.category,
          assigneeId: ticketData.assigneeId?.toString() || '',
          dueAt: ticketData.dueAt
            ? format(new Date(ticketData.dueAt), "yyyy-MM-dd'T'HH:mm")
            : '',
          tags: ticketData.tags || []
        });
      } else {
        toast.error('获取工单详情失败');
        onOpenChange(false);
      }
    } catch (error) {
      console.error('获取工单详情失败:', error);
      toast.error('获取工单详情失败');
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && ticketId) {
      fetchTicket();
      setEditing(false);
    }
  }, [open, ticketId]);

  // 保存编辑
  const handleSave = async () => {
    if (!ticketId) return;

    setSaving(true);
    try {
      const updateData: any = {
        status: editForm.status,
        priority: editForm.priority,
        category: editForm.category
      };

      if (editForm.assigneeId) {
        updateData.assigneeId = parseInt(editForm.assigneeId);
      } else {
        updateData.assigneeId = null;
      }

      if (editForm.dueAt) {
        updateData.dueAt = new Date(editForm.dueAt).toISOString();
      } else {
        updateData.dueAt = null;
      }

      const response = await TicketAPI.updateTicket(ticketId, updateData);
      if (response.success) {
        toast.success('工单更新成功');
        setEditing(false);
        await fetchTicket();
        onTicketUpdate?.();
      } else {
        toast.error(response.message || '更新工单失败');
      }
    } catch (error) {
      console.error('更新工单失败:', error);
      toast.error('更新工单失败');
    } finally {
      setSaving(false);
    }
  };

  if (!ticketId) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction='right'>
      <DrawerContent className='h-full w-full sm:max-w-2xl'>
        <DrawerHeader className='border-b'>
          <div className='flex items-center justify-between'>
            <DrawerTitle>
              {ticket ? `工单 #${ticket.id}` : '工单详情'}
            </DrawerTitle>
            <div className='flex items-center gap-2'>
              {editing && (
                <>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      setEditing(false);
                      fetchTicket();
                    }}
                    disabled={saving}
                  >
                    取消
                  </Button>
                  <Button size='sm' onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        保存中...
                      </>
                    ) : (
                      <>
                        <Save className='mr-2 h-4 w-4' />
                        保存
                      </>
                    )}
                  </Button>
                </>
              )}
              {!editing && ticket && (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setEditing(true)}
                >
                  <Edit2 className='mr-2 h-4 w-4' />
                  编辑
                </Button>
              )}
              <DrawerClose asChild>
                <Button variant='ghost' size='sm'>
                  <X className='h-4 w-4' />
                </Button>
              </DrawerClose>
            </div>
          </div>
        </DrawerHeader>

        <div className='flex-1 overflow-y-auto'>
          {loading ? (
            <div className='flex items-center justify-center py-12'>
              <Loader2 className='h-8 w-8 animate-spin' />
            </div>
          ) : !ticket ? (
            <div className='text-muted-foreground py-12 text-center'>
              工单不存在
            </div>
          ) : (
            <Tabs defaultValue='basic' className='p-6'>
              <TabsList className='grid w-full grid-cols-4'>
                <TabsTrigger value='basic'>基本信息</TabsTrigger>
                <TabsTrigger value='comments'>评论</TabsTrigger>
                <TabsTrigger value='attachments'>附件</TabsTrigger>
                <TabsTrigger value='events'>事件</TabsTrigger>
              </TabsList>

              {/* 基本信息 Tab */}
              <TabsContent value='basic' className='mt-4 space-y-4'>
                {editing ? (
                  <div className='space-y-4'>
                    <div className='grid grid-cols-2 gap-4'>
                      <div className='space-y-2'>
                        <Label>状态</Label>
                        <Select
                          value={editForm.status}
                          onValueChange={(value) =>
                            setEditForm({
                              ...editForm,
                              status: value as TicketStatus
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className='space-y-2'>
                        <Label>优先级</Label>
                        <Select
                          value={editForm.priority}
                          onValueChange={(value) =>
                            setEditForm({
                              ...editForm,
                              priority: value as TicketPriority
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PRIORITY_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className='space-y-2'>
                        <Label>分类</Label>
                        <Select
                          value={editForm.category}
                          onValueChange={(value) =>
                            setEditForm({ ...editForm, category: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORY_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className='space-y-2'>
                        <Label>处理人ID</Label>
                        <Input
                          type='number'
                          value={editForm.assigneeId}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              assigneeId: e.target.value
                            })
                          }
                          placeholder='留空表示未指派'
                        />
                      </div>

                      <div className='col-span-2 space-y-2'>
                        <Label>截止时间</Label>
                        <Input
                          type='datetime-local'
                          value={editForm.dueAt}
                          onChange={(e) =>
                            setEditForm({ ...editForm, dueAt: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    <div>
                      <h3 className='mb-2 text-lg font-semibold'>
                        {ticket.title}
                      </h3>
                      <p className='text-muted-foreground whitespace-pre-wrap'>
                        {ticket.description}
                      </p>
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <Label className='text-muted-foreground'>状态</Label>
                        <div className='mt-1'>
                          <Badge>
                            {STATUS_OPTIONS.find(
                              (s) => s.value === ticket.status
                            )?.label || ticket.status}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <Label className='text-muted-foreground'>优先级</Label>
                        <div className='mt-1'>
                          <Badge variant='outline'>
                            {PRIORITY_OPTIONS.find(
                              (p) => p.value === ticket.priority
                            )?.label || ticket.priority}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <Label className='text-muted-foreground'>分类</Label>
                        <div className='mt-1 font-medium'>
                          {ticket.category}
                        </div>
                      </div>

                      <div>
                        <Label className='text-muted-foreground'>用户ID</Label>
                        <div className='mt-1 font-medium'>#{ticket.userId}</div>
                      </div>

                      <div>
                        <Label className='text-muted-foreground'>处理人</Label>
                        <div className='mt-1 font-medium'>
                          {ticket.assigneeId
                            ? `#${ticket.assigneeId}`
                            : '未指派'}
                        </div>
                      </div>

                      {ticket.dueAt && (
                        <div>
                          <Label className='text-muted-foreground'>
                            截止时间
                          </Label>
                          <div className='mt-1 font-medium'>
                            {format(
                              new Date(ticket.dueAt),
                              'yyyy-MM-dd HH:mm',
                              {
                                locale: zhCN
                              }
                            )}
                          </div>
                        </div>
                      )}

                      <div>
                        <Label className='text-muted-foreground'>
                          创建时间
                        </Label>
                        <div className='mt-1 font-medium'>
                          {format(
                            new Date(ticket.createdAt),
                            'yyyy-MM-dd HH:mm',
                            {
                              locale: zhCN
                            }
                          )}
                        </div>
                      </div>

                      <div>
                        <Label className='text-muted-foreground'>
                          更新时间
                        </Label>
                        <div className='mt-1 font-medium'>
                          {formatDistanceToNow(new Date(ticket.updatedAt), {
                            locale: zhCN,
                            addSuffix: true
                          })}
                        </div>
                      </div>
                    </div>

                    {ticket.tags && ticket.tags.length > 0 && (
                      <div>
                        <Label className='text-muted-foreground'>标签</Label>
                        <div className='mt-2 flex flex-wrap gap-2'>
                          {ticket.tags.map((tag, i) => (
                            <Badge key={i} variant='outline'>
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* 评论 Tab */}
              <TabsContent value='comments' className='mt-4'>
                <TicketCommentList
                  ticketId={ticketId}
                  onCommentAdded={() => {
                    fetchTicket();
                    onTicketUpdate?.();
                  }}
                />
              </TabsContent>

              {/* 附件 Tab */}
              <TabsContent value='attachments' className='mt-4'>
                <TicketAttachmentList
                  ticketId={ticketId}
                  onAttachmentChange={() => {
                    fetchTicket();
                    onTicketUpdate?.();
                  }}
                />
              </TabsContent>

              {/* 事件 Tab */}
              <TabsContent value='events' className='mt-4'>
                <TicketEventTimeline ticketId={ticketId} />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
