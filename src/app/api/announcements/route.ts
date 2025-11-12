import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/announcements
 * 获取所有公告（简化版本）
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: '请使用 POST /api/announcements/list 获取公告列表'
  });
}

/**
 * POST /api/announcements
 * 创建新公告
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('创建公告:', body);

    return NextResponse.json(
      {
        message: '公告创建成功',
        data: {
          id: Math.floor(Math.random() * 10000),
          ...body,
          version: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          removed: false
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('创建公告失败:', error);
    return NextResponse.json(
      { error: '创建公告失败' },
      { status: 500 }
    );
  }
}
