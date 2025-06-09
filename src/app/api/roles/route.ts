import { db } from '@/db';
import { roles } from '@/db/schema';
import { NextResponse } from 'next/server';
import { like, and, gte, lte } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const description = searchParams.get('description');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // 构建查询条件
    const conditions = [];

    if (name) {
      conditions.push(like(roles.name, `%${name}%`));
    }

    if (description) {
      conditions.push(like(roles.description, `%${description}%`));
    }

    if (startDate) {
      conditions.push(gte(roles.createdAt, new Date(startDate)));
    }

    if (endDate) {
      conditions.push(lte(roles.createdAt, new Date(endDate)));
    }

    const baseQuery = db
      .select({
        id: roles.id,
        name: roles.name,
        description: roles.description,
        createdAt: roles.createdAt,
        updatedAt: roles.updatedAt
      })
      .from(roles);

    // 如果有筛选条件，应用它们
    const roleList =
      conditions.length > 0
        ? await baseQuery.where(and(...conditions))
        : await baseQuery;

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
