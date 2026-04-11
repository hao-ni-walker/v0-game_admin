import { NextRequest } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
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

function assertSafeObjectKey(key: string) {
  if (!key.trim()) throw new Error('key 不能为空');
  if (key.startsWith('/') || key.includes('..')) {
    throw new Error('key 不合法');
  }
}

/** 经服务端转发上传到 R2，避免浏览器直连 R2 时的 CORS / 预签名 Header 不一致等问题 */
export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const bucket = ensureAllowedBucket(String(form.get('bucket') || ''));
    const key = String(form.get('key') || '').trim();
    assertSafeObjectKey(key);

    const file = form.get('file');
    if (!(file instanceof Blob)) {
      return errorResponse('请上传文件字段 file');
    }

    const contentType =
      (file instanceof File && file.type?.trim()) || 'application/octet-stream';
    const body = new Uint8Array(await file.arrayBuffer());

    const s3 = getR2ClientForBucket(bucket);
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType
      })
    );

    return successResponse({ key, size: body.byteLength, content_type: contentType });
  } catch (error) {
    return errorResponse(
      `上传失败: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export const maxDuration = 120;
