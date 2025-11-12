import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/payment-channels/[id]
 * 获取支付渠道详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);

    // 导入模拟数据
    const fs = await import('fs/promises');
    const path = await import('path');
    const dataPath = path.join(process.cwd(), 'data', 'paymentChannels.json');
    const fileContent = await fs.readFile(dataPath, 'utf-8');
    const allChannels = JSON.parse(fileContent);

    const channel = allChannels.find((c: any) => c.id === id);

    if (!channel) {
      return NextResponse.json(
        { code: 404, message: '支付渠道不存在', data: null },
        { status: 404 }
      );
    }

    return NextResponse.json({
      code: 200,
      message: '成功',
      data: channel
    });
  } catch (error) {
    console.error('获取支付渠道详情失败:', error);
    return NextResponse.json(
      { code: 500, message: '获取支付渠道详情失败', data: null },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/payment-channels/[id]
 * 更新支付渠道
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    const updates = await request.json();

    // 导入模拟数据
    const fs = await import('fs/promises');
    const path = await import('path');
    const dataPath = path.join(process.cwd(), 'data', 'paymentChannels.json');
    const fileContent = await fs.readFile(dataPath, 'utf-8');
    const allChannels = JSON.parse(fileContent);

    const channelIndex = allChannels.findIndex((c: any) => c.id === id);

    if (channelIndex === -1) {
      return NextResponse.json(
        { code: 404, message: '支付渠道不存在', data: null },
        { status: 404 }
      );
    }

    const channel = allChannels[channelIndex];

    // 乐观锁版本检查
    if (updates.version !== undefined && updates.version !== channel.version) {
      return NextResponse.json(
        { code: 409, message: '数据已被其他用户修改,请刷新后重试', data: null },
        { status: 409 }
      );
    }

    // 更新渠道
    allChannels[channelIndex] = {
      ...channel,
      ...updates,
      version: channel.version + 1,
      updatedAt: new Date().toISOString()
    };

    // 写回文件
    await fs.writeFile(dataPath, JSON.stringify(allChannels, null, 2), 'utf-8');

    return NextResponse.json({
      code: 200,
      message: '更新成功',
      data: allChannels[channelIndex]
    });
  } catch (error) {
    console.error('更新支付渠道失败:', error);
    return NextResponse.json(
      { code: 500, message: '更新支付渠道失败', data: null },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/payment-channels/[id]
 * 逻辑删除支付渠道
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);

    // 导入模拟数据
    const fs = await import('fs/promises');
    const path = await import('path');
    const dataPath = path.join(process.cwd(), 'data', 'paymentChannels.json');
    const fileContent = await fs.readFile(dataPath, 'utf-8');
    const allChannels = JSON.parse(fileContent);

    const channelIndex = allChannels.findIndex((c: any) => c.id === id);

    if (channelIndex === -1) {
      return NextResponse.json(
        { code: 404, message: '支付渠道不存在', data: null },
        { status: 404 }
      );
    }

    // 逻辑删除
    allChannels[channelIndex].removed = true;
    allChannels[channelIndex].updatedAt = new Date().toISOString();

    // 写回文件
    await fs.writeFile(dataPath, JSON.stringify(allChannels, null, 2), 'utf-8');

    return NextResponse.json({
      code: 200,
      message: '删除成功',
      data: null
    });
  } catch (error) {
    console.error('删除支付渠道失败:', error);
    return NextResponse.json(
      { code: 500, message: '删除支付渠道失败', data: null },
      { status: 500 }
    );
  }
}
