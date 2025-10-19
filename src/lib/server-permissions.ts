import { cookies } from 'next/headers';
import { verifyToken } from './auth';
// 使用仓储获取数据
import { getRepositories } from '@/repository';

/**
 * 从请求中获取用户ID (服务端专用)
 */
export async function getUserFromRequest(): Promise<number | null> {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get('token');

    if (!token) {
      return null;
    }

    const user = verifyToken(token.value);
    return user?.id || null;
  } catch {
    return null;
  }
}

/**
 * 获取用户的所有权限代码 (服务端专用)
 */
export async function getUserPermissions(userId?: number): Promise<string[]> {
  try {
    // 如果没有传入userId，尝试从请求中获取
    if (!userId) {
      const requestUserId = await getUserFromRequest();
      if (!requestUserId) {
        return [];
      }
      userId = requestUserId;
    }

    const repos = await getRepositories();

    // 获取用户信息
    const user = await repos.users.getById(userId);
    if (!user) return [];

    // 如果是超级管理员，返回所有权限
    if (user.isSuperAdmin) {
      const all = await repos.permissions.list({ page: 1, limit: 1000 });
      return all.data.map((p) => p.code);
    }

    // 获取角色权限 codes
    const rolePerms = await repos.rolePermissions.listByRole(user.roleId);
    if (!rolePerms.length) return [];

    // 将 permissionId 转换为 code
    const permSet = new Set<number>(rolePerms.map((rp) => rp.permissionId));
    // 简化：一次性取较大页码
    const allPerms = await repos.permissions.list({ page: 1, limit: 5000 });
    const codes = allPerms.data
      .filter((p) => permSet.has(p.id))
      .map((p) => p.code);
    return codes;
  } catch (error) {
    console.error('获取用户权限失败:', error);
    return [];
  }
}

/**
 * 检查用户是否具有指定权限 (服务端专用)
 */
export async function hasPermission(
  permissionCode: string,
  userId?: number
): Promise<boolean> {
  try {
    const userPermissions = await getUserPermissions(userId);
    return userPermissions.includes(permissionCode);
  } catch (error) {
    console.error('权限检查失败:', error);
    return false;
  }
}

/**
 * 检查用户是否具有任意一个权限 (服务端专用)
 */
export async function hasAnyPermission(
  permissionCodes: string[],
  userId?: number
): Promise<boolean> {
  try {
    const userPermissions = await getUserPermissions(userId);
    return permissionCodes.some((code) => userPermissions.includes(code));
  } catch (error) {
    console.error('权限检查失败:', error);
    return false;
  }
}

/**
 * 检查用户是否具有所有权限 (服务端专用)
 */
export async function hasAllPermissions(
  permissionCodes: string[],
  userId?: number
): Promise<boolean> {
  try {
    const userPermissions = await getUserPermissions(userId);
    return permissionCodes.every((code) => userPermissions.includes(code));
  } catch (error) {
    console.error('权限检查失败:', error);
    return false;
  }
}
