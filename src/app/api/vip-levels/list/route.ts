import { NextRequest, NextResponse } from 'next/server';

/**
 * VIP等级列表接口
 * POST /api/vip-levels/list
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 解析请求参数
    const {
      page = 1,
      page_size = 20,
      keyword,
      level_min,
      level_max,
      required_exp_min,
      required_exp_max,
      disabled,
      show_removed = false,
      created_from,
      created_to,
      updated_from,
      updated_to,
      sort_by = 'default',
      sort_dir = 'asc'
    } = body;

    // TODO: 实际实现时从数据库查询
    // 这里返回模拟数据
    const mockData = {
      total: 8,
      page,
      page_size,
      list: [
        {
          id: 1,
          level: 0,
          name: 'VIP0',
          required_exp: 0,
          upgrade_reward: null,
          daily_reward: null,
          withdraw_daily_limit: 3,
          withdraw_amount_limit: 1000.0,
          commission_rate: 0.0,
          benefits: null,
          version: 1,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
          removed: false,
          disabled: false
        },
        {
          id: 2,
          level: 1,
          name: 'VIP1',
          required_exp: 1000,
          upgrade_reward: 10.0,
          daily_reward: 1.0,
          withdraw_daily_limit: 5,
          withdraw_amount_limit: 2000.0,
          commission_rate: 0.001,
          benefits: {
            priority_support: true,
            badge: 'vip1'
          },
          version: 2,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-02-15T10:00:00Z',
          removed: false,
          disabled: false
        },
        {
          id: 3,
          level: 2,
          name: 'VIP2',
          required_exp: 3000,
          upgrade_reward: 15.0,
          daily_reward: 1.5,
          withdraw_daily_limit: 5,
          withdraw_amount_limit: 3000.0,
          commission_rate: 0.0025,
          benefits: {
            priority_support: true,
            badge: 'vip2',
            lottery_extra_times: 1
          },
          version: 1,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-03-10T12:00:00Z',
          removed: false,
          disabled: false
        },
        {
          id: 4,
          level: 3,
          name: 'VIP3',
          required_exp: 5000,
          upgrade_reward: 18.0,
          daily_reward: 2.0,
          withdraw_daily_limit: 5,
          withdraw_amount_limit: 5000.0,
          commission_rate: 0.005,
          benefits: {
            priority_support: true,
            badge: 'vip3',
            lottery_extra_times: 1
          },
          version: 4,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-11-10T12:00:00Z',
          removed: false,
          disabled: false
        },
        {
          id: 5,
          level: 4,
          name: 'VIP4',
          required_exp: 10000,
          upgrade_reward: 30.0,
          daily_reward: 3.0,
          withdraw_daily_limit: 10,
          withdraw_amount_limit: 10000.0,
          commission_rate: 0.0075,
          benefits: {
            priority_support: true,
            badge: 'vip4',
            lottery_extra_times: 2,
            task_multiplier: 1.5
          },
          version: 2,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-10-05T08:00:00Z',
          removed: false,
          disabled: false
        },
        {
          id: 6,
          level: 5,
          name: 'VIP5',
          required_exp: 20000,
          upgrade_reward: 50.0,
          daily_reward: 5.0,
          withdraw_daily_limit: 10,
          withdraw_amount_limit: 20000.0,
          commission_rate: 0.01,
          benefits: {
            priority_support: true,
            badge: 'vip5',
            lottery_extra_times: 3,
            task_multiplier: 2.0,
            exclusive_games: true
          },
          version: 3,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-09-20T14:30:00Z',
          removed: false,
          disabled: false
        }
      ]
    };

    return NextResponse.json(mockData);
  } catch (error) {
    console.error('获取VIP等级列表失败:', error);
    return NextResponse.json(
      { error: '获取VIP等级列表失败' },
      { status: 500 }
    );
  }
}
