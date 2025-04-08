import { db } from '@/db';
import { users } from '@/db/schema';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const userList = await db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        roleId: users.roleId,
        avatar: users.avatar,
        createdAt: users.createdAt
      })
      .from(users);

    return NextResponse.json(userList);
  } catch (error) {
    return NextResponse.json({ error: '获取用户列表失败' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, password, roleId } = body;

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
