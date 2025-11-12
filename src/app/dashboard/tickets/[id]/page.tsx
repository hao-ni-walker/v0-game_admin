'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PageContainer from '@/components/layout/page-container';
import { TicketAPI } from '@/service/api/ticket';
import type { Ticket, TicketComment, TicketEvent } from '@/repository/models';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const STATUS_LABELS: Record<string, string> = {
  open: '待处理',
  in_progress: '处理中',
  pending: '挂起',
  resolved: '已解决',
  closed: '已关闭',
  canceled: '已取消'
};

const PRIORITY_LABELS: Record<string, string> = {
  low: '低',
  normal: '普通',
  high: '高',
  urgent: '紧急'
};

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<
    (Ticket & { comments?: TicketComment[]; events?: TicketEvent[] }) | null
  >(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await TicketAPI.getTicket(Number(params.id));
        if (response.success && response.data) {
          setTicket(response.data);
        } else {
          toast.error('获取工单详情失败');
          router.push('/dashboard/tickets');
        }
      } catch (error) {
        console.error('获取工单详情失败:', error);
        toast.error('获取工单详情失败');
        router.push('/dashboard/tickets');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchTicket();
    }
  }, [params.id, router]);

  if (loading) {
    return (
      <PageContainer>
        <div className='flex h-64 items-center justify-center'>
          <Loader2 className='h-8 w-8 animate-spin' />
        </div>
      </PageContainer>
    );
  }

  if (!ticket) {
    return null;
  }

  return (
    <PageContainer>
      <div className='space-y-4'>
        {/* 头部 */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Button variant='ghost' size='sm' onClick={() => router.back()}>
              <ArrowLeft className='mr-2 h-4 w-4' />
              返回
            </Button>
            <div>
              <h1 className='text-2xl font-bold'>
                #{ticket.id} {ticket.title}
              </h1>
              <p className='text-muted-foreground mt-1 text-sm'>
                创建于{' '}
                {formatDistanceToNow(new Date(ticket.createdAt), {
                  locale: zhCN,
                  addSuffix: true
                })}
              </p>
            </div>
          </div>
          <div className='flex gap-2'>
            <Badge>{STATUS_LABELS[ticket.status]}</Badge>
            <Badge variant='outline'>{PRIORITY_LABELS[ticket.priority]}</Badge>
          </div>
        </div>

        <div className='grid grid-cols-3 gap-4'>
          {/* 主体内容 */}
          <div className='col-span-2 space-y-4'>
            {/* 描述 */}
            <Card>
              <CardHeader>
                <CardTitle>工单描述</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='whitespace-pre-wrap'>{ticket.description}</p>
              </CardContent>
            </Card>

            {/* 评论 */}
            <Card>
              <CardHeader>
                <CardTitle>评论 ({ticket.comments?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                {ticket.comments && ticket.comments.length > 0 ? (
                  <div className='space-y-4'>
                    {ticket.comments.map((comment) => (
                      <div key={comment.id} className='border-l-2 py-2 pl-4'>
                        <div className='mb-2 flex items-center justify-between'>
                          <div className='flex items-center gap-2'>
                            <span className='font-medium'>
                              用户 #{comment.userId}
                            </span>
                            {comment.isInternal && (
                              <Badge variant='secondary' className='text-xs'>
                                内部备注
                              </Badge>
                            )}
                          </div>
                          <span className='text-muted-foreground text-xs'>
                            {formatDistanceToNow(new Date(comment.createdAt), {
                              locale: zhCN,
                              addSuffix: true
                            })}
                          </span>
                        </div>
                        <p className='text-sm'>{comment.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='text-muted-foreground py-8 text-center'>
                    暂无评论
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 侧边栏 */}
          <div className='space-y-4'>
            {/* 基本信息 */}
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>基本信息</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3 text-sm'>
                <div>
                  <div className='text-muted-foreground'>分类</div>
                  <div className='font-medium'>{ticket.category}</div>
                </div>
                <div>
                  <div className='text-muted-foreground'>提单人</div>
                  <div className='font-medium'>用户 #{ticket.userId}</div>
                </div>
                <div>
                  <div className='text-muted-foreground'>处理人</div>
                  <div className='font-medium'>
                    {ticket.assigneeId
                      ? `用户 #${ticket.assigneeId}`
                      : '未指派'}
                  </div>
                </div>
                {ticket.dueAt && (
                  <div>
                    <div className='text-muted-foreground'>截止时间</div>
                    <div className='font-medium'>
                      {formatDistanceToNow(new Date(ticket.dueAt), {
                        locale: zhCN,
                        addSuffix: true
                      })}
                    </div>
                  </div>
                )}
                {ticket.tags && ticket.tags.length > 0 && (
                  <div>
                    <div className='text-muted-foreground mb-2'>标签</div>
                    <div className='flex flex-wrap gap-1'>
                      {ticket.tags.map((tag, i) => (
                        <Badge key={i} variant='outline' className='text-xs'>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 时间线 */}
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>事件时间线</CardTitle>
              </CardHeader>
              <CardContent>
                {ticket.events && ticket.events.length > 0 ? (
                  <div className='space-y-3'>
                    {ticket.events.map((event) => (
                      <div key={event.id} className='text-sm'>
                        <div className='font-medium'>{event.eventType}</div>
                        <div className='text-muted-foreground text-xs'>
                          {formatDistanceToNow(new Date(event.createdAt), {
                            locale: zhCN,
                            addSuffix: true
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='text-muted-foreground text-sm'>暂无事件</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
