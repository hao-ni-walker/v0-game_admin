/**
 * 初始化超级管理员角色、权限与管理员账号（基于仓储 + JSON）
 * - 去除 drizzle/mysql 依赖
 * - 采用“存在则跳过”的增量初始化策略，避免清空现有数据
 */

import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
// 从配置读取默认管理员信息
import { surperAdmin } from '../src/config/surper-admin';
// 仓储入口（JSON 持久化）
import { getRepositories } from '../src/repository';

dotenv.config();

/** 基础权限清单（可根据需要扩展/调整） */
const permissionList = [
  // 系统管理 - 账号
  { id: 1, name: '账号管理', code: 'account', description: '账号管理相关权限', parentId: null, sortOrder: 100 },
  { id: 11, name: '用户管理', code: 'account.user', description: '用户管理权限', parentId: 1, sortOrder: 110 },
  { id: 111, name: '查看用户', code: 'account.user.read', description: '查看用户列表和详情', parentId: 11, sortOrder: 111 },
  { id: 112, name: '新增用户', code: 'account.user.create', description: '创建新用户', parentId: 11, sortOrder: 112 },
  { id: 113, name: '编辑用户', code: 'account.user.update', description: '编辑用户信息', parentId: 11, sortOrder: 113 },
  { id: 114, name: '删除用户', code: 'account.user.delete', description: '删除用户', parentId: 11, sortOrder: 114 },

  { id: 12, name: '角色管理', code: 'account.role', description: '角色管理权限', parentId: 1, sortOrder: 120 },
  { id: 121, name: '查看角色', code: 'account.role.read', description: '查看角色列表和详情', parentId: 12, sortOrder: 121 },
  { id: 122, name: '新增角色', code: 'account.role.create', description: '创建新角色', parentId: 12, sortOrder: 122 },
  { id: 123, name: '编辑角色', code: 'account.role.update', description: '编辑角色信息', parentId: 12, sortOrder: 123 },
  { id: 124, name: '删除角色', code: 'account.role.delete', description: '删除角色', parentId: 12, sortOrder: 124 },
  { id: 125, name: '分配权限', code: 'account.role.assign', description: '给角色分配权限', parentId: 12, sortOrder: 125 },

  { id: 13, name: '权限管理', code: 'account.permission', description: '权限管理权限', parentId: 1, sortOrder: 130 },
  { id: 131, name: '查看权限', code: 'account.permission.read', description: '查看权限列表和详情', parentId: 13, sortOrder: 131 },
  { id: 132, name: '新增权限', code: 'account.permission.create', description: '创建新权限', parentId: 13, sortOrder: 132 },
  { id: 133, name: '编辑权限', code: 'account.permission.update', description: '编辑权限信息', parentId: 13, sortOrder: 133 },
  { id: 134, name: '删除权限', code: 'account.permission.delete', description: '删除权限', parentId: 13, sortOrder: 134 },

  // 系统管理 - 日志
  { id: 2, name: '系统管理', code: 'system', description: '系统管理权限', parentId: null, sortOrder: 200 },
  { id: 21, name: '日志管理', code: 'system.log', description: '日志管理权限', parentId: 2, sortOrder: 210 },
  { id: 211, name: '查看日志', code: 'system.log.read', description: '查看日志列表和详情', parentId: 21, sortOrder: 211 },
  { id: 212, name: '新增日志', code: 'system.log.create', description: '创建新日志', parentId: 21, sortOrder: 212 },
  { id: 213, name: '编辑日志', code: 'system.log.update', description: '编辑日志信息', parentId: 21, sortOrder: 213 },
  { id: 214, name: '删除日志', code: 'system.log.delete', description: '删除日志', parentId: 21, sortOrder: 214 }
];

/**
 * 确保存在“超级管理员”角色（isSuper=true）
 * - 若不存在则创建
 */
async function ensureSuperAdminRole() {
  const repos = await getRepositories();
  const existing = await repos.roles.findByName('超级管理员');
  if (existing) {
    console.log('超级管理员角色已存在');
    return existing.id;
  }
  const id = await repos.roles.create({
    name: '超级管理员',
    description: '系统超级管理员，拥有所有权限',
    isSuper: true
  });
  console.log('超级管理员角色创建成功:', id);
  return id;
}

/**
 * 确保基础权限集合
 * - 按 code 去重创建；不清空已有权限，避免破坏现有数据
 * - 返回已确保存在的权限 ID 集合
 */
async function ensureBasePermissions(): Promise<number[]> {
  const repos = await getRepositories();
  const ensuredIds: number[] = [];

  for (const p of permissionList) {
    const existing = await repos.permissions.findByCode(p.code);
    if (existing) {
      ensuredIds.push(existing.id);
      continue;
    }
    const id = await repos.permissions.create({
      name: p.name,
      code: p.code,
      description: p.description,
      parentId: p.parentId as number | null | undefined,
      sortOrder: p.sortOrder
    });
    ensuredIds.push(id);
  }

  console.log(`基础权限已确保，共 ${ensuredIds.length} 项`);
  return ensuredIds;
}

/**
 * 确保角色-权限关联
 */
async function ensureRolePermissions(roleId: number, permissionIds: number[]) {
  const repos = await getRepositories();
  let added = 0;
  for (const pid of permissionIds) {
    const before = await repos.rolePermissions.listByRole(roleId);
    const exists = before.find((rp) => rp.permissionId === pid);
    if (!exists) {
      await repos.rolePermissions.add(roleId, pid);
      added++;
    }
  }
  console.log(`角色权限已确保，新增关联 ${added} 条`);
}

/**
 * 确保超级管理员账号
 * - email/username 唯一性校验
 */
async function ensureSuperAdminUser(roleId: number) {
  const repos = await getRepositories();

  const adminEmail = surperAdmin.email;
  const adminName = surperAdmin.username;
  const passwordPlain = surperAdmin.password;

  // 如果已存在则跳过
  const byEmail = await repos.users.findByEmail(adminEmail);
  const byName = await repos.users.findByUsername(adminName);
  if (byEmail || byName) {
    console.log('超级管理员账号已存在');
    return;
  }

  const saltRounds = Number(process.env.SALT_ROUNDS || 12);
  const password = await bcrypt.hash(passwordPlain, saltRounds);

  await repos.users.create({
    email: adminEmail,
    username: adminName,
    password,
    avatar: '/avatars/admin.jpg',
    roleId,
    status: 'active',
    isSuperAdmin: true
  });

  console.log('超级管理员账号创建成功！');
  console.log('邮箱:', adminEmail);
  console.log('用户名:', adminName);
}

/** 主流程 */
async function main() {
  try {
    console.log('开始初始化系统...');
    const roleId = await ensureSuperAdminRole();
    const permIds = await ensureBasePermissions();
    await ensureRolePermissions(roleId, permIds);
    await ensureSuperAdminUser(roleId);
    console.log('系统初始化完成！');
    process.exit(0);
  } catch (error) {
    console.error('初始化失败:', error);
    process.exit(1);
  }
}

main();