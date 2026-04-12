'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
  Headphones,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  Video
} from 'lucide-react';
import { buildPublicObjectUrlForBucket } from '@/constants/storage-buckets';

const OBJECT_LIST_PAGE_SIZE = 50;

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
  return /\.(png|jpg|jpeg|gif|webp|svg|avif|bmp|ico)$/i.test(key);
}

function isVideoFile(key: string, contentType?: string) {
  if (contentType?.startsWith('audio/')) return false;
  if (contentType?.startsWith('video/')) return true;
  return /\.(mp4|webm|ogv|mov|m4v|mkv)$/i.test(key);
}

function isAudioFile(key: string, contentType?: string) {
  if (contentType?.startsWith('audio/')) return true;
  return /\.(mp3|wav|ogg|m4a|aac|flac|opus|webm)$/i.test(key);
}

function isMultimediaFile(key: string, contentType?: string) {
  return isImageFile(key, contentType) || isVideoFile(key, contentType) || isAudioFile(key, contentType);
}

async function fetchPresignedDownloadUrl(bucket: string, key: string): Promise<string> {
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
}

function ObjectListPreviewCell({
  bucket,
  obj,
  onOpenPreview
}: {
  bucket: string;
  obj: StorageObjectItem;
  onOpenPreview: (obj: StorageObjectItem) => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [phase, setPhase] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const loadedRef = useRef(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const isImage = isImageFile(obj.key, obj.content_type);
  const isVideo = isVideoFile(obj.key, obj.content_type);
  const isAudio = isAudioFile(obj.key, obj.content_type);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || !isMultimediaFile(obj.key, obj.content_type)) return;

    const publicUrl = buildPublicObjectUrlForBucket(bucket, obj.key);
    if (publicUrl) {
      loadedRef.current = true;
      setUrl(publicUrl);
      setPhase('ready');
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || loadedRef.current) return;
        loadedRef.current = true;
        setPhase('loading');
        fetchPresignedDownloadUrl(bucket, obj.key)
          .then((u) => {
            setUrl(u);
            setPhase('ready');
          })
          .catch(() => setPhase('error'));
      },
      { rootMargin: '120px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [bucket, obj.key, obj.content_type]);

  if (!isMultimediaFile(obj.key, obj.content_type)) {
    return <span className='text-muted-foreground'>—</span>;
  }

  return (
    <div ref={wrapRef} className='flex items-center'>
      <button
        type='button'
        title='点击打开完整预览'
        onClick={() => onOpenPreview(obj)}
        className='bg-muted/50 hover:bg-muted relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border transition-colors'
      >
        {phase === 'idle' || phase === 'loading' ? (
          <span className='text-muted-foreground text-[10px]'>{phase === 'loading' ? '…' : '···'}</span>
        ) : phase === 'error' ? (
          <span className='text-destructive text-[10px]'>!</span>
        ) : url && isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt='' className='h-full w-full object-cover' loading='lazy' />
        ) : url && isVideo ? (
          <video
            src={url}
            muted
            playsInline
            preload='metadata'
            className='h-full w-full object-cover'
          />
        ) : url && isAudio ? (
          <Headphones className='text-muted-foreground h-5 w-5' />
        ) : (
          <Video className='text-muted-foreground h-5 w-5' />
        )}
      </button>
    </div>
  );
}

