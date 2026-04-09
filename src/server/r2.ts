import 'server-only';

import { S3Client } from '@aws-sdk/client-s3';

function requireEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`缺少环境变量: ${name}`);
  return v;
}

export function getR2Client() {
  const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
  const endpoint =
    process.env.CLOUDFLARE_R2_ENDPOINT ||
    (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined);

  if (!endpoint) {
    throw new Error('缺少 Cloudflare R2 endpoint（请设置 CLOUDFLARE_R2_ENDPOINT 或 CLOUDFLARE_R2_ACCOUNT_ID）');
  }

  return new S3Client({
    region: process.env.CLOUDFLARE_R2_REGION || 'auto',
    endpoint,
    credentials: {
      accessKeyId: requireEnv('CLOUDFLARE_R2_ACCESS_KEY_ID'),
      secretAccessKey: requireEnv('CLOUDFLARE_R2_SECRET_ACCESS_KEY')
    }
  });
}

