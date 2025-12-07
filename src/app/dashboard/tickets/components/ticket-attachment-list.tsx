'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, Trash2, Download, Loader2, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { TicketAPI } from '@/service/api/ticket';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { TicketAttachment } from '@/repository/models';

interface TicketAttachmentListProps {
  ticketId: number;
  onAttachmentChange?: () => void;
}

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export function TicketAttachmentList({
  ticketId,
  onAttachmentChange
}: TicketAttachmentListProps) {
  const [attachments, setAttachments] = useState<TicketAttachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 获取附件列表
  const fetchAttachments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await TicketAPI.getAttachments(ticketId);
      if (response.success && response.data) {
        setAttachments(response.data);
      } else {
        toast.error('获取附件列表失败');
      }
    } catch (error) {
      console.error('获取附件列表失败:', error);
      toast.error('获取附件列表失败');
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    if (ticketId) {
      fetchAttachments();
    }
  }, [ticketId, fetchAttachments]);

  // 处理文件选择
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 文件大小限制（10MB）
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('文件大小不能超过 10MB');
      return;
    }

    setUploading(true);
    try {
      const response = await TicketAPI.uploadAttachment(ticketId, file);
      if (response.success) {
        toast.success('附件上传成功');
        await fetchAttachments();
        onAttachmentChange?.();
      } else {
        toast.error(response.message || '上传附件失败');
      }
    } catch (error) {
      console.error('上传附件失败:', error);
      toast.error('上传附件失败');
    } finally {
      setUploading(false);
      // 清空文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 删除附件
  const handleDelete = async () => {
    if (deletingId === null) return;

    try {
      const response = await TicketAPI.deleteAttachment(deletingId);
      if (response.success) {
        toast.success('附件删除成功');
        await fetchAttachments();
        onAttachmentChange?.();
      } else {
        toast.error(response.message || '删除附件失败');
      }
    } catch (error) {
      console.error('删除附件失败:', error);
      toast.error('删除附件失败');
    } finally {
      setDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  // 打开文件
  const handleOpenFile = (attachment: TicketAttachment) => {
    // 在实际环境中，这里应该使用真实的文件URL
    // 这里我们假设 filePath 是可访问的URL
    window.open(attachment.filePath, '_blank');
  };

  return (
    <div className='space-y-4'>
      {/* 附件列表 */}
      <div className='space-y-2'>
        {loading ? (
          <div className='flex items-center justify-center py-8'>
            <Loader2 className='h-6 w-6 animate-spin' />
          </div>
        ) : attachments.length === 0 ? (
          <div className='text-muted-foreground py-8 text-center text-sm'>
            暂无附件
          </div>
        ) : (
          attachments.map((attachment) => (
            <Card
              key={attachment.id}
              className='hover:bg-accent/50 transition-colors'
            >
              <CardContent className='flex items-center justify-between p-4'>
                <div className='flex min-w-0 flex-1 items-center gap-3'>
                  <File className='text-muted-foreground h-5 w-5 shrink-0' />
                  <div className='min-w-0 flex-1'>
                    <button
                      onClick={() => handleOpenFile(attachment)}
                      className='block w-full truncate text-left text-sm font-medium hover:underline'
                    >
                      {attachment.filename}
                    </button>
                    <div className='text-muted-foreground mt-1 text-xs'>
                      {formatFileSize(attachment.fileSize)} ·{' '}
                      {formatDistanceToNow(new Date(attachment.uploadedAt), {
                        locale: zhCN,
                        addSuffix: true
                      })}
                    </div>
                  </div>
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => {
                    setDeletingId(attachment.id);
                    setDeleteDialogOpen(true);
                  }}
                  className='text-destructive hover:text-destructive'
                >
                  <Trash2 className='h-4 w-4' />
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* 上传附件 */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>上传附件</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <input
              ref={fileInputRef}
              type='file'
              onChange={handleFileSelect}
              className='hidden'
              disabled={uploading}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className='w-full'
            >
              {uploading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  上传中...
                </>
              ) : (
                <>
                  <Upload className='mr-2 h-4 w-4' />
                  选择文件
                </>
              )}
            </Button>
            <p className='text-muted-foreground text-xs'>
              支持上传最大 10MB 的文件
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除此附件吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
