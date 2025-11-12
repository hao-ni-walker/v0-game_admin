import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/items/list
 * 获取道具/礼包列表
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 这里应该是数据库操作
    // 现在只是模拟返回数据
    console.log('获取礼包列表:', body);

    // 模拟数据
    const mockData = [
      {
        id: 1,
        item_id: 7001001,
        category: 'box',
        name: '史诗宝箱',
        name_default: 'Epic Chest',
        rarity: 'epic',
        stack_limit: 1,
        is_consumable: true,
        bind_flag: true,
        status: 'active',
        display_icon: 'https://via.placeholder.com/40',
        display_color: '#7B61FF',
        sort_weight: 900,
        expire_days: 7,
        usage_limit: 1,
        level_required: 10,
        vip_required: 2,
        extra: { drop_table: 'epic_box_v3', preview: ['gem', 'ticket'] },
        created_at: '2025-10-20T08:20:00Z',
        updated_at: '2025-11-11T12:45:00Z',
        locale: body.locale || 'zh-CN',
        locale_overrides: {
          name: '史诗宝箱',
          description: '开启可获得稀有奖励，有概率开出传奇。',
          short_desc: '概率开传奇',
          display_icon: 'https://via.placeholder.com/40',
          extra_locale: { tooltip: '活动期掉率提升' }
        }
      },
      {
        id: 2,
        item_id: 7001002,
        category: 'currency',
        name: '金币',
        name_default: 'Gold Coin',
        rarity: 'common',
        stack_limit: 99999,
        is_consumable: true,
        bind_flag: false,
        status: 'active',
        display_icon: 'https://via.placeholder.com/40',
        display_color: '#FFD700',
        sort_weight: 800,
        expire_days: null,
        usage_limit: null,
        level_required: 1,
        vip_required: 0,
        extra: { currency_type: 'soft' },
        created_at: '2025-10-15T10:00:00Z',
        updated_at: '2025-11-10T15:30:00Z',
        locale: body.locale || 'zh-CN',
        locale_overrides: {
          name: '金币',
          description: '游戏内通用货币',
          short_desc: '通用货币'
        }
      },
      {
        id: 3,
        item_id: 7001003,
        category: 'ticket',
        name: '抽奖券',
        name_default: 'Lottery Ticket',
        rarity: 'rare',
        stack_limit: 100,
        is_consumable: true,
        bind_flag: true,
        status: 'active',
        display_icon: 'https://via.placeholder.com/40',
        display_color: '#3B82F6',
        sort_weight: 850,
        expire_days: 30,
        usage_limit: 10,
        level_required: 5,
        vip_required: 1,
        extra: { lottery_pool: 'standard' },
        created_at: '2025-10-18T14:20:00Z',
        updated_at: '2025-11-09T09:15:00Z',
        locale: body.locale || 'zh-CN',
        locale_overrides: {
          name: '抽奖券',
          description: '可用于参与抽奖活动',
          short_desc: '抽奖专用'
        }
      },
      {
        id: 4,
        item_id: 7001004,
        category: 'buff',
        name: '经验加成卡',
        name_default: 'EXP Boost Card',
        rarity: 'rare',
        stack_limit: 10,
        is_consumable: true,
        bind_flag: false,
        status: 'active',
        display_icon: 'https://via.placeholder.com/40',
        display_color: '#10B981',
        sort_weight: 820,
        expire_days: 14,
        usage_limit: null,
        level_required: 10,
        vip_required: 0,
        extra: { boost_percent: 50, duration_hours: 1 },
        created_at: '2025-10-22T11:30:00Z',
        updated_at: '2025-11-08T16:20:00Z',
        locale: body.locale || 'zh-CN',
        locale_overrides: {
          name: '经验加成卡',
          description: '使用后1小时内经验获取提升50%',
          short_desc: '+50%经验'
        }
      },
      {
        id: 5,
        item_id: 7001005,
        category: 'skin',
        name: '传奇皮肤',
        name_default: 'Legendary Skin',
        rarity: 'legendary',
        stack_limit: 1,
        is_consumable: false,
        bind_flag: true,
        status: 'active',
        display_icon: 'https://via.placeholder.com/40',
        display_color: '#F59E0B',
        sort_weight: 950,
        expire_days: null,
        usage_limit: null,
        level_required: 30,
        vip_required: 5,
        extra: { skin_id: 'legendary_001', special_effects: true },
        created_at: '2025-11-01T08:00:00Z',
        updated_at: '2025-11-12T10:00:00Z',
        locale: body.locale || 'zh-CN',
        locale_overrides: {
          name: '传奇皮肤',
          description: '稀有外观，附带特殊特效',
          short_desc: '稀有外观'
        }
      }
    ];

    // 应用筛选条件
    let filteredData = [...mockData];

    // 关键词搜索
    if (body.keyword) {
      filteredData = filteredData.filter(item =>
        item.name.includes(body.keyword) ||
        item.name_default.includes(body.keyword)
      );
    }

    // 类别筛选
    if (body.categories && body.categories.length > 0) {
      filteredData = filteredData.filter(item =>
        body.categories.includes(item.category)
      );
    }

    // 稀有度筛选
    if (body.rarities && body.rarities.length > 0) {
      filteredData = filteredData.filter(item =>
        body.rarities.includes(item.rarity)
      );
    }

    // 状态筛选
    if (body.statuses && body.statuses.length > 0) {
      filteredData = filteredData.filter(item =>
        body.statuses.includes(item.status)
      );
    }

    // 消耗品筛选
    if (body.is_consumable !== undefined) {
      filteredData = filteredData.filter(item =>
        item.is_consumable === body.is_consumable
      );
    }

    // 绑定筛选
    if (body.bind_flag !== undefined) {
      filteredData = filteredData.filter(item =>
        item.bind_flag === body.bind_flag
      );
    }

    // VIP等级筛选
    if (body.vip_min !== undefined) {
      filteredData = filteredData.filter(item =>
        (item.vip_required || 0) >= body.vip_min
      );
    }
    if (body.vip_max !== undefined) {
      filteredData = filteredData.filter(item =>
        (item.vip_required || 0) <= body.vip_max
      );
    }

    // 玩家等级筛选
    if (body.level_min !== undefined) {
      filteredData = filteredData.filter(item =>
        (item.level_required || 0) >= body.level_min
      );
    }
    if (body.level_max !== undefined) {
      filteredData = filteredData.filter(item =>
        (item.level_required || 0) <= body.level_max
      );
    }

    // 排序
    const sortBy = body.sort_by || 'sort_weight';
    const sortDir = body.sort_dir || 'desc';
    
    filteredData.sort((a: any, b: any) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === 'rarity') {
        const rarityOrder = { common: 1, rare: 2, epic: 3, legendary: 4 };
        aVal = rarityOrder[a.rarity as keyof typeof rarityOrder];
        bVal = rarityOrder[b.rarity as keyof typeof rarityOrder];
      }
      
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
    console.error('获取礼包列表失败:', error);
    return NextResponse.json(
      { error: '获取礼包列表失败' },
      { status: 500 }
    );
  }
}
