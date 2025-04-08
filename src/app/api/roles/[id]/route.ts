import { db } from '@/db';
import { roles } from '@/db/schema';
import { preventSuperRoleModification } from '@/lib/super-admin';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function PUT(
  request: Request,
  { params }: { params: { id: number } }
) {
  try {
    const { id } = await params;
    await preventSuperRoleModification(id);
    const body = await request.json();
    const { name, description } = body;

    await db
      .update(roles)
      .set({ name, description })
      .where(eq(roles.id, id));

    return NextResponse.json({ message: '角色更新成功' });
  } catch (error) {
    return NextResponse.json({ error: (error as Error)?.message || '更新角色失败' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: number } }
) {
  try {
    const { id } = await params;
    await preventSuperRoleModification(id);

    await db
      .delete(roles)
      .where(eq(roles.id, id));

    return NextResponse.json({ message: '角色删除成功' });
  } catch (error) {
    return NextResponse.json({ error: (error as Error)?.message || '删除角色失败' }, { status: 500 });
  }
}