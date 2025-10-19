// 通用 JSON 存储：目录与文件初始化、读取、原子写入
// 说明：为了简单与稳健，采用写入临时文件后 rename 的方式实现原子替换

import { promises as fs } from 'fs';
import * as path from 'path';

export interface JsonStoreOptions {
  baseDir?: string; // 默认 process.env.DATA_DIR || {cwd}/data
}

export class JsonStore {
  private baseDir: string;

  constructor(options?: JsonStoreOptions) {
    const fallback = path.join(process.cwd(), 'data');
    this.baseDir = options?.baseDir || process.env.DATA_DIR || fallback;
  }

  // 确保目录存在
  async ensureDir(): Promise<void> {
    await fs.mkdir(this.baseDir, { recursive: true });
  }

  // 读取 JSON 文件，若不存在则写入默认值
  async readJson<T>(fileName: string, defaultValue: T): Promise<T> {
    await this.ensureDir();
    const filePath = path.join(this.baseDir, fileName);
    try {
      const buf = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(buf) as T;
    } catch (e: any) {
      if (e && (e.code === 'ENOENT' || e.code === 'ENOTDIR')) {
        await this.writeJson(fileName, defaultValue);
        return defaultValue;
      }
      throw e;
    }
  }

  // 原子写入：写入 .tmp 然后 rename
  async writeJson<T>(fileName: string, data: T): Promise<void> {
    await this.ensureDir();
    const filePath = path.join(this.baseDir, fileName);
    const tmpPath = filePath + '.tmp';
    const json = JSON.stringify(data, null, 2);
    await fs.writeFile(tmpPath, json, 'utf-8');
    await fs.rename(tmpPath, filePath);
  }
}