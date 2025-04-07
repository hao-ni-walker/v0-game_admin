import { db } from "../src/db";
import { users, roles, rolePermissions, permissions } from "../src/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config();

async function initSuperAdminRole() {
  console.log('开始初始化超级管理员角色...');
  
  const roleExists = await db.select().from(roles).where(eq(roles.name, '超级管理员'));
  
  if (roleExists.length === 0) {
    const [superAdminRole] = await db.insert(roles).values({
      name: '超级管理员',
      description: '系统超级管理员，拥有所有权限'
    }).$returningId();

    // 初始化基础权限
    const permissionList = [
      { name: '用户查看', code: 'user:list', description: '查看用户列表' },
      { name: '用户创建', code: 'user:create', description: '创建新用户' },
      { name: '用户编辑', code: 'user:update', description: '编辑用户信息' },
      { name: '用户删除', code: 'user:delete', description: '删除用户' },
      { name: '角色查看', code: 'role:list', description: '查看角色列表' },
      { name: '角色创建', code: 'role:create', description: '创建新角色' },
      { name: '角色编辑', code: 'role:update', description: '编辑角色信息' },
      { name: '角色删除', code: 'role:delete', description: '删除角色' },
      { name: '权限查看', code: 'permission:list', description: '查看权限列表' },
      { name: '权限分配', code: 'permission:assign', description: '为角色分配权限' }
    ];

    // 逐个插入权限并收集ID
    const insertedPermissionIds = [];
    for (const permission of permissionList) {
      const [result] = await db.insert(permissions).values(permission).$returningId();
      insertedPermissionIds.push({ id: result.id });
    }

    // 创建角色-权限关联
    await db.insert(rolePermissions).values(
      insertedPermissionIds.map(permission => ({
        roleId: superAdminRole.id,
        permissionId: permission.id
      }))
    );

    console.log('超级管理员角色创建成功！');
    return superAdminRole;
  } else {
    console.log('超级管理员角色已存在');
    return roleExists[0];
  }
}

async function initSuperAdminUser(roleId: number) {
  console.log('开始初始化超级管理员账号...');
  
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
  const saltRounds = Number(process.env.SALT_ROUNDS || 12);
  const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

  const adminExists = await db.select().from(users).where(eq(users.email, 'admin@example.com'));

  if (adminExists.length === 0) {
    await db.insert(users).values({
      email: 'admin@example.com',
      username: 'Administrator',
      password: hashedPassword,
      avatar: '/avatars/admin.jpg',
      role: roleId.toString()
    });

    console.log('超级管理员账号创建成功！');
    console.log('邮箱: admin@example.com');
    console.log('用户名: Administrator');
    console.log('请使用环境变量中配置的密码登录');
  } else {
    console.log('超级管理员账号已存在');
  }
}

async function main() {
  try {
    console.log('开始初始化系统...');
    const superAdminRole = await initSuperAdminRole();
    await initSuperAdminUser(superAdminRole.id);
    console.log('系统初始化完成！');
    process.exit(0);
  } catch (error) {
    console.error('初始化失败:', error);
    process.exit(1);
  }
}

main();