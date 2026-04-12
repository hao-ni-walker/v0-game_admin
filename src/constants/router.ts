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
  MessageSquare,
  MessageSquareReply,
  Send,
  Database,
  Smartphone
} from 'lucide-react';
import { STORAGE_BUCKETS } from '@/constants/storage-buckets';

// 业务导航列表
export const businessNavList: NavItem[] = [
  {
    title: '工作台',
    url: '/dashboard/overview',
    icon: SquareTerminal,
    isActive: false,
    description: '工作台',
    searchConfig: {
      keywords: 'dashboard overview home 仪表板 首页 工作台',
      searchShortcut: ['d'],
      searchSection: '导航',
      searchPriority: 1
    }
  },
  {
    title: '存储管理',
    url: '/dashboard/workbench/storage',
    icon: Database,
    isActive: false,
    description: 'Cloudflare R2 存储管理',
    items: STORAGE_BUCKETS.map((bucket) => ({
      title: bucket.title,
      url: `/dashboard/workbench/storage/${encodeURIComponent(bucket.name)}`,
      icon: Database,
      description: bucket.description || `Bucket: ${bucket.name}`,
      searchConfig: {
        keywords: `storage r2 bucket ${bucket.name} 存储 文件 对象`,
        searchSection: '存储管理',
        searchPriority: 9
      }
    })),
    searchConfig: {
      keywords: 'storage r2 bucket 存储 文件 对象 上传 下载 删除',
      searchShortcut: ['t'],
      searchSection: '导航',
      searchPriority: 2
    }
  },
  {
    title: 'PopGameHubbot 频道运营',
    url: '#',
    icon: Users,
    isActive: false,
    items: [
      {
        title: '用户列表',
        url: '/dashboard/players',
        icon: Users,
        description: '查看 Telegram Bot 用户',
        searchConfig: {
          keywords: 'user users telegram 用户 列表',
          searchShortcut: ['u'],
          searchSection: '用户管理',
          searchPriority: 3
        }
      },
      {
        title: '消息管理',
        url: '/dashboard/messages',
        icon: MessageSquare,
        description: '管理 Telegram Bot 消息',
        searchConfig: {
          keywords: 'message messages 消息 管理 telegram',
          searchShortcut: ['m'],
          searchSection: '消息管理',
          searchPriority: 4
        }
      },
      {
        title: '推广 App',
        url: '/dashboard/promoted-apps',
        icon: Smartphone,
        description: '推广应用图标、链接与页面排序',
        searchConfig: {
          keywords: 'promoted app 推广 应用 图标 链接 排序 ranking telegram',
          searchSection: '频道运营',
          searchPriority: 5
        }
      },
      {
        title: '规则配置（待开发）',
        url: '/dashboard/channel-reply-rules',
        icon: MessageSquareReply,
        description: '关键词自动回复规则（对话匹配）',
        searchConfig: {
          keywords: 'keyword reply rule 关键词 规则 自动回复 telegram bot',
          searchSection: '频道运营',
          searchPriority: 6
        }
      },
      {
        title: '发送日志',
        url: '/dashboard/send-logs',
        icon: Send,
        description: '查看消息发送日志',
        searchConfig: {
          keywords: 'send logs 发送 日志 消息',
          searchShortcut: ['s'],
          searchSection: '日志管理',
          searchPriority: 10
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
