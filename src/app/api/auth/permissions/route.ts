import { NextResponse } from 'next/server';
import { getUserPermissions } from '@/lib/server-permissions';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const permissions = await getUserPermissions(session.user.id);

    return NextResponse.json(permissions);
  } catch (error) {
    console.error('获取用户权限失败:', error);
    return NextResponse.json({ error: '获取权限失败' }, { status: 500 });
  }
}
