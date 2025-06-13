// 权限数据接口（基于数据库schema）
export interface MockPermission {
  id: number;
  name: string;
  code: string;
  description: string | null;
  parentId: number | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Mock 权限数据（基于数据库schema的层级结构）
export const mockPermissions: MockPermission[] = [
  // 顶级权限分类
  {
    id: 1,
    name: '用户管理',
    code: 'user',
    description: '用户管理相关权限',
    parentId: null,
    sortOrder: 100,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: 2,
    name: '查看用户',
    code: 'user:read',
    description: '查看用户列表和详情',
    parentId: 1,
    sortOrder: 101,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: 3,
    name: '编辑用户',
    code: 'user:write',
    description: '创建、编辑、删除用户',
    parentId: 1,
    sortOrder: 102,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  },
  // 角色管理
  {
    id: 4,
    name: '角色管理',
    code: 'role',
    description: '角色管理相关权限',
    parentId: null,
    sortOrder: 200,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: 5,
    name: '查看角色',
    code: 'role:read',
    description: '查看角色列表和详情',
    parentId: 4,
    sortOrder: 201,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: 6,
    name: '编辑角色',
    code: 'role:write',
    description: '创建、编辑、删除角色',
    parentId: 4,
    sortOrder: 202,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  },
  // 权限管理
  {
    id: 7,
    name: '权限管理',
    code: 'permission',
    description: '权限管理相关权限',
    parentId: null,
    sortOrder: 300,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: 8,
    name: '查看权限',
    code: 'permission:read',
    description: '查看权限列表和详情',
    parentId: 7,
    sortOrder: 301,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: 9,
    name: '编辑权限',
    code: 'permission:write',
    description: '创建、编辑、删除权限',
    parentId: 7,
    sortOrder: 302,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  },
  // 系统日志
  {
    id: 10,
    name: '系统日志',
    code: 'log',
    description: '系统日志相关权限',
    parentId: null,
    sortOrder: 400,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: 11,
    name: '查看日志',
    code: 'log:read',
    description: '查看系统日志',
    parentId: 10,
    sortOrder: 401,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: 12,
    name: '管理日志',
    code: 'log:write',
    description: '删除和管理系统日志',
    parentId: 10,
    sortOrder: 402,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  }
];

// 获取权限的最大 ID
export function getNextPermissionId(): number {
  return Math.max(...mockPermissions.map((p) => p.id)) + 1;
}

// 根据 ID 查找权限
export function findPermissionById(id: number): MockPermission | undefined {
  return mockPermissions.find((permission) => permission.id === id);
}

// 根据名称查找权限
export function findPermissionByName(name: string): MockPermission | undefined {
  return mockPermissions.find((permission) => permission.name === name);
}

// 检查权限名是否已存在
export function isPermissionNameExist(
  name: string,
  excludeId?: number
): boolean {
  return mockPermissions.some(
    (permission) => permission.name === name && permission.id !== excludeId
  );
}

// 根据父级ID获取子权限
export function getPermissionsByParent(
  parentId: number | null
): MockPermission[] {
  return mockPermissions.filter(
    (permission) => permission.parentId === parentId
  );
}

// 获取顶级权限分类
export function getTopLevelPermissions(): MockPermission[] {
  return mockPermissions.filter((permission) => permission.parentId === null);
}

// 获取权限树结构
export function getPermissionTree(): Array<
  MockPermission & { children: MockPermission[] }
> {
  const topLevel = getTopLevelPermissions();
  return topLevel.map((parent) => ({
    ...parent,
    children: getPermissionsByParent(parent.id)
  }));
}
