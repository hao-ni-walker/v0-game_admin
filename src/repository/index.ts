// 仓储单例入口：按需初始化一次，后续直接复用
import { createJsonRepositories } from './impl/jsonRepos';
import type { Repositories } from './interfaces';

let reposPromise: Promise<Repositories> | null = null;

export function getRepositories(): Promise<Repositories> {
  if (!reposPromise) {
    reposPromise = createJsonRepositories();
  }
  return reposPromise;
}