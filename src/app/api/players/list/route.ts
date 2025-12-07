import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse
} from '@/service/response';
import { logger } from '@/lib/logger';

const REMOTE_API_URL = 'https://api.xreddeercasino.com/api/admin/users';

/**
 * 玩家列表 API - 代理到远程 API
 * POST /api/players/list
 */
export async function POST(request: NextRequest) {
  const requestStartTime = Date.now();
  try {
    // 从 cookie 中获取 token
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token || !token.value) {
      await logger.warn('玩家管理', '获取玩家列表', '未授权访问：缺少 token', {
        timestamp: new Date().toISOString()
      });
      return unauthorizedResponse('未授权访问');
    }

    // 解析请求体
    const body = await request.json().catch(() => ({}));

    // 记录请求日志
    await logger.info('玩家管理', '获取玩家列表', '收到请求', {
      requestBody: body,
      timestamp: new Date().toISOString()
    });

    // 将请求体参数转换为查询参数
    const queryParams = new URLSearchParams();

    // 分页参数
    if (body.page) queryParams.append('page', String(body.page));
    if (body.pageSize) queryParams.append('page_size', String(body.pageSize));
    if (body.page_size) queryParams.append('page_size', String(body.page_size));

    // 用户基本信息
    if (body.id) queryParams.append('id', String(body.id));
    if (body.id_min) queryParams.append('id_min', String(body.id_min));
    if (body.id_max) queryParams.append('id_max', String(body.id_max));
    if (body.username) queryParams.append('username', body.username);
    if (body.email) queryParams.append('email', body.email);
    if (body.idname) queryParams.append('idname', body.idname);
    if (body.keyword) {
      // keyword 可能匹配用户名或邮箱
      queryParams.append('username', body.keyword);
    }

    // 账户状态
    if (body.status !== undefined) {
      if (typeof body.status === 'boolean') {
        queryParams.append('status', body.status ? 'active' : 'disabled');
      } else if (typeof body.status === 'string') {
        queryParams.append('status', body.status);
      }
    }
    if (body.vip_level) queryParams.append('vip_level', String(body.vip_level));
    if (body.vipLevel) queryParams.append('vip_level', String(body.vipLevel));
    if (body.vip_level_min) queryParams.append('vip_level_min', String(body.vip_level_min));
    if (body.vipMin) queryParams.append('vip_level_min', String(body.vipMin));
    if (body.vip_level_max) queryParams.append('vip_level_max', String(body.vip_level_max));
    if (body.vipMax) queryParams.append('vip_level_max', String(body.vipMax));
    if (body.is_locked !== undefined) queryParams.append('is_locked', String(body.is_locked));

    // 代理关系
    if (body.agent) queryParams.append('agent', body.agent);
    if (body.agents && Array.isArray(body.agents) && body.agents.length > 0) {
      queryParams.append('agent', body.agents[0]);
    }
    if (body.direct_superior_id) queryParams.append('direct_superior_id', String(body.direct_superior_id));
    if (body.directSuperiorIds && Array.isArray(body.directSuperiorIds) && body.directSuperiorIds.length > 0) {
      queryParams.append('direct_superior_id', String(body.directSuperiorIds[0]));
    }

    // 注册信息
    if (body.registration_method) queryParams.append('registration_method', body.registration_method);
    if (body.registrationMethods && Array.isArray(body.registrationMethods) && body.registrationMethods.length > 0) {
      queryParams.append('registration_method', body.registrationMethods[0]);
    }
    if (body.registration_source) queryParams.append('registration_source', body.registration_source);
    if (body.registrationSources && Array.isArray(body.registrationSources) && body.registrationSources.length > 0) {
      queryParams.append('registration_source', body.registrationSources[0]);
    }
    if (body.identity_category) queryParams.append('identity_category', body.identity_category);
    if (body.identityCategories && Array.isArray(body.identityCategories) && body.identityCategories.length > 0) {
      queryParams.append('identity_category', body.identityCategories[0]);
    }

    // 钱包信息范围
    if (body.balance_min) queryParams.append('balance_min', String(body.balance_min));
    if (body.balanceMin) queryParams.append('balance_min', String(body.balanceMin));
    if (body.balance_max) queryParams.append('balance_max', String(body.balance_max));
    if (body.balanceMax) queryParams.append('balance_max', String(body.balanceMax));
    if (body.total_deposit_min) queryParams.append('total_deposit_min', String(body.total_deposit_min));
    if (body.total_deposit_max) queryParams.append('total_deposit_max', String(body.total_deposit_max));
    if (body.total_withdraw_min) queryParams.append('total_withdraw_min', String(body.total_withdraw_min));
    if (body.total_withdraw_max) queryParams.append('total_withdraw_max', String(body.total_withdraw_max));

    // 时间范围
    if (body.created_at_start) queryParams.append('created_at_start', body.created_at_start);
    if (body.createdFrom) queryParams.append('created_at_start', body.createdFrom);
    if (body.created_at_end) queryParams.append('created_at_end', body.created_at_end);
    if (body.createdTo) queryParams.append('created_at_end', body.createdTo);
    if (body.last_login_start) queryParams.append('last_login_start', body.last_login_start);
    if (body.lastLoginFrom) queryParams.append('last_login_start', body.lastLoginFrom);
    if (body.last_login_end) queryParams.append('last_login_end', body.last_login_end);
    if (body.lastLoginTo) queryParams.append('last_login_end', body.lastLoginTo);

    // 排序
    if (body.sort_by) queryParams.append('sort_by', body.sort_by);
    if (body.sortBy) queryParams.append('sort_by', body.sortBy);
    if (body.sort_order) queryParams.append('sort_order', body.sort_order);
    if (body.sortDir) queryParams.append('sort_order', body.sortDir);

    // 构建远程 API URL
    const queryString = queryParams.toString();
    const remoteUrl = queryString ? `${REMOTE_API_URL}?${queryString}` : REMOTE_API_URL;

    // 记录发送到远程 API 的请求日志
    await logger.info('玩家管理', '获取玩家列表', '发送请求到远程API', {
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
      await logger.error('玩家管理', '获取玩家列表', '远程API请求失败', {
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
    console.log('[玩家列表] 远程API响应:', JSON.stringify(result, null, 2));

    // 记录远程 API 响应日志
    await logger.info('玩家管理', '获取玩家列表', '收到远程API响应', {
      remoteUrl,
      httpStatus: remoteResponse.status,
      httpStatusText: remoteResponse.statusText,
      responseCode: result.code,
      responseMsg: result.msg,
      responseData: {
        total: result.data?.total,
        page: result.data?.page,
        page_size: result.data?.page_size,
        itemsCount: Array.isArray(result.data?.items) ? result.data.items.length : 0
      },
      timestamp: new Date().toISOString()
    });

    // 转换响应格式以匹配前端期望的结构
    // 远程 API 返回: { code: 200, msg: "SUCCESS", data: { items: [], total, page, page_size } }
    // 前端期望: { code: 0, data: { list: [], total, page, page_size } }
    if ((result.code === 200 || result.code === 0) && result.data) {
      const transformedData = {
        list: result.data.items || result.data.list || [],
        total: result.data.total || 0,
        page: result.data.page || 1,
        page_size: result.data.page_size || result.data.pageSize || 20
      };

      // 记录返回给前端的响应日志
      const requestDuration = Date.now() - requestStartTime;
      
      // 控制台打印返回给前端的数据（调试用）
      console.log('[玩家列表] 返回给前端:', JSON.stringify({
        code: 0,
        data: {
          total: transformedData.total,
          page: transformedData.page,
          page_size: transformedData.page_size,
          listCount: transformedData.list.length,
          firstItem: transformedData.list[0] || null
        }
      }, null, 2));
      
      await logger.info('玩家管理', '获取玩家列表', '返回响应给前端', {
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
      await logger.warn('玩家管理', '获取玩家列表', '远程API返回错误', {
        code: result.code,
        msg: result.msg,
        requestDuration: `${requestDuration}ms`,
        timestamp: new Date().toISOString()
      });
      return errorResponse(result.msg || '获取玩家列表失败');
    }

    // 如果格式不匹配，直接返回原始数据
    const requestDuration = Date.now() - requestStartTime;
    await logger.info('玩家管理', '获取玩家列表', '返回响应给前端（原始格式）', {
      responseData: result.data || result,
      requestDuration: `${requestDuration}ms`,
      timestamp: new Date().toISOString()
    });
    return successResponse(result.data || result);
  } catch (error) {
    // 记录错误日志
    const requestDuration = Date.now() - requestStartTime;
    await logger.error('玩家管理', '获取玩家列表', '获取玩家列表失败', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      requestDuration: `${requestDuration}ms`,
      timestamp: new Date().toISOString()
    });

    return errorResponse('获取玩家列表失败');
  }
}
