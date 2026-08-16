import { NavItem } from '@/types/nav';
import {
  LayoutDashboard,
  ShieldAlert,
  Scale,
  Users,
  Wallet,
  BarChart3,
  Settings,
  Activity,
  SlidersHorizontal,
  AlertTriangle,
  ScanSearch,
  ScrollText,
  FileCheck,
  AlertCircle,
  UserCog,
  UserCheck,
  ClipboardCheck,
  Ban,
  ArrowDownCircle,
  Landmark,
  TrendingUp,
  Receipt,
  ClipboardList,
  Cog,
  CircleUserRound,
  Shield,
  Key,
  Mail,
  Coins,
  Megaphone,
  Gift,
  Timer
} from 'lucide-react';

// 业务导航列表
export const businessNavList: NavItem[] = [
  {
    title: '仪表盘',
    url: '/dashboard/overview',
    icon: LayoutDashboard,
    isActive: false,
    description: '实时经营概览',
    items: [],
    searchConfig: {
      keywords: 'dashboard overview 仪表盘 首页 概览',
      searchShortcut: ['d'],
      searchSection: '导航',
      searchPriority: 1
    }
  },
  {
    title: '风控中心',
    url: '#',
    icon: ShieldAlert,
    isActive: false,
    items: [
      {
        title: '实时风险监控',
        url: '/dashboard/risk/monitoring',
        icon: Activity,
        description: '净风险敞口监控',
        items: [],
        searchConfig: {
          keywords: 'risk monitoring 风控 风险 监控 敞口',
          searchShortcut: ['rm'],
          searchSection: '风控中心',
          searchPriority: 2
        }
      },
      {
        title: '收益率管理',
        url: '/dashboard/risk/odds',
        icon: SlidersHorizontal,
        description: '基础收益率与动态调节',
        items: [],
        searchConfig: {
          keywords: 'odds 收益率 管理 调节',
          searchShortcut: ['ro'],
          searchSection: '风控中心',
          searchPriority: 3
        }
      },
      {
        title: '限额配置',
        url: '/dashboard/risk/limits',
        icon: Wallet,
        description: '下单限额与截止时间',
        items: [],
        searchConfig: {
          keywords: 'limits 限额 配置 截止 时间',
          searchShortcut: ['rl'],
          searchSection: '风控中心',
          searchPriority: 4
        }
      },
      {
        title: '单边行情控制',
        url: '/dashboard/risk/market-control',
        icon: AlertTriangle,
        description: '单边行情识别与处理',
        items: [],
        searchConfig: {
          keywords: 'market control 单边 行情 控制',
          searchShortcut: ['rc'],
          searchSection: '风控中心',
          searchPriority: 5
        }
      },
      {
        title: '交易失败流',
        url: '/dashboard/risk/trade-failures',
        icon: AlertCircle,
        description: '下单失败与拒单观测',
        items: [],
        searchConfig: {
          keywords: 'trade failures order rejected 交易失败 拒单 下单失败',
          searchShortcut: ['rf'],
          searchSection: '风控中心',
          searchPriority: 6
        }
      },
      {
        title: '干预日志流',
        url: '/dashboard/risk/intervention-log',
        icon: ScrollText,
        description: '系统与人工风控干预',
        items: [],
        searchConfig: {
          keywords: 'intervention log risk event 干预 日志 风控事件',
          searchShortcut: ['ri'],
          searchSection: '风控中心',
          searchPriority: 7
        }
      },
      {
        title: '异常行为检测',
        url: '/dashboard/risk/anomaly-detection',
        icon: ScanSearch,
        description: '异常账户检测规则',
        items: [],
        searchConfig: {
          keywords: 'anomaly detection 异常 检测 行为',
          searchShortcut: ['ra'],
          searchSection: '风控中心',
          searchPriority: 8
        }
      }
    ]
  },
  {
    title: '订单管理',
    url: '#',
    icon: Receipt,
    isActive: false,
    items: [
      {
        title: '交易订单',
        url: '/dashboard/orders/trade-orders',
        icon: Receipt,
        description: '用户下单明细与待结算订单',
        items: [],
        searchConfig: {
          keywords: 'trade orders 交易订单 订单管理 待结算 用户下单',
          searchShortcut: ['to'],
          searchSection: '订单管理',
          searchPriority: 9
        }
      }
    ]
  },
  {
    title: '结算中心',
    url: '#',
    icon: Scale,
    isActive: false,
    items: [
      {
        title: '结算记录',
        url: '/dashboard/settlement/records',
        icon: ScrollText,
        description: '按期查询结算记录',
        items: [],
        searchConfig: {
          keywords: 'settlement records 结算 记录',
          searchShortcut: ['sr'],
          searchSection: '结算中心',
          searchPriority: 7
        }
      },
      {
        title: '结算审计',
        url: '/dashboard/settlement/audit',
        icon: FileCheck,
        description: '结算明细审计',
        items: [],
        searchConfig: {
          keywords: 'settlement audit 结算 审计 明细',
          searchShortcut: ['sa'],
          searchSection: '结算中心',
          searchPriority: 8
        }
      },
      {
        title: '异常结算处理',
        url: '/dashboard/settlement/exceptions',
        icon: AlertCircle,
        description: '异常结算人工介入',
        items: [],
        searchConfig: {
          keywords: 'settlement exceptions 异常 结算 处理',
          searchShortcut: ['se'],
          searchSection: '结算中心',
          searchPriority: 9
        }
      }
    ]
  },
  {
    title: '用户管理',
    url: '#',
    icon: Users,
    isActive: false,
    items: [
      {
        title: '用户列表',
        url: '/dashboard/users/list',
        icon: Users,
        description: '用户查询与管理',
        items: [],
        searchConfig: {
          keywords: 'users list 用户 列表 管理',
          searchShortcut: ['ul'],
          searchSection: '用户管理',
          searchPriority: 10
        }
      },
      {
        title: '账户操作',
        url: '/dashboard/users/operations',
        icon: UserCog,
        description: '余额调整与冻结',
        items: [],
        searchConfig: {
          keywords: 'user operations 账户 操作 余额 冻结',
          searchShortcut: ['uo'],
          searchSection: '用户管理',
          searchPriority: 11
        }
      },
      {
        title: '黑名单管理',
        url: '/dashboard/users/blacklist',
        icon: Ban,
        description: '黑名单加入与移出',
        items: [],
        searchConfig: {
          keywords: 'blacklist 黑名单 管理',
          searchShortcut: ['ub'],
          searchSection: '用户管理',
          searchPriority: 12
        }
      },
      {
        title: '站内信管理',
        url: '/dashboard/messages',
        icon: Mail,
        description: '系统消息推送与撤回',
        items: [],
        searchConfig: {
          keywords: 'messages 站内信 消息 推送',
          searchShortcut: ['mm'],
          searchSection: '用户管理',
          searchPriority: 24
        }
      },
      {
        title: '群发管理',
        url: '/dashboard/messages/broadcasts',
        icon: Megaphone,
        description: '批量群发站内信与审批跟踪',
        items: [],
        searchConfig: {
          keywords: 'broadcast 群发 消息 审批',
          searchShortcut: ['mb'],
          searchSection: '用户管理',
          searchPriority: 26
        }
      }
    ]
  },
  {
    title: '资金管理',
    url: '#',
    icon: Wallet,
    isActive: false,
    items: [
      {
        title: '币种管理',
        url: '/dashboard/funds/currencies',
        icon: Coins,
        description: '管理可交易的 Web3 资产',
        items: [],
        searchConfig: {
          keywords: 'currency 币种 管理 web3 资产',
          searchShortcut: ['fc'],
          searchSection: '资金管理',
          searchPriority: 12
        }
      },
      {
        title: '费率管理',
        url: '/dashboard/funds/fees',
        icon: Receipt,
        description: '管理各类费率配置与预览',
        items: [],
        searchConfig: {
          keywords: 'fee 费率 管理 配置 预览',
          searchShortcut: ['ff'],
          searchSection: '资金管理',
          searchPriority: 25
        }
      },
      {
        title: '充值审核',
        url: '/dashboard/funds/deposits',
        icon: Wallet,
        description: '充值记录与大额复核',
        items: [],
        searchConfig: {
          keywords: 'deposit 充值 审核 复核',
          searchShortcut: ['fd'],
          searchSection: '资金管理',
          searchPriority: 13
        }
      },
      {
        title: '提现审核',
        url: '/dashboard/funds/withdrawals',
        icon: ArrowDownCircle,
        description: '提现风控与人工审核',
        items: [],
        searchConfig: {
          keywords: 'withdrawal 提现 审核',
          searchShortcut: ['fw'],
          searchSection: '资金管理',
          searchPriority: 14
        }
      },
      {
        title: '资金池监控',
        url: '/dashboard/funds/pool',
        icon: Landmark,
        description: '资金池余额与安全线',
        items: [],
        searchConfig: {
          keywords: 'fund pool 资金池 监控 安全',
          searchShortcut: ['fp'],
          searchSection: '资金管理',
          searchPriority: 15
        }
      }
    ]
  },
  {
    title: '报表中心',
    url: '#',
    icon: BarChart3,
    isActive: false,
    items: [
      {
        title: '盈亏报表',
        url: '/dashboard/reports/profit-loss',
        icon: TrendingUp,
        description: '经营日报',
        items: [],
        searchConfig: {
          keywords: 'profit loss 盈亏 报表 日报',
          searchShortcut: ['rp'],
          searchSection: '报表中心',
          searchPriority: 16
        }
      },
      {
        title: '交易报表',
        url: '/dashboard/reports/transactions',
        icon: Receipt,
        description: '交易统计',
        items: [],
        searchConfig: {
          keywords: 'transaction 交易 报表 统计',
          searchShortcut: ['rt'],
          searchSection: '报表中心',
          searchPriority: 17
        }
      },
      {
        title: '审计日志',
        url: '/dashboard/reports/audit-logs',
        icon: ClipboardList,
        description: '结算审计与操作审计',
        items: [],
        searchConfig: {
          keywords: 'audit log 审计 日志',
          searchShortcut: ['ra'],
          searchSection: '报表中心',
          searchPriority: 18
        }
      }
    ]
  }
];

