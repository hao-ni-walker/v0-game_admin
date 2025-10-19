import { errorResponse, successResponse } from '@/service/response';
import { getRepositories } from '@/repository';

export async function GET() {
  try {
    const repos = await getRepositories();
    // 读取所有权限（较大上限），再按 sortOrder 排序
    const res = await repos.permissions.list({ page: 1, limit: 10000 });
    const allPermissions = res.data
      .slice()
      .sort((a, b) => (Number(a.sortOrder || 0) - Number(b.sortOrder || 0)))
      .map((p) => ({
        id: p.id,
        name: p.name,
        code: p.code,
        description: p.description,
        parentId: p.parentId,
        sortOrder: p.sortOrder
      }));
    return successResponse(allPermissions);
  } catch (error) {
    console.error('获取权限列表失败:', error);
    return errorResponse('获取权限列表失败');
  }
}