/**
 * 系统参数业务语言目录
 *
 * 把 system_configs 表里的技术键翻译成运营可读的业务语言：
 * - 每个配置键一个业务名称 + 分类 + 业务描述；
 * - 键内每个子字段一条 dot-path 元数据（业务名/说明/类型/单位），
 *   编辑弹窗按此逐字段渲染表单，不再要求运营手改整段 JSON。
 *
 * 活/死键标注（live=false 表示运行时不读取此键，仅历史残留或展示用），
 * 提示文案必须与代码实际读取方一致，勿凭感觉改。
 */

export type CatalogFieldType = 'number' | 'string' | 'boolean' | 'url';

export interface CatalogField {
  /** JSON 内的 dot 路径，如 `sweep_enabled.TON`、`commission.default_rate` */
  path: string;
  /** 业务字段名 */
  name: string;
  /** 业务说明（单位、生效范围、注意事项） */
  hint?: string;
  type: CatalogFieldType;
  /** 展示单位（USD / 秒 / TON …），仅展示 */
  unit?: string;
  /** 只读展示（运行时读常量等，改了无效） */
  readOnly?: boolean;
  /**
   * 死字段：运行时不读取此子键（2026-10 逐键核实）。
   * 展示红色「不读取」标，编辑弹窗中禁用输入防止误改。
   */
  dead?: boolean;
}

export interface CatalogEntry {
  /** system_configs.config_key */
  key: string;
  /** 业务名称 */
  name: string;
  /** 业务分类（筛选用） */
  category: string;
  /** 业务描述 */
  description: string;
  /** 运行时是否读取（活键热生效；死键只在后台展示，实际参数在别处） */
  live: boolean;
  /** 死键/共用入口等特别提示 */
  note?: string;
  /** 子字段（按 group 分组渲染） */
  groups: { name: string; fields: CatalogField[] }[];
}

