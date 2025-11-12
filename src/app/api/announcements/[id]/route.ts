import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/announcements/[id]
 * 获取公告详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    console.log('获取公告详情:', id);

    // 模拟返回数据
    return NextResponse.json({
      id: parseInt(id),
      title: '系统维护公告',
      content: '11 月 15 日 02:00–04:00 将进行系统维护，期间部分服务不可用。',
      type: 3,
      priority: 1,
      start_time: '2025-11-15T02:00:00Z',
      end_time: '2025-11-15T04:00:00Z',
      status: 1,
      version: 2,
      created_at: '2025-11-10T08:00:00Z',
      updated_at: '2025-11-12T10:20:00Z',
      removed: false,
      disabled: false
    });
  } catch (error) {
    console.error('获取公告详情失败:', error);
    return NextResponse.json(
      { error: '获取公告详情失败' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/announcements/[id]
 * 更新公告（含乐观锁）
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    
    console.log('更新公告:', id, body);

    // 模拟版本冲突检查
    const currentVersion = 2; // 模拟当前版本
    if (body.version && body.version !== currentVersion) {
      return NextResponse.json(
        { 
          error: '版本冲突，数据已被其他用户修改',
          code: 'VERSION_CONFLICT',
          current_version: currentVersion
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      message: '公告更新成功',
      data: {
        id: parseInt(id),
        ...body,
        version: (body.version || 0) + 1,
        updated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('更新公告失败:', error);
    return NextResponse.json(
      { error: '更新公告失败' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/announcements/[id]
 * 删除公告（逻辑删除）
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    console.log('删除公告:', id);

    return NextResponse.json({
      message: '公告删除成功'
    });
  } catch (error) {
    console.error('删除公告失败:', error);
    return NextResponse.json(
      { error: '删除公告失败' },
      { status: 500 }
    );
  }
}
