import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/banners
 * 获取所有轮播图（简化版本）
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: '请使用 POST /api/banners/list 获取轮播图列表'
  });
}

/**
 * POST /api/banners
 * 创建新轮播图
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 这里应该是数据库操作
    console.log('创建轮播图:', body);

    return NextResponse.json(
      {
        message: '轮播图创建成功',
        data: {
          id: Math.floor(Math.random() * 10000),
          ...body,
          version: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('创建轮播图失败:', error);
    return NextResponse.json(
      { error: '创建轮播图失败' },
      { status: 500 }
    );
  }
}
