import { successResponse, errorResponse } from '@/service/response';
import { getRepositories } from '@/repository';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const code = searchParams.get('code');
    const description = searchParams.get('description');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // 验证分页参数
    const validPage = Math.max(1, page);
    const validLimit = Math.min(Math.max(1, limit), 100); // 限制最大100条
    const offset = (validPage - 1) * validLimit;

    const repos = await getRepositories();

    const result = await repos.permissions.list({
      name: name || undefined,
      code: code || undefined,
      description: description || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      page: validPage,
      limit: validLimit
    });

    return successResponse(result.data, {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages
    });
  } catch (error) {
    console.error('获取权限列表失败:', error);
    return errorResponse('获取权限列表失败');
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, code, description, parent_id, sort_order } = body;

    const repos = await getRepositories();
    await repos.permissions.create({
      name,
      code,
      description,
      parentId: parent_id ?? null,
      sortOrder: sort_order ?? 0
    });

    return successResponse({ message: '权限创建成功' });
  } catch (error) {
    console.error('创建权限失败:', error);
    return errorResponse('创建权限失败');
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return errorResponse('请提供要删除的权限ID数组');
    }

    const repos = await getRepositories();

    // 批量删除权限
    for (const id of ids) {
      await repos.permissions.delete(id);
    }

    return successResponse({ message: `成功删除 ${ids.length} 个权限` });
  } catch (error) {
    console.error('批量删除权限失败:', error);
    return errorResponse('批量删除权限失败');
  }
}
