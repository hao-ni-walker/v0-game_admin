'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Send,
  Loader2,
  MessageSquare,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import { TicketAPI } from '@/service/api/ticket';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { TicketComment } from '@/repository/models';

interface TicketCommentInlineProps {
  ticketId: number;
  onCommentAdded?: () => void;
}

export function TicketCommentInline({
  ticketId,
  onCommentAdded
}: TicketCommentInlineProps) {
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [open, setOpen] = useState(false);

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

  // 当展开时加载评论
  useEffect(() => {
    if (open) {
      fetchComments();
    }
  }, [open, fetchComments]);

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
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          className='flex items-center gap-2 text-xs'
        >
          <MessageSquare className='h-3.5 w-3.5' />
          <span>
            评论{comments.length > 0 || loading ? ` (${comments.length})` : ''}
          </span>
          {open ? (
            <ChevronUp className='h-3.5 w-3.5' />
          ) : (
            <ChevronDown className='h-3.5 w-3.5' />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className='mt-2'>
        <div className='bg-card space-y-4 rounded-md border p-4'>
          {/* 评论列表 */}
          <div className='max-h-64 space-y-3 overflow-y-auto'>
            {loading ? (
              <div className='flex items-center justify-center py-4'>
                <Loader2 className='h-4 w-4 animate-spin' />
              </div>
            ) : comments.length === 0 ? (
              <div className='text-muted-foreground py-4 text-center text-xs'>
                暂无评论
              </div>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className='border-border space-y-1 border-l-2 py-2 pl-3'
                >
                  <div className='flex items-center justify-between gap-2'>
                    <div className='flex items-center gap-2'>
                      <span className='text-xs font-medium'>
                        用户 #{comment.userId}
                      </span>
                      {comment.isInternal && (
                        <Badge variant='secondary' className='py-0 text-xs'>
                          内部
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
                  <p className='text-muted-foreground text-xs whitespace-pre-wrap'>
                    {comment.content}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* 添加评论表单 */}
          <div className='space-y-2 border-t pt-3'>
            <form onSubmit={handleSubmit} className='space-y-2'>
              <Textarea
                placeholder='输入评论内容...'
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={2}
                disabled={submitting}
                className='text-xs'
              />
              <div className='flex items-center justify-between'>
                <label className='text-muted-foreground flex cursor-pointer items-center gap-2 text-xs'>
                  <input
                    type='checkbox'
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    disabled={submitting}
                    className='h-3 w-3'
                  />
                  <span>内部备注</span>
                </label>
                <Button
                  type='submit'
                  size='sm'
                  disabled={submitting || !content.trim()}
                  className='h-7 text-xs'
                >
                  {submitting ? (
                    <>
                      <Loader2 className='mr-1 h-3 w-3 animate-spin' />
                      提交中
                    </>
                  ) : (
                    <>
                      <Send className='mr-1 h-3 w-3' />
                      发送
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
