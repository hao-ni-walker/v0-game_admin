import { NextRequest } from 'next/server';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const bucket = ensureAllowedBucket(String(body.bucket || ''));
    const key = String(body.key || '').trim();
    if (!key) return errorResponse('key 不能为空');

    const s3 = getR2Client();
    const cmd = new GetObjectCommand({
      Bucket: bucket,
      Key: key
    });

    const downloadUrl = await getSignedUrl(s3, cmd, {
      expiresIn: Number(process.env.CLOUDFLARE_R2_PRESIGN_EXPIRES || 900)
    });

    return successResponse({ download_url: downloadUrl });
  } catch (error) {
    return errorResponse(`生成下载链接失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

