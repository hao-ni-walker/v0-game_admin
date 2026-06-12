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
  Ban,
  ArrowDownCircle,
  Landmark,
  TrendingUp,
  Receipt,
  ClipboardList,
  Cog,
  CircleUserRound,
  Shield,
  Key
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
        title: '赔率管理',
        url: '/dashboard/risk/odds',
        icon: SlidersHorizontal,
        description: '基础赔率与动态调节',
        items: [],
        searchConfig: {
          keywords: 'odds 赔率 管理 调节',
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
        title: '异常行为检测',
        url: '/dashboard/risk/anomaly-detection',
        icon: ScanSearch,
        description: '异常账户检测规则',
        items: [],
        searchConfig: {
          keywords: 'anomaly detection 异常 检测 行为',
          searchShortcut: ['ra'],
          searchSection: '风控中心',
          searchPriority: 6
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
        title: '开奖记录',
        url: '/dashboard/settlement/records',
        icon: ScrollText,
        description: '按期查询开奖记录',
        items: [],
        searchConfig: {
          keywords: 'settlement records 开奖 记录 结算',
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
  }
];

// 保持原有的navList导出以兼容现有代码
export const navList: NavItem[] = [...businessNavList, ...systemNavList];
