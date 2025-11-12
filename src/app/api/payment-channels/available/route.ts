import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/payment-channels/available?type=1
 * 获取前台可用的支付渠道(仅返回启用且未禁用的渠道)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = parseInt(searchParams.get('type') || '1', 10);

    // 导入模拟数据
    const fs = await import('fs/promises');
    const path = await import('path');
    const dataPath = path.join(process.cwd(), 'data', 'paymentChannels.json');
    const fileContent = await fs.readFile(dataPath, 'utf-8');
    const allChannels = JSON.parse(fileContent);

    // 过滤可用渠道
    const availableChannels = allChannels.filter((channel: any) => {
      return (
        channel.type === type &&
        channel.status === 1 &&
        channel.disabled === false &&
        channel.removed === false
      );
    });

    // 按 sortOrder 降序, 然后 feeRate 升序排序
    availableChannels.sort((a: any, b: any) => {
      if (a.sortOrder !== b.sortOrder) {
        return b.sortOrder - a.sortOrder;
      }
      return a.feeRate - b.feeRate;
    });

    // 只返回前台需要的字段，敏感配置不下发
    const safeChannels = availableChannels.map((channel: any) => ({
      id: channel.id,
      name: channel.name,
      code: channel.code,
      type: channel.type,
      channelType: channel.channelType,
      displayName: channel.config?.displayName || channel.name,
      minAmount: channel.minAmount,
      maxAmount: channel.maxAmount,
      feeRate: channel.feeRate,
      fixedFee: channel.fixedFee,
      sortOrder: channel.sortOrder
    }));

    return NextResponse.json({
      code: 200,
      message: '成功',
      data: safeChannels
    });
  } catch (error) {
    console.error('获取可用支付渠道失败:', error);
    return NextResponse.json(
      { code: 500, message: '获取可用支付渠道失败', data: null },
      { status: 500 }
    );
  }
}
