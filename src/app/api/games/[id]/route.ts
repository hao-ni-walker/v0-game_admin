import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/games/[id]
 * 获取单个游戏详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 这里应该从数据库获取
    console.log('获取游戏详情:', id);

    return NextResponse.json({
      message: '游戏详情',
      data: {
        id: parseInt(id),
        game_id: 'MOCK_GAME_' + id,
        name: '模拟游戏'
        // ... 其他字段
      }
    });
  } catch (error) {
    console.error('获取游戏详情失败:', error);
    return NextResponse.json({ error: '获取游戏详情失败' }, { status: 500 });
  }
}

/**
 * PUT /api/games/[id]
 * 更新游戏信息
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // 这里应该是数据库操作
    console.log('更新游戏:', id, body);

    return NextResponse.json({
      message: '游戏更新成功',
      data: {
        id: parseInt(id),
        ...body,
        updated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('更新游戏失败:', error);
    return NextResponse.json({ error: '更新游戏失败' }, { status: 500 });
  }
}

/**
 * DELETE /api/games/[id]
 * 删除游戏
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 这里应该是数据库操作
    console.log('删除游戏:', id);

    return NextResponse.json({
      message: '游戏删除成功'
    });
  } catch (error) {
    console.error('删除游戏失败:', error);
    return NextResponse.json({ error: '删除游戏失败' }, { status: 500 });
  }
}
