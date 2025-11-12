import { NextRequest } from 'next/server';
import { getUserFromRequest } from '@/lib/server-permissions';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse
} from '@/service/response';

/**
 * 获取用户操作日志统计 API
 * GET /api/user-operation-logs/stats
 *
 * 提供操作日志的统计信息，用于仪表盘展示
 */
export async function GET(request: NextRequest) {
  try {
    // 检查用户权限
    const userId = await getUserFromRequest();
    if (!userId) {
      return unauthorizedResponse('未授权');
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    // TODO: 实现真实的统计查询
    // 1. 按操作类型统计数量
    // 2. 按用户统计操作频次
    // 3. 按表统计操作次数
    // 4. 按时间统计趋势
    // 5. 统计异常操作（大量删除、频繁导出等）

    // 临时返回模拟统计数据
    const stats = {
      // 总体统计
      overview: {
        total: 8,
        today: 3,
        week: 8,
        hasDiffCount: 5 // 有数据变更的记录数
      },

      // 按操作类型统计
      operationStats: [
        { operation: 'UPDATE', count: 2, percentage: 25 },
        { operation: 'CREATE', count: 1, percentage: 12.5 },
        { operation: 'DELETE', count: 1, percentage: 12.5 },
        { operation: 'LOGIN', count: 1, percentage: 12.5 },
        { operation: 'EXPORT', count: 1, percentage: 12.5 },
        { operation: 'RESET_PWD', count: 1, percentage: 12.5 },
        { operation: 'READ', count: 1, percentage: 12.5 }
      ],

      // 按用户统计
      userStats: [
        { userId: 1001, username: 'ops_admin', count: 4, percentage: 50 },
        { userId: 1002, username: 'admin', count: 2, percentage: 25 },
        { userId: 1, username: 'admin', count: 1, percentage: 12.5 },
        { userId: 1003, username: 'data_analyst', count: 1, percentage: 12.5 }
      ],

      // 按表统计
      tableStats: [
        { tableName: 'tickets', count: 2, percentage: 25 },
        { tableName: 'users', count: 2, percentage: 25 },
        { tableName: 'banners', count: 1, percentage: 12.5 },
        { tableName: 'sessions', count: 1, percentage: 12.5 },
        { tableName: 'games', count: 1, percentage: 12.5 },
        { tableName: 'tickets', count: 1, percentage: 12.5 }
      ],

      // 最近活跃用户
      recentActiveUsers: [
        {
          userId: 1001,
          username: 'ops_admin',
          lastOperation: 'UPDATE',
          lastOperationAt: '2025-11-12T03:41:20Z',
          operationCount: 4
        },
        {
          userId: 1002,
          username: 'admin',
          lastOperation: 'RESET_PWD',
          lastOperationAt: '2025-11-12T02:30:15Z',
          operationCount: 2
        }
      ],

      // 时间趋势（按小时统计）
      timeTrend: [
        { hour: '20:00', count: 1 },
        { hour: '21:00', count: 1 },
        { hour: '22:00', count: 1 },
        { hour: '23:00', count: 1 },
        { hour: '00:00', count: 1 },
        { hour: '01:00', count: 1 },
        { hour: '02:00', count: 1 },
        { hour: '03:00', count: 1 }
      ],

      // 热点表（最近被操作最多的表）
      hotTables: [
        { tableName: 'tickets', operations: ['UPDATE', 'READ'], count: 2 },
        {
          tableName: 'users',
          operations: ['CREATE', 'RESET_PWD', 'EXPORT'],
          count: 2
        },
        { tableName: 'banners', operations: ['DELETE'], count: 1 }
      ]
    };

    return successResponse(stats);
  } catch (error) {
    console.error('获取操作日志统计失败:', error);
    return errorResponse('获取操作日志统计失败');
  }
}
