'use client';

import { useState, useEffect } from 'react';
import {
  Circle,
  UserPlus,
  ArrowRight,
  Tag,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { TicketAPI } from '@/service/api/ticket';
import { toast } from 'sonner';
import { formatDistanceToNow, format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { TicketEvent, TicketEventType } from '@/repository/models';

interface TicketEventTimelineProps {
  ticketId: number;
}

// 事件类型配置
const EVENT_CONFIG: Record<
  TicketEventType,
  { label: string; icon: React.ReactNode; color: string }
> = {
  created: {
    label: '工单创建',
    icon: <Circle className='h-4 w-4' />,
    color: 'text-blue-500'
  },
  assigned: {
    label: '工单指派',
    icon: <UserPlus className='h-4 w-4' />,
    color: 'text-purple-500'
  },
  status_changed: {
    label: '状态变更',
    icon: <ArrowRight className='h-4 w-4' />,
    color: 'text-orange-500'
  },
  priority_changed: {
    label: '优先级变更',
    icon: <AlertCircle className='h-4 w-4' />,
    color: 'text-red-500'
  },
  edited: {
    label: '工单编辑',
    icon: <Edit className='h-4 w-4' />,
    color: 'text-gray-500'
  },
  sla_changed: {
    label: '截止时间变更',
    icon: <Clock className='h-4 w-4' />,
    color: 'text-yellow-500'
  },
  comment_added: {
    label: '添加评论',
    icon: <MessageSquare className='h-4 w-4' />,
    color: 'text-green-500'
  },
  tag_changed: {
    label: '标签变更',
    icon: <Tag className='h-4 w-4' />,
    color: 'text-indigo-500'
  },
  reopened: {
    label: '工单重新打开',
    icon: <CheckCircle className='h-4 w-4' />,
    color: 'text-blue-500'
  },
  automated_action: {
    label: '自动操作',
    icon: <Loader2 className='h-4 w-4' />,
    color: 'text-gray-400'
  }
};

// 格式化事件描述
function formatEventDescription(event: TicketEvent): string {
  const config = EVENT_CONFIG[event.eventType];
  let description = config.label;

  switch (event.eventType) {
    case 'status_changed':
      if (event.oldValue && event.newValue) {
        description = `状态从 "${event.oldValue}" 变更为 "${event.newValue}"`;
      }
      break;
    case 'priority_changed':
      if (event.oldValue && event.newValue) {
        description = `优先级从 "${event.oldValue}" 变更为 "${event.newValue}"`;
      }
      break;
    case 'assigned':
      if (event.newValue) {
        description = `指派给用户 #${event.newValue}`;
      } else if (event.oldValue) {
        description = '取消指派';
      }
      break;
    case 'sla_changed':
      if (event.oldValue && event.newValue) {
        description = `截止时间从 ${format(new Date(event.oldValue as string), 'yyyy-MM-dd HH:mm', { locale: zhCN })} 变更为 ${format(new Date(event.newValue as string), 'yyyy-MM-dd HH:mm', { locale: zhCN })}`;
      } else if (event.newValue) {
        description = `设置截止时间为 ${format(new Date(event.newValue as string), 'yyyy-MM-dd HH:mm', { locale: zhCN })}`;
      } else {
        description = '取消截止时间';
      }
      break;
    case 'tag_changed':
      description = '标签已更新';
      break;
  }

  if (event.reason) {
    description += `（${event.reason}）`;
  }

  return description;
}

export function TicketEventTimeline({ ticketId }: TicketEventTimelineProps) {
  const [events, setEvents] = useState<TicketEvent[]>([]);
  const [loading, setLoading] = useState(false);

  // 获取事件列表
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await TicketAPI.getEvents(ticketId);
      if (response.success && response.data) {
        // 按时间正序排列（最早的在前）
        const sorted = [...response.data].sort((a, b) => {
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });
        setEvents(sorted);
      } else {
        toast.error('获取事件列表失败');
      }
    } catch (error) {
      console.error('获取事件列表失败:', error);
      toast.error('获取事件列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ticketId) {
      fetchEvents();
    }
  }, [ticketId]);

  if (loading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <Loader2 className='h-6 w-6 animate-spin' />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className='text-muted-foreground py-8 text-center text-sm'>
        暂无事件记录
      </div>
    );
  }

  return (
    <div className='relative'>
      {/* 时间线 */}
      <div className='bg-border absolute top-0 bottom-0 left-4 w-0.5' />

      <div className='space-y-6'>
        {events.map((event, index) => {
          const config = EVENT_CONFIG[event.eventType];
          const isLast = index === events.length - 1;

          return (
            <div key={event.id} className='relative flex gap-4'>
              {/* 时间线节点 */}
              <div className='bg-background border-border relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2'>
                <div className={config.color}>{config.icon}</div>
              </div>

              {/* 内容 */}
              <div className='flex-1 space-y-1 pb-6'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm font-medium'>{config.label}</span>
                    {event.userId && (
                      <span className='text-muted-foreground text-xs'>
                        用户 #{event.userId}
                      </span>
                    )}
                  </div>
                  <span className='text-muted-foreground text-xs'>
                    {formatDistanceToNow(new Date(event.createdAt), {
                      locale: zhCN,
                      addSuffix: true
                    })}
                  </span>
                </div>

                <p className='text-muted-foreground text-sm'>
                  {formatEventDescription(event)}
                </p>

                <div className='text-muted-foreground text-xs'>
                  {format(new Date(event.createdAt), 'yyyy-MM-dd HH:mm:ss', {
                    locale: zhCN
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
