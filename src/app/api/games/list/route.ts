import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/games/list
 * 获取游戏列表（带筛选和分页）
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      page = 1,
      page_size = 20,
      keyword,
      provider_codes,
      categories,
      lang,
      status,
      is_new,
      is_featured,
      is_mobile_supported,
      is_demo_available,
      has_jackpot,
      sort_by = 'sort_order',
      sort_dir = 'desc'
    } = body;

    // 模拟数据（实际项目中应从数据库获取）
    const mockGames = [
      {
        id: 1,
        game_id: 'PG_DRAGON_HERO',
        name: '龙之英雄',
        lang: 'zh-CN',
        category: 'slot',
        provider_code: 'PG',
        min_bet: 0.1,
        max_bet: 500.0,
        rtp: 96.5,
        icon_url: 'https://placehold.co/100x100/png?text=Dragon',
        thumbnail_url: 'https://placehold.co/300x200/png?text=Dragon',
        description: '高波动率老虎机游戏，具有免费旋转和倍数奖励',
        supported_languages: ['en', 'zh-CN', 'th'],
        supported_currencies: ['USD', 'CNY', 'THB'],
        is_mobile_supported: true,
        is_demo_available: true,
        has_jackpot: false,
        has_bonus_game: true,
        status: true,
        is_featured: true,
        is_new: false,
        sort_order: 120,
        removed: false,
        play_count: 9821,
        popularity_score: 87.25,
        created_at: '2025-09-12T08:32:20Z',
        updated_at: '2025-11-10T14:03:11Z',
        last_played_at: '2025-11-11T10:27:05Z'
      },
      {
        id: 2,
        game_id: 'PP_STARLIGHT_PRINCESS',
        name: '星光公主',
        lang: 'zh-CN',
        category: 'slot',
        provider_code: 'PP',
        min_bet: 0.2,
        max_bet: 1000.0,
        rtp: 96.48,
        icon_url: 'https://placehold.co/100x100/png?text=Princess',
        thumbnail_url: 'https://placehold.co/300x200/png?text=Princess',
        description: '梦幻风格的老虎机，具有乘数和级联功能',
        supported_languages: ['en', 'zh-CN', 'zh-TW', 'th'],
        supported_currencies: ['USD', 'CNY', 'THB', 'VND'],
        is_mobile_supported: true,
        is_demo_available: true,
        has_jackpot: false,
        has_bonus_game: true,
        status: true,
        is_featured: true,
        is_new: true,
        sort_order: 150,
        removed: false,
        play_count: 15432,
        popularity_score: 92.5,
        created_at: '2025-10-15T10:20:30Z',
        updated_at: '2025-11-11T09:15:22Z',
        last_played_at: '2025-11-11T11:45:18Z'
      },
      {
        id: 3,
        game_id: 'EVO_LIGHTNING_ROULETTE',
        name: '闪电轮盘',
        lang: 'zh-CN',
        category: 'live',
        provider_code: 'EVO',
        min_bet: 0.5,
        max_bet: 5000.0,
        rtp: 97.3,
        icon_url: 'https://placehold.co/100x100/png?text=Roulette',
        thumbnail_url: 'https://placehold.co/300x200/png?text=Roulette',
        description: '真人荷官轮盘游戏，具有闪电倍数',
        supported_languages: ['en', 'zh-CN', 'zh-TW'],
        supported_currencies: ['USD', 'CNY', 'THB'],
        is_mobile_supported: true,
        is_demo_available: false,
        has_jackpot: false,
        has_bonus_game: false,
        status: true,
        is_featured: false,
        is_new: false,
        sort_order: 80,
        removed: false,
        play_count: 5234,
        popularity_score: 78.6,
        created_at: '2025-08-20T14:30:00Z',
        updated_at: '2025-11-08T16:22:33Z',
        last_played_at: '2025-11-10T22:10:45Z'
      },
      {
        id: 4,
        game_id: 'PG_FORTUNE_TIGER',
        name: '财富老虎',
        lang: 'zh-CN',
        category: 'slot',
        provider_code: 'PG',
        min_bet: 0.1,
        max_bet: 250.0,
        rtp: 96.81,
        icon_url: 'https://placehold.co/100x100/png?text=Tiger',
        thumbnail_url: 'https://placehold.co/300x200/png?text=Tiger',
        description: '中国风老虎机，具有重新旋转和奖金功能',
        supported_languages: ['en', 'zh-CN', 'th'],
        supported_currencies: ['USD', 'CNY', 'THB'],
        is_mobile_supported: true,
        is_demo_available: true,
        has_jackpot: false,
        has_bonus_game: true,
        status: true,
        is_featured: false,
        is_new: false,
        sort_order: 100,
        removed: false,
        play_count: 12345,
        popularity_score: 85.3,
        created_at: '2025-07-10T09:15:40Z',
        updated_at: '2025-11-09T13:45:28Z',
        last_played_at: '2025-11-11T08:33:12Z'
      },
      {
        id: 5,
        game_id: 'PP_GATES_OF_OLYMPUS',
        name: '奥林匹斯之门',
        lang: 'zh-CN',
        category: 'slot',
        provider_code: 'PP',
        min_bet: 0.2,
        max_bet: 1000.0,
        rtp: 96.5,
        icon_url: 'https://placehold.co/100x100/png?text=Olympus',
        thumbnail_url: 'https://placehold.co/300x200/png?text=Olympus',
        description: '希腊神话主题，具有级联和倍数功能',
        supported_languages: ['en', 'zh-CN', 'zh-TW', 'th', 'vi'],
        supported_currencies: ['USD', 'CNY', 'THB', 'VND'],
        is_mobile_supported: true,
        is_demo_available: true,
        has_jackpot: false,
        has_bonus_game: true,
        status: false,
        is_featured: false,
        is_new: false,
        sort_order: 90,
        removed: false,
        play_count: 8765,
        popularity_score: 81.2,
        created_at: '2025-06-05T11:20:15Z',
        updated_at: '2025-11-07T10:30:50Z',
        last_played_at: '2025-11-09T19:22:38Z'
      }
    ];

    // 筛选逻辑
    let filteredGames = [...mockGames];

    // 关键词搜索
    if (keyword) {
      const lowerKeyword = keyword.toLowerCase();
      filteredGames = filteredGames.filter(
        (game) =>
          game.name.toLowerCase().includes(lowerKeyword) ||
          game.game_id.toLowerCase().includes(lowerKeyword)
      );
    }

    // 供应商筛选
    if (provider_codes && provider_codes.length > 0) {
      filteredGames = filteredGames.filter((game) =>
        provider_codes.includes(game.provider_code)
      );
    }

    // 分类筛选
    if (categories && categories.length > 0) {
      filteredGames = filteredGames.filter((game) =>
        categories.includes(game.category)
      );
    }

    // 语言筛选
    if (lang) {
      filteredGames = filteredGames.filter((game) =>
        game.supported_languages.includes(lang)
      );
    }

    // 状态筛选
    if (status !== undefined && status !== 'all') {
      filteredGames = filteredGames.filter((game) => game.status === status);
    }

    // 新品筛选
    if (is_new !== undefined) {
      filteredGames = filteredGames.filter((game) => game.is_new === is_new);
    }

    // 推荐筛选
    if (is_featured !== undefined) {
      filteredGames = filteredGames.filter(
        (game) => game.is_featured === is_featured
      );
    }

    // 移动端筛选
    if (is_mobile_supported !== undefined) {
      filteredGames = filteredGames.filter(
        (game) => game.is_mobile_supported === is_mobile_supported
      );
    }

    // 试玩筛选
    if (is_demo_available !== undefined) {
      filteredGames = filteredGames.filter(
        (game) => game.is_demo_available === is_demo_available
      );
    }

    // 累积奖池筛选
    if (has_jackpot !== undefined) {
      filteredGames = filteredGames.filter(
        (game) => game.has_jackpot === has_jackpot
      );
    }

    // 排序
    filteredGames.sort((a, b) => {
      const aValue = a[sort_by as keyof typeof a];
      const bValue = b[sort_by as keyof typeof b];

      if (aValue === undefined || bValue === undefined) return 0;

      if (sort_dir === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // 分页
    const total = filteredGames.length;
    const start = (page - 1) * page_size;
    const end = start + page_size;
    const paginatedGames = filteredGames.slice(start, end);

    return NextResponse.json({
      total,
      page,
      page_size,
      list: paginatedGames
    });
  } catch (error) {
    console.error('获取游戏列表失败:', error);
    return NextResponse.json(
      { error: '获取游戏列表失败' },
      { status: 500 }
    );
  }
}
