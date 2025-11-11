import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/games
 * 获取所有游戏（简化版本）
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: '请使用 POST /api/games/list 获取游戏列表'
  });
}

/**
 * POST /api/games
 * 创建新游戏
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 这里应该是数据库操作
    // 现在只是模拟返回
    console.log('创建游戏:', body);

    return NextResponse.json(
      {
        message: '游戏创建成功',
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
    console.error('创建游戏失败:', error);
    return NextResponse.json(
      { error: '创建游戏失败' },
      { status: 500 }
    );
  }
}
