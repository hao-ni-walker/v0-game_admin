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
  List,
  Megaphone,
  Image
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
    title: '游戏运营',
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
      },
      {
        title: '通知管理',
        url: '#',
        icon: Megaphone,
        isActive: false,
        description: '通知管理',
        items: [
          {
            title: '通告列表',
            url: '/dashboard/announcements',
            icon: List,
            description: '通告列表',
            searchConfig: {
              keywords: 'announcement 通告 公告 列表',
              searchShortcut: ['n'],
              searchSection: '通知管理',
              searchPriority: 8
            }
          },
          {
            title: '通告模板',
            url: '/dashboard/announcements/templates',
            icon: ScrollText,
            description: '通告模板',
            searchConfig: {
              keywords: 'announcement template 通告 模板',
              searchShortcut: ['t'],
              searchSection: '通知管理',
              searchPriority: 9
            }
          }
        ],
        searchConfig: {
          keywords: 'announcement 通知 通告',
          searchShortcut: ['n'],
          searchSection: '通知管理',
          searchPriority: 8
        }
      },
      {
        title: 'Banner 列表',
        url: '/dashboard/home-banners',
        icon: Image,
        description: 'Banner 列表',
        searchConfig: {
          keywords: 'home banner 首 页 轮播 列表',
          searchShortcut: ['h'],
          searchSection: '首页 Banner 管理',
          searchPriority: 9
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
      },
      {
        title: '系统参数配置',
        url: '/dashboard/system/config',
        icon: Cog,
        description: '系统参数配置',
        searchConfig: {
          keywords: 'system config 参数 配置 设置',
          searchShortcut: ['s'],
          searchSection: '系统管理',
          searchPriority: 6
        }
      }
    ]
  }
];

// 保持原有的navList导出以兼容现有代码
export const navList: NavItem[] = [...businessNavList, ...systemNavList];
