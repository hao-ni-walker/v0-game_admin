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
        code: 'system',
        description: '账号管理相关权限',
        parentId: null,
        sortOrder: 100
      },
      {
        id: 11,
        name: '用户管理',
        code: 'system.user',
        description: '用户管理权限',
        parentId: 1,
        sortOrder: 110
      },
      {
        id: 111,
        name: '查看用户',
        code: 'system.user.read',
        description: '查看用户列表和详情',
        parentId: 11,
        sortOrder: 111
      },
      {
        id: 112,
        name: '新增用户',
        code: 'system.user.create',
        description: '创建新用户',
        parentId: 11,
        sortOrder: 112
      },
      {
        id: 113,
        name: '编辑用户',
        code: 'system.user.update',
        description: '编辑用户信息',
        parentId: 11,
        sortOrder: 113
      },
      {
        id: 114,
        name: '删除用户',
        code: 'system.user.delete',
        description: '删除用户',
        parentId: 11,
        sortOrder: 114
      },

      {
        id: 12,
        name: '角色管理',
        code: 'system.role',
        description: '角色管理权限',
        parentId: 1,
        sortOrder: 120
      },
      {
        id: 121,
        name: '查看角色',
        code: 'system.role.read',
        description: '查看角色列表和详情',
        parentId: 12,
        sortOrder: 121
      },
      {
        id: 122,
        name: '新增角色',
        code: 'system.role.create',
        description: '创建新角色',
        parentId: 12,
        sortOrder: 122
      },
      {
        id: 123,
        name: '编辑角色',
        code: 'system.role.update',
        description: '编辑角色信息',
        parentId: 12,
        sortOrder: 123
      },
      {
        id: 124,
        name: '删除角色',
        code: 'system.role.delete',
        description: '删除角色',
        parentId: 12,
        sortOrder: 124
      },
      {
        id: 125,
        name: '分配权限',
        code: 'system.role.assign',
        description: '给角色分配权限',
        parentId: 12,
        sortOrder: 125
      },

      {
        id: 13,
        name: '权限管理',
        code: 'system.permission',
        description: '权限管理权限',
        parentId: 1,
        sortOrder: 130
      },
      {
        id: 131,
        name: '查看权限',
        code: 'system.permission.read',
        description: '查看权限列表和详情',
        parentId: 13,
        sortOrder: 131
      },
      {
        id: 132,
        name: '新增权限',
        code: 'system.permission.create',
        description: '创建新权限',
        parentId: 13,
        sortOrder: 132
      },
      {
        id: 133,
        name: '编辑权限',
        code: 'system.permission.update',
        description: '编辑权限信息',
        parentId: 13,
        sortOrder: 133
      },
      {
        id: 134,
        name: '删除权限',
        code: 'system.permission.delete',
        description: '删除权限',
        parentId: 13,
        sortOrder: 134
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
