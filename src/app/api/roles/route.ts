import { Logger } from '@/lib/logger';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/service/response';
import { getRepositories } from '@/repository';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // 验证分页参数
    const validPage = Math.max(1, page);
    const validLimit = Math.min(Math.max(1, limit), 100); // 限制最大100条
    const offset = (validPage - 1) * validLimit;

    const repos = await getRepositories();

    const result = await repos.roles.list({
      name: name || undefined,
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
    console.error('获取角色列表失败:', error);
    return errorResponse('获取角色列表失败');
  }
}

export async function POST(request: Request) {
  const currentUser = getCurrentUser(request);
  const logger = new Logger('角色管理', currentUser?.id);

  try {
    const body = await request.json();
    const { name, description } = body;

    // 验证必填字段
    if (!name) {
      await logger.warn('创建角色', '创建角色失败：缺少角色名称', {
        operatorId: currentUser?.id,
        operatorName: currentUser?.username
      });
      return errorResponse('角色名称不能为空');
    }

    const repos = await getRepositories();

    // 检查角色名是否已存在
    const existingRole = await repos.roles.findByName(name);
    if (existingRole) {
      await logger.warn('创建角色', '创建角色失败：角色名已存在', {
        roleName: name,
        operatorId: currentUser?.id,
        operatorName: currentUser?.username
      });
      return errorResponse('角色名已存在');
    }

    await repos.roles.create({
      name,
      description
    });

    // 记录创建成功日志
    await logger.info('创建角色', '角色创建成功', {
      roleName: name,
      description,
      operatorId: currentUser?.id,
      operatorName: currentUser?.username,
      timestamp: new Date().toISOString()
    });

    return successResponse({ message: '角色创建成功' });
  } catch (error) {
    await logger.error('创建角色', '创建角色失败：系统错误', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      operatorId: currentUser?.id,
      operatorName: currentUser?.username
    });

    console.error('创建角色失败:', error);
    return errorResponse('创建角色失败');
  }
}
