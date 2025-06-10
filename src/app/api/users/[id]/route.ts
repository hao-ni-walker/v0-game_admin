import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { preventSuperAdminModification } from '@/lib/super-admin';
import { Logger } from '@/lib/logger';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = getCurrentUser(request);
  const logger = new Logger('用户管理', currentUser?.id);

  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    // 获取原用户信息
    const originalUser = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!originalUser.length) {
      await logger.warn('更新用户', '更新用户失败：用户不存在', {
        targetUserId: id,
        operatorId: currentUser?.id,
        operatorName: currentUser?.username
      });
      return NextResponse.json({ message: '用户不存在' }, { status: 404 });
    }

    await preventSuperAdminModification(id);
    const body = await request.json();
    const { username, email, password, roleId } = body;

    const updateData: any = {
      username,
      email,
      roleId
    };

    // 只有在提供新密码时才更新密码
    if (password) {
      const saltRounds = Number(process.env.SALT_ROUNDS || 12);
      updateData.password = await bcrypt.hash(password, saltRounds);
    }

    await db.update(users).set(updateData).where(eq(users.id, id));

    // 记录更新日志
    await logger.info('更新用户', '用户信息更新成功', {
      targetUserId: id,
      targetUsername: originalUser[0].username,
      changedFields: {
        username:
          originalUser[0].username !== username
            ? { from: originalUser[0].username, to: username }
            : undefined,
        email:
          originalUser[0].email !== email
            ? { from: originalUser[0].email, to: email }
            : undefined,
        roleId:
          originalUser[0].roleId !== roleId
            ? { from: originalUser[0].roleId, to: roleId }
            : undefined,
        passwordChanged: !!password
      },
      operatorId: currentUser?.id,
      operatorName: currentUser?.username,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ message: '用户更新成功' });
  } catch (error) {
    await logger.error('更新用户', '更新用户失败：系统错误', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      operatorId: currentUser?.id,
      operatorName: currentUser?.username
    });

    return NextResponse.json(
      { error: (error as Error)?.message || '更新用户失败' },
      { status: 500 }
    );
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

    // 获取要删除的用户信息
    const targetUser = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!targetUser.length) {
      await logger.warn('删除用户', '删除用户失败：用户不存在', {
        targetUserId: id,
        operatorId: currentUser?.id,
        operatorName: currentUser?.username
      });
      return NextResponse.json({ message: '用户不存在' }, { status: 404 });
    }

    await preventSuperAdminModification(id);
    await db.delete(users).where(eq(users.id, id));

    // 记录删除日志
    await logger.warn('删除用户', '用户删除成功', {
      deletedUserId: id,
      deletedUsername: targetUser[0].username,
      deletedEmail: targetUser[0].email,
      operatorId: currentUser?.id,
      operatorName: currentUser?.username,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ message: '用户删除成功' });
  } catch (error) {
    await logger.error('删除用户', '删除用户失败：系统错误', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      operatorId: currentUser?.id,
      operatorName: currentUser?.username
    });

    return NextResponse.json(
      { error: (error as Error)?.message || '删除用户失败' },
      { status: 500 }
    );
  }
}
