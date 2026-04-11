import { NextRequest } from 'next/server';
import {
  ListObjectsV2Command,
  type ListObjectsV2CommandInput,
  HeadObjectCommand
} from '@aws-sdk/client-s3';
import { getR2ClientForBucket } from '@/server/r2';
import { errorResponse, successResponse } from '@/service/response';
import { STORAGE_BUCKETS } from '@/constants/storage-buckets';

function ensureAllowedBucket(bucket: string) {
  if (!bucket) throw new Error('bucket 不能为空');
  if (STORAGE_BUCKETS.length === 0) return bucket;
  const ok = STORAGE_BUCKETS.some((b) => b.name === bucket);
  if (!ok) throw new Error(`bucket 不在允许列表中: ${bucket}`);
  return bucket;
}

const HEAD_CAP = 200;

async function attachContentTypes(
  s3: ReturnType<typeof getR2ClientForBucket>,
  bucket: string,
  keys: { key: string; size: number; updated_at?: string; etag?: string }[]
) {
  const headSlice = keys.slice(0, HEAD_CAP);
  const withContentType = await Promise.all(
    headSlice.map(async (x) => {
      try {
        const head = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: x.key }));
        return { ...x, content_type: head.ContentType };
      } catch {
        return x;
      }
    })
  );
  return [...withContentType, ...keys.slice(HEAD_CAP)];
}

/**
 * GET
 * - 无 keyword：S3 原分页，参数 continuation_token（可选）、page_size（默认 50，最大 100）
 * - 有 keyword：单次最多列举 1000 个对象后内存过滤，再按 page / page_size 切片（桶很大时可能不全）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bucket = ensureAllowedBucket(searchParams.get('bucket') || '');
    const keyword = (searchParams.get('keyword') || '').trim();
    const pageSize = Math.min(Math.max(parseInt(searchParams.get('page_size') || '50', 10), 1), 100);

    const s3 = getR2ClientForBucket(bucket);

    if (keyword) {
      const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
      const cmd = new ListObjectsV2Command({
        Bucket: bucket,
        MaxKeys: 1000
      });
      const res = await s3.send(cmd);

      const raw = (res.Contents || [])
        .map((obj) => ({
          key: obj.Key || '',
          size: obj.Size || 0,
          updated_at: obj.LastModified ? obj.LastModified.toISOString() : undefined,
          etag: obj.ETag
        }))
        .filter((x) => x.key);

      const filtered = raw.filter((x) => x.key.includes(keyword));
      const offset = (page - 1) * pageSize;
      const pageKeys = filtered.slice(offset, offset + pageSize);
      const items = await attachContentTypes(s3, bucket, pageKeys);

      const total = filtered.length;
      const totalPages = Math.max(1, Math.ceil(total / pageSize));

      return successResponse({
        items,
        pager: {
          page,
          page_size: pageSize,
          total,
          total_pages: totalPages
        },
        /** S3 单次只拉取了 1000 条，桶内可能还有更多未扫描 */
        scan_truncated: Boolean(res.IsTruncated),
        next_continuation_token: null,
        is_truncated: false
      });
    }

    const continuationToken = searchParams.get('continuation_token') || undefined;
    const input: ListObjectsV2CommandInput = {
      Bucket: bucket,
      MaxKeys: pageSize
    };
    if (continuationToken) {
      input.ContinuationToken = continuationToken;
    }

    const res = await s3.send(new ListObjectsV2Command(input));

    const keys = (res.Contents || [])
      .map((obj) => ({
        key: obj.Key || '',
        size: obj.Size || 0,
        updated_at: obj.LastModified ? obj.LastModified.toISOString() : undefined,
        etag: obj.ETag
      }))
      .filter((x) => x.key);

    const items = await attachContentTypes(s3, bucket, keys);

    return successResponse({
      items,
      pager: null,
      scan_truncated: false,
      next_continuation_token: res.NextContinuationToken ?? null,
      is_truncated: Boolean(res.IsTruncated)
    });
  } catch (error) {
    return errorResponse(`获取对象列表失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}
