import { NextRequest, NextResponse } from 'next/server';
import { getRepositories } from '@/repository';
import { errorResponse, unauthorizedResponse } from '@/service/response';
import { cookies } from 'next/headers';

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

export async function GET(request: NextRequest) {
  if (!(await ensureAdminToken())) {
    return unauthorizedResponse('未授权访问');
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, Number(searchParams.get('page') || '1'));
    const pageSize = Math.max(
      1,
      Number(searchParams.get('page_size') || searchParams.get('limit') || '10')
    );
    const repos = await getRepositories();
    const result = await repos.permissions.list({
      name: searchParams.get('name') || undefined,
      code: searchParams.get('code') || undefined,
      page,
      limit: pageSize,
    });

    return NextResponse.json({
      code: 200,
      msg: 'SUCCESS',
      data: {
        items: result.data.map(mapPermission),
        page: result.page,
        page_size: result.limit,
        total: result.total,
        total_pages: result.totalPages,
      },
    });
  } catch (error) {
    console.error('[权限管理] 获取权限列表失败:', error);
    return errorResponse('获取权限列表失败');
  }
}

export async function POST(request: NextRequest) {
  if (!(await ensureAdminToken())) {
    return unauthorizedResponse('未授权访问');
  }

  try {
    const body = await request.json();
    const repos = await getRepositories();
    const id = await repos.permissions.create({
      name: body.name,
      code: body.code,
      description: body.description,
      parentId: body.parent_id ?? null,
      sortOrder: body.sort_order ?? 0,
    });

    return NextResponse.json({
      code: 200,
      msg: 'SUCCESS',
      data: { id },
    });
  } catch (error) {
    console.error('[权限管理] 创建权限失败:', error);
    return errorResponse('创建权限失败');
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await ensureAdminToken())) {
    return unauthorizedResponse('未授权访问');
  }

  try {
    const body = await request.json();
    const ids = Array.isArray(body.ids) ? body.ids : [];
    const repos = await getRepositories();
    for (const id of ids) {
      await repos.permissions.delete(Number(id));
    }

    return NextResponse.json({
      code: 200,
      msg: 'SUCCESS',
      data: null,
    });
  } catch (error) {
    console.error('[权限管理] 批量删除权限失败:', error);
    return errorResponse('批量删除权限失败');
  }
}
