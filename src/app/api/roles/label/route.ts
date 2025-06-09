import { db } from '@/db';
import { roles } from '@/db/schema';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const roleList = await db
      .select({
        id: roles.id,
        name: roles.name
      })
      .from(roles);

    return NextResponse.json({
      data: roleList
    });
  } catch (error) {
    console.error('获取角色标签失败:', error);
    return NextResponse.json({ error: '获取角色标签失败' }, { status: 500 });
  }
}
