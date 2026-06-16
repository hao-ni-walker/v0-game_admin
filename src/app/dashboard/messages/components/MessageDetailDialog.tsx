'use client';

import React from 'react';
import { Mail, Clock, Tag, Link2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

import type { Message } from '../types';
import { CATEGORY_COLORS } from '../constants';

interface MessageDetailDialogProps {
  message: Message | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MessageDetailDialog({
  message,
  open,
  onOpenChange,
}: MessageDetailDialogProps) {
  if (!message) return null;

  const colorClass =
    CATEGORY_COLORS[message.category] || 'bg-gray-100 text-gray-700';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[85vh] max-w-2xl'>
        <DialogHeader>
          <div className='flex-1'>
            <DialogTitle className='flex items-center gap-2'>
              <Mail className='h-5 w-5' />
              消息详情
              <Badge className={colorClass}>{message.category}</Badge>
            </DialogTitle>
            <p className='text-muted-foreground mt-1 text-sm'>
              消息ID: <span className='font-mono'>{message.message_id}</span>
              {' | '}用户ID: {message.user_id}
            </p>
          </div>
        </DialogHeader>

        <ScrollArea className='max-h-[calc(85vh-8rem)] pr-4'>
          <div className='space-y-6'>
            <div className='space-y-3'>
              <h3 className='text-sm font-semibold'>基本信息</h3>
              <div className='grid grid-cols-2 gap-4'>
                <div className='flex items-start gap-2'>
                  <Tag className='text-muted-foreground mt-0.5 h-4 w-4' />
                  <div className='min-w-0 flex-1'>
                    <p className='text-muted-foreground text-xs'>模板类型</p>
                    <p className='text-sm font-medium'>
                      {message.template_type}
                    </p>
                  </div>
                </div>
                <div className='flex items-start gap-2'>
                  <Clock className='text-muted-foreground mt-0.5 h-4 w-4' />
                  <div className='min-w-0 flex-1'>
                    <p className='text-muted-foreground text-xs'>发送时间</p>
                    <p className='font-mono text-sm font-medium'>
                      {new Date(message.created_at * 1000).toLocaleString(
                        'zh-CN'
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className='space-y-2'>
              <h3 className='text-sm font-semibold'>标题</h3>
              <p className='text-sm font-medium'>{message.title}</p>
            </div>

            <Separator />

            <div className='space-y-2'>
              <h3 className='text-sm font-semibold'>正文</h3>
              <pre className='bg-muted/50 whitespace-pre-wrap rounded-md p-3 text-sm'>
                {message.body}
              </pre>
            </div>

            {message.action_url && (
              <>
                <Separator />
                <div className='space-y-2'>
                  <h3 className='text-sm font-semibold'>跳转</h3>
                  <div className='flex items-center gap-2'>
                    <Link2 className='text-muted-foreground h-4 w-4' />
                    <span className='font-mono text-sm break-all'>
                      {message.action_url}
                    </span>
                    {message.action_label && (
                      <Badge variant='outline'>{message.action_label}</Badge>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <div className='flex justify-end pt-4'>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            关闭
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
