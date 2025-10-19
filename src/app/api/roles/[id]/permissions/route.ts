import { Logger } from '@/lib/logger';
import { getCurrentUser } from '@/lib/auth';
import { errorResponse, successResponse } from '@/service/response';
import { getRepositories } from '@/repository';

// 获取角色的权限列表
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const roleId = parseInt(id);

    const repos = await getRepositories();

    // 读取该角色的权限关联
    const rolePerms = await repos.rolePermissions.listByRole(roleId);
    const permIds = rolePerms.map((rp) => rp.permissionId);

    // 一次性读取全部权限（小数据可接受），再筛选
    const allPerms = await repos.permissions.list({ page: 1, limit: 10000 });

    const rolePermissionList = allPerms.data
      .filter((p) => permIds.includes(p.id))
      .map((p) => ({
        id: p.id,
        name: p.name,
        code: p.code,
        description: p.description
      }));

    return successResponse(rolePermissionList);
  } catch (error) {
    console.error('获取角色权限失败:', error);
    return errorResponse('获取角色权限失败');
  }
}

// 更新角色的权限
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = getCurrentUser(request);
  const logger = new Logger('权限管理', currentUser?.id);

  try {
    const { id } = await params;
    const { permissionIds } = await request.json();
    const roleId = parseInt(id);

    const repos = await getRepositories();

    // 获取角色信息
    const targetRole = await repos.roles.getById(roleId);
    if (!targetRole) {
      await logger.warn('分配权限', '权限分配失败：角色不存在', {
        targetRoleId: roleId,
        operatorId: currentUser?.id,
        operatorName: currentUser?.username
      });
      return errorResponse('角色不存在');
    }

    // 获取原有权限用于对比
    const original = await repos.rolePermissions.listByRole(roleId);
    const originalPermissionIds = original.map((p) => p.permissionId);

    // 计算需要新增与移除的集合（幂等）
    const incoming = Array.isArray(permissionIds) ? permissionIds : [];
    const toAdd = incoming.filter((pid: number) => !originalPermissionIds.includes(pid));
    const toRemove = originalPermissionIds.filter((pid) => !incoming.includes(pid));

    // 执行增删
    for (const pid of toRemove) {
      await repos.rolePermissions.remove(roleId, pid);
    }
    for (const pid of toAdd) {
      await repos.rolePermissions.add(roleId, pid);
    }

    // 记录权限分配日志
    await logger.info('分配权限', '角色权限分配成功', {
      targetRoleId: roleId,
      targetRoleName: targetRole.name,
      originalPermissions: originalPermissionIds,
      newPermissions: incoming,
      addedPermissions: toAdd,
      removedPermissions: toRemove,
      operatorId: currentUser?.id,
      operatorName: currentUser?.username,
      timestamp: new Date().toISOString()
    });

    return successResponse('权限更新成功');
  } catch (error) {
    await logger.error('分配权限', '权限分配失败：系统错误', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      operatorId: currentUser?.id,
      operatorName: currentUser?.username
    });

    console.error('更新角色权限失败:', error);
    return errorResponse('更新角色权限失败');
  }
}