// 系统导航列表
export const systemNavList: NavItem[] = [
  {
    title: '系统配置',
    url: '#',
    icon: Settings,
    isActive: false,
    items: [
      {
        title: '参数配置',
        url: '/dashboard/system/config',
        icon: Cog,
        description: '全局参数配置',
        items: [],
        searchConfig: {
          keywords: 'system config 参数 配置',
          searchShortcut: ['sc'],
          searchSection: '系统配置',
          searchPriority: 19
        }
      },
      {
        title: '自动化任务',
        url: '/dashboard/system/automation',
        icon: Timer,
        description: '定时备份、报表推送与自定义脚本',
        items: [],
        searchConfig: {
          keywords: 'automation cron schedule task 定时 任务 备份 backup 报表 report',
          searchShortcut: ['sat'],
          searchSection: '系统配置',
          searchPriority: 20
        }
      },
      {
        title: '邀请奖励',
        url: '/dashboard/system/referral',
        icon: Gift,
        description: '配置投注流水邀请分佣',
        items: [],
        searchConfig: {
          keywords: 'referral invite commission 邀请 奖励 佣金',
          searchShortcut: ['sir'],
          searchSection: '系统配置',
          searchPriority: 20
        }
      },
      {
        title: '角色权限',
        url: '#',
        icon: CircleUserRound,
        isActive: false,
        description: '角色与权限管理',
        items: [
          {
            title: '管理员',
            url: '/dashboard/system/roles/admins',
            icon: Users,
            description: '管理员账户管理',
            items: [],
            searchConfig: {
              keywords: 'admin users 管理员 账户',
              searchShortcut: ['sa'],
              searchSection: '角色权限',
              searchPriority: 20
            }
          },
          {
            title: '角色管理',
            url: '/dashboard/system/roles/roles',
            icon: Shield,
            description: '角色管理',
            items: [],
            searchConfig: {
              keywords: 'roles 角色 管理',
              searchShortcut: ['sr'],
              searchSection: '角色权限',
              searchPriority: 21
            }
          },
          {
            title: '权限管理',
            url: '/dashboard/system/roles/permissions',
            icon: Key,
            description: '权限节点管理',
            items: [],
            searchConfig: {
              keywords: 'permissions 权限 管理',
              searchShortcut: ['sp'],
              searchSection: '角色权限',
              searchPriority: 22
            }
          }
        ]
      },
      {
        title: '操作日志',
        url: '/dashboard/system/operation-logs',
        icon: ScrollText,
        description: '管理员操作记录',
        items: [],
        searchConfig: {
          keywords: 'operation logs 操作 日志',
          searchShortcut: ['so'],
          searchSection: '系统配置',
          searchPriority: 23
        }
      }
    ]
  },
  {
    title: '跟单管理',
    url: '#',
    icon: Users,
    isActive: false,
    description: '带单员、佣金与跟单数据管理',
    items: [
      {
        title: '带单员管理',
        url: '/dashboard/copy-trade/leaders',
        icon: UserCheck,
        description: '带单员列表与状态管理',
        items: [],
        searchConfig: {
          keywords: 'copy trade leader 带单员 跟单',
          searchShortcut: ['cl'],
          searchSection: '跟单管理',
          searchPriority: 27
        }
      },
      {
        title: '申请审核',
        url: '/dashboard/copy-trade/applications',
        icon: ClipboardCheck,
        description: '带单员申请审核',
        items: [],
        searchConfig: {
          keywords: 'copy trade application 申请 审核 带单',
          searchShortcut: ['ca'],
          searchSection: '跟单管理',
          searchPriority: 28
        }
      },
      {
        title: '佣金结算',
        url: '/dashboard/copy-trade/commissions',
        icon: Receipt,
        description: '佣金结算记录查询',
        items: [],
        searchConfig: {
          keywords: 'commission 佣金 结算 跟单',
          searchShortcut: ['cc'],
          searchSection: '跟单管理',
          searchPriority: 29
        }
      },
      {
        title: '数据总览',
        url: '/dashboard/copy-trade/overview',
        icon: BarChart3,
        description: '跟单业务数据总览',
        items: [],
        searchConfig: {
          keywords: 'copy trade overview 数据 总览 跟单',
          searchShortcut: ['co'],
          searchSection: '跟单管理',
          searchPriority: 30
        }
      },
      {
        title: '全局配置',
        url: '/dashboard/copy-trade/config',
        icon: SlidersHorizontal,
        description: '跟单参数全局配置',
        items: [],
        searchConfig: {
          keywords: 'copy trade config 配置 跟单',
          searchShortcut: ['cf'],
          searchSection: '跟单管理',
          searchPriority: 31
        }
      }
    ]
  }
];

// 保持原有的navList导出以兼容现有代码
export const navList: NavItem[] = [...businessNavList, ...systemNavList];
