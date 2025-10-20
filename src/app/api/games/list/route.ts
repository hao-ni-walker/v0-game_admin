import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/service/response';

const API_URL = 'https://api.zenflourish.com/api/games/list';
const ICON_BASE = 'https://api.zenflourish.com';

export async function POST(req: NextRequest) {
  try {
    const token = process.env.ZENFLOURISH_API_TOKEN;
    if (!token) {
      return errorResponse('服务端未配置 ZENFLOURISH_API_TOKEN');
    }

    // 读取前端传来的 body，默认语言 en
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }
    const payload = { Language: 'en', ...body };

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      // 确保不缓存
      cache: 'no-store'
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return errorResponse(`上游接口错误：${res.status} ${res.statusText}`);
    }

    // 期望返回结构: { code, msg, data: { List: [...] } }
    const list = data?.data?.List || [];

    // 规范化字段与图标绝对地址
    const normalized = list.map((item: any) => ({
      id: item.id ?? item.game_id ?? crypto.randomUUID(),
      game_id: item.game_id,
      name: item.name,
      icon_url: item.icon_url ? (item.icon_url.startsWith('http') ? item.icon_url : `${ICON_BASE}${item.icon_url}`) : '',
      category: item.category ?? '',
      provider_code: item.provider_code ?? '',
      is_featured: Boolean(item.is_featured),
      is_new: Boolean(item.is_new),
      updated_at: item.updated_at ?? ''
    }));

    return successResponse({ List: normalized });
  } catch (err: any) {
    console.error('获取游戏列表失败:', err);
    return errorResponse('获取游戏列表失败');
  }
}