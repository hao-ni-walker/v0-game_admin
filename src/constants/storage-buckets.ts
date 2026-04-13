export type StorageBucketDef = {
  /** Cloudflare R2 bucket name */
  name: string;
  /** Sidebar/menu display title */
  title: string;
  /**
   * 可选：已绑定到该 bucket 的公共访问基址（自定义域）。
   * 若填写，存储管理「复制地址」与预览将优先使用 `{publicBaseUrl}/{key 路径编码}`，
   * 而不再使用带过期时间的 R2 预签名 URL。
   */
  publicBaseUrl?: string;
  /** Optional description */
  description?: string;
  /**
   * 可选：该 bucket 使用独立的 R2 账号/密钥。
   * 填写大写字母后缀（如 ONLINEPLAYSLOTS），则读取
   * `CLOUDFLARE_R2_<后缀>_ACCOUNT_ID`、`CLOUDFLARE_R2_<后缀>_ACCESS_KEY_ID` 等；
   * 未单独配置的项会回退到全局 `CLOUDFLARE_R2_*`。
   */
  r2Profile?: string;
};

/**
 * 存储桶目录配置（用于侧边栏「存储管理」下的子菜单）。
 *
 * 你说“每个目录是一个 cloudflare bucket”，这里就是目录清单。
 * 后续你把 bucket 名称/显示名补齐即可，无需在页面新增配置表单。
 */
export const STORAGE_BUCKETS: StorageBucketDef[] = [
  {
    name: 'pigbagames',
    title: 'pigbagames',
    publicBaseUrl:
      process.env.NEXT_PUBLIC_STORAGE_PUBLIC_BASE_PIGBAGAMES?.replace(/\/+$/, '') ||
      'https://storage.pigbagames.com'
  },
  {
    name: 'xreddeer',
    title: 'xreddeer',
    publicBaseUrl:
      process.env.NEXT_PUBLIC_STORAGE_PUBLIC_BASE_XREDDEER?.replace(/\/+$/, '') ||
      'https://xreddeercasino.com'
  }
];

/**
 * 若该 bucket 配置了公共基址，返回可直接访问的对象 URL（路径分段 encodeURIComponent，与常见 CDN 行为一致）。
 */
export function buildPublicObjectUrlForBucket(bucketName: string, key: string): string | undefined {
  const def = STORAGE_BUCKETS.find((b) => b.name === bucketName);
  const base = def?.publicBaseUrl?.trim().replace(/\/+$/, '');
  if (!base) return undefined;
  const path = key.split('/').map(encodeURIComponent).join('/');
  return `${base}/${path}`;
}

/** 根据 bucket 名解析 R2 环境变量后缀（未配置则走全局 CLOUDFLARE_R2_*） */
export function getR2ProfileForBucket(bucketName: string): string | undefined {
  const def = STORAGE_BUCKETS.find((b) => b.name === bucketName);
  const p = def?.r2Profile?.trim();
  return p || undefined;
}

