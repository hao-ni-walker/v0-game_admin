import { NextRequest } from 'next/server';
import { getUserFromRequest } from '@/lib/server-permissions';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse
} from '@/service/response';
import { getRepositories } from '@/repository';
import type { PlayersFilter } from '@/repository/interfaces';

/**
 * 玩家列表 API
 * POST /api/players/list
 */
export async function POST(request: NextRequest) {
  try {
    // 检查用户权限
    const userId = await getUserFromRequest();
    if (!userId) {
      return unauthorizedResponse('未授权');
    }

    // 解析请求体
    const body = await request.json();
    const {
      keyword,
      status,
      vipLevels,
      vipMin,
      vipMax,
      balanceMin,
      balanceMax,
      agents,
      directSuperiorIds,
      registrationMethods,
      registrationSources,
      loginSources,
      identityCategories,
      createdFrom,
      createdTo,
      updatedFrom,
      updatedTo,
      lastLoginFrom,
      lastLoginTo,
      sortBy = 'updatedAt',
      sortDir = 'desc',
      page = 1,
      pageSize = 20
    } = body;

    // 构建筛选条件
    const filter: PlayersFilter = {
      keyword,
      status,
      vipLevels,
      vipMin,
      vipMax,
      balanceMin,
      balanceMax,
      agents,
      directSuperiorIds,
      registrationMethods,
      registrationSources,
      loginSources,
      identityCategories,
      createdFrom,
      createdTo,
      updatedFrom,
      updatedTo,
      lastLoginFrom,
      lastLoginTo,
      sortBy,
      sortDir,
      page,
      limit: pageSize
    };

    const repos = await getRepositories();

    // 调用仓储层查询
    const result = await repos.players.list(filter);

    // 脱敏处理邮箱
    const maskedList = result.data.map((player) => ({
      ...player,
      email: maskEmail(player.email)
    }));

    // 返回统一响应结构
    return successResponse({
      total: result.total,
      page: result.page,
      page_size: result.limit,
      list: maskedList
    });
  } catch (error) {
    console.error('获取玩家列表失败:', error);
    return errorResponse('获取玩家列表失败');
  }
}

/**
 * 邮箱脱敏函数
 */
function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return email;

  if (localPart.length <= 2) {
    return `${localPart[0]}***@${domain}`;
  }

  return `${localPart[0]}***@${domain}`;
}