export const FIELD_CATALOG: CatalogEntry[] = [
  {
    key: 'deposit_config',
    name: '充值与归集',
    category: '充值提现',
    description:
      '充值运行参数（热生效）。⚠️ 仅前两组 5 个参数被运行时读取；确认数/扫链频率/平台钱包等已迁至托管服务与链注册表，此处不再读取（详见各组标注）。',
    live: true,
    groups: [
      {
        name: '入账与超时（生效）',
        fields: [
          {
            path: 'deposit_timeout_minutes',
            name: '待支付超时（分钟）',
            hint: '充值发起后超过该时长未到账，订单自动置为失败；超时读路径会懒扫描',
            type: 'number',
            unit: '分钟'
          },
          {
            path: 'ton_deposit_min_ton',
            name: 'TON 最小充值额',
            hint: '低于该金额的 TON 充值不入账',
            type: 'number',
            unit: 'TON'
          },
          {
            path: 'deposit_ton_usd_rate',
            name: 'TON 展示兜底汇率',
            hint: 'OKX 实时价取不到时的展示用汇率；仅用于估算显示，不入账；非正数自动回落环境变量默认值',
            type: 'number',
            unit: 'USD/TON'
          },
          {
            path: 'deposit_credit_fallback_rate',
            name: 'TON 入账兜底汇率',
            hint: '实时价取不到时的入账折算率；刻意保守（默认 1.0）防止多入账；提现报价永不兜底',
            type: 'number',
            unit: 'USD/TON'
          },
          {
            path: 'max_wallets_per_user',
            name: '每用户充值地址数上限',
            type: 'number',
            unit: '个'
          }
        ]
      },
      {
        name: '入账确认数（不读取）',
        fields: [
          {
            path: 'ton_deposit_confirmations',
            name: 'TON 入账确认数',
            hint: '实际确认数由托管扫链服务与「链注册」表（chain_registry）判定，此处不读取',
            type: 'number',
            unit: '块',
            dead: true
          },
          {
            path: 'evm_deposit_confirmations',
            name: 'EVM 链入账确认数',
            hint: '实际确认数由托管扫链服务与「链注册」表判定，此处不读取',
            type: 'number',
            unit: '块',
            dead: true
          },
          {
            path: 'tron_deposit_confirmations',
            name: 'TRON 入账确认数',
            hint: '实际确认数由托管扫链服务与「链注册」表判定，此处不读取',
            type: 'number',
            unit: '块',
            dead: true
          },
          {
            path: 'deposit_confirmations_required',
            name: '通用入账确认数（兜底）',
            hint: '历史兜底键，运行时无读者',
            type: 'number',
            unit: '块',
            dead: true
          }
        ]
      },
      {
        name: '扫链频率与平台钱包（不读取）',
        fields: [
          {
            path: 'ton_poll_interval_seconds',
            name: 'TON 扫链间隔',
            hint: '扫链轮询在托管服务侧，此处不读取',
            type: 'number',
            unit: '秒',
            dead: true
          },
          {
            path: 'evm_poll_interval_seconds',
            name: 'EVM 扫链间隔',
            hint: '扫链轮询在托管服务侧，此处不读取',
            type: 'number',
            unit: '秒',
            dead: true
          },
          {
            path: 'tron_poll_interval_seconds',
            name: 'TRON 扫链间隔',
            hint: '扫链轮询在托管服务侧，此处不读取',
            type: 'number',
            unit: '秒',
            dead: true
          },
          {
            path: 'platform_ton_wallet',
            name: '平台 TON 热钱包',
            hint: '托管模式下充值地址由托管服务派生，此处不读取',
            type: 'string',
            dead: true
          },
          {
            path: 'platform_evm_wallet',
            name: '平台 EVM 热钱包',
            hint: '托管模式下充值地址由托管服务派生，此处不读取',
            type: 'string',
            dead: true
          },
          {
            path: 'deposit_simulated_transfer_delay_seconds',
            name: '模拟转账延迟',
            hint: '历史测试用键，运行时无读者',
            type: 'number',
            unit: '秒',
            dead: true
          }
        ]
      },
      {
        name: '归集（不读取）',
        fields: [
          {
            path: 'sweep_enabled.TON',
            name: 'TON 归集开关',
            type: 'boolean',
            dead: true
          },
          {
            path: 'sweep_enabled.ETH',
            name: 'ETH 归集开关',
            type: 'boolean',
            dead: true
          },
          {
            path: 'sweep_enabled.BSC',
            name: 'BSC 归集开关',
            type: 'boolean',
            dead: true
          },
          {
            path: 'sweep_enabled.TRON',
            name: 'TRON 归集开关',
            type: 'boolean',
            dead: true
          },
          {
            path: 'sweep_min_gain_usd.TON',
            name: 'TON 归集最小收益',
            type: 'number',
            unit: 'USD',
            dead: true
          },
          {
            path: 'sweep_min_gain_usd.ETH',
            name: 'ETH 归集最小收益',
            type: 'number',
            unit: 'USD',
            dead: true
          },
          {
            path: 'sweep_min_gain_usd.BSC',
            name: 'BSC 归集最小收益',
            type: 'number',
            unit: 'USD',
            dead: true
          },
          {
            path: 'sweep_min_gain_usd.TRON',
            name: 'TRON 归集最小收益',
            type: 'number',
            unit: 'USD',
            dead: true
          },
          {
            path: 'sweep_interval_seconds',
            name: '归集轮询间隔',
            type: 'number',
            unit: '秒',
            dead: true
          },
          {
            path: 'sweep_gas_reserve_ton',
            name: '归集 Gas 预留（TON）',
            type: 'number',
            unit: 'TON',
            dead: true
          }
        ]
      }
    ],
    note: '归集与扫链已整体迁至托管服务（CoinChest），入账确认数以「链注册」表与托管侧为准；本键仅「入账与超时」组的 5 个参数被读取。'
  },
  {
    key: 'content_config',
    name: '客服与内容链接',
    category: '内容客服',
    description:
      '官网/机器人对外链接与带单信号发布规范。热生效，经 /public/config 下发前端。',
    live: true,
    groups: [
      {
        name: '对外链接',
        fields: [
          {
            path: 'help_channel_url',
            name: '帮助频道链接',
            hint: 'Telegram 官方频道地址，展示在小程序帮助入口与机器人 /help',
            type: 'url'
          },
          {
            path: 'support_url',
            name: '在线客服链接',
            hint: '客服会话地址（如 @PredictXGoSupportBot）；为空时客服按钮不展示',
            type: 'url'
          }
        ]
      },
      {
        name: '带单信号规范',
        fields: [
          {
            path: 'leader_signal_image_max_bytes',
            name: '信号图片大小上限',
            type: 'number',
            unit: '字节'
          },
          {
            path: 'leader_signal_image_max_count',
            name: '信号图片数量上限',
            type: 'number',
            unit: '张'
          },
          {
            path: 'leader_signal_text_max_chars',
            name: '信号文字长度上限',
            type: 'number',
            unit: '字'
          },
          {
            path: 'leader_signal_longform_max_chars',
            name: '长文信号长度上限',
            type: 'number',
            unit: '字'
          },
          {
            path: 'leader_signal_review_sla_seconds',
            name: '信号审核时限',
            hint: '超时未审自动提醒',
            type: 'number',
            unit: '秒'
          },
          {
            path: 'leader_signal_warning_quota_penalty',
            name: '信号违规扣额度',
            hint: '违规一次扣除的发布额度',
            type: 'number'
          }
        ]
      }
    ]
  },
  {
    key: 'copytrade_config',
    name: '跟单全局配置',
    category: '跟单',
    description:
      '带单申请门槛、跟单限制、佣金结构与跟单份数上限。热生效（每次读取即时合并）；个别历史字段无读者，见组内标注。',
    live: true,
    groups: [
      {
        name: '带单申请条件',
        fields: [
          {
            path: 'leader_apply_conditions.min_deposit',
            name: '累计充值门槛',
            hint: '申请成为带单员所需的累计充值金额',
            type: 'number',
            unit: 'USD'
          },
          {
            path: 'leader_apply_conditions.min_orders',
            name: '累计注单数门槛',
            type: 'number',
            unit: '单'
          },
          {
            path: 'leader_apply_conditions.min_register_days',
            name: '注册天数门槛',
            type: 'number',
            unit: '天'
          }
        ]
      },
      {
        name: '跟单限制',
        fields: [
          {
            path: 'follow_limits.max_following_per_user',
            name: '每人最多同时跟单人数',
            type: 'number',
            unit: '人'
          },
          {
            path: 'follow_limits.default_max_followers_per_leader',
            name: '每位带单员默认粉丝上限',
            type: 'number',
            unit: '人'
          },
          {
            path: 'follow_limits.default_daily_copy_limit',
            name: '默认日跟单金额上限',
            hint: '运行时无读者（历史字段）',
            type: 'number',
            unit: 'USD',
            dead: true
          }
        ]
      },
      {
        name: '佣金',
        fields: [
          {
            path: 'commission.default_rate',
            name: '默认佣金比例',
            hint: '新带单员默认亏损单返佣比例（0.08 = 8%）',
            type: 'number'
          },
          {
            path: 'commission.min_rate',
            name: '佣金比例下限',
            type: 'number'
          },
          {
            path: 'commission.max_rate',
            name: '佣金比例上限',
            type: 'number'
          },
          {
            path: 'commission.frozen_hours',
            name: '佣金冻结时长',
            hint: '佣金计提后冻结指定小时才可提（对齐 T+72h 邀请佣金的思路）',
            type: 'number',
            unit: '小时'
          },
          {
            path: 'commission.min_withdraw',
            name: '佣金起提金额',
            type: 'number',
            unit: 'USD'
          }
        ]
      },
      {
        name: '跟单风控',
        fields: [
          {
            path: 'risk.copy_order_counts_toward_user_limits',
            name: '跟单占用用户限额',
            hint: '运行时无读者（历史字段）',
            type: 'boolean',
            dead: true
          },
          {
            path: 'risk.copy_order_respects_odds_zero',
            name: '赔率为零时禁止跟单',
            hint: '运行时无读者（历史字段）',
            type: 'boolean',
            dead: true
          },
          {
            path: 'risk.max_copy_orders_per_leader_order',
            name: '单笔带单最大跟单份数',
            type: 'number',
            unit: '份'
          }
        ]
      }
    ]
  },
  {
    key: 'alert_config',
    name: '告警机器人通道',
    category: '告警',
    description: '运维告警的 Telegram 机器人令牌与目标会话。与「告警设置」页维护同一份数据。',
    live: true,
    groups: [
      {
        name: 'Telegram 通道',
        fields: [
          {
            path: 'alert_telegram_chat_id',
            name: '告警会话 ID',
            hint: '运维告警群/频道的 chat id（负数开头）',
            type: 'string'
          },
          {
            path: 'alert_telegram_bot_token',
            name: '告警机器人 Token',
            hint: '专用告警 bot 的令牌；bot 须在目标群内',
            type: 'string'
          }
        ]
      }
    ]
  },
  {
    key: 'market_stream_config',
    name: '行情源出站代理',
    category: '行情',
    description: '行情备用源（Binance）出站代理。OKX 主源永不经代理。',
    live: true,
    groups: [
      {
        name: '代理',
        fields: [
          {
            path: 'binance_proxy',
            name: 'Binance 出站代理',
            hint: '格式 http://host:port 或 socks5://host:port；出口须非美国（Binance 451 地缘封锁）；留空禁用代理',
            type: 'string'
          }
        ]
      }
    ]
  },
  {
    key: 'system.referral',
    name: '邀请返佣比例',
    category: '邀请',
    description: '邀请好友的流水返佣比例。与「邀请返佣」页维护同一份数据。',
    live: true,
    groups: [
      {
        name: '返佣',
        fields: [
          {
            path: 'commission_rate',
            name: '流水返佣比例',
            hint: '按被邀请人下注流水计佣（0.025 = 2.5%）；实际到账为其一半（见下行）',
            type: 'number'
          },
          {
            path: 'reward_share_rate',
            name: '邀请人分成比例（固定）',
            hint: '运行时固定读常量 0.50，修改此值不生效',
            type: 'number',
            readOnly: true
          }
        ]
      }
    ]
  },
  {
    key: 'pool_safety_lines',
    name: '资金池安全线',
    category: '资金池',
    description: '资金池页的三档余额水位线，仅用于后台展示着色。',
    live: true,
    groups: [
      {
        name: '水位线',
        fields: [
          { path: 'healthy', name: '健康线', type: 'number', unit: 'USD' },
          { path: 'warning', name: '预警线', type: 'number', unit: 'USD' },
          { path: 'danger', name: '危险线', type: 'number', unit: 'USD' }
        ]
      }
    ]
  },
  {
    key: 'admin.limits',
    name: '下注限额（历史）',
    category: '交易',
    description: '单笔/日累计/全站周期下注限额与截单提前秒数。',
    live: false,
    note: '⚠️ 运行时不再读取此键：实际下注/提现限额以「风控参数」页（risk_params 表）为准，此处仅作历史参考。',
    groups: [
      {
        name: '单笔限额',
        fields: [
          { path: 'single_order.min_amount', name: '单笔最小下注', type: 'number', unit: 'USD' },
          { path: 'single_order.max_amount', name: '单笔最大下注', type: 'number', unit: 'USD' },
          { path: 'single_order.vip_max_amount', name: 'VIP 单笔上限', type: 'number', unit: 'USD' }
        ]
      },
      {
        name: '用户日限额',
        fields: [
          { path: 'user_daily.max_bet_total', name: '日下注总额上限', type: 'number', unit: 'USD' },
          { path: 'user_daily.max_pending_orders', name: '待结算单数上限', type: 'number', unit: '单' },
          { path: 'user_daily.max_bet_per_period', name: '单周期下注上限', type: 'number', unit: 'USD' }
        ]
      },
      {
        name: '全站限额',
        fields: [
          { path: 'platform_global.max_per_period_total', name: '全站周期总限额', type: 'number', unit: 'USD' },
          { path: 'platform_global.max_per_direction', name: '单方向总限额', type: 'number', unit: 'USD' }
        ]
      },
      {
        name: '截单提前秒数',
        fields: [
          { path: 'deadline_offsets.30s', name: '30 秒期截单提前', type: 'number', unit: '秒' },
          { path: 'deadline_offsets.1m', name: '1 分钟期截单提前', type: 'number', unit: '秒' },
          { path: 'deadline_offsets.3m', name: '3 分钟期截单提前', type: 'number', unit: '秒' },
          { path: 'deadline_offsets.5m', name: '5 分钟期截单提前', type: 'number', unit: '秒' },
          { path: 'deadline_offsets.10m', name: '10 分钟期截单提前', type: 'number', unit: '秒' }
        ]
      }
    ]
  },
  {
    key: 'system.withdraw',
    name: '提现限额与费率（历史）',
    category: '充值提现',
    description: '单笔最低提现、单日累计上限与手续费率。',
    live: false,
    note: '⚠️ 运行时不读取此键：实际提现限额以「风控参数」页（risk_params 表）为准，此处仅作历史参考。',
    groups: [
      {
        name: '提现',
        fields: [
          { path: 'min_amount_usd', name: '单笔最低提现', type: 'number', unit: 'USD' },
          { path: 'max_daily_usd', name: '单日提现上限', type: 'number', unit: 'USD' },
          {
            path: 'fee_rate',
            name: '提现手续费率',
            hint: '小数形式（0.001 = 0.1%）',
            type: 'number'
          }
        ]
      }
    ]
  },
  {
    key: 'system.risk_thresholds',
    name: '风险敞口阈值（历史）',
    category: '风控',
    description: '全站单方向敞口的三档告警阈值。',
    live: false,
    note: '⚠️ 运行时不读取此键：实际风控阈值与敞口展示以「风控参数」页为准，此处仅作历史参考。',
    groups: [
      {
        name: '敞口阈值',
        fields: [
          { path: 'exposure_warning', name: '预警线', type: 'number', unit: 'USD' },
          { path: 'exposure_high', name: '高压线', type: 'number', unit: 'USD' },
          { path: 'exposure_extreme', name: '极限线', type: 'number', unit: 'USD' }
        ]
      }
    ]
  }
];

