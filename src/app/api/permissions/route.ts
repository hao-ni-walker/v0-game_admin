import { db } from '@/db';
import { permissions } from '@/db/schema';
import { NextResponse } from 'next/server';
import { like, and, gte, lte } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const code = searchParams.get('code');
    const description = searchParams.get('description');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // 构建查询条件
    const conditions = [];

    if (name) {
      conditions.push(like(permissions.name, `%${name}%`));
    }

    if (code) {
      conditions.push(like(permissions.code, `%${code}%`));
    }

    if (description) {
      conditions.push(like(permissions.description, `%${description}%`));
    }

    if (startDate) {
      conditions.push(gte(permissions.createdAt, new Date(startDate)));
    }

    if (endDate) {
      conditions.push(lte(permissions.createdAt, new Date(endDate)));
    }

    const baseQuery = db
      .select({
        id: permissions.id,
        name: permissions.name,
        code: permissions.code,
        description: permissions.description,
        createdAt: permissions.createdAt,
        updatedAt: permissions.updatedAt
      })
      .from(permissions);

    // 如果有筛选条件，应用它们
    const permissionList =
      conditions.length > 0
        ? await baseQuery.where(and(...conditions))
        : await baseQuery;

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
