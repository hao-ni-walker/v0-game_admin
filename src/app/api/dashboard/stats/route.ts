import { successResponse, errorResponse } from '@/service/response';
import { getRepositories } from '@/repository';

export async function GET() {
  try {
    const repos = await getRepositories();

    // 获取当前时间点
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 快速统计计数（分页 total）
    const [
      usersTotalRes,
      usersTodayRes,
      usersWeekRes,
      rolesTotalRes,
      permissionsTotalRes,
      logsTotalRes,
      logsTodayRes,
      logsWeekRes
    ] = await Promise.all([
      repos.users.list({ page: 1, limit: 1 }),
      repos.users.list({ startDate: startOfDay.toISOString(), page: 1, limit: 1 }),
      repos.users.list({ startDate: startOfWeek.toISOString(), page: 1, limit: 1 }),
      repos.roles.list({ page: 1, limit: 1 }),
      repos.permissions.list({ page: 1, limit: 1 }),
      repos.logs.list({ page: 1, limit: 1 }),
      repos.logs.list({ startDate: startOfDay.toISOString(), page: 1, limit: 1 }),
      repos.logs.list({ startDate: startOfWeek.toISOString(), page: 1, limit: 1 })
    ]);

    // 获取最近用户（按 createdAt 降序，取前 5）
    const usersAll = await repos.users.list({ page: 1, limit: 100000 });
    const recentUsers = usersAll.data
      .slice()
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 5)
      .map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        avatar: u.avatar,
        createdAt: u.createdAt
      }));

    // 日志级别分布
    const logsAll = await repos.logs.list({ page: 1, limit: 100000 });
    const levelMap = new Map<string, number>();
    for (const l of logsAll.data) {
      const key = String(l.level || 'info');
      levelMap.set(key, (levelMap.get(key) || 0) + 1);
    }
    const logLevelStats = Array.from(levelMap.entries()).map(([level, count]) => ({ level, count }));

    // 最近30天的用户注册数量（简化版）
    const userTrend: { date: string; users: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const startOfTargetDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );
      const dayRes = await repos.users.list({
        startDate: startOfTargetDay.toISOString(),
        page: 1,
        limit: 1
      });
      userTrend.push({
        date: date.toISOString().split('T')[0],
        users: dayRes.total || 0
      });
    }

    // 计算增长率（简化版）
    const userGrowthRate =
      (usersWeekRes.total || 0) > 0
        ? `+${(((usersTodayRes.total || 0) / (usersWeekRes.total || 1)) * 100).toFixed(1)}%`
        : '+0%';

    return successResponse({
      overview: {
        totalUsers: usersTotalRes.total || 0,
        todayUsers: usersTodayRes.total || 0,
        weekUsers: usersWeekRes.total || 0,
        userGrowthRate,
        totalRoles: rolesTotalRes.total || 0,
        totalPermissions: permissionsTotalRes.total || 0,
        totalLogs: logsTotalRes.total || 0,
        todayLogs: logsTodayRes.total || 0,
        weekLogs: logsWeekRes.total || 0,
        errorLogs: logsAll.data.filter(l => l.level === 'error').length
      },
      recentUsers,
      logLevelStats,
      userTrend
    });
  } catch (error) {
    console.error('获取dashboard统计数据失败:', error);
    return errorResponse('获取统计数据失败');
  }
}