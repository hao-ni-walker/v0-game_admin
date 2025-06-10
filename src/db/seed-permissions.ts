import { db } from './index';
import { permissions } from './schema';

export const seedPermissions = async () => {
  try {
    // 删除现有权限（如果存在）
    await db.delete(permissions);

    // 插入树形权限数据
    const permissionData = [
      // 系统管理
      {
        id: 1,
        name: '账号管理',
        code: 'account',
        description: '账号管理相关权限',
        parentId: null,
        sortOrder: 100
      },
      {
        id: 11,
        name: '用户管理',
        code: 'account.user',
        description: '用户管理权限',
        parentId: 1,
        sortOrder: 110
      },
      {
        id: 111,
        name: '查看用户',
        code: 'account.user.read',
        description: '查看用户列表和详情',
        parentId: 11,
        sortOrder: 111
      },
      {
        id: 112,
        name: '新增用户',
        code: 'account.user.create',
        description: '创建新用户',
        parentId: 11,
        sortOrder: 112
      },
      {
        id: 113,
        name: '编辑用户',
        code: 'account.user.update',
        description: '编辑用户信息',
        parentId: 11,
        sortOrder: 113
      },
      {
        id: 114,
        name: '删除用户',
        code: 'account.user.delete',
        description: '删除用户',
        parentId: 11,
        sortOrder: 114
      },

      {
        id: 12,
        name: '角色管理',
        code: 'account.role',
        description: '角色管理权限',
        parentId: 1,
        sortOrder: 120
      },
      {
        id: 121,
        name: '查看角色',
        code: 'account.role.read',
        description: '查看角色列表和详情',
        parentId: 12,
        sortOrder: 121
      },
      {
        id: 122,
        name: '新增角色',
        code: 'account.role.create',
        description: '创建新角色',
        parentId: 12,
        sortOrder: 122
      },
      {
        id: 123,
        name: '编辑角色',
        code: 'account.role.update',
        description: '编辑角色信息',
        parentId: 12,
        sortOrder: 123
      },
      {
        id: 124,
        name: '删除角色',
        code: 'account.role.delete',
        description: '删除角色',
        parentId: 12,
        sortOrder: 124
      },
      {
        id: 125,
        name: '分配权限',
        code: 'account.role.assign',
        description: '给角色分配权限',
        parentId: 12,
        sortOrder: 125
      },

      {
        id: 13,
        name: '权限管理',
        code: 'account.permission',
        description: '权限管理权限',
        parentId: 1,
        sortOrder: 130
      },
      {
        id: 131,
        name: '查看权限',
        code: 'account.permission.read',
        description: '查看权限列表和详情',
        parentId: 13,
        sortOrder: 131
      },
      {
        id: 132,
        name: '新增权限',
        code: 'account.permission.create',
        description: '创建新权限',
        parentId: 13,
        sortOrder: 132
      },
      {
        id: 133,
        name: '编辑权限',
        code: 'account.permission.update',
        description: '编辑权限信息',
        parentId: 13,
        sortOrder: 133
      },
      {
        id: 134,
        name: '删除权限',
        code: 'account.permission.delete',
        description: '删除权限',
        parentId: 13,
        sortOrder: 134
      },

      // 系统管理
      {
        id: 2,
        name: '系统管理',
        code: 'system',
        description: '系统管理相关权限',
        parentId: null,
        sortOrder: 200
      },
      {
        id: 21,
        name: '日志管理',
        code: 'system.log',
        description: '日志管理相关权限',
        parentId: 2,
        sortOrder: 210
      },
      {
        id: 211,
        name: '查看日志',
        code: 'system.log.read',
        description: '查看日志列表和详情',
        parentId: 21,
        sortOrder: 211
      },
      {
        id: 212,
        name: '删除日志',
        code: 'system.log.delete',
        description: '删除日志',
        parentId: 21,
        sortOrder: 212
      },
      {
        id: 213,
        name: '导出日志',
        code: 'system.log.export',
        description: '导出日志',
        parentId: 21,
        sortOrder: 213
      }
    ];

    // 插入权限数据
    for (const perm of permissionData) {
      await db.insert(permissions).values(perm);
    }

    console.log('权限数据插入成功');
  } catch (error) {
    console.error('权限数据插入失败:', error);
    throw error;
  }
};

// 如果直接运行此文件，则执行种子数据插入
if (require.main === module) {
  seedPermissions()
    .then(() => {
      console.log('种子数据插入完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('种子数据插入失败:', error);
      process.exit(1);
    });
}
