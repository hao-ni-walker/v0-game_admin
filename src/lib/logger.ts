import { headers } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import { getRepositories } from '@/repository';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogData {
  level: LogLevel;
  action: string;
  module: string;
  message: string;
  details?: Record<string, any>;
  userId?: number;
  duration?: number;
}

/**
 * 记录系统日志
 */
export async function createLog(data: LogData) {
  try {
    const headersList = headers();
    const userAgent = (await headersList).get('user-agent') || undefined;
    const forwardedFor = (await headersList).get('x-forwarded-for');
    const realIp = (await headersList).get('x-real-ip');
    const ip =
      forwardedFor?.split(',')[0] ||
      realIp ||
      (await headersList).get('host') ||
      'unknown';

    const requestId = uuidv4();

    const repos = await getRepositories();
    await repos.logs.append({
      level: data.level,
      action: data.action,
      module: data.module,
      message: data.message,
      details: data.details || undefined,
      userId: data.userId,
      userAgent,
      ip,
      requestId,
      duration: data.duration
    });
  } catch (error) {
    console.error('Failed to create log:', error);
  }
}

/**
 * Logger实例缓存
 */
const loggerCache = new Map<string, Logger>();

/**
 * 日志记录器类
 */
export class Logger {
  private module: string;
  private userId?: number;

  constructor(module: string, userId?: number) {
    this.module = module;
    this.userId = userId;
  }

  async info(action: string, message: string, details?: Record<string, any>) {
    await createLog({
      level: 'info',
      action,
      module: this.module,
      message,
      details,
      userId: this.userId
    });
  }

  async warn(action: string, message: string, details?: Record<string, any>) {
    await createLog({
      level: 'warn',
      action,
      module: this.module,
      message,
      details,
      userId: this.userId
    });
  }

  async error(action: string, message: string, details?: Record<string, any>) {
    await createLog({
      level: 'error',
      action,
      module: this.module,
      message,
      details,
      userId: this.userId
    });
  }

  async debug(action: string, message: string, details?: Record<string, any>) {
    await createLog({
      level: 'debug',
      action,
      module: this.module,
      message,
      details,
      userId: this.userId
    });
  }
}

/**
 * Logger工厂 - 创建或获取缓存的Logger实例
 */
export function getLogger(module: string, userId?: number): Logger {
  const cacheKey = `${module}_${userId || 'anonymous'}`;

  if (!loggerCache.has(cacheKey)) {
    loggerCache.set(cacheKey, new Logger(module, userId));
  }

  return loggerCache.get(cacheKey)!;
}

/**
 * 快捷日志记录函数 - 扩展版，支持自定义模块
 */
export const logger = {
  /**
   * 直接记录日志，无需创建Logger实例
   */
  info: (
    module: string,
    action: string,
    message: string,
    details?: Record<string, any>,
    userId?: number
  ) =>
    createLog({
      level: 'info',
      action,
      module,
      message,
      details,
      userId
    }),

  warn: (
    module: string,
    action: string,
    message: string,
    details?: Record<string, any>,
    userId?: number
  ) =>
    createLog({
      level: 'warn',
      action,
      module,
      message,
      details,
      userId
    }),

  error: (
    module: string,
    action: string,
    message: string,
    details?: Record<string, any>,
    userId?: number
  ) =>
    createLog({
      level: 'error',
      action,
      module,
      message,
      details,
      userId
    }),

  debug: (
    module: string,
    action: string,
    message: string,
    details?: Record<string, any>,
    userId?: number
  ) =>
    createLog({
      level: 'debug',
      action,
      module,
      message,
      details,
      userId
    }),

  /**
   * 获取模块专用的logger实例
   */
  for: (module: string, userId?: number) => getLogger(module, userId)
};

/**
 * 快捷日志记录函数 - 保持向后兼容
 */
export const log = {
  info: (
    action: string,
    message: string,
    details?: Record<string, any>,
    userId?: number
  ) =>
    createLog({
      level: 'info',
      action,
      module: 'system',
      message,
      details,
      userId
    }),

  warn: (
    action: string,
    message: string,
    details?: Record<string, any>,
    userId?: number
  ) =>
    createLog({
      level: 'warn',
      action,
      module: 'system',
      message,
      details,
      userId
    }),

  error: (
    action: string,
    message: string,
    details?: Record<string, any>,
    userId?: number
  ) =>
    createLog({
      level: 'error',
      action,
      module: 'system',
      message,
      details,
      userId
    }),

  debug: (
    action: string,
    message: string,
    details?: Record<string, any>,
    userId?: number
  ) =>
    createLog({
      level: 'debug',
      action,
      module: 'system',
      message,
      details,
      userId
    })
};

/**
 * 性能监控装饰器
 */
export function withPerformanceLog(
  module: string,
  action: string,
  userId?: number
) {
  return function <T extends (...args: any[]) => Promise<any>>(
    target: any,
    propertyName: string,
    descriptor: TypedPropertyDescriptor<T>
  ) {
    const method = descriptor.value!;

    descriptor.value = async function (this: any, ...args: any[]) {
      const startTime = Date.now();
      try {
        const result = await method.apply(this, args);
        const duration = Date.now() - startTime;

        await createLog({
          level: 'info',
          action,
          module,
          message: `${action} completed successfully`,
          details: { args: args.length },
          userId,
          duration
        });

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;

        await createLog({
          level: 'error',
          action,
          module,
          message: `${action} failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          details: {
            error: error instanceof Error ? error.stack : String(error),
            args: args.length
          },
          userId,
          duration
        });

        throw error;
      }
    } as any;
  };
}
