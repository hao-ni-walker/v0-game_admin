import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/banners/list
 * 获取轮播图列表（带筛选和分页）
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      page = 1,
      page_size = 20,
      keyword,
      positions,
      status,
      disabled = false,
      show_removed = false,
      active_only = false,
      sort_by = 'sort_order',
      sort_dir = 'desc'
    } = body;

    // 模拟数据
    const mockBanners = [
      {
        id: 1001,
        title: '欢迎周礼包',
        image_url: 'https://placehold.co/800x300/png?text=Welcome',
        link_url: '/promo/welcome',
        target: '_self',
        position: 'home',
        sort_order: 500,
        start_time: '2025-11-01T00:00:00Z',
        end_time: '2025-11-30T23:59:59Z',
        status: 1,
        version: 3,
        created_at: '2025-10-28T09:15:00Z',
        updated_at: '2025-11-10T12:00:00Z',
        removed: false,
        disabled: false
      },
      {
        id: 1002,
        title: '限时彩票活动',
        image_url: 'https://placehold.co/800x300/png?text=Lottery',
        link_url: '/promo/lottery',
        target: '_blank',
        position: 'promo',
        sort_order: 480,
        start_time: '2025-11-05T00:00:00Z',
        end_time: '2025-11-15T23:59:59Z',
        status: 1,
        version: 1,
        created_at: '2025-11-04T10:20:30Z',
        updated_at: '2025-11-10T14:30:22Z',
        removed: false,
        disabled: false
      },
      {
        id: 1003,
        title: '新游戏上线',
        image_url: 'https://placehold.co/800x300/png?text=New+Game',
        link_url: '/games/new',
        target: '_self',
        position: 'games_top',
        sort_order: 450,
        start_time: '2025-11-08T00:00:00Z',
        end_time: null,
        status: 1,
        version: 2,
        created_at: '2025-11-07T08:00:00Z',
        updated_at: '2025-11-11T10:15:44Z',
        removed: false,
        disabled: false
      },
      {
        id: 1004,
        title: '节假日特惠',
        image_url: 'https://placehold.co/800x300/png?text=Holiday',
        link_url: '/promo/holiday',
        target: '_self',
        position: 'footer',
        sort_order: 400,
        start_time: '2025-12-01T00:00:00Z',
        end_time: '2025-12-31T23:59:59Z',
        status: 0,
        version: 1,
        created_at: '2025-10-20T14:22:10Z',
        updated_at: '2025-11-10T09:45:33Z',
        removed: false,
        disabled: false
      },
      {
        id: 1005,
        title: '已过期的活动',
        image_url: 'https://placehold.co/800x300/png?text=Expired',
        link_url: '/promo/expired',
        target: '_self',
        position: 'home',
        sort_order: 350,
        start_time: '2025-10-01T00:00:00Z',
        end_time: '2025-10-31T23:59:59Z',
        status: 1,
        version: 1,
        created_at: '2025-09-30T11:00:00Z',
        updated_at: '2025-10-31T20:00:00Z',
        removed: false,
        disabled: true
      }
    ];

    // 筛选逻辑
    let filteredBanners = [...mockBanners];

    // 关键词搜索
    if (keyword) {
      const lowerKeyword = keyword.toLowerCase();
      filteredBanners = filteredBanners.filter(
        (banner) =>
          (banner.title && banner.title.toLowerCase().includes(lowerKeyword)) ||
          (banner.link_url && banner.link_url.toLowerCase().includes(lowerKeyword))
      );
    }

    // 位置筛选
    if (positions && positions.length > 0) {
      filteredBanners = filteredBanners.filter((banner) =>
        positions.includes(banner.position)
      );
    }

    // 状态筛选
    if (status !== undefined && status !== 'all') {
      filteredBanners = filteredBanners.filter((banner) => banner.status === status);
    }

    // 禁用筛选
    if (disabled) {
      filteredBanners = filteredBanners.filter((banner) => banner.disabled === disabled);
    }

    // 删除筛选
    if (!show_removed) {
      filteredBanners = filteredBanners.filter((banner) => !banner.removed);
    }

    // 仅生效中筛选
    if (active_only) {
      const now = new Date();
      filteredBanners = filteredBanners.filter((banner) => {
        const isStatusActive = banner.status === 1;
        const isNotDisabled = !banner.disabled;
        const isInTimePeriod =
          (!banner.start_time || new Date(banner.start_time) <= now) &&
          (!banner.end_time || new Date(banner.end_time) >= now);
        return isStatusActive && isNotDisabled && isInTimePeriod;
      });
    }

    // 排序
    filteredBanners.sort((a, b) => {
      const aValue = a[sort_by as keyof typeof a];
      const bValue = b[sort_by as keyof typeof b];

      if (aValue === undefined || aValue === null || bValue === undefined || bValue === null) return 0;

      if (sort_dir === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // 分页
    const total = filteredBanners.length;
    const start = (page - 1) * page_size;
    const end = start + page_size;
    const paginatedBanners = filteredBanners.slice(start, end);

    return NextResponse.json({
      total,
      page,
      page_size,
      list: paginatedBanners
    });
  } catch (error) {
    console.error('获取轮播图列表失败:', error);
    return NextResponse.json(
      { error: '获取轮播图列表失败' },
      { status: 500 }
    );
  }
}
