import { db } from '@/db';
import { permissions } from '@/db/schema';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const permissionList = await db
      .select({
        id: permissions.id,
        name: permissions.name,
        code: permissions.code,
        description: permissions.description,
        createdAt: permissions.createdAt,
        updatedAt: permissions.updatedAt
      })
      .from(permissions);

    return NextResponse.json(permissionList);
  } catch (error) {
    console.error('获取权限列表失败:', error);
    return NextResponse.json({ error: '获取权限列表失败' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, code, description } = body;

    await db.insert(permissions).values({
      name,
      code,
      description
    });

    return NextResponse.json({ message: '权限创建成功' });
  } catch (error) {
    console.error('创建权限失败:', error);
    return NextResponse.json({ error: '创建权限失败' }, { status: 500 });
  }
}