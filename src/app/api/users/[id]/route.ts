import bcrypt from 'bcryptjs';
import { getRepositories } from '@/repository';
import {
  preventSuperAdminModification,
  preventSuperAdminDisable
} from '@/lib/super-admin';
import { Logger } from '@/lib/logger';
import { getCurrentUser } from '@/lib/auth';
import {
  successResponse,
  errorResponse,
  notFoundResponse
} from '@/service/response';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = getCurrentUser(request);
  const logger = new Logger('用户管理', currentUser?.id);

  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    const repos = await getRepositories();
    // 获取原用户信息
    const original = await repos.users.getById(id);

    if (!original) {
      await logger.warn('更新用户', '更新用户失败：用户不存在', {
        targetUserId: id,
        operatorId: currentUser?.id,
        operatorName: currentUser?.username
      });
      return notFoundResponse('用户不存在');
    }

    const body = await request.json();
    const { username, email, password, roleId, status } = body;

    // 检查是否尝试禁用超级管理员
    if (status !== undefined) {
      await preventSuperAdminDisable(id, status);
    }

    // 对于其他修改，仍然保护超级管理员（但状态修改已经单独检查）
    if (
      username !== undefined ||
      email !== undefined ||
      password ||
      roleId !== undefined
    ) {
      await preventSuperAdminModification(id);
    }

    const updateData: any = {};

    // 只更新提供的字段
    if (username !== undefined) updateData.username = username;
    if (email !== undefined) updateData.email = email;
    if (roleId !== undefined) updateData.roleId = roleId;
    if (status !== undefined) updateData.status = status;

    // 只有在提供新密码时才更新密码
    if (password) {
      const saltRounds = Number(process.env.SALT_ROUNDS || 12);
      updateData.password = await bcrypt.hash(password, saltRounds);
    }

    const repos2 = await getRepositories();
    await repos2.users.update(id, updateData);

    // 记录更新日志
    await logger.info('更新用户', '用户信息更新成功', {
      targetUserId: id,
      targetUsername: original.username,
      changedFields: {
        username:
          username !== undefined && original.username !== username
            ? { from: original.username, to: username }
            : undefined,
        email:
          email !== undefined && original.email !== email
            ? { from: original.email, to: email }
            : undefined,
        roleId:
          roleId !== undefined && original.roleId !== roleId
            ? { from: original.roleId, to: roleId }
            : undefined,
        status:
          status !== undefined && original.status !== status
            ? { from: original.status, to: status }
            : undefined,
        passwordChanged: !!password
      },
      operatorId: currentUser?.id,
      operatorName: currentUser?.username,
      timestamp: new Date().toISOString()
    });

    return successResponse({ message: '用户更新成功' });
  } catch (error) {
    await logger.error('更新用户', '更新用户失败：系统错误', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      operatorId: currentUser?.id,
      operatorName: currentUser?.username
    });

    return errorResponse((error as Error)?.message || '更新用户失败');
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = getCurrentUser(request);
  const logger = new Logger('用户管理', currentUser?.id);

  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    const repos = await getRepositories();
    // 获取要删除的用户信息
    const targetUser = await repos.users.getById(id);

    if (!targetUser) {
      await logger.warn('删除用户', '删除用户失败：用户不存在', {
        targetUserId: id,
        operatorId: currentUser?.id,
        operatorName: currentUser?.username
      });
      return notFoundResponse('用户不存在');
    }

    await preventSuperAdminModification(id);
    const repos2 = await getRepositories();
    await repos2.users.delete(id);

    // 记录删除日志
    await logger.warn('删除用户', '用户删除成功', {
      deletedUserId: id,
      deletedUsername: targetUser.username,
      deletedEmail: targetUser.email,
      operatorId: currentUser?.id,
      operatorName: currentUser?.username,
      timestamp: new Date().toISOString()
    });

    return successResponse({ message: '用户删除成功' });
  } catch (error) {
    await logger.error('删除用户', '删除用户失败：系统错误', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      operatorId: currentUser?.id,
      operatorName: currentUser?.username
    });

    return errorResponse((error as Error)?.message || '删除用户失败');
  }
}
