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
  BarChart3,
  Server,
} from 'lucide-react';

// 翠雀 JADE.AI · 麻将管理后台导航
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
    title: '麻将运营',
    url: '#',
    icon: Gamepad2,
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
          searchSection: '麻将运营',
          searchPriority: 2
        }
      },
      {
        title: '对局管理',
        url: '/dashboard/games',
        icon: Gamepad2,
        description: '对局管理（房间监控）',
        searchConfig: {
          keywords: 'game room games 对局 房间',
          searchShortcut: ['g'],
          searchSection: '麻将运营',
          searchPriority: 3
        }
      },
      {
        title: '举报管理',
        url: '/dashboard/analytics/reports',
        icon: BarChart3,
        description: '举报管理',
        searchConfig: {
          keywords: 'report 举报 管理',
          searchShortcut: ['r'],
          searchSection: '麻将运营',
          searchPriority: 4
        }
      }
    ]
  }
];

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
          searchPriority: 5
        }
      },
      {
        title: '角色管理',
        url: '/dashboard/account/role',
        description: '角色管理',
        icon: Shield,
        searchConfig: {
          keywords: 'roles permissions 角色 权限 role',
          searchShortcut: ['o'],
          searchSection: '账户管理',
          searchPriority: 6
        }
      },
      {
        title: '权限管理',
        url: '/dashboard/account/permission',
        description: '权限管理',
        icon: Key,
        searchConfig: {
          keywords: 'permissions settings 权限 设置 permission',
          searchShortcut: ['e'],
          searchSection: '账户管理',
          searchPriority: 7
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
        title: '系统日志',
        url: '/dashboard/system/logs',
        icon: ScrollText,
        description: '系统日志审计',
        searchConfig: {
          keywords: 'system logs audit 系统日志 审计 log',
          searchShortcut: ['l'],
          searchSection: '系统管理',
          searchPriority: 8
        }
      },
      {
        title: '参数配置',
        url: '/dashboard/system/config',
        icon: Cog,
        description: '游戏参数配置',
        searchConfig: {
          keywords: 'system config 参数 配置 设置',
          searchShortcut: ['s'],
          searchSection: '系统管理',
          searchPriority: 9
        }
      },
      {
        title: '平台管理',
        url: '/dashboard/system/platform',
        icon: Server,
        description: '平台管理',
        searchConfig: {
          keywords: 'platform 平台 管理',
          searchShortcut: ['m'],
          searchSection: '系统管理',
          searchPriority: 10
        }
      }
    ]
  }
];

export const navList: NavItem[] = [...businessNavList, ...systemNavList];
