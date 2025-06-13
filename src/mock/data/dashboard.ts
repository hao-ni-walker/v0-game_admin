import { faker } from '@faker-js/faker';
import { mockUsers } from './user';
import { mockRoles } from './role';
import { mockPermissions } from './permission';

// 仪表板统计数据接口
export interface MockDashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalRoles: number;
  totalPermissions: number;
  recentUsers: any[];
  userGrowth: {
    month: string;
    users: number;
  }[];
  systemHealth: {
    status: 'good' | 'warning' | 'error';
    cpu: number;
    memory: number;
    disk: number;
    uptime: string;
  };
  todayStats: {
    newUsers: number;
    activeUsers: number;
    logins: number;
  };
}

// Mock 仪表板数据
export const mockDashboardStats: MockDashboardStats = {
  totalUsers: mockUsers.length,
  activeUsers: mockUsers.filter((u) => !u.isSuperAdmin).length, // 非超级管理员用户数
  totalRoles: mockRoles.length,
  totalPermissions: mockPermissions.length,
  recentUsers: mockUsers.slice(0, 5),
  userGrowth: Array.from({ length: 12 }, (_, i) => ({
    month: new Date(2023, i, 1).toLocaleDateString('zh-CN', { month: 'short' }),
    users: faker.number.int({ min: 10, max: 100 })
  })),
  systemHealth: {
    status: 'good',
    cpu: faker.number.int({ min: 20, max: 80 }),
    memory: faker.number.int({ min: 30, max: 90 }),
    disk: faker.number.int({ min: 10, max: 70 }),
    uptime: '15 天 8 小时 32 分钟'
  },
  todayStats: {
    newUsers: faker.number.int({ min: 1, max: 10 }),
    activeUsers: faker.number.int({ min: 20, max: 50 }),
    logins: faker.number.int({ min: 50, max: 200 })
  }
};

// 生成用户增长数据
export function generateUserGrowthData(
  period: 'week' | 'month' | 'year' = 'month'
) {
  let length = 7;
  let dateFormat: Intl.DateTimeFormatOptions = { weekday: 'short' };

  switch (period) {
    case 'week':
      length = 7;
      dateFormat = { weekday: 'short' };
      break;
    case 'month':
      length = 30;
      dateFormat = { day: 'numeric' };
      break;
    case 'year':
      length = 12;
      dateFormat = { month: 'short' };
      break;
  }

  return Array.from({ length }, (_, i) => {
    const date = new Date();
    if (period === 'year') {
      date.setMonth(date.getMonth() - (length - 1 - i));
    } else {
      date.setDate(date.getDate() - (length - 1 - i));
    }

    return {
      date: date.toLocaleDateString('zh-CN', dateFormat),
      users: faker.number.int({ min: 5, max: 50 }),
      newUsers: faker.number.int({ min: 1, max: 10 })
    };
  });
}

// 生成系统性能数据
export function generateSystemMetrics() {
  return {
    cpu: {
      current: faker.number.int({ min: 20, max: 80 }),
      average: faker.number.int({ min: 30, max: 60 }),
      peak: faker.number.int({ min: 70, max: 95 })
    },
    memory: {
      used: faker.number.int({ min: 2, max: 8 }),
      total: 16,
      percentage: faker.number.int({ min: 30, max: 80 })
    },
    disk: {
      used: faker.number.int({ min: 50, max: 200 }),
      total: 500,
      percentage: faker.number.int({ min: 10, max: 60 })
    },
    network: {
      inbound: faker.number.float({ min: 0.1, max: 10, multipleOf: 0.1 }),
      outbound: faker.number.float({ min: 0.1, max: 5, multipleOf: 0.1 })
    }
  };
}

// 生成热门页面访问数据
export function generatePopularPages() {
  const pages = [
    { path: '/dashboard', name: '仪表板' },
    { path: '/users', name: '用户管理' },
    { path: '/roles', name: '角色管理' },
    { path: '/permissions', name: '权限管理' },
    { path: '/logs', name: '日志管理' },
    { path: '/settings', name: '系统设置' }
  ];

  return pages
    .map((page) => ({
      ...page,
      views: faker.number.int({ min: 10, max: 500 }),
      uniqueVisitors: faker.number.int({ min: 5, max: 100 }),
      avgDuration: faker.number.int({ min: 30, max: 300 }) // 秒
    }))
    .sort((a, b) => b.views - a.views);
}
