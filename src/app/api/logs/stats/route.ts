import { NextRequest, NextResponse } from 'next/server';
import { getRepositories } from '@/repository';
import { getUserFromRequest } from '@/lib/server-permissions';
import { errorResponse, successResponse } from '@/service/response';

export async function GET(request: NextRequest) {
  try {
    // 检查用户权限
    const userId = await getUserFromRequest();
    if (!userId) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const repos = await getRepositories();

    // 时间点计算
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - thisWeek.getDay());
    thisWeek.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // 快速统计计数（利用分页返回 total）
    const [totalRes, todayRes, weekRes] = await Promise.all([
      repos.logs.list({ page: 1, limit: 1 }),
      repos.logs.list({ startDate: today.toISOString(), page: 1, limit: 1 }),
      repos.logs.list({ startDate: thisWeek.toISOString(), page: 1, limit: 1 })
    ]);

    // 取出全部日志用于聚合（开发/小数据可接受）
    const allRes = await repos.logs.list({ page: 1, limit: 100000 });

    // 按级别统计
    const levelMap = new Map<string, number>();
    for (const l of allRes.data) {
      const key = String(l.level || 'info');
      levelMap.set(key, (levelMap.get(key) || 0) + 1);
    }
    const levelStats = Array.from(levelMap.entries()).map(([level, count]) => ({ level, count }));

    // 按模块统计（Top 10）
    const moduleMap = new Map<string, number>();
    for (const l of allRes.data) {
      const key = String(l.module || 'unknown');
      moduleMap.set(key, (moduleMap.get(key) || 0) + 1);
    }
    const moduleStats = Array.from(moduleMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([module, count]) => ({ module, count }));

    // 最近7天的日志趋势（按日期分组）
    const recentRes = await repos.logs.list({
      startDate: sevenDaysAgo.toISOString(),
      page: 1,
      limit: 100000
    });
    const dayMap = new Map<string, number>();
    for (const l of recentRes.data) {
      const d = l.createdAt ? new Date(l.createdAt) : new Date();
      const k = d.toISOString().slice(0, 10); // YYYY-MM-DD
      dayMap.set(k, (dayMap.get(k) || 0) + 1);
    }
    const weeklyTrend = Array.from(dayMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, count }));

    return successResponse({
      overview: {
        total: totalRes.total,
        today: todayRes.total,
        week: weekRes.total
      },
      levelStats,
      moduleStats,
      weeklyTrend
    });
  } catch (error) {
    console.error('获取日志统计失败:', error);
    return errorResponse('获取日志统计失败');
  }
}
