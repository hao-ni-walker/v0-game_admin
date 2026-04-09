import { NextRequest } from 'next/server';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
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

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bucket = ensureAllowedBucket(searchParams.get('bucket') || '');
    const key = (searchParams.get('key') || '').trim();
    if (!key) return errorResponse('key 不能为空');

    const s3 = getR2Client();
    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));

    return successResponse(true);
  } catch (error) {
    return errorResponse(`删除对象失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

