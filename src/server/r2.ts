import 'server-only';

import { S3Client } from '@aws-sdk/client-s3';
import { getR2ProfileForBucket } from '@/constants/storage-buckets';

/** 读 R2 相关环境变量：优先 `CLOUDFLARE_R2_<profile>_<name>`，否则 `CLOUDFLARE_R2_<name>` */
function envR2(name: string, profile?: string): string | undefined {
  if (profile) {
    const prefixed = process.env[`CLOUDFLARE_R2_${profile}_${name}`];
    if (prefixed !== undefined && prefixed !== '') {
      return prefixed;
    }
  }
  const v = process.env[`CLOUDFLARE_R2_${name}`];
  return v !== undefined && v !== '' ? v : undefined;
}

function requireR2Env(name: string, profile?: string): string {
  const v = envR2(name, profile);
  if (!v) {
    const hint = profile
      ? `CLOUDFLARE_R2_${profile}_${name}（或回退 CLOUDFLARE_R2_${name}）`
      : `CLOUDFLARE_R2_${name}`;
    throw new Error(`缺少 Cloudflare R2 配置: ${hint}`);
  }
  return v;
}

function createR2Client(profile?: string): S3Client {
  const accountId = envR2('ACCOUNT_ID', profile);
  const rawEndpoint =
    envR2('ENDPOINT', profile) ||
    (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined);
  const endpoint = rawEndpoint?.replace(/\/+$/, '');

  if (!endpoint) {
    const hint = profile
      ? `请设置 CLOUDFLARE_R2_${profile}_ENDPOINT 或 CLOUDFLARE_R2_${profile}_ACCOUNT_ID（或对应全局变量）`
      : '请设置 CLOUDFLARE_R2_ENDPOINT 或 CLOUDFLARE_R2_ACCOUNT_ID';
    throw new Error(`缺少 Cloudflare R2 endpoint（${hint}）`);
  }

  return new S3Client({
    region: envR2('REGION', profile) || 'auto',
    endpoint,
    // 避免虚拟主机样式 https://<bucket>.<account>.r2...（多层子域可能与证书不匹配，引发 EPROTO / handshake failure）
    forcePathStyle: true,
    credentials: {
      accessKeyId: requireR2Env('ACCESS_KEY_ID', profile),
      secretAccessKey: requireR2Env('SECRET_ACCESS_KEY', profile)
    }
  });
}

const clientCache = new Map<string, S3Client>();

function cacheKeyForProfile(profile: string | undefined): string {
  return profile ?? '__default__';
}

/**
 * 按 bucket 名解析连接配置（与 `STORAGE_BUCKETS[].r2Profile` 及环境变量对应）。
 */
export function getR2ClientForBucket(bucketName: string): S3Client {
  const profile = getR2ProfileForBucket(bucketName);
  const key = cacheKeyForProfile(profile);
  let client = clientCache.get(key);
  if (!client) {
    client = createR2Client(profile);
    clientCache.set(key, client);
  }
  return client;
}

export function getR2PresignExpiresSeconds(bucketName: string): number {
  const profile = bucketName ? getR2ProfileForBucket(bucketName) : undefined;
  const raw = envR2('PRESIGN_EXPIRES', profile);
  const n = Number(raw ?? 900);
  return Number.isFinite(n) && n > 0 ? n : 900;
}
