import { NextRequest } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getR2ClientForBucket, getR2PresignExpiresSeconds } from '@/server/r2';
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
    // 与浏览器 PUT 的 Content-Type 必须一致；未签名的 Content-Type 会导致 SignatureDoesNotMatch
    const contentType =
      typeof body.content_type === 'string' && body.content_type.trim()
        ? body.content_type.trim()
        : 'application/octet-stream';

    if (!key) return errorResponse('key 不能为空');

    const s3 = getR2ClientForBucket(bucket);
    const cmd = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType
    });
    const uploadUrl = await getSignedUrl(s3, cmd, {
      expiresIn: getR2PresignExpiresSeconds(bucket)
    });

    return successResponse({ upload_url: uploadUrl });
  } catch (error) {
    return errorResponse(`生成上传链接失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

