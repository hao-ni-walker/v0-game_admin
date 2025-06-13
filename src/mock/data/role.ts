// 角色数据接口（基于数据库schema）
export interface MockRole {
  id: number;
  name: string;
  isSuper: boolean;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  // 关联数据
  userCount?: number;
}

// Mock 角色数据
export const mockRoles: MockRole[] = [
  {
    id: 1,
    name: 'admin',
    isSuper: true,
    description: '系统管理员，拥有所有权限',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
    userCount: 1
  },
  {
    id: 2,
    name: 'editor',
    isSuper: false,
    description: '内容编辑者，可以管理内容',
    createdAt: '2023-01-02T00:00:00.000Z',
    updatedAt: '2023-01-02T00:00:00.000Z',
    userCount: 12
  },
  {
    id: 3,
    name: 'user',
    isSuper: false,
    description: '普通用户，基础权限',
    createdAt: '2023-01-03T00:00:00.000Z',
    updatedAt: '2023-01-03T00:00:00.000Z',
    userCount: 25
  },
  {
    id: 4,
    name: 'viewer',
    isSuper: false,
    description: '只读权限用户',
    createdAt: '2023-01-04T00:00:00.000Z',
    updatedAt: '2023-01-04T00:00:00.000Z',
    userCount: 8
  }
];

// 获取角色的最大 ID
export function getNextRoleId(): number {
  return Math.max(...mockRoles.map((r) => r.id)) + 1;
}

// 根据 ID 查找角色
export function findRoleById(id: number): MockRole | undefined {
  return mockRoles.find((role) => role.id === id);
}

// 根据名称查找角色
export function findRoleByName(name: string): MockRole | undefined {
  return mockRoles.find((role) => role.name === name);
}

// 检查角色名是否已存在
export function isRoleNameExist(name: string, excludeId?: number): boolean {
  return mockRoles.some((role) => role.name === name && role.id !== excludeId);
}

// 获取角色标签列表（用于下拉选择）
export function getRoleLabels() {
  return mockRoles.map((role) => ({
    id: role.id,
    name: role.name,
    description: role.description
  }));
}
