// 仓储单例入口:按需初始化一次,后续直接复用。
// 生产环境(ADMIN_DATABASE_URL 存在)用 PG 实现;否则回落到 JSON 文件实现。
import type { Repositories } from './interfaces';

let reposPromise: Promise<Repositories> | null = null;

export function getRepositories(): Promise<Repositories> {
  if (!reposPromise) {
    reposPromise = createRepositories();
  }
  return reposPromise;
}

async function createRepositories(): Promise<Repositories> {
  if (process.env.ADMIN_DATABASE_URL) {
    const { createPgRepositories } = await import('./impl/pgRepos');
    return createPgRepositories();
  }
  const { createJsonRepositories } = await import('./impl/jsonRepos');
  return createJsonRepositories();
}
