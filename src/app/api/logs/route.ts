import { NextRequest } from 'next/server';
import { getUserFromRequest } from '@/lib/server-permissions';
import { getRepositories } from '@/repository';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse
} from '@/service/response';

export async function GET(request: NextRequest) {
  try {
    // 检查用户权限
    const userId = await getUserFromRequest();
    if (!userId) {
      return unauthorizedResponse('未授权');
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const level = searchParams.get('level');
    const module = searchParams.get('module');
    const action = searchParams.get('action');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search');

    const repos = await getRepositories();

    const result = await repos.logs.list({
      level: (level as any) || undefined,
      module: module || undefined,
      action: action || undefined,
      search: search || undefined,
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
    console.error('获取日志失败:', error);
    return errorResponse('获取日志失败');
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // 检查用户权限
    const userId = await getUserFromRequest();
    if (!userId) {
      return unauthorizedResponse('未授权');
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    // 删除指定天数之前的日志
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const repos = await getRepositories();
    await repos.logs.removeBefore(cutoffDate.toISOString());

    return successResponse({
      message: `成功删除 ${days} 天前的日志`
    });
  } catch (error) {
    console.error('删除日志失败:', error);
    return errorResponse('删除日志失败');
  }
}
