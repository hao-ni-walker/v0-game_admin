import { getRepositories } from '@/repository';

import { preventSuperRoleModification } from '@/lib/super-admin';

import { Logger } from '@/lib/logger';
import { getCurrentUser } from '@/lib/auth';
import { errorResponse, successResponse } from '@/service/response';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = getCurrentUser(request);
  const logger = new Logger('角色管理', currentUser?.id);

  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    // 获取原角色信息
    const repos = await getRepositories();
    const originalRole = await repos.roles.getById(id);

    if (!originalRole) {
      await logger.warn('更新角色', '更新角色失败：角色不存在', {
        targetRoleId: id,
        operatorId: currentUser?.id,
        operatorName: currentUser?.username
      });
      return errorResponse('角色不存在');
    }

    await preventSuperRoleModification(id);
    const body = await request.json();
    const { name, description } = body;

    await (await getRepositories()).roles.update(id, { name, description });

    // 记录更新日志
    await logger.info('更新角色', '角色信息更新成功', {
      targetRoleId: id,
      targetRoleName: originalRole.name,
      changedFields: {
        name:
          originalRole.name !== name
            ? { from: originalRole.name, to: name }
            : undefined,
        description:
          originalRole.description !== description
            ? { from: originalRole.description, to: description }
            : undefined
      },
      operatorId: currentUser?.id,
      operatorName: currentUser?.username,
      timestamp: new Date().toISOString()
    });

    return successResponse('角色更新成功');
  } catch (error) {
    await logger.error('更新角色', '更新角色失败：系统错误', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      operatorId: currentUser?.id,
      operatorName: currentUser?.username
    });

    return errorResponse('更新角色失败');
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = getCurrentUser(request);
  const logger = new Logger('角色管理', currentUser?.id);

  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    // 获取要删除的角色信息
    const repos2 = await getRepositories();
    const targetRole = await repos2.roles.getById(id);

    if (!targetRole) {
      await logger.warn('删除角色', '删除角色失败：角色不存在', {
        targetRoleId: id,
        operatorId: currentUser?.id,
        operatorName: currentUser?.username
      });
      return errorResponse('角色不存在');
    }

    await preventSuperRoleModification(id);
    await (await getRepositories()).roles.delete(id);

    // 记录删除日志
    await logger.warn('删除角色', '角色删除成功', {
      deletedRoleId: id,
      deletedRoleName: targetRole.name,
      deletedRoleDescription: targetRole.description,
      operatorId: currentUser?.id,
      operatorName: currentUser?.username,
      timestamp: new Date().toISOString()
    });

    return successResponse('角色删除成功');
  } catch (error) {
    await logger.error('删除角色', '删除角色失败：系统错误', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      operatorId: currentUser?.id,
      operatorName: currentUser?.username
    });

    return errorResponse('删除角色失败');
  }
}
