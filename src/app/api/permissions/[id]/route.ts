import { db } from '@/db';
import { permissions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, code, description } = body;

    await db
      .update(permissions)
      .set({ name, code, description })
      .where(eq(permissions.id, parseInt(id)));

    return NextResponse.json({ message: '权限更新成功' });
  } catch (error) {
    return NextResponse.json({ error: '更新权限失败' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await db.delete(permissions).where(eq(permissions.id, parseInt(id)));

    return NextResponse.json({ message: '权限删除成功' });
  } catch (error) {
    return NextResponse.json({ error: '删除权限失败' }, { status: 500 });
  }
}
