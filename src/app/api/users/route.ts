import bcrypt from 'bcryptjs';
import { Logger } from '@/lib/logger';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/service/response';
// 使用仓储
import { getRepositories } from '@/repository';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const email = searchParams.get('email');
    const roleId = searchParams.get('roleId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const repos = await getRepositories();

    const result = await repos.users.list({
      username: username || undefined,
      email: email || undefined,
      roleId: roleId ? parseInt(roleId) : undefined,
      status: (status as any) || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      page,
      limit
    });

    return successResponse(result.data, {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    return errorResponse('获取用户列表失败');
  }
}

export async function POST(request: Request) {
  const currentUser = getCurrentUser(request);
  const logger = new Logger('用户管理', currentUser?.id);

  try {
    const body = await request.json();
    const { username, email, password, roleId, status = 'active' } = body;

    // 验证必填字段
    if (!username || !email || !password) {
      await logger.warn('创建用户', '创建用户失败：缺少必填字段', {
        missingFields: {
          username: !username,
          email: !email,
          password: !password
        },
        operatorId: currentUser?.id,
        operatorName: currentUser?.username
      });

      return errorResponse('请填写所有必填字段');
    }

    const repos = await getRepositories();

    // 检查用户名是否已存在
    const existingUser = await repos.users.findByUsername(username);
    if (existingUser) {
      await logger.warn('创建用户', '创建用户失败：用户名已存在', {
        username,
        email,
        operatorId: currentUser?.id,
        operatorName: currentUser?.username
      });

      return errorResponse('用户名已存在');
    }

    // 加密密码
    const saltRounds = Number(process.env.SALT_ROUNDS || 12);
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 创建用户
    await repos.users.create({
      username,
      email,
      password: hashedPassword,
      roleId,
      status,
      avatar: `/avatars/default.jpg`
    });

    // 记录成功日志
    await logger.info('创建用户', '用户创建成功', {
      username,
      email,
      roleId,
      operatorId: currentUser?.id,
      operatorName: currentUser?.username,
      timestamp: new Date().toISOString()
    });

    return successResponse({ message: '用户创建成功' });
  } catch (error) {
    await logger.error('创建用户', '创建用户失败：系统错误', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      operatorId: currentUser?.id,
      operatorName: currentUser?.username
    });

    console.error('创建用户失败:', error);
    return errorResponse('创建用户失败');
  }
}
