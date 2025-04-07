import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/db';
import { users, roles, permissions, rolePermissions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function checkPermission(
  userId: number,
  requiredPermission: string
) {
  const userWithPermissions = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      role: {
        with: {
          permissions: {
            with: {
              permission: true
            }
          }
        }
      }
    }
  });

  if (!userWithPermissions) return false;

  const hasPermission = userWithPermissions.role.permissions.some(
    (rp: { permission: { code: string } }) =>
      rp.permission.code === requiredPermission
  );

  return hasPermission;
}

export async function withPermission(handler: Function, permission: string) {
  return async (req: NextRequest) => {
    const userId = req.headers.get('user-id'); // 从请求头或session获取用户ID

    if (!userId) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const hasPermission = await checkPermission(Number(userId), permission);

    if (!hasPermission) {
      return NextResponse.json({ error: '没有权限' }, { status: 403 });
    }

    return handler(req);
  };
}
