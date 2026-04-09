export type StorageBucketDef = {
  /** Cloudflare R2 bucket name */
  name: string;
  /** Sidebar/menu display title */
  title: string;
  /** Optional description */
  description?: string;
};

/**
 * 存储桶目录配置（用于“工作台 -> 存储管理”子菜单）。
 *
 * 你说“每个目录是一个 cloudflare bucket”，这里就是目录清单。
 * 后续你把 bucket 名称/显示名补齐即可，无需在页面新增配置表单。
 */
export const STORAGE_BUCKETS: StorageBucketDef[] = [
  { name: 'onlineplayslots', title: 'onlineplayslots' },
  { name: 'pigbagames', title: 'pigbagames' },
  { name: 'xreddeer', title: 'xreddeer' }
];

