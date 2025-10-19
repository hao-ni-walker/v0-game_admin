import { NavItem } from '@/types/nav';
import {
  CircleUserRound,
  SquareTerminal,
  Settings,
  ScrollText,
  Cog,
  Users,
  Shield,
  Key,
  Gamepad2,
  List,
  BarChart3,
  LineChart,
  Megaphone
} from 'lucide-react';

// 业务导航列表
export const businessNavList: NavItem[] = [
  {
    title: '工作台',
    url: '/dashboard/overview',
    icon: SquareTerminal,
    isActive: false,
    description: '工作台',
    items: [],
    searchConfig: {
      keywords: 'dashboard overview home 仪表板 首页 工作台',
      searchShortcut: ['d'],
      searchSection: '导航',
      searchPriority: 1
    }
  },
  {
    title: '游戏管理',
    url: '#',
    icon: Gamepad2,
    isActive: false,
    items: [
      {
        title: '游戏列表',
        url: '/dashboard/games',
        icon: List,
        description: '游戏列表',
        searchConfig: {
          keywords: 'game games 游戏 列表',
          searchShortcut: ['g'],
          searchSection: '游戏管理',
          searchPriority: 2
        }
      }
    ]
  },
  {
    title: '玩家管理',
    url: '#',
    icon: Users,
    isActive: false,
    items: [
      {
        title: '玩家列表',
        url: '/dashboard/players',
        icon: Users,
        description: '玩家列表',
        searchConfig: {
          keywords: 'player players 玩家 列表',
          searchShortcut: ['p'],
          searchSection: '玩家管理',
          searchPriority: 3
        }
      }
    ]
  },
  {
    title: '数据分析',
    url: '#',
    icon: BarChart3,
    isActive: false,
    items: [
      {
        title: '游戏流水',
        url: '/dashboard/analytics/flows',
        icon: LineChart,
        description: '游戏流水',
        searchConfig: {
          keywords: 'analytics flows 流水 数据 分析',
          searchShortcut: ['f'],
          searchSection: '数据分析',
          searchPriority: 4
        }
      },
      {
        title: '运营报表',
        url: '/dashboard/analytics/reports',
        icon: BarChart3,
        description: '运营报表',
        searchConfig: {
          keywords: 'analytics reports 报表 数据 分析',
          searchShortcut: ['r'],
          searchSection: '数据分析',
          searchPriority: 5
        }
      }
    ]
  },
  {
    title: '活动管理',
    url: '#',
    icon: Megaphone,
    isActive: false,
    items: [
      {
        title: '活动列表',
        url: '/dashboard/campaigns',
        icon: List,
        description: '活动列表',
        searchConfig: {
          keywords: 'campaign 活动 列表',
          searchShortcut: ['c'],
          searchSection: '活动管理',
          searchPriority: 6
        }
      }
    ]
  }
];

// 系统导航列表
export const systemNavList: NavItem[] = [
  {
    title: '账号管理',
    url: '#',
    icon: CircleUserRound,
    isActive: false,
    items: [
      {
        title: '用户管理',
        url: '/dashboard/account/user',
        description: '用户管理',
        icon: Users,
        searchConfig: {
          keywords: 'users management 用户 管理 user',
          searchShortcut: ['u'],
          searchSection: '账户管理',
          searchPriority: 2
        }
      },
      {
        title: '角色管理',
        url: '/dashboard/account/role',
        description: '角色管理',
        icon: Shield,
        searchConfig: {
          keywords: 'roles permissions 角色 权限 role',
          searchShortcut: ['r'],
          searchSection: '账户管理',
          searchPriority: 3
        }
      },
      {
        title: '权限管理',
        url: '/dashboard/account/permission',
        description: '权限管理',
        icon: Key,
        searchConfig: {
          keywords: 'permissions settings 权限 设置 permission',
          searchShortcut: ['p'],
          searchSection: '账户管理',
          searchPriority: 4
        }
      }
    ]
  },
  {
    title: '系统管理',
    url: '#',
    icon: Settings,
    isActive: false,
    items: [
      {
        title: '日志管理',
        url: '/dashboard/system/logs',
        icon: ScrollText,
        description: '系统日志审计',
        searchConfig: {
          keywords: 'system logs audit 系统日志 审计 log',
          searchShortcut: ['l'],
          searchSection: '系统管理',
          searchPriority: 5
        }
      }
    ]
  }
];

// 保持原有的navList导出以兼容现有代码
export const navList: NavItem[] = [...businessNavList, ...systemNavList];
