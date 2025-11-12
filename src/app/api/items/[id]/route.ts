import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/items/[id]
 * 获取道具详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    console.log('获取道具详情:', id);

    // 模拟返回数据
    return NextResponse.json({
      id: parseInt(id),
      item_id: 7001001,
      category: 'box',
      name: '史诗宝箱',
      name_default: 'Epic Chest',
      rarity: 'epic',
      stack_limit: 1,
      is_consumable: true,
      bind_flag: true,
      status: 'active',
      display_icon: 'https://via.placeholder.com/40',
      display_color: '#7B61FF',
      sort_weight: 900,
      expire_days: 7,
      usage_limit: 1,
      level_required: 10,
      vip_required: 2,
      extra: { drop_table: 'epic_box_v3' },
      created_at: '2025-10-20T08:20:00Z',
      updated_at: '2025-11-11T12:45:00Z'
    });
  } catch (error) {
    console.error('获取道具详情失败:', error);
    return NextResponse.json(
      { error: '获取道具详情失败' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/items/[id]
 * 更新道具
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    
    console.log('更新道具:', id, body);

    return NextResponse.json({
      message: '道具更新成功',
      data: {
        id: parseInt(id),
        ...body,
        updated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('更新道具失败:', error);
    return NextResponse.json(
      { error: '更新道具失败' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/items/[id]
 * 删除道具
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    console.log('删除道具:', id);

    return NextResponse.json({
      message: '道具删除成功'
    });
  } catch (error) {
    console.error('删除道具失败:', error);
    return NextResponse.json(
      { error: '删除道具失败' },
      { status: 500 }
    );
  }
}
