import {
  mockLogs,
  getLogStats,
  filterLogs,
  LOG_LEVELS,
  type MockLog
} from '../data/log';
import {
  filterAndPaginate,
  successResponse,
  errorResponse,
  delay,
  type PaginationParams
} from '../base';

export class MockLogAPI {
  // 获取日志列表
  async getLogs(
    params: PaginationParams & {
      level?: string;
      module?: string;
      userId?: number;
    } = {}
  ) {
    await delay();

    try {
      // 先根据特定条件过滤
      const filtered = filterLogs(mockLogs, {
        level: params.level,
        module: params.module,
        userId: params.userId,
        startDate: params.startDate,
        endDate: params.endDate,
        search: params.search
      });

      // 再进行分页
      const page = params.page || 1;
      const limit = params.limit || 10;
      const total = filtered.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const data = filtered.slice(startIndex, startIndex + limit);

      return {
        code: 0,
        data,
        pager: {
          page,
          limit,
          total,
          totalPages
        }
      };
    } catch (error) {
      return errorResponse('获取日志列表失败');
    }
  }

  // 根据ID获取日志详情
  async getLogById(id: number) {
    await delay();

    try {
      const log = mockLogs.find((l) => l.id === id);
      if (!log) {
        return errorResponse('日志不存在');
      }

      return successResponse(log);
    } catch (error) {
      return errorResponse('获取日志详情失败');
    }
  }

  // 获取日志统计信息
  async getLogStats() {
    await delay();

    try {
      const stats = getLogStats(mockLogs);
      return successResponse(stats);
    } catch (error) {
      return errorResponse('获取日志统计失败');
    }
  }

  // 获取日志级别配置
  async getLogLevels() {
    await delay();

    try {
      return successResponse(LOG_LEVELS);
    } catch (error) {
      return errorResponse('获取日志级别失败');
    }
  }

  // 清理日志（根据日期范围）
  async clearLogs(
    params: {
      startDate?: string;
      endDate?: string;
      level?: string;
      module?: string;
    } = {}
  ) {
    await delay();

    try {
      let deletedCount = 0;

      for (let i = mockLogs.length - 1; i >= 0; i--) {
        const log = mockLogs[i];
        let shouldDelete = true;

        // 日期范围过滤
        if (params.startDate) {
          const start = new Date(params.startDate);
          if (new Date(log.createdAt) < start) {
            shouldDelete = false;
          }
        }

        if (params.endDate) {
          const end = new Date(params.endDate);
          if (new Date(log.createdAt) > end) {
            shouldDelete = false;
          }
        }

        // 级别过滤
        if (params.level && log.level !== params.level) {
          shouldDelete = false;
        }

        // 模块过滤
        if (params.module && log.module !== params.module) {
          shouldDelete = false;
        }

        if (shouldDelete) {
          mockLogs.splice(i, 1);
          deletedCount++;
        }
      }

      return successResponse({
        message: `成功清理 ${deletedCount} 条日志`,
        deletedCount
      });
    } catch (error) {
      return errorResponse('清理日志失败');
    }
  }

  // 获取可用的模块列表
  async getModules() {
    await delay();

    try {
      const modules = [...new Set(mockLogs.map((log) => log.module))];
      return successResponse(modules);
    } catch (error) {
      return errorResponse('获取模块列表失败');
    }
  }

  // 获取日志趋势数据（最近7天）
  async getLogTrends(days: number = 7) {
    await delay();

    try {
      const today = new Date();
      const trends = Array.from({ length: days }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dayStart = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate()
        );
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);

        const dayLogs = mockLogs.filter((log) => {
          const logDate = new Date(log.createdAt);
          return logDate >= dayStart && logDate < dayEnd;
        });

        return {
          date: date.toISOString().split('T')[0],
          total: dayLogs.length,
          info: dayLogs.filter((l) => l.level === 'info').length,
          warn: dayLogs.filter((l) => l.level === 'warn').length,
          error: dayLogs.filter((l) => l.level === 'error').length,
          debug: dayLogs.filter((l) => l.level === 'debug').length
        };
      }).reverse();

      return successResponse(trends);
    } catch (error) {
      return errorResponse('获取日志趋势失败');
    }
  }
}
