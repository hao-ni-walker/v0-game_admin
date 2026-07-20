import React from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/table/page-header';

interface UserPageHeaderProps {
  /** 新增用户回调 */
  onCreateUser: () => void;
}

/**
 * 用户页面头部组件
 * 负责页面标题和新增用户按钮
 */
export function UserPageHeader({ onCreateUser }: UserPageHeaderProps) {
  return (
    <PageHeader
      title='管理员账号'
      description='管理后台登录账号、角色与密码'
      action={{
        label: '新增管理员',
        onClick: onCreateUser,
        icon: <Plus className='mr-2 h-4 w-4' />
      }}
    />
  );
}
