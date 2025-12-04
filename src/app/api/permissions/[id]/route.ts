import { errorResponse, successResponse } from '@/service/response';
import { getRepositories } from '@/repository';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, code, description, parent_id, sort_order } = body;

    const repos = await getRepositories();
    await repos.permissions.update(parseInt(id), {
      name,
      code,
      description,
      parentId: parent_id ?? null,
      sortOrder: sort_order ?? 0
    });

    return successResponse('权限更新成功');
  } catch (error) {
    return errorResponse('更新权限失败');
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const repos = await getRepositories();
    await repos.permissions.delete(parseInt(id));
    return successResponse('权限删除成功');
  } catch (error) {
    return errorResponse('删除权限失败');
  }
}
