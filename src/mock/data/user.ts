import { faker } from '@faker-js/faker';

// 用户数据接口（基于数据库schema）
export interface MockUser {
  id: number;
  email: string;
  username: string;
  password: string;
  avatar: string;
  roleId: number;
  isSuperAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  // 关联数据（通过join查询获得）
  role?: {
    id: number;
    name: string;
  };
}

// Mock 用户数据
export const mockUsers: MockUser[] = [
  // 超级管理员
  {
    id: 1,
    email: 'admin@example.com',
    username: 'admin',
    password: '$2a$12$rFzYB7YEhp6iHWqSkJ0sE.LkC9E7Rn5YYdI4mI9XLvJzXqGFgZ3Oy', // 123456
    avatar: '/avatars/default.jpg',
    roleId: 1,
    isSuperAdmin: true,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
    role: { id: 1, name: 'admin' }
  },
  // 普通用户数据
  ...Array.from({ length: 49 }, (_, index) => {
    const roleId = faker.helpers.arrayElement([1, 2, 3, 4]);
    const roleNames = { 1: 'admin', 2: 'editor', 3: 'user', 4: 'viewer' };

    return {
      id: index + 2,
      email: faker.internet.email(),
      username: faker.person.fullName(),
      password: '$2a$12$rFzYB7YEhp6iHWqSkJ0sE.LkC9E7Rn5YYdI4mI9XLvJzXqGFgZ3Oy', // 123456
      avatar: '/avatars/default.jpg',
      roleId,
      isSuperAdmin: false,
      createdAt: faker.date.past({ years: 2 }).toISOString(),
      updatedAt: faker.date.recent().toISOString(),
      role: {
        id: roleId,
        name: roleNames[roleId as keyof typeof roleNames]
      }
    };
  })
];

// 获取用户的最大 ID（用于创建新用户时生成 ID）
export function getNextUserId(): number {
  return Math.max(...mockUsers.map((u) => u.id)) + 1;
}

// 根据 ID 查找用户
export function findUserById(id: number): MockUser | undefined {
  return mockUsers.find((user) => user.id === id);
}

// 检查用户名是否已存在
export function isUsernameExist(username: string, excludeId?: number): boolean {
  return mockUsers.some(
    (user) => user.username === username && user.id !== excludeId
  );
}

// 检查邮箱是否已存在
export function isEmailExist(email: string, excludeId?: number): boolean {
  return mockUsers.some(
    (user) => user.email === email && user.id !== excludeId
  );
}
