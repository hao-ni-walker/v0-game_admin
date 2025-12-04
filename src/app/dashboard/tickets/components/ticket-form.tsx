'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TicketAPI } from '@/service/api/ticket';
import { toast } from 'sonner';
import type { Ticket, TicketPriority } from '@/repository/models';

interface TicketFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket?: Ticket | null;
  onSuccess?: () => void;
}

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

export function TicketForm({
  open,
  onOpenChange,
  ticket,
  onSuccess
}: TicketFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'normal' as TicketPriority,
    category: '',
    userId: '',
    dueAt: '',
    tags: [] as string[]
  });
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEdit = !!ticket;

  // 初始化表单数据
  useEffect(() => {
    if (open) {
      if (ticket) {
        setFormData({
          title: ticket.title,
          description: ticket.description,
          priority: ticket.priority,
          category: ticket.category,
          userId: ticket.userId.toString(),
          dueAt: ticket.dueAt
            ? new Date(ticket.dueAt).toISOString().slice(0, 16)
            : '',
          tags: ticket.tags || []
        });
      } else {
        setFormData({
          title: '',
          description: '',
          priority: 'normal',
          category: '',
          userId: '',
          dueAt: '',
          tags: []
        });
      }
      setTagInput('');
      setErrors({});
    }
  }, [open, ticket]);

  // 验证表单
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '请输入工单标题';
    }

    if (!formData.description.trim()) {
      newErrors.description = '请输入工单描述';
    }

    if (!formData.category) {
      newErrors.category = '请选择分类';
    }

    if (!isEdit && !formData.userId.trim()) {
      newErrors.userId = '请输入用户ID';
    } else if (!isEdit && isNaN(parseInt(formData.userId))) {
      newErrors.userId = '用户ID必须是数字';
    }

    if (formData.dueAt) {
      const dueDate = new Date(formData.dueAt);
      if (dueDate < new Date()) {
        newErrors.dueAt = '截止时间不能早于当前时间';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      if (isEdit && ticket) {
        // 更新工单
        const updateData: any = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          priority: formData.priority,
          category: formData.category
        };

        if (formData.dueAt) {
          updateData.dueAt = new Date(formData.dueAt).toISOString();
        } else {
          updateData.dueAt = null;
        }

        const response = await TicketAPI.updateTicket(ticket.id, updateData);
        if (response.success) {
          toast.success('工单更新成功');
          onOpenChange(false);
          onSuccess?.();
        } else {
          toast.error(response.message || '更新工单失败');
        }
      } else {
        // 创建工单
        const createData = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          priority: formData.priority,
          category: formData.category,
          userId: parseInt(formData.userId),
          dueAt: formData.dueAt
            ? new Date(formData.dueAt).toISOString()
            : undefined,
          tags: formData.tags
        };

        const response = await TicketAPI.createTicket(createData);
        if (response.success) {
          toast.success('工单创建成功');
          onOpenChange(false);
          onSuccess?.();
        } else {
          toast.error(response.message || '创建工单失败');
        }
      }
    } catch (error) {
      console.error('提交工单失败:', error);
      toast.error(isEdit ? '更新工单失败' : '创建工单失败');
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !formData.tags.includes(trimmed)) {
      setFormData({ ...formData, tags: [...formData.tags, trimmed] });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag)
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{isEdit ? '编辑工单' : '新建工单'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='title'>
              标题 <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='title'
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder='请输入工单标题'
              className={errors.title ? 'border-destructive' : ''}
            />
            {errors.title && (
              <p className='text-destructive text-sm'>{errors.title}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='description'>
              描述 <span className='text-destructive'>*</span>
            </Label>
            <Textarea
              id='description'
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder='请输入工单描述'
              rows={6}
              className={errors.description ? 'border-destructive' : ''}
            />
            {errors.description && (
              <p className='text-destructive text-sm'>{errors.description}</p>
            )}
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='category'>
                分类 <span className='text-destructive'>*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger
                  id='category'
                  className={errors.category ? 'border-destructive' : ''}
                >
                  <SelectValue placeholder='请选择分类' />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className='text-destructive text-sm'>{errors.category}</p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='priority'>优先级</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    priority: value as TicketPriority
                  })
                }
              >
                <SelectTrigger id='priority'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {!isEdit && (
            <div className='space-y-2'>
              <Label htmlFor='userId'>
                用户ID <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='userId'
                type='number'
                value={formData.userId}
                onChange={(e) =>
                  setFormData({ ...formData, userId: e.target.value })
                }
                placeholder='请输入用户ID'
                className={errors.userId ? 'border-destructive' : ''}
              />
              {errors.userId && (
                <p className='text-destructive text-sm'>{errors.userId}</p>
              )}
            </div>
          )}

          <div className='space-y-2'>
            <Label htmlFor='dueAt'>截止时间</Label>
            <Input
              id='dueAt'
              type='datetime-local'
              value={formData.dueAt}
              onChange={(e) =>
                setFormData({ ...formData, dueAt: e.target.value })
              }
              className={errors.dueAt ? 'border-destructive' : ''}
            />
            {errors.dueAt && (
              <p className='text-destructive text-sm'>{errors.dueAt}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label>标签</Label>
            <div className='mb-2 flex flex-wrap gap-2'>
              {formData.tags.map((tag) => (
                <Badge key={tag} variant='secondary' className='gap-1'>
                  {tag}
                  <button
                    type='button'
                    onClick={() => removeTag(tag)}
                    className='hover:bg-secondary-foreground/20 ml-1 rounded-full'
                  >
                    <X className='h-3 w-3' />
                  </button>
                </Badge>
              ))}
            </div>
            <div className='flex gap-2'>
              <Input
                placeholder='输入标签后按回车'
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button type='button' variant='outline' onClick={addTag}>
                添加
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              取消
            </Button>
            <Button type='submit' disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  提交中...
                </>
              ) : (
                <>
                  <Plus className='mr-2 h-4 w-4' />
                  {isEdit ? '更新' : '创建'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
