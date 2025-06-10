import { db } from '@/db';
import { rolePermissions, permissions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

// 获取角色的权限列表
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const rolePermissionList = await db
      .select({
        id: permissions.id,
        name: permissions.name,
        code: permissions.code,
        description: permissions.description
      })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(rolePermissions.roleId, parseInt(id)));

    return NextResponse.json(rolePermissionList);
  } catch (error) {
    console.error('获取角色权限失败:', error);
    return NextResponse.json({ error: '获取角色权限失败' }, { status: 500 });
  }
}

// 更新角色的权限
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { permissionIds } = await request.json();
    const roleId = parseInt(id);

    // 开启事务
    await db.transaction(async (tx) => {
      // 删除原有权限
      await tx
        .delete(rolePermissions)
        .where(eq(rolePermissions.roleId, roleId));

      // 添加新权限
      if (permissionIds.length > 0) {
        await tx.insert(rolePermissions).values(
          permissionIds.map((permissionId: number) => ({
            roleId,
            permissionId
          }))
        );
      }
    });

    return NextResponse.json({ message: '权限更新成功' });
  } catch (error) {
    console.error('更新角色权限失败:', error);
    return NextResponse.json({ error: '更新角色权限失败' }, { status: 500 });
  }
}
