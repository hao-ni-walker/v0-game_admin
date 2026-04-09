import { NextRequest } from 'next/server';
import { ListObjectsV2Command, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getR2Client } from '@/server/r2';
import { errorResponse, successResponse } from '@/service/response';
import { STORAGE_BUCKETS } from '@/constants/storage-buckets';

function ensureAllowedBucket(bucket: string) {
  if (!bucket) throw new Error('bucket 不能为空');
  if (STORAGE_BUCKETS.length === 0) return bucket;
  const ok = STORAGE_BUCKETS.some((b) => b.name === bucket);
  if (!ok) throw new Error(`bucket 不在允许列表中: ${bucket}`);
  return bucket;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bucket = ensureAllowedBucket(searchParams.get('bucket') || '');
    const keyword = (searchParams.get('keyword') || '').trim();
    const maxKeys = Math.min(Math.max(Number(searchParams.get('max_keys') || 200), 1), 1000);

    const s3 = getR2Client();
    const cmd = new ListObjectsV2Command({
      Bucket: bucket,
      MaxKeys: maxKeys
    });
    const res = await s3.send(cmd);

    const items = (res.Contents || [])
      .map((obj) => ({
        key: obj.Key || '',
        size: obj.Size || 0,
        updated_at: obj.LastModified ? obj.LastModified.toISOString() : undefined,
        etag: obj.ETag
      }))
      .filter((x) => x.key);

    const filtered = keyword ? items.filter((x) => x.key.includes(keyword)) : items;

    // 尽量补充 content-type（R2 ListObjects 不返回该字段）
    const withContentType = await Promise.all(
      filtered.slice(0, 200).map(async (x) => {
        try {
          const head = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: x.key }));
          return { ...x, content_type: head.ContentType };
        } catch {
          return x;
        }
      })
    );
    const rest = filtered.slice(withContentType.length);

    return successResponse({ items: [...withContentType, ...rest] });
  } catch (error) {
    return errorResponse(`获取对象列表失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