/** 分类选项（筛选下拉用） */
export const CATEGORY_OPTIONS = [
  { label: '全部分类', value: 'all' },
  ...Array.from(new Set(FIELD_CATALOG.map((e) => e.category))).map((c) => ({
    label: c,
    value: c
  }))
];

export function getCatalogEntry(key: string): CatalogEntry | undefined {
  return FIELD_CATALOG.find((e) => e.key === key);
}

/** 所有子字段（平铺） */
export function catalogFields(entry: CatalogEntry): CatalogField[] {
  return entry.groups.flatMap((g) => g.fields);
}

/** 按业务词解析命中的配置键集合（业务名/分类/字段名/原始键模糊匹配） */
export function resolveKeysByBusinessKeyword(keyword: string): string[] {
  const kw = keyword.trim().toLowerCase();
  if (!kw) return [];
  const hits = FIELD_CATALOG.filter((entry) => {
    if (entry.key.toLowerCase().includes(kw)) return true;
    if (entry.name.toLowerCase().includes(kw)) return true;
    if (entry.category.toLowerCase().includes(kw)) return true;
    if (entry.description.toLowerCase().includes(kw)) return true;
    return catalogFields(entry).some(
      (f) =>
        f.name.toLowerCase().includes(kw) || f.path.toLowerCase().includes(kw)
    );
  });
  return hits.map((e) => e.key);
}

