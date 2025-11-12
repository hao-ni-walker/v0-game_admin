import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/payment-channels
 * 创建支付渠道
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 导入模拟数据
    const fs = await import('fs/promises');
    const path = await import('path');
    const dataPath = path.join(process.cwd(), 'data', 'paymentChannels.json');
    const fileContent = await fs.readFile(dataPath, 'utf-8');
    const allChannels = JSON.parse(fileContent);

    // 检查code是否重复
    const existingChannel = allChannels.find((c: any) => c.code === body.code);
    if (existingChannel) {
      return NextResponse.json(
        { code: 400, message: '渠道代码已存在', data: null },
        { status: 400 }
      );
    }

    // 生成新ID
    const maxId = Math.max(...allChannels.map((c: any) => c.id), 0);
    const newChannel = {
      id: maxId + 1,
      ...body,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      removed: false
    };

    allChannels.push(newChannel);

    // 写回文件
    await fs.writeFile(dataPath, JSON.stringify(allChannels, null, 2), 'utf-8');

    return NextResponse.json({
      code: 200,
      message: '创建成功',
      data: newChannel
    });
  } catch (error) {
    console.error('创建支付渠道失败:', error);
    return NextResponse.json(
      { code: 500, message: '创建支付渠道失败', data: null },
      { status: 500 }
    );
  }
}
