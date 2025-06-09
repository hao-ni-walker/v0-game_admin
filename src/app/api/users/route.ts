import { db } from '@/db';
import { roles, users } from '@/db/schema';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { eq, like, and, gte, lte, or, sql } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const email = searchParams.get('email');
    const roleName = searchParams.get('roleName');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // 构建查询条件
    const conditions = [];

    if (username) {
      conditions.push(like(users.username, `%${username}%`));
    }

    if (email) {
      conditions.push(like(users.email, `%${email}%`));
    }

    if (roleName) {
      conditions.push(like(roles.name, `%${roleName}%`));
    }

    if (startDate) {
      conditions.push(gte(users.createdAt, new Date(startDate)));
    }

    if (endDate) {
      conditions.push(lte(users.createdAt, new Date(endDate)));
    }

    const baseQuery = db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        roleId: users.roleId,
        avatar: users.avatar,
        createdAt: users.createdAt,
        role: {
          id: roles.id,
          name: roles.name
        }
      })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id));

    // 计算总数
    const countQuery = db
      .select({ count: sql`count(*)` })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id));

    const [userList, totalResult] = await Promise.all([
      conditions.length > 0
        ? baseQuery
            .where(and(...conditions))
            .limit(limit)
            .offset((page - 1) * limit)
        : baseQuery.limit(limit).offset((page - 1) * limit),
      conditions.length > 0 ? countQuery.where(and(...conditions)) : countQuery
    ]);

    const total = totalResult[0]?.count || 0;

    return NextResponse.json({
      data: userList,
      total: Number(total),
      page,
      limit,
      totalPages: Math.ceil(Number(total) / limit)
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    return NextResponse.json({ error: '获取用户列表失败' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, password, roleId } = body;

    // 验证必填字段
    if (!username || !email || !password) {
      return NextResponse.json(
        { message: '请填写所有必填字段' },
        { status: 400 }
      );
    }

    // 检查用户名或邮箱是否已存在
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json({ message: '用户名已存在' }, { status: 400 });
    }

    // 加密密码
    const saltRounds = Number(process.env.SALT_ROUNDS || 12);
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 创建用户
    await db.insert(users).values({
      username,
      email,
      password: hashedPassword,
      roleId,
      avatar: `/avatars/default.jpg`
    });

    return NextResponse.json({ message: '用户创建成功' });
  } catch (error) {
    console.error('创建用户失败:', error);
    return NextResponse.json({ error: '创建用户失败' }, { status: 500 });
  }
}