/** 按分类取键集合 */
export function resolveKeysByCategory(category: string): string[] {
  if (!category || category === 'all') return [];
  return FIELD_CATALOG.filter((e) => e.category === category).map((e) => e.key);
}

/** 读 dot 路径值（不存在返回 undefined） */
export function getPathValue(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, seg) => {
    if (acc !== null && typeof acc === 'object' && seg in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[seg];
    }
    return undefined;
  }, obj);
}

/** 就地写 dot 路径值（自动补建中间对象） */
export function setPathValue(obj: Record<string, unknown>, path: string, value: unknown): void {
  const segs = path.split('.');
  let cur: Record<string, unknown> = obj;
  for (let i = 0; i < segs.length - 1; i++) {
    const seg = segs[i];
    if (typeof cur[seg] !== 'object' || cur[seg] === null) {
      cur[seg] = {};
    }
    cur = cur[seg] as Record<string, unknown>;
  }
  cur[segs[segs.length - 1]] = value;
}

/**
 * 收集 JSON 里未被目录覆盖的顶层键（编辑弹窗把它们放进"未收录字段"兜底区，
 * 保证保存时不丢数据）。
 */
export function collectUncataloguedTopKeys(
  entry: CatalogEntry | undefined,
  value: unknown
): string[] {
  if (!entry || value === null || typeof value !== 'object' || Array.isArray(value)) {
    return [];
  }
  const known = new Set<string>();
  for (const f of catalogFields(entry)) {
    known.add(f.path.split('.')[0]);
  }
  return Object.keys(value as Record<string, unknown>).filter((k) => !known.has(k));
}

/** 表格/弹窗展示用的紧凑值格式化 */
export function formatFieldValue(value: unknown): string {
  if (value === undefined || value === null) return '—';
  if (typeof value === 'boolean') return value ? '开' : '关';
  if (typeof value === 'number') {
    return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(6)));
  }
  const s = String(value);
  return s.length > 24 ? `${s.slice(0, 24)}…` : s || '（空）';
}
