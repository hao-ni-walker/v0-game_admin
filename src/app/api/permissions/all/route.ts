import { db } from '@/db';
import { permissions } from '@/db/schema';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 获取所有权限数据，按sortOrder排序
    const allPermissions = await db
      .select({
        id: permissions.id,
        name: permissions.name,
        code: permissions.code,
        description: permissions.description,
        parentId: permissions.parentId,
        sortOrder: permissions.sortOrder
      })
      .from(permissions)
      .orderBy(permissions.sortOrder);

    return NextResponse.json({
      data: allPermissions
    });
  } catch (error) {
    console.error('获取权限列表失败:', error);
    return NextResponse.json({ error: '获取权限列表失败' }, { status: 500 });
  }
}
