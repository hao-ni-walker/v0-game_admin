import { db } from '@/db';
import { roles } from '@/db/schema';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const roleList = await db
      .select({
        id: roles.id,
        name: roles.name,
        description: roles.description,
        createdAt: roles.createdAt,
        updatedAt: roles.updatedAt
      })
      .from(roles);

    return NextResponse.json(roleList);
  } catch (error) {
    console.error('获取角色列表失败:', error);
    return NextResponse.json({ error: '获取角色列表失败' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description } = body;

    await db.insert(roles).values({
      name,
      description
    });

    return NextResponse.json({ message: '角色创建成功' });
  } catch (error) {
    console.error('创建角色失败:', error);
    return NextResponse.json({ error: '创建角色失败' }, { status: 500 });
  }
}
