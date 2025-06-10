import { NavItem } from '@/types/nav';
import {
  CircleUserRound,
  SquareTerminal,
  Settings,
  ScrollText
} from 'lucide-react';

export const navList: NavItem[] = [
  {
    title: '工作台',
    url: '/dashboard/overview',
    icon: SquareTerminal,
    isActive: false,
    shortcut: ['d', 'd'],
    items: []
  },
  {
    title: '账号管理',
    url: '#',
    icon: CircleUserRound,
    isActive: false,
    items: [
      {
        title: '用户管理',
        url: '/dashboard/account/user',
        shortcut: ['m', 'm']
      },
      {
        title: '角色管理',
        shortcut: ['l', 'l'],
        url: '/dashboard/account/role'
      },
      {
        title: '权限管理',
        shortcut: ['l', 'l'],
        url: '/dashboard/account/permission'
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
        shortcut: ['l', 'o'],
        icon: ScrollText
      }
    ]
  }
];
