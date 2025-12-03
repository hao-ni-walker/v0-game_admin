'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Activity } from '@/repository/models';
import { ActivityAPI, CreateActivityParams } from '@/service/api/activities';
import { TYPE_LABELS, STATUS_LABELS } from '../types';
import { toast } from 'sonner';

interface ActivityEditModalProps {
  open: boolean;
  activity: Activity | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function ActivityEditModal({
  open,
  activity,
  onClose,
  onSuccess
}: ActivityEditModalProps) {
  const isEdit = !!activity;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<CreateActivityParams>>({
    activity_code: '',
    activity_type: '',
    name: '',
    description: '',
    start_time: '',
    end_time: '',
    display_start_time: '',
    display_end_time: '',
    status: 'draft',
    priority: 0,
    icon_url: '',
    banner_url: ''
  });
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [displayStartDate, setDisplayStartDate] = useState<Date | undefined>();
  const [displayEndDate, setDisplayEndDate] = useState<Date | undefined>();

  useEffect(() => {
    if (open) {
      if (activity) {
        setFormData({
          activity_code: activity.activityCode,
          activity_type: activity.activityType,
          name: activity.name,
          description: activity.description,
          start_time: activity.startTime,
          end_time: activity.endTime,
          display_start_time: activity.displayStartTime || '',
          display_end_time: activity.displayEndTime || '',
          status: activity.status,
          priority: activity.priority,
          icon_url: activity.iconUrl || '',
          banner_url: activity.bannerUrl || ''
        });
        setStartDate(new Date(activity.startTime));
        setEndDate(new Date(activity.endTime));
        if (activity.displayStartTime) {
          setDisplayStartDate(new Date(activity.displayStartTime));
        }
        if (activity.displayEndTime) {
          setDisplayEndDate(new Date(activity.displayEndTime));
        }
      } else {
        // 新建
        setFormData({
          activity_code: '',
          activity_type: '',
          name: '',
          description: '',
          start_time: '',
          end_time: '',
          display_start_time: '',
          display_end_time: '',
          status: 'draft',
          priority: 0,
          icon_url: '',
          banner_url: ''
        });
        setStartDate(undefined);
        setEndDate(undefined);
        setDisplayStartDate(undefined);
        setDisplayEndDate(undefined);
      }
    }
  }, [open, activity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.activity_code || !formData.activity_type || !formData.name) {
      toast.error('请填写必填字段');
      return;
    }

    if (!startDate || !endDate) {
      toast.error('请选择活动时间');
      return;
    }

    if (startDate >= endDate) {
      toast.error('活动开始时间必须早于结束时间');
      return;
    }

    setLoading(true);
    try {
      const submitData: CreateActivityParams = {
        activity_code: formData.activity_code!,
        activity_type: formData.activity_type!,
        name: formData.name!,
        description: formData.description || '',
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        display_start_time: displayStartDate?.toISOString(),
        display_end_time: displayEndDate?.toISOString(),
        status: formData.status || 'draft',
        priority: formData.priority || 0,
        icon_url: formData.icon_url,
        banner_url: formData.banner_url
      };

      if (isEdit && activity) {
        const response = await ActivityAPI.updateActivity(activity.id, submitData);
        if (response.code === 0) {
          toast.success('更新成功');
          onSuccess();
          onClose();
        } else {
          toast.error(response.message || '更新失败');
        }
      } else {
        const response = await ActivityAPI.createActivity(submitData);
        if (response.code === 0) {
          toast.success('创建成功');
          onSuccess();
          onClose();
        } else {
          toast.error(response.message || '创建失败');
        }
      }
    } catch (error) {
      console.error('保存失败:', error);
      toast.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{isEdit ? '编辑活动' : '新建活动'}</DialogTitle>
          <DialogDescription>
            {isEdit ? '修改活动信息' : '创建一个新的活动'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='activity_code'>
                活动编码 <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='activity_code'
                value={formData.activity_code}
                onChange={(e) =>
                  setFormData({ ...formData, activity_code: e.target.value })
                }
                disabled={isEdit}
                placeholder='请输入活动编码'
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='activity_type'>
                活动类型 <span className='text-red-500'>*</span>
              </Label>
              <Select
                value={formData.activity_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, activity_type: value })
                }
                disabled={isEdit}
                required
              >
                <SelectTrigger id='activity_type'>
                  <SelectValue placeholder='请选择活动类型' />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2 md:col-span-2'>
              <Label htmlFor='name'>
                活动名称 <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='name'
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder='请输入活动名称'
                required
              />
            </div>

            <div className='space-y-2 md:col-span-2'>
              <Label htmlFor='description'>描述</Label>
              <Textarea
                id='description'
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder='请输入活动描述'
                rows={3}
              />
            </div>

            <div className='space-y-2'>
              <Label>
                活动开始时间 <span className='text-red-500'>*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !startDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className='mr-2 h-4 w-4' />
                    {startDate ? (
                      format(startDate, 'yyyy-MM-dd HH:mm', { locale: zhCN })
                    ) : (
                      <span>选择开始时间</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0'>
                  <Calendar
                    mode='single'
                    selected={startDate}
                    onSelect={setStartDate}
                    locale={zhCN}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className='space-y-2'>
              <Label>
                活动结束时间 <span className='text-red-500'>*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !endDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className='mr-2 h-4 w-4' />
                    {endDate ? (
                      format(endDate, 'yyyy-MM-dd HH:mm', { locale: zhCN })
                    ) : (
                      <span>选择结束时间</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0'>
                  <Calendar
                    mode='single'
                    selected={endDate}
                    onSelect={setEndDate}
                    locale={zhCN}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className='space-y-2'>
              <Label>展示开始时间</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !displayStartDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className='mr-2 h-4 w-4' />
                    {displayStartDate ? (
                      format(displayStartDate, 'yyyy-MM-dd HH:mm', { locale: zhCN })
                    ) : (
                      <span>选择展示开始时间</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0'>
                  <Calendar
                    mode='single'
                    selected={displayStartDate}
                    onSelect={setDisplayStartDate}
                    locale={zhCN}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className='space-y-2'>
              <Label>展示结束时间</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !displayEndDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className='mr-2 h-4 w-4' />
                    {displayEndDate ? (
                      format(displayEndDate, 'yyyy-MM-dd HH:mm', { locale: zhCN })
                    ) : (
                      <span>选择展示结束时间</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0'>
                  <Calendar
                    mode='single'
                    selected={displayEndDate}
                    onSelect={setDisplayEndDate}
                    locale={zhCN}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {!isEdit && (
              <div className='space-y-2'>
                <Label htmlFor='status'>初始状态</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger id='status'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className='space-y-2'>
              <Label htmlFor='priority'>优先级</Label>
              <Input
                id='priority'
                type='number'
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })
                }
                placeholder='0'
              />
            </div>

            <div className='space-y-2 md:col-span-2'>
              <Label htmlFor='icon_url'>图标 URL</Label>
              <Input
                id='icon_url'
                value={formData.icon_url}
                onChange={(e) =>
                  setFormData({ ...formData, icon_url: e.target.value })
                }
                placeholder='https://...'
              />
            </div>

            <div className='space-y-2 md:col-span-2'>
              <Label htmlFor='banner_url'>横幅 URL</Label>
              <Input
                id='banner_url'
                value={formData.banner_url}
                onChange={(e) =>
                  setFormData({ ...formData, banner_url: e.target.value })
                }
                placeholder='https://...'
              />
            </div>
          </div>

          <DialogFooter>
            <Button type='button' variant='outline' onClick={onClose} disabled={loading}>
              取消
            </Button>
            <Button type='submit' disabled={loading}>
              {loading ? '保存中...' : isEdit ? '更新' : '创建'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

