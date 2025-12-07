'use client';

import { useState, useEffect, useCallback } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TicketAPI } from '@/service/api/ticket';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { TicketComment } from '@/repository/models';

interface TicketCommentListProps {
  ticketId: number;
  onCommentAdded?: () => void;
}

export function TicketCommentList({
  ticketId,
  onCommentAdded
}: TicketCommentListProps) {
  const { session } = useAuth();
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  // 获取评论列表
  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await TicketAPI.getComments(ticketId);
      if (response.success && response.data) {
        setComments(response.data);
      } else {
        toast.error('获取评论列表失败');
      }
    } catch (error) {
      console.error('获取评论列表失败:', error);
      toast.error('获取评论列表失败');
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    if (ticketId) {
      fetchComments();
    }
  }, [ticketId, fetchComments]);

  // 添加评论
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error('请输入评论内容');
      return;
    }

    setSubmitting(true);
    try {
      const response = await TicketAPI.addComment(
        ticketId,
        content.trim(),
        isInternal
      );
      if (response.success) {
        toast.success('评论添加成功');
        setContent('');
        setIsInternal(false);
        await fetchComments();
        onCommentAdded?.();
      } else {
        toast.error(response.message || '添加评论失败');
      }
    } catch (error) {
      console.error('添加评论失败:', error);
      toast.error('添加评论失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='space-y-4'>
      {/* 评论列表 */}
      <div className='space-y-4'>
        {loading ? (
          <div className='flex items-center justify-center py-8'>
            <Loader2 className='h-6 w-6 animate-spin' />
          </div>
        ) : comments.length === 0 ? (
          <div className='text-muted-foreground py-8 text-center text-sm'>
            暂无评论
          </div>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id} className='border-l-4'>
              <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <CardTitle className='text-sm font-medium'>
                      用户 #{comment.userId}
                    </CardTitle>
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
              </CardHeader>
              <CardContent>
                <p className='text-sm whitespace-pre-wrap'>{comment.content}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Separator />

      {/* 添加评论表单 */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>添加评论</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Textarea
                placeholder='输入评论内容...'
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                disabled={submitting}
              />
            </div>

            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-2'>
                <Switch
                  id='is-internal'
                  checked={isInternal}
                  onCheckedChange={setIsInternal}
                  disabled={submitting}
                />
                <Label
                  htmlFor='is-internal'
                  className='cursor-pointer text-sm font-normal'
                >
                  内部备注（仅运营可见）
                </Label>
              </div>

              <Button type='submit' disabled={submitting || !content.trim()}>
                {submitting ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    提交中...
                  </>
                ) : (
                  <>
                    <Send className='mr-2 h-4 w-4' />
                    发送
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