export default function WorkbenchBucketPage({
}) {
  const params = useParams();
  const bucket = useMemo(() => decodeURIComponent(String(params.bucket || '')), [params.bucket]);

  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<StorageObjectItem[]>([]);

  /** 无关键词：S3 continuation 分页，stack 每项为当前页请求所用的 token（首页为空栈） */
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [nextContinuationToken, setNextContinuationToken] = useState<string | null>(null);

  /** 有关键词：服务端在最多 1000 条内过滤后的页码分页 */
  const [keywordPage, setKeywordPage] = useState(1);
  const [keywordPager, setKeywordPager] = useState<{
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  } | null>(null);
  const [scanTruncated, setScanTruncated] = useState(false);

  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [uploading, setUploading] = useState(false);
  /** 上传成功后递增以重置 file input，避免仍显示已选文件名 */
  const [fileInputNonce, setFileInputNonce] = useState(0);

  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [previewContentType, setPreviewContentType] = useState<string | undefined>(undefined);

  const listScopeKeyRef = useRef<string | null>(null);

  const fetchObjects = useCallback(async () => {
    if (!bucket) return;
    const listScopeKey = `${bucket}\0${keyword}`;
    const scopeChanged = listScopeKeyRef.current !== listScopeKey;
    if (scopeChanged) {
      listScopeKeyRef.current = listScopeKey;
    }

    const kw = keyword.trim();
    const effectiveKeywordPage = kw ? (scopeChanged ? 1 : keywordPage) : 1;
    const effectiveCursorStack = kw ? [] : scopeChanged ? [] : cursorStack;

    if (scopeChanged) {
      setKeywordPage(1);
      setCursorStack([]);
      setNextContinuationToken(null);
      setKeywordPager(null);
      setScanTruncated(false);
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        bucket,
        page_size: String(OBJECT_LIST_PAGE_SIZE)
      });
      if (kw) {
        params.set('keyword', kw);
        params.set('page', String(effectiveKeywordPage));
      } else if (effectiveCursorStack.length > 0) {
        params.set('continuation_token', effectiveCursorStack[effectiveCursorStack.length - 1]);
      }

      const res = await fetch(`/api/admin/r2/objects?${params.toString()}`);
      const data = await res.json();
      if (data.code !== 0) {
        toast.error(data.message || '获取文件列表失败');
        return;
      }
      const list = data.data?.items || data.data?.list || data.data || [];
      setItems(Array.isArray(list) ? list : []);

      if (kw) {
        setKeywordPager(data.data?.pager ?? null);
        setScanTruncated(Boolean(data.data?.scan_truncated));
        setNextContinuationToken(null);
      } else {
        setKeywordPager(null);
        setScanTruncated(false);
        setNextContinuationToken(
          typeof data.data?.next_continuation_token === 'string'
            ? data.data.next_continuation_token
            : null
        );
      }
    } catch {
      toast.error('获取文件列表失败');
    } finally {
      setLoading(false);
    }
  }, [bucket, keyword, keywordPage, cursorStack]);

  useEffect(() => {
    fetchObjects();
  }, [fetchObjects]);

  const goNextCursorPage = () => {
    if (!nextContinuationToken) return;
    setCursorStack((s) => [...s, nextContinuationToken]);
  };

  const goPrevCursorPage = () => {
    setCursorStack((s) => (s.length > 0 ? s.slice(0, -1) : s));
  };

  const resetCursorPagination = () => {
    setCursorStack([]);
  };

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
    const batch = uploadItems;
    let allSuccess = true;
    try {
      for (const item of batch) {
        setUploadItems((prev) =>
          prev.map((x) => (x.id === item.id ? { ...x, status: 'uploading', error: '' } : x))
        );
        try {
          const fd = new FormData();
          fd.set('bucket', bucket);
          fd.set('key', item.file.name);
          fd.set('file', item.file);

          const uploadRes = await fetch('/api/admin/r2/upload', {
            method: 'POST',
            body: fd
          });
          const uploadData = await uploadRes.json();
          if (uploadData.code !== 0) {
            throw new Error(uploadData.message || '上传失败');
          }

          setUploadItems((prev) =>
            prev.map((x) => (x.id === item.id ? { ...x, status: 'success' } : x))
          );
        } catch (error) {
          allSuccess = false;
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
      if (allSuccess) {
        setUploadItems((prev) => {
          prev.forEach((x) => {
            if (x.preview) URL.revokeObjectURL(x.preview);
          });
          return [];
        });
        setFileInputNonce((n) => n + 1);
        toast.success('上传完成');
      } else {
        toast.error('部分文件上传失败，请查看列表后重试');
      }
    } finally {
      setUploading(false);
    }
  };

  const getDownloadUrl = useCallback(
    async (key: string) => fetchPresignedDownloadUrl(bucket, key),
    [bucket]
  );

  const handleOpenPreview = async (obj: StorageObjectItem) => {
    const publicUrl = buildPublicObjectUrlForBucket(bucket, obj.key);
    if (publicUrl) {
      setPreviewTitle(obj.key);
      setPreviewUrl(publicUrl);
      setPreviewContentType(obj.content_type);
      setPreviewDialogOpen(true);
      return;
    }
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

  const copyTextToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('已复制到剪贴板');
    } catch {
      toast.error('复制失败，请检查浏览器权限');
    }
  };

  /**
   * 复制图片地址：若该 bucket 在配置里填了 publicBaseUrl（自定义域），复制稳定公共 URL；
   * 否则复制 R2 预签名链接（约 15 分钟有效，直连 cloudflarestorage.com）。
   */
  const handleCopyImageUrl = async (obj: StorageObjectItem) => {
    const publicUrl = buildPublicObjectUrlForBucket(bucket, obj.key);
    if (publicUrl) {
      await copyTextToClipboard(publicUrl);
      return;
    }
    try {
      const url = await getDownloadUrl(obj.key);
      await copyTextToClipboard(url);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '获取链接失败');
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
            <CardTitle>文件上传</CardTitle>
            <p className='text-muted-foreground text-sm font-normal'>
              经后台转发至 R2，无需在桶上为管理后台配置 CORS。超大文件受网关/部署平台的请求体上限限制。
            </p>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='flex flex-wrap items-center gap-3'>
              <Input
                key={fileInputNonce}
                type='file'
                multiple
                onChange={(e) => handleUploadFileSelect(e.target.files)}
              />
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
            <p className='text-muted-foreground text-sm font-normal'>
              已为配置公共自定义域的 bucket（如 pigbagames）优先复制{' '}
              <code className='bg-muted rounded px-1 text-xs'>https://storage…/对象 key</code>{' '}
              形式的稳定链接；未配置的 bucket 仍复制带过期的 R2 预签名 URL。
            </p>
            {keyword.trim() && scanTruncated ? (
              <p className='text-amber-600 dark:text-amber-500 text-sm font-normal'>
                当前关键词仅在单次扫描的前 1000 个对象中匹配；若未找到目标文件，请缩小 key 范围或清空关键词翻页浏览。
              </p>
            ) : null}
          </CardHeader>
          <CardContent className='p-0'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-[72px]'>预览</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>大小</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>更新时间</TableHead>
                  <TableHead className='min-w-[280px]'>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className='py-8 text-center'>
                      加载中...
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className='py-8 text-center text-muted-foreground'>
                      暂无文件
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((obj) => (
                    <TableRow key={obj.key}>
                      <TableCell className='align-middle'>
                        <ObjectListPreviewCell
                          bucket={bucket}
                          obj={obj}
                          onOpenPreview={handleOpenPreview}
                        />
                      </TableCell>
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
                          {isImageFile(obj.key, obj.content_type) ? (
                            <Button size='sm' variant='outline' onClick={() => handleCopyImageUrl(obj)}>
                              <Copy className='mr-1 h-3 w-3' />
                              复制地址
                            </Button>
                          ) : null}
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
            <div className='text-muted-foreground flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-sm'>
              <div>
                {keyword.trim() && keywordPager ? (
                  <>
                    第 {keywordPager.page} / {keywordPager.total_pages} 页，共 {keywordPager.total} 条
                  </>
                ) : (
                  <>
                    本页 {items.length} 条
                    {cursorStack.length > 0 ? ` · 已向后翻 ${cursorStack.length} 页` : null}
                    {nextContinuationToken
                      ? ' · 后面还有数据'
                      : !keyword.trim() && items.length > 0
                        ? ' · 当前段已无更多'
                        : null}
                  </>
                )}
              </div>
              <div className='flex flex-wrap items-center gap-2'>
                {keyword.trim() && keywordPager ? (
                  <>
                    <Button
                      size='sm'
                      variant='outline'
                      disabled={loading || keywordPager.page <= 1}
                      onClick={() => setKeywordPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className='mr-1 h-4 w-4' />
                      上一页
                    </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      disabled={loading || keywordPager.page >= keywordPager.total_pages}
                      onClick={() => setKeywordPage((p) => p + 1)}
                    >
                      下一页
                      <ChevronRight className='ml-1 h-4 w-4' />
                    </Button>
                  </>
                ) : !keyword.trim() ? (
                  <>
                    <Button
                      size='sm'
                      variant='outline'
                      disabled={loading || cursorStack.length === 0}
                      onClick={goPrevCursorPage}
                    >
                      <ChevronLeft className='mr-1 h-4 w-4' />
                      上一页
                    </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      disabled={loading || !nextContinuationToken}
                      onClick={goNextCursorPage}
                    >
                      下一页
                      <ChevronRight className='ml-1 h-4 w-4' />
                    </Button>
                    {cursorStack.length > 0 ? (
                      <Button size='sm' variant='ghost' disabled={loading} onClick={resetCursorPagination}>
                        回到首页
                      </Button>
                    ) : null}
                  </>
                ) : null}
              </div>
            </div>
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
          <DialogFooter className='flex-wrap gap-2 sm:justify-end'>
            <Button variant='outline' onClick={() => setPreviewDialogOpen(false)}>
              关闭
            </Button>
            {previewUrl && isImageFile(previewTitle, previewContentType) ? (
              <Button
                variant='outline'
                onClick={() => copyTextToClipboard(previewUrl)}
              >
                <Copy className='mr-2 h-4 w-4' />
                复制图片地址
              </Button>
            ) : null}
            {previewUrl ? (
              <Button onClick={() => window.open(previewUrl, '_blank', 'noopener,noreferrer')}>在新窗口打开</Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

