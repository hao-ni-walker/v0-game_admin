import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/system-configs/list
 * 获取系统配置列表
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('获取系统配置列表:', body);

    // 模拟数据
    const mockData = [
      {
        id: 1,
        key: 'site_name',
        value: '游戏管理后台',
        description: '网站名称',
        category: 'general',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      },
      {
        id: 2,
        key: 'maintenance_mode',
        value: 'false',
        description: '维护模式开关',
        category: 'system',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      }
    ];

    const page = body.page || 1;
    const pageSize = body.page_size || 20;
    const total = mockData.length;

    return NextResponse.json({
      total,
      page,
      page_size: pageSize,
      list: mockData
    });
  } catch (error) {
    console.error('获取系统配置列表失败:', error);
    return NextResponse.json(
      { error: '获取系统配置列表失败' },
      { status: 500 }
    );
  }
}
