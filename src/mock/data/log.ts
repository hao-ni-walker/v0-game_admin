import { faker } from '@faker-js/faker';

// 日志数据接口（基于数据库schema）
export interface MockLog {
  id: number;
  level: 'info' | 'warn' | 'error' | 'debug';
  action: string;
  module: string;
  message: string;
  details?: Record<string, any>;
  userId?: number;
  userAgent?: string;
  ip?: string;
  requestId?: string;
  duration?: number;
  createdAt: string;
}

// 日志级别配置
export const LOG_LEVELS = {
  info: { label: '信息', color: 'blue' },
  warn: { label: '警告', color: 'orange' },
  error: { label: '错误', color: 'red' },
  debug: { label: '调试', color: 'gray' }
} as const;

// 模块列表
const MODULES = [
  '用户管理',
  '角色管理',
  '权限管理',
  '登录认证',
  '系统配置',
  '数据导入',
  '文件上传',
  '邮件发送',
  '定时任务',
  'API调用'
];

// 生成日志消息模板
const LOG_MESSAGE_TEMPLATES = {
  info: [
    '用户 {username} 登录成功',
    '创建新用户 {username}',
    '更新用户信息',
    '导出数据报表',
    '发送邮件通知',
    '执行定时任务',
    '系统配置更新',
    '文件上传成功'
  ],
  warn: [
    '用户 {username} 登录失败，密码错误',
    '磁盘空间不足，使用率超过80%',
    'API调用频率过高',
    '邮件发送失败，重试中',
    '数据库连接缓慢',
    '文件大小超出限制',
    '缓存清理延迟',
    '第三方服务响应慢'
  ],
  error: [
    '数据库连接失败',
    '文件上传失败，磁盘空间不足',
    '邮件服务器连接超时',
    '用户权限验证失败',
    'API调用异常，服务不可用',
    '数据导入失败，格式错误',
    '系统内存溢出',
    '配置文件解析错误'
  ],
  debug: [
    'SQL查询执行：SELECT * FROM users',
    '缓存命中率：85%',
    'Redis连接状态：正常',
    '请求处理时间：125ms',
    '内存使用情况：2.5GB/8GB',
    '文件系统检查完成',
    '定时任务调度器启动',
    '会话清理完成'
  ]
};

// 生成随机日志消息
function generateLogMessage(level: keyof typeof LOG_MESSAGE_TEMPLATES): string {
  const templates = LOG_MESSAGE_TEMPLATES[level];
  const template = faker.helpers.arrayElement(templates);

  return template.replace(/\{(\w+)\}/g, (match, key) => {
    switch (key) {
      case 'username':
        return faker.person.fullName();
      case 'email':
        return faker.internet.email();
      case 'count':
        return faker.number.int({ min: 1, max: 100 }).toString();
      default:
        return match;
    }
  });
}

// 生成 Mock 日志数据
export function generateMockLogs(count: number = 100): MockLog[] {
  const actions = [
    'login',
    'logout',
    'create',
    'update',
    'delete',
    'read',
    'export',
    'import',
    'upload',
    'download'
  ];

  return Array.from({ length: count }, (_, index) => {
    const level = faker.helpers.arrayElement([
      'info',
      'warn',
      'error',
      'debug'
    ] as const);
    const hasUser = faker.datatype.boolean({ probability: 0.7 });
    const action = faker.helpers.arrayElement(actions);

    return {
      id: index + 1,
      level,
      action,
      module: faker.helpers.arrayElement(MODULES),
      message: generateLogMessage(level),
      details: faker.datatype.boolean({ probability: 0.3 })
        ? {
            responseTime: faker.number.int({ min: 10, max: 2000 }),
            statusCode: faker.helpers.arrayElement([
              200, 201, 400, 401, 403, 404, 500
            ]),
            path: faker.helpers.arrayElement([
              '/api/users',
              '/api/roles',
              '/api/permissions',
              '/api/auth/login',
              '/api/dashboard'
            ])
          }
        : undefined,
      userId: hasUser ? faker.number.int({ min: 1, max: 50 }) : undefined,
      userAgent: faker.internet.userAgent(),
      ip: faker.internet.ip(),
      requestId: faker.string.uuid(),
      duration: faker.number.int({ min: 50, max: 3000 }),
      createdAt: faker.date.past({ years: 1 }).toISOString()
    };
  });
}

// Mock 日志数据
export const mockLogs = generateMockLogs(200);

// 获取日志统计数据
export function getLogStats(logs: MockLog[] = mockLogs) {
  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const todayLogs = logs.filter((log) => new Date(log.createdAt) >= todayStart);

  const levelCounts = logs.reduce(
    (acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // 生成最近7天的趋势数据
  const weeklyTrend = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayStart = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const dayLogs = logs.filter((log) => {
      const logDate = new Date(log.createdAt);
      return logDate >= dayStart && logDate < dayEnd;
    });

    return {
      date: date.toISOString().split('T')[0],
      count: dayLogs.length,
      info: dayLogs.filter((l) => l.level === 'info').length,
      warn: dayLogs.filter((l) => l.level === 'warn').length,
      error: dayLogs.filter((l) => l.level === 'error').length,
      debug: dayLogs.filter((l) => l.level === 'debug').length
    };
  }).reverse();

  return {
    total: logs.length,
    todayCount: todayLogs.length,
    ...levelCounts,
    weeklyTrend
  };
}

// 根据条件过滤日志
export function filterLogs(
  logs: MockLog[],
  filters: {
    level?: string;
    module?: string;
    userId?: number;
    startDate?: string;
    endDate?: string;
    search?: string;
  }
): MockLog[] {
  return logs.filter((log) => {
    if (filters.level && log.level !== filters.level) return false;
    if (filters.module && log.module !== filters.module) return false;
    if (filters.userId && log.userId !== filters.userId) return false;

    if (filters.startDate) {
      const start = new Date(filters.startDate);
      if (new Date(log.createdAt) < start) return false;
    }

    if (filters.endDate) {
      const end = new Date(filters.endDate);
      if (new Date(log.createdAt) > end) return false;
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        log.message.toLowerCase().includes(searchTerm) ||
        log.module.toLowerCase().includes(searchTerm) ||
        log.action.toLowerCase().includes(searchTerm)
      );
    }

    return true;
  });
}
