import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/items
 * 获取所有道具（简化版本）
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: '请使用 POST /api/items/list 获取道具列表'
  });
}

/**
 * POST /api/items
 * 创建新道具
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 这里应该是数据库操作
    // 现在只是模拟返回
    console.log('创建道具:', body);

    return NextResponse.json(
      {
        message: '道具创建成功',
        data: {
          id: Math.floor(Math.random() * 10000),
          ...body,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('创建道具失败:', error);
    return NextResponse.json(
      { error: '创建道具失败' },
      { status: 500 }
    );
  }
}
