import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getRepositories } from '@/repository';
import {
  errorResponse,
  notFoundResponse,
  unauthorizedResponse,
} from '@/service/response';

function mapPermission(item: any) {
  return {
    id: item.id,
    name: item.name,
    code: item.code,
    description: item.description || '',
    parent_id: item.parentId ?? null,
    sort_order: Number(item.sortOrder || 0),
    created_at: item.createdAt,
    updated_at: item.updatedAt,
  };
}

async function ensureAdminToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  return token?.value || null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await ensureAdminToken())) {
    return unauthorizedResponse('未授权访问');
  }

  try {
    const { id } = await params;
    const repos = await getRepositories();
    const permission = await repos.permissions.getById(Number(id));
    if (!permission) {
      return notFoundResponse('权限不存在');
    }

    return NextResponse.json({
      code: 200,
      msg: 'SUCCESS',
      data: mapPermission(permission),
    });
  } catch (error) {
    console.error('[权限管理] 获取权限详情失败:', error);
    return errorResponse('获取权限详情失败');
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await ensureAdminToken())) {
    return unauthorizedResponse('未授权访问');
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const repos = await getRepositories();
    await repos.permissions.update(Number(id), {
      name: body.name,
      code: body.code,
      description: body.description,
      parentId: body.parent_id ?? null,
      sortOrder: body.sort_order ?? 0,
    });

    const updated = await repos.permissions.getById(Number(id));
    return NextResponse.json({
      code: 200,
      msg: 'SUCCESS',
      data: updated ? mapPermission(updated) : null,
    });
  } catch (error) {
    console.error('[权限管理] 更新权限失败:', error);
    return errorResponse('更新权限失败');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await ensureAdminToken())) {
    return unauthorizedResponse('未授权访问');
  }

  try {
    const { id } = await params;
    const repos = await getRepositories();
    await repos.permissions.delete(Number(id));

    return NextResponse.json({
      code: 200,
      msg: 'SUCCESS',
      data: null,
    });
  } catch (error) {
    console.error('[权限管理] 删除权限失败:', error);
    return errorResponse('删除权限失败');
  }
}
