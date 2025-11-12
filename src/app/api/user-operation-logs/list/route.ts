import { NextRequest } from 'next/server';
import { getUserFromRequest } from '@/lib/server-permissions';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse
} from '@/service/response';

/**
 * 用户操作日志列表 API
 * POST /api/user-operation-logs/list
 */
export async function POST(request: NextRequest) {
  try {
    // 检查用户权限
    const userId = await getUserFromRequest();
    if (!userId) {
      return unauthorizedResponse('未授权');
    }

    // 解析请求体
    const body = await request.json();
    const {
      keyword,
      userIds,
      usernames,
      operations,
      tables,
      objectId,
      ipAddress,
      hasDiff,
      from,
      to,
      sortBy = 'operationAt',
      sortDir = 'desc',
      page = 1,
      pageSize = 20
    } = body;

    // 模拟数据
    const mockData = [
      {
        id: 912345,
        userId: 1001,
        username: 'ops_admin',
        operation: 'UPDATE',
        tableName: 'tickets',
        objectId: '8800123',
        oldData: { status: 'open', assigneeId: null },
        newData: { status: 'in_progress', assigneeId: 2001 },
        description: '指派工单并开始处理',
        ipAddress: '203.0.113.45',
        source: 'web',
        userAgent: 'Mozilla/5.0',
        operationAt: '2025-11-12T03:41:20Z',
        createdAt: '2025-11-12T03:41:20Z'
      },
      {
        id: 912344,
        userId: 1002,
        username: 'admin',
        operation: 'CREATE',
        tableName: 'users',
        objectId: '1005',
        oldData: null,
        newData: {
          username: 'newuser',
          email: 'newuser@example.com',
          roleId: 2
        },
        description: '创建新用户',
        ipAddress: '192.168.1.100',
        source: 'admin',
        userAgent: 'Mozilla/5.0',
        operationAt: '2025-11-12T02:30:15Z',
        createdAt: '2025-11-12T02:30:15Z'
      },
      {
        id: 912343,
        userId: 1001,
        username: 'ops_admin',
        operation: 'DELETE',
        tableName: 'banners',
        objectId: '101',
        oldData: {
          title: 'Old Banner',
          imageUrl: '/old-banner.jpg',
          status: 'inactive'
        },
        newData: null,
        description: '删除过期轮播图',
        ipAddress: '203.0.113.45',
        source: 'web',
        userAgent: 'Mozilla/5.0',
        operationAt: '2025-11-12T01:15:30Z',
        createdAt: '2025-11-12T01:15:30Z'
      },
      {
        id: 912342,
        userId: 1,
        username: 'admin',
        operation: 'LOGIN',
        tableName: 'sessions',
        objectId: 'session_' + Date.now(),
        oldData: null,
        newData: {
          sessionId: 'sess_abc123',
          loginAt: '2025-11-12T00:45:00Z'
        },
        description: '用户登录系统',
        ipAddress: '192.168.1.100',
        source: 'web',
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        operationAt: '2025-11-12T00:45:00Z',
        createdAt: '2025-11-12T00:45:00Z'
      },
      {
        id: 912341,
        userId: 1003,
        username: 'data_analyst',
        operation: 'EXPORT',
        tableName: 'users',
        objectId: 'export_20251112',
        oldData: null,
        newData: {
          exportType: 'csv',
          recordCount: 1500,
          columns: ['id', 'username', 'email', 'createdAt']
        },
        description: '导出用户数据报表',
        ipAddress: '10.0.1.50',
        source: 'api',
        userAgent: 'DataExportService/1.0',
        operationAt: '2025-11-11T23:30:00Z',
        createdAt: '2025-11-11T23:30:00Z'
      },
      {
        id: 912340,
        userId: 1001,
        username: 'ops_admin',
        operation: 'UPDATE',
        tableName: 'games',
        objectId: '2050',
        oldData: {
          status: 'active',
          featured: false,
          priority: 10
        },
        newData: {
          status: 'active',
          featured: true,
          priority: 1
        },
        description: '设置游戏为推荐',
        ipAddress: '203.0.113.45',
        source: 'web',
        userAgent: 'Mozilla/5.0',
        operationAt: '2025-11-11T22:15:00Z',
        createdAt: '2025-11-11T22:15:00Z'
      },
      {
        id: 912339,
        userId: 1002,
        username: 'admin',
        operation: 'RESET_PWD',
        tableName: 'users',
        objectId: '1008',
        oldData: {
          passwordHash: '***'
        },
        newData: {
          passwordHash: '***',
          passwordResetAt: '2025-11-11T21:00:00Z'
        },
        description: '重置用户密码',
        ipAddress: '192.168.1.100',
        source: 'admin',
        userAgent: 'Mozilla/5.0',
        operationAt: '2025-11-11T21:00:00Z',
        createdAt: '2025-11-11T21:00:00Z'
      },
      {
        id: 912338,
        userId: 1001,
        username: 'ops_admin',
        operation: 'READ',
        tableName: 'tickets',
        objectId: '8800125',
        oldData: null,
        newData: null,
        description: '查看工单详情',
        ipAddress: '203.0.113.45',
        source: 'web',
        userAgent: 'Mozilla/5.0',
        operationAt: '2025-11-11T20:30:00Z',
        createdAt: '2025-11-11T20:30:00Z'
      }
    ];

    // 应用筛选
    let filteredData = mockData;

    // 关键词筛选
    if (keyword) {
      filteredData = filteredData.filter(
        (item) =>
          item.username.toLowerCase().includes(keyword.toLowerCase()) ||
          item.tableName.toLowerCase().includes(keyword.toLowerCase()) ||
          item.objectId.toLowerCase().includes(keyword.toLowerCase()) ||
          item.description?.toLowerCase().includes(keyword.toLowerCase())
      );
    }

    // 用户ID筛选
    if (userIds && userIds.length > 0) {
      const userIdArray = Array.isArray(userIds)
        ? userIds
        : userIds.split(',').map(Number);
      filteredData = filteredData.filter((item) =>
        userIdArray.includes(item.userId)
      );
    }

    // 用户名筛选
    if (usernames && usernames.length > 0) {
      const usernameArray = Array.isArray(usernames)
        ? usernames
        : usernames.split(',');
      filteredData = filteredData.filter((item) =>
        usernameArray.includes(item.username)
      );
    }

    // 操作类型筛选
    if (operations && operations.length > 0) {
      const operationArray = Array.isArray(operations)
        ? operations
        : operations.split(',');
      filteredData = filteredData.filter((item) =>
        operationArray.includes(item.operation)
      );
    }

    // 表名筛选
    if (tables && tables.length > 0) {
      const tableArray = Array.isArray(tables) ? tables : tables.split(',');
      filteredData = filteredData.filter((item) =>
        tableArray.includes(item.tableName)
      );
    }

    // 对象ID筛选
    if (objectId) {
      filteredData = filteredData.filter((item) =>
        item.objectId.includes(objectId)
      );
    }

    // IP地址筛选
    if (ipAddress) {
      filteredData = filteredData.filter((item) =>
        item.ipAddress?.includes(ipAddress)
      );
    }

    // 数据变更筛选
    if (hasDiff) {
      filteredData = filteredData.filter(
        (item) => item.oldData !== null && item.newData !== null
      );
    }

    // 时间范围筛选
    if (from) {
      filteredData = filteredData.filter(
        (item) => new Date(item.operationAt) >= new Date(from)
      );
    }
    if (to) {
      filteredData = filteredData.filter(
        (item) => new Date(item.operationAt) <= new Date(to)
      );
    }

    // 排序
    filteredData.sort((a, b) => {
      let compareValue = 0;

      switch (sortBy) {
        case 'id':
          compareValue = a.id - b.id;
          break;
        case 'userId':
          compareValue = a.userId - b.userId;
          break;
        case 'username':
          compareValue = a.username.localeCompare(b.username);
          break;
        case 'tableName':
          compareValue = a.tableName.localeCompare(b.tableName);
          break;
        case 'operation':
          compareValue = a.operation.localeCompare(b.operation);
          break;
        case 'operationAt':
        default:
          compareValue =
            new Date(a.operationAt).getTime() -
            new Date(b.operationAt).getTime();
          break;
      }

      return sortDir === 'asc' ? compareValue : -compareValue;
    });

    const total = filteredData.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return successResponse(paginatedData, {
      page,
      limit: pageSize,
      total,
      totalPages
    });
  } catch (error) {
    console.error('获取用户操作日志失败:', error);
    return errorResponse('获取用户操作日志失败');
  }
}
