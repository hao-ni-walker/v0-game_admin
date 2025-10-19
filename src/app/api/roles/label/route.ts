import { errorResponse, successResponse } from '@/service/response';
import { getRepositories } from '@/repository';

export async function GET() {
  try {
    const repos = await getRepositories();
    // 读取角色列表，取较大上限以简化（小数据场景可行）
    const result = await repos.roles.list({ page: 1, limit: 10000 });
    const roleList = result.data.map((r) => ({ id: r.id, name: r.name }));
    return successResponse(roleList);
  } catch (error) {
    console.error('获取角色标签失败:', error);
    return errorResponse('获取角色标签失败');
  }
}