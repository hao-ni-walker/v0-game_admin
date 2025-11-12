import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/announcements/list
 * 获取公告列表
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('获取公告列表:', body);

    // 模拟数据
    const mockData = [
      {
        id: 5012,
        title: '系统维护公告',
        content: '11 月 15 日 02:00–04:00 将进行系统维护，期间部分服务不可用。',
        type: 3,
        priority: 1,
        start_time: '2025-11-15T02:00:00Z',
        end_time: '2025-11-15T04:00:00Z',
        status: 1,
        version: 2,
        created_at: '2025-11-10T08:00:00Z',
        updated_at: '2025-11-12T10:20:00Z',
        removed: false,
        disabled: false
      },
      {
        id: 5011,
        title: '双11狂欢活动开启',
        content: '参与双11活动，赢取丰厚奖励！活动时间：11月11日全天。',
        type: 2,
        priority: 2,
        start_time: '2025-11-11T00:00:00Z',
        end_time: '2025-11-11T23:59:59Z',
        status: 1,
        version: 1,
        created_at: '2025-11-08T10:00:00Z',
        updated_at: '2025-11-10T15:30:00Z',
        removed: false,
        disabled: false,
        activity_code: 'DOUBLE_11_2025'
      },
      {
        id: 5010,
        title: '系统升级通知',
        content: '为了给您提供更好的服务体验，我们将在近期进行系统升级。',
        type: 1,
        priority: 2,
        start_time: '2025-11-01T00:00:00Z',
        end_time: null,
        status: 1,
        version: 3,
        created_at: '2025-11-01T09:00:00Z',
        updated_at: '2025-11-11T08:15:00Z',
        removed: false,
        disabled: false
      },
      {
        id: 5009,
        title: '紧急维护通知',
        content: '因突发问题，需要进行紧急维护，预计30分钟恢复。',
        type: 3,
        priority: 1,
        start_time: '2025-11-12T14:00:00Z',
        end_time: '2025-11-12T14:30:00Z',
        status: 0,
        version: 1,
        created_at: '2025-11-12T13:55:00Z',
        updated_at: '2025-11-12T14:35:00Z',
        removed: false,
        disabled: true
      },
      {
        id: 5008,
        title: '新功能上线公告',
        content: '全新功能已上线，快来体验吧！',
        type: 1,
        priority: 3,
        start_time: '2025-11-05T00:00:00Z',
        end_time: '2025-11-20T23:59:59Z',
        status: 1,
        version: 2,
        created_at: '2025-11-05T08:00:00Z',
        updated_at: '2025-11-05T10:00:00Z',
        removed: false,
        disabled: false
      }
    ];

    // 应用筛选条件
    let filteredData = [...mockData];

    // 关键词搜索
    if (body.keyword) {
      filteredData = filteredData.filter(item =>
        item.title.includes(body.keyword)
      );
    }

    // 类型筛选
    if (body.types && body.types.length > 0) {
      filteredData = filteredData.filter(item =>
        body.types.includes(item.type)
      );
    }

    // 状态筛选
    if (body.status !== undefined && body.status !== null) {
      filteredData = filteredData.filter(item =>
        item.status === body.status
      );
    }

    // 禁用筛选
    if (body.disabled !== undefined) {
      if (!body.disabled) {
        filteredData = filteredData.filter(item => !item.disabled);
      }
    }

    // 显示已删除
    if (!body.show_removed) {
      filteredData = filteredData.filter(item => !item.removed);
    }

    // 仅生效中
    if (body.active_only) {
      const now = new Date().toISOString();
      filteredData = filteredData.filter(item => {
        if (item.disabled || item.status === 0 || item.removed) return false;
        const startOk = !item.start_time || item.start_time <= now;
        const endOk = !item.end_time || item.end_time >= now;
        return startOk && endOk;
      });
    }

    // 排序
    const sortBy = body.sort_by || 'default';
    const sortDir = body.sort_dir || 'asc';
    
    filteredData.sort((a: any, b: any) => {
      if (sortBy === 'default') {
        // 默认排序：priority 升序，start_time 降序，updated_at 降序，id 降序
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }
        if (a.start_time && b.start_time) {
          return new Date(b.start_time).getTime() - new Date(a.start_time).getTime();
        }
        if (new Date(a.updated_at).getTime() !== new Date(b.updated_at).getTime()) {
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        }
        return b.id - a.id;
      }

      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortDir === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    // 分页
    const page = body.page || 1;
    const page_size = body.page_size || 20;
    const total = filteredData.length;
    const start = (page - 1) * page_size;
    const end = start + page_size;
    const paginatedData = filteredData.slice(start, end);

    return NextResponse.json({
      total,
      page,
      page_size,
      list: paginatedData
    });
  } catch (error) {
    console.error('获取公告列表失败:', error);
    return NextResponse.json(
      { error: '获取公告列表失败' },
      { status: 500 }
    );
  }
}
