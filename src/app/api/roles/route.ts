import { db } from '@/db';
import { roles, users } from '@/db/schema';
import { NextResponse } from 'next/server';
import { like, and, gte, lte, count, eq, sql } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // 验证分页参数
    const validPage = Math.max(1, page);
    const validLimit = Math.min(Math.max(1, limit), 100); // 限制最大100条
    const offset = (validPage - 1) * validLimit;

    // 构建查询条件
    const conditions = [];

    if (name) {
      conditions.push(like(roles.name, `%${name}%`));
    }

    if (startDate) {
      conditions.push(gte(roles.createdAt, new Date(startDate)));
    }

    if (endDate) {
      conditions.push(lte(roles.createdAt, new Date(endDate)));
    }

    // 构建基础查询
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // 获取总数
    const [totalResult] = await db
      .select({ count: count() })
      .from(roles)
      .where(whereClause);

    const total = totalResult.count;

    // 获取分页数据（包含用户数量）
    const baseQuery = db
      .select({
        id: roles.id,
        name: roles.name,
        description: roles.description,
        createdAt: roles.createdAt,
        updatedAt: roles.updatedAt,
        userCount: sql<number>`count(${users.id})`.as('userCount')
      })
      .from(roles)
      .leftJoin(users, eq(roles.id, users.roleId))
      .groupBy(
        roles.id,
        roles.name,
        roles.description,
        roles.createdAt,
        roles.updatedAt
      );

    const query = whereClause ? baseQuery.where(whereClause) : baseQuery;

    const roleList = await query
      .limit(validLimit)
      .offset(offset)
      .orderBy(roles.createdAt);

    // 计算分页信息
    const totalPages = Math.ceil(total / validLimit);

    return NextResponse.json({
      data: roleList,
      pagination: {
        page: validPage,
        limit: validLimit,
        total,
        totalPages
      }
    });
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
