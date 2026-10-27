/**
 * 预测市场运营说明 —— 后台内嵌版。
 *
 * 内容对应 docs/product_operations_manual.md §16（源文件）。改动规则：
 * 手册 §16 与这里必须同步修改，否则运营在后台看到的口径会和手册不一致。
 */

export interface ManualTable {
  headers: string[];
  rows: string[][];
}

export interface ManualSection {
  id: string;
  title: string;
  intro?: string;
  bullets?: string[];
  steps?: string[];
  table?: ManualTable;
  /** warn = 会亏钱/会踩坑；info = 补充认知 */
  callout?: { tone: 'warn' | 'info'; title: string; body: string };
}

export const PREDICTION_MANUAL: ManualSection[] = [
  {
    id: 'model',
    title: '1. 这个产品怎么赚钱（先看懂这条）',
    intro:
      '站内记账 + Polymarket 结算：用户用站内真实余额对 Polymarket 市场下 YES/NO 注，平台是用户唯一的对手方，输赢按 Polymarket 官方结果结算。',
    bullets: [
      '平台不代理真实下单、不对冲、不碰 Polymarket 钱包——只读它的盘口来定价。',
      '用户押中，平台从自己资金里赔（每份额兑 1 USDT）；押错，本金归平台。',
      '点差是毛利，同时承担用户押对的方向性风险，不是无风险套利。',
      '单市场敞口上限、全站敞口上限、资金池覆盖三道上限就是止损线。',
    ],
    callout: {
      tone: 'info',
      title: '一句话记住',
      body: '价格借 Polymarket 的盘口，风险自己扛。所以下面那些上限和交易带不是"限制用户"，是保护平台。',
    },
  },
  {
    id: 'sync',
    title: '2. 目录从哪来（每小时自动同步）',
    bullets: [
      '每小时自动从 Polymarket 拉一次开放市场，写进本站目录；页头显示最近一轮统计与完成时间。',
      '同步只覆盖 Polymarket 侧字段（题目、结果、价格、流动性、开闭状态）。',
      '上架状态、点差、敞口上限、单注限额、排序属于运营字段，永远不会被同步覆盖。',
      '需要立即刷新时点页头「手动同步」，约 10 秒后自动刷新列表。',
    ],
  },
  {
    id: 'listing',
    title: '3. 上架一个市场（标准动作）',
    steps: [
      '等自动同步（或手动触发），让市场出现在「进行中」。',
      '点该行「配置」，填运营参数（留空即继承全局交易设置）。',
      '点「上架」确认，市场对用户可见、可下注。',
      '下架随时允许，已有注单不受影响。',
    ],
    intro: '上架前系统会做硬门槛校验，任何一条不满足都会拒绝并给出原因。',
    callout: {
      tone: 'warn',
      title: '上架硬门槛（全部必须满足）',
      body:
        '两个不同结果 · 两个非空且不同的 CLOB token id · 有 condition id · Polymarket 侧 active 且接受订单 · 未关闭/归档/已结算 · 未过 endDate · 当前两侧价格都落在交易带内。',
    },
  },
  {
    id: 'params',
    title: '4. 单市场四个运营参数',
    table: {
      headers: ['字段', '含义', '留空时'],
      rows: [
        ['点差 spread_bps', '用户支付单价 = 盘口均价 × (1 + bps/10000)，即平台毛利（200 = 2%）', '继承全局 200'],
        ['敞口 max_exposure_usdt', '该市场最多愿承担的净赔付额，超限拒单', '继承全局 10,000'],
        ['单注 min/max_bet_usdt', '单笔本金上下限', '继承全局 1 / 500'],
        ['排序 sort_order', '仅影响用户端列表顺序，越大越靠前，无风控含义', '0（按 24h 量排）'],
      ],
    },
    bullets: [
      '绝大多数市场留空即可，只对重点推的（排序）或高风险事件（压低敞口/单注）单独覆盖。',
      '改点差会让用户手里未提交的旧报价失效，需重新报价。',
    ],
  },
  {
    id: 'band',
    title: '5. 交易带（最容易踩坑的规则）',
    intro:
      '价格即概率：0.60 表示市场认为该结果有 60% 概率。价带默认 0.03–0.97，超出即不允许成交。',
    bullets: [
      '报价时逐档检查真实订单簿，任一档出界就拒单——大额订单扫到深处档位也可能被拒。',
      '上下限之和为 1，二元市场两侧价格互补，所以两侧永远同时进场内或场外。',
      '带外 = 整场无法下注（不存在只能买一边），属于准决出的死盘，例如 0.0015 / 0.9985。',
      '这类市场 2026-10-27 起不允许上架；已上架的用户端显示「不可交易」并给出原因。',
    ],
    callout: {
      tone: 'warn',
      title: '想放开极端小概率市场？',
      body:
        '只能改「交易设置」里的价带（没有单市场覆盖），代价是全站所有市场同步放宽风控。极端小概率盘用户几乎必赢、平台作为对手方基本必赔，务必谨慎。',
    },
  },
  {
    id: 'global',
    title: '6. 全局交易设置',
    intro:
      '页头「交易设置」管理全部市场的默认值，需 prediction:read/write 权限，保存即生效并写审计日志。单市场的非空设置覆盖对应全局项。',
    table: {
      headers: ['参数', '默认值', '含义'],
      rows: [
        ['enabled', 'true', '暂停只阻止新注单，已有注单照常结算'],
        ['spread_bps', '200', '参考均价乘以 1.02'],
        ['min / max_bet_usdt', '1 / 500', '单笔本金范围'],
        ['max_exposure_usdt', '10,000', '单市场净负债上限'],
        ['global_exposure_usdt', '25,000', '所有市场净负债之和上限'],
        ['price_floor / price_ceiling', '0.03 / 0.97', '允许成交的价格区间（价带）'],
        ['quote_ttl_seconds', '20', '用户报价有效期'],
        ['book_max_age_seconds', '30', '订单簿最大年龄，报价与扣款均校验'],
        ['max_price_deviation_bps', '100', '提交时相对确认报价的最大偏移 1%'],
        ['resolution_confirmation_seconds', '300', '官方最终结果的最短二次确认间隔'],
        ['require_pool_coverage', 'true', '新增敞口必须有可用资金池覆盖'],
      ],
    },
  },
  {
    id: 'errors',
    title: '7. 报错对照表（照着处置）',
    intro: '运营和客服最常遇到的口径。带「上架」的出现在后台，其余是用户下注时看到的原因。',
    table: {
      headers: ['报错', '含义', '怎么办'],
      rows: [
        ['当前价格 X 超出可交易区间（0.03-0.97）', '该市场两侧价格已在价带外，整场无法成交', '不要上架；属准决出死盘'],
        ['市场已过 endDate', '截止时间已过，等待官方结算', '无需处理，结算后归入「已结算」'],
        ['市场暂不接受新注单 / 未激活 / 已关闭或归档', 'Polymarket 侧状态不允许', '等同步刷新；长期不可用则下架'],
        ['非二元市场 / 缺少 CLOB token ids / 缺少 condition id', '数据结构不支持站内份额交易', '无法上架'],
        ['Market price is outside the tradeable range (0.03-0.97)', '用户侧同一价带拦截（英文）', 'App 会预先显示不可交易，用户无需再试'],
        ['Market has reached its closing time', '已过截止时间，等待官方结果', '等待结算'],
        ["Amount is outside this market's limits", '超出单笔上下限，或超出用户等级限额', '核对 §4 单注限额与风控额度'],
        ['Prediction exposure limit reached', '该市场或全站敞口已达上限', '属风控保护；可调低单笔或等待结算释放'],
        ['Platform liquidity is insufficient', '资金池不足以覆盖新增潜在赔付', '先补充资金池再放量'],
        ['Market configuration changed', '报价期间运营改了参数', '让用户重新获取报价'],
      ],
    },
  },
  {
    id: 'settlement',
    title: '8. 结算与异常',
    bullets: [
      '结算按 Polymarket 官方结果（Gamma + CLOB 双源核对），存在数小时到数天等待期。',
      'endDate 过了 ≠ 立即结算；到期、下架、暂停都不会退款或提前结算。',
      '押中按持有份额向下取整兑付；押错兑付 0；官方 50/50 结果按规则退还原本金。',
      '两源结果不一致、市场被移除、缺少终值等情形保持待结果，后台不会自动赔付。',
      '当前版本没有手工强制结算入口；异常时先核对官方源与日志，数据恢复后工作器自动重试。',
    ],
  },
];
