import { cookies } from 'next/headers';
import { getRepositories } from '@/repository';
import { successResponse, unauthorizedResponse } from '@/service/response';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  if (!token?.value) {
    return unauthorizedResponse('未授权访问');
  }

  const repos = await getRepositories();
  const result = await repos.permissions.list({ page: 1, limit: 10000 });
  const items = result.data
    .slice()
    .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
    .map((item) => ({
      id: item.id,
      name: item.name,
      code: item.code,
      description: item.description || '',
      parent_id: item.parentId ?? null,
      parentId: item.parentId ?? null,
      sort_order: Number(item.sortOrder || 0),
      sortOrder: Number(item.sortOrder || 0),
      created_at: item.createdAt,
      createdAt: item.createdAt,
      updated_at: item.updatedAt,
      updatedAt: item.updatedAt,
    }));

  return successResponse(items);
}
