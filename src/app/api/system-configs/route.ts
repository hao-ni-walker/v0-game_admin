import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/system-configs
 * 创建新系统配置
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证必需字段
    if (!body.config_key || !body.config_value || !body.config_type) {
      return NextResponse.json(
        { error: '缺少必需字段: config_key, config_value, config_type' },
        { status: 400 }
      );
    }

    // 验证配置值格式
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

    console.log('创建系统配置:', body);

    return NextResponse.json(
      {
        message: '系统配置创建成功',
        data: {
          id: Math.floor(Math.random() * 10000),
          ...body,
          version: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          removed: false,
          disabled: false
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('创建系统配置失败:', error);
    return NextResponse.json(
      { error: '创建系统配置失败' },
      { status: 500 }
    );
  }
}
