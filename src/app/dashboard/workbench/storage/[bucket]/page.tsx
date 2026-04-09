'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { toast } from 'sonner';
import { Download, Eye, RefreshCw, Search, Trash2, Upload } from 'lucide-react';

type StorageObjectItem = {
  key: string;
  size: number;
  content_type?: string;
  updated_at?: string;
  etag?: string;
};

type UploadItem = {
  id: string;
  file: File;
  preview?: string;
  status: 'pending' | 'uploading' | 'success' | 'failed';
  error?: string;
};

function formatDate(value?: string) {
  return value ? new Date(value).toLocaleString('zh-CN') : '-';
}

function formatSize(size: number) {
  if (!size) return '0 B';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
  return `${(size / 1024 / 1024 / 1024).toFixed(1)} GB`;
}

function isImageFile(key: string, contentType?: string) {
  if (contentType?.startsWith('image/')) return true;
  return /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(key);
}

export default function WorkbenchBucketPage({
}) {
  const params = useParams();
  const bucket = useMemo(() => decodeURIComponent(String(params.bucket || '')), [params.bucket]);

  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<StorageObjectItem[]>([]);

  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [uploading, setUploading] = useState(false);

  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [previewContentType, setPreviewContentType] = useState<string | undefined>(undefined);

  const fetchObjects = useCallback(async () => {
    if (!bucket) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ bucket });
      if (keyword) params.set('keyword', keyword);
      const res = await fetch(`/api/admin/r2/objects?${params.toString()}`);
      const data = await res.json();
      if (data.code !== 0) {
        toast.error(data.message || '获取文件列表失败');
        return;
      }
      const list = data.data?.items || data.data?.list || data.data || [];
      setItems(Array.isArray(list) ? list : []);
    } catch {
      toast.error('获取文件列表失败');
    } finally {
      setLoading(false);
    }
  }, [bucket, keyword]);

  useEffect(() => {
    fetchObjects();
  }, [fetchObjects]);

  const handleUploadFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const list: UploadItem[] = Array.from(files).map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}`,
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      status: 'pending'
    }));
    setUploadItems((prev) => [...list, ...prev]);
  };

  const handleUpload = async () => {
    if (!bucket) return;
    if (uploadItems.length === 0) {
      toast.error('请先选择文件');
      return;
    }

    setUploading(true);
    try {
      for (const item of uploadItems) {
        setUploadItems((prev) =>
          prev.map((x) => (x.id === item.id ? { ...x, status: 'uploading', error: '' } : x))
        );
        try {
          const presignRes = await fetch('/api/admin/r2/presign-upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              bucket,
              key: item.file.name,
              content_type: item.file.type
            })
          });
          const presignData = await presignRes.json();
          if (presignData.code !== 0) {
            throw new Error(presignData.message || '获取上传地址失败');
          }

          const uploadUrl = presignData.data?.upload_url || presignData.data?.url;
          if (!uploadUrl) throw new Error('上传地址为空');

          const uploadRes = await fetch(uploadUrl, {
            method: 'PUT',
            headers: { 'Content-Type': item.file.type || 'application/octet-stream' },
            body: item.file
          });
          if (!uploadRes.ok) throw new Error(`上传失败: ${uploadRes.status}`);

          setUploadItems((prev) =>
            prev.map((x) => (x.id === item.id ? { ...x, status: 'success' } : x))
          );
        } catch (error) {
          setUploadItems((prev) =>
            prev.map((x) =>
              x.id === item.id
                ? {
                    ...x,
                    status: 'failed',
                    error: error instanceof Error ? error.message : '上传失败'
                  }
                : x
            )
          );
        }
      }
      await fetchObjects();
      toast.success('上传流程完成');
    } finally {
      setUploading(false);
    }
  };

  const getDownloadUrl = async (key: string) => {
    const res = await fetch('/api/admin/r2/presign-download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bucket, key })
    });
    const data = await res.json();
    if (data.code !== 0) {
      throw new Error(data.message || '获取下载链接失败');
    }
    const url = data.data?.download_url || data.data?.url;
    if (!url) throw new Error('下载链接为空');
    return url as string;
  };

  const handleOpenPreview = async (obj: StorageObjectItem) => {
    try {
      const url = await getDownloadUrl(obj.key);
      setPreviewTitle(obj.key);
      setPreviewUrl(url);
      setPreviewContentType(obj.content_type);
      setPreviewDialogOpen(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '获取预览链接失败');
    }
  };

  const handleDownloadObject = async (obj: StorageObjectItem) => {
    try {
      const url = await getDownloadUrl(obj.key);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '获取下载链接失败');
    }
  };

  const handleDeleteObject = async (obj: StorageObjectItem) => {
    try {
      const params = new URLSearchParams({ bucket, key: obj.key });
      const res = await fetch(`/api/admin/r2/object?${params.toString()}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.code !== 0) {
        toast.error(data.message || '删除文件失败');
        return;
      }
      toast.success('删除成功');
      fetchObjects();
    } catch {
      toast.error('删除文件失败');
    }
  };

  return (
    <PageContainer scrollable>
      <div className='space-y-6 p-4 md:p-6'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div>
            <h1 className='text-2xl font-bold'>存储管理</h1>
            <div className='mt-1 text-xs text-muted-foreground'>
              bucket: <span className='font-mono'>{bucket || '-'}</span>
            </div>
          </div>
          <Button variant='outline' onClick={fetchObjects} disabled={loading}>
            <RefreshCw className='mr-2 h-4 w-4' />
            刷新
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>对象搜索</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex flex-wrap gap-2'>
              <Input
                value={keyword}
                placeholder='按 key 搜索文件'
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchObjects()}
                className='min-w-[220px] flex-1'
              />
              <Button onClick={fetchObjects}>
                <Search className='mr-2 h-4 w-4' />
                搜索
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>文件上传（预签名 URL）</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='flex flex-wrap items-center gap-3'>
              <Input type='file' multiple onChange={(e) => handleUploadFileSelect(e.target.files)} />
              <Button onClick={handleUpload} disabled={uploading}>
                <Upload className='mr-2 h-4 w-4' />
                {uploading ? '上传中...' : '开始上传'}
              </Button>
            </div>
            {uploadItems.length > 0 && (
              <div className='grid gap-2'>
                {uploadItems.map((item) => (
                  <div key={item.id} className='flex items-center justify-between rounded-md border p-2 text-sm'>
                    <div className='flex items-center gap-3'>
                      {item.preview && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.preview} alt={item.file.name} className='h-10 w-10 rounded object-cover' />
                      )}
                      <span className='max-w-[380px] truncate'>{item.file.name}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Badge
                        variant={
                          item.status === 'success'
                            ? 'default'
                            : item.status === 'failed'
                            ? 'destructive'
                            : 'outline'
                        }
                      >
                        {item.status}
                      </Badge>
                      {item.error && <span className='text-xs text-destructive'>{item.error}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>对象列表</CardTitle>
          </CardHeader>
          <CardContent className='p-0'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key</TableHead>
                  <TableHead>大小</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>更新时间</TableHead>
                  <TableHead className='w-[220px]'>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className='py-8 text-center'>
                      加载中...
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className='py-8 text-center text-muted-foreground'>
                      暂无文件
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((obj) => (
                    <TableRow key={obj.key}>
                      <TableCell className='max-w-[360px] truncate font-mono text-xs'>{obj.key}</TableCell>
                      <TableCell>{formatSize(obj.size || 0)}</TableCell>
                      <TableCell>{obj.content_type || '-'}</TableCell>
                      <TableCell>{formatDate(obj.updated_at)}</TableCell>
                      <TableCell>
                        <div className='flex flex-wrap gap-1'>
                          <Button size='sm' variant='outline' onClick={() => handleOpenPreview(obj)}>
                            <Eye className='mr-1 h-3 w-3' />
                            预览
                          </Button>
                          <Button size='sm' variant='outline' onClick={() => handleDownloadObject(obj)}>
                            <Download className='mr-1 h-3 w-3' />
                            下载
                          </Button>
                          <Button size='sm' variant='destructive' onClick={() => handleDeleteObject(obj)}>
                            <Trash2 className='mr-1 h-3 w-3' />
                            删除
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
      </div>

      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className='max-w-4xl'>
          <DialogHeader>
            <DialogTitle>文件预览</DialogTitle>
            <DialogDescription className='font-mono text-xs'>{previewTitle}</DialogDescription>
          </DialogHeader>
          <div className='max-h-[70vh] overflow-auto rounded-md border p-3'>
            {previewUrl ? (
              isImageFile(previewTitle, previewContentType) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt={previewTitle} className='mx-auto max-h-[60vh] object-contain' />
              ) : (
                <iframe title={previewTitle} src={previewUrl} className='h-[60vh] w-full rounded' />
              )
            ) : (
              <div className='py-10 text-center text-sm text-muted-foreground'>暂无可预览内容</div>
            )}
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setPreviewDialogOpen(false)}>
              关闭
            </Button>
            {previewUrl ? (
              <Button onClick={() => window.open(previewUrl, '_blank', 'noopener,noreferrer')}>在新窗口打开</Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

