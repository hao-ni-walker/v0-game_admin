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
    const { name, code, description } = body;

    const repos = await getRepositories();
    await repos.permissions.create({
      name,
      code,
      description
    });

    return successResponse({ message: '权限创建成功' });
  } catch (error) {
    console.error('创建权限失败:', error);
    return errorResponse('创建权限失败');
  }
}
