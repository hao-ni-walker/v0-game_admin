import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse
} from '@/service/response';
import { logger } from '@/lib/logger';

const REMOTE_API_URL = 'https://api.xreddeercasino.com/api/admin/games';

/**
 * 游戏列表 API - 代理到远程 API
 * POST /api/games/list
 */
export async function POST(request: NextRequest) {
  const requestStartTime = Date.now();
  try {
    // 从 cookie 中获取 token
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token || !token.value) {
      await logger.warn('游戏管理', '获取游戏列表', '未授权访问：缺少 token', {
        timestamp: new Date().toISOString()
      });
      return unauthorizedResponse('未授权访问');
    }

    // 解析请求体
    const body = await request.json().catch(() => ({}));

    // 记录请求日志
    await logger.info('游戏管理', '获取游戏列表', '收到请求', {
      requestBody: body,
      timestamp: new Date().toISOString()
    });

    // 将请求体参数转换为查询参数
    const queryParams = new URLSearchParams();

    // 分页参数
    if (body.page) queryParams.append('page', String(body.page));
    if (body.page_size) queryParams.append('page_size', String(body.page_size));
    if (body.pageSize) queryParams.append('page_size', String(body.pageSize));

    // 筛选参数
    if (body.keyword) queryParams.append('keyword', body.keyword);
    if (body.provider_codes && Array.isArray(body.provider_codes)) {
      body.provider_codes.forEach((code: string) => {
        queryParams.append('provider_codes[]', code);
      });
    }
    if (body.categories && Array.isArray(body.categories)) {
      body.categories.forEach((cat: string) => {
        queryParams.append('categories[]', cat);
      });
    }
    if (body.lang) queryParams.append('lang', body.lang);
    if (body.status !== undefined && body.status !== 'all') {
      queryParams.append('status', String(body.status));
    }
    if (body.is_new !== undefined) {
      queryParams.append('is_new', String(body.is_new));
    }
    if (body.is_featured !== undefined) {
      queryParams.append('is_featured', String(body.is_featured));
    }
    if (body.is_mobile_supported !== undefined) {
      queryParams.append(
        'is_mobile_supported',
        String(body.is_mobile_supported)
      );
    }
    if (body.is_demo_available !== undefined) {
      queryParams.append('is_demo_available', String(body.is_demo_available));
    }
    if (body.has_jackpot !== undefined) {
      queryParams.append('has_jackpot', String(body.has_jackpot));
    }
    if (body.sort_by) queryParams.append('sort_by', body.sort_by);
    if (body.sort_dir) queryParams.append('sort_dir', body.sort_dir);

    // 构建远程 API URL
    const queryString = queryParams.toString();
    const remoteUrl = queryString
      ? `${REMOTE_API_URL}?${queryString}`
      : REMOTE_API_URL;

    // 记录发送到远程 API 的请求日志
    await logger.info('游戏管理', '获取游戏列表', '发送请求到远程API', {
      remoteUrl,
      method: 'GET',
      queryParams: queryString,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${token.value.substring(0, 20)}...` // 只记录 token 前20个字符
      },
      timestamp: new Date().toISOString()
    });

    // 转发请求到远程 API
    const remoteResponse = await fetch(remoteUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${token.value}`
      }
    });

    // 检查 HTTP 状态码
    if (!remoteResponse.ok) {
      const errorText = await remoteResponse.text();
      const requestDuration = Date.now() - requestStartTime;
      await logger.error('游戏管理', '获取游戏列表', '远程API请求失败', {
        remoteUrl,
        httpStatus: remoteResponse.status,
        httpStatusText: remoteResponse.statusText,
        errorText,
        requestDuration: `${requestDuration}ms`,
        timestamp: new Date().toISOString()
      });

      if (remoteResponse.status === 401) {
        return unauthorizedResponse('认证失败，请重新登录');
      }

      return errorResponse(
        `远程API错误: ${remoteResponse.status} ${remoteResponse.statusText}`
      );
    }

    // 解析远程 API 响应
    const result = await remoteResponse.json();

    // 控制台打印完整响应（调试用）
    console.log(
      '[游戏列表] 远程API响应:',
      JSON.stringify(
        {
          code: result.code,
          msg: result.msg,
          dataInfo: {
            total: result.data?.total,
            page: result.data?.page,
            page_size: result.data?.page_size,
            itemsCount: Array.isArray(result.data?.items)
              ? result.data.items.length
              : 0
          }
        },
        null,
        2
      )
    );

    // 记录远程 API 响应日志
    await logger.info('游戏管理', '获取游戏列表', '收到远程API响应', {
      remoteUrl,
      httpStatus: remoteResponse.status,
      httpStatusText: remoteResponse.statusText,
      responseCode: result.code,
      responseMsg: result.msg,
      responseData: {
        total: result.data?.total,
        page: result.data?.page,
        page_size: result.data?.page_size,
        itemsCount: Array.isArray(result.data?.items)
          ? result.data.items.length
          : 0
      },
      timestamp: new Date().toISOString()
    });

    // 转换响应格式以匹配前端期望的结构
    // 远程 API 返回: { code: 200, msg: "SUCCESS", data: { items: [], total, page, page_size, total_pages } }
    // 前端期望: { code: 0, data: { list: [], total, page, page_size } }
    if ((result.code === 200 || result.code === 0) && result.data) {
      // 处理游戏数据，添加缺失的字段默认值并转换类型
      const games = (result.data.items || result.data.list || []).map(
        (game: any) => ({
          ...game,
          // 转换金额字段（字符串转数字）
          min_bet:
            game.min_bet !== undefined
              ? typeof game.min_bet === 'string'
                ? parseFloat(game.min_bet)
                : game.min_bet
              : undefined,
          max_bet:
            game.max_bet !== undefined
              ? typeof game.max_bet === 'string'
                ? parseFloat(game.max_bet)
                : game.max_bet
              : undefined,
          // 转换 RTP 字段
          rtp:
            game.rtp !== null && game.rtp !== undefined
              ? typeof game.rtp === 'string'
                ? parseFloat(game.rtp)
                : game.rtp
              : undefined,
          // 转换 popularity_score 字段
          popularity_score:
            game.popularity_score !== undefined
              ? typeof game.popularity_score === 'string'
                ? parseFloat(game.popularity_score)
                : game.popularity_score
              : undefined,
          // 添加缺失的字段默认值
          supported_languages: game.supported_languages || [],
          supported_currencies: game.supported_currencies || [],
          // 处理 removed 字段（如果不存在，使用 disabled 字段）
          removed:
            game.removed !== undefined
              ? game.removed
              : game.disabled !== undefined
                ? game.disabled
                : false
        })
      );

      const transformedData = {
        list: games,
        total: result.data.total || 0,
        page: result.data.page || 1,
        page_size: result.data.page_size || result.data.pageSize || 20
      };

      // 记录返回给前端的响应日志
      const requestDuration = Date.now() - requestStartTime;

      // 控制台打印返回给前端的数据（调试用）
      console.log(
        '[游戏列表] 返回给前端:',
        JSON.stringify(
          {
            code: 0,
            data: {
              total: transformedData.total,
              page: transformedData.page,
              page_size: transformedData.page_size,
              listCount: transformedData.list.length,
              firstItem: transformedData.list[0] || null
            }
          },
          null,
          2
        )
      );

      await logger.info('游戏管理', '获取游戏列表', '返回响应给前端', {
        responseCode: 0,
        responseData: {
          total: transformedData.total,
          page: transformedData.page,
          page_size: transformedData.page_size,
          listCount: transformedData.list.length
        },
        requestDuration: `${requestDuration}ms`,
        timestamp: new Date().toISOString()
      });

      return successResponse(transformedData);
    }

    // 如果远程 API 返回错误
    if (result.code !== 200 && result.code !== 0) {
      const requestDuration = Date.now() - requestStartTime;
      await logger.warn('游戏管理', '获取游戏列表', '远程API返回错误', {
        code: result.code,
        msg: result.msg,
        requestDuration: `${requestDuration}ms`,
        timestamp: new Date().toISOString()
      });
      return errorResponse(result.msg || '获取游戏列表失败');
    }

    // 如果格式不匹配，直接返回原始数据
    const requestDuration = Date.now() - requestStartTime;
    await logger.info(
      '游戏管理',
      '获取游戏列表',
      '返回响应给前端（原始格式）',
      {
        responseData: result.data || result,
        requestDuration: `${requestDuration}ms`,
        timestamp: new Date().toISOString()
      }
    );
    return successResponse(result.data || result);
  } catch (error) {
    // 记录错误日志
    const requestDuration = Date.now() - requestStartTime;
    await logger.error('游戏管理', '获取游戏列表', '获取游戏列表失败', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      requestDuration: `${requestDuration}ms`,
      timestamp: new Date().toISOString()
    });

    return errorResponse('获取游戏列表失败');
  }
}
