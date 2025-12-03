import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/system-configs/[id]
 * 获取单个系统配置详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log('获取系统配置详情:', id);

    return NextResponse.json({
      message: '系统配置详情',
      data: {
        id: parseInt(id),
        config_key: 'sample.config',
        config_value: 'value',
        config_type: 'string',
        description: '示例配置',
        is_public: false,
        version: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        removed: false,
        disabled: false
      }
    });
  } catch (error) {
    console.error('获取系统配置详情失败:', error);
    return NextResponse.json(
      { error: '获取系统配置详情失败' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/system-configs/[id]
 * 更新系统配置
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // 版本校验（乐观锁）
    if (body.version === undefined) {
      return NextResponse.json(
        { error: '缺少版本号（version）字段，无法进行更新' },
        { status: 400 }
      );
    }

    // 验证配置值格式
    if (body.config_value && body.config_type) {
      if (body.config_type === 'json') {
        try {
          JSON.parse(body.config_value);
        } catch {
          return NextResponse.json(
            { error: '配置值不是有效的JSON格式' },
            { status: 400 }
          );
        }
      } else if (body.config_type === 'number') {
        if (isNaN(parseFloat(body.config_value))) {
          return NextResponse.json(
            { error: '配置值不是有效的数字格式' },
            { status: 400 }
          );
        }
      } else if (body.config_type === 'boolean') {
        if (!['true', 'false', '1', '0'].includes(body.config_value)) {
          return NextResponse.json(
            { error: '配置值不是有效的布尔值（true/false/1/0）' },
            { status: 400 }
          );
        }
      }
    }

    console.log('更新系统配置:', id, body);

    return NextResponse.json({
      message: '系统配置更新成功',
      data: {
        id: parseInt(id),
        ...body,
        version: (body.version || 0) + 1,
        updated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('更新系统配置失败:', error);
    return NextResponse.json({ error: '更新系统配置失败' }, { status: 500 });
  }
}

/**
 * DELETE /api/system-configs/[id]
 * 删除系统配置
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log('删除系统配置:', id);

    return NextResponse.json({
      message: '系统配置删除成功'
    });
  } catch (error) {
    console.error('删除系统配置失败:', error);
    return NextResponse.json({ error: '删除系统配置失败' }, { status: 500 });
  }
}
