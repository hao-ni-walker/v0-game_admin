import {
  mockPermissions,
  findPermissionById,
  getNextPermissionId,
  isPermissionNameExist,
  getPermissionsByParent,
  getTopLevelPermissions,
  getPermissionTree,
  type MockPermission
} from '../data/permission';
import {
  filterAndPaginate,
  successResponse,
  errorResponse,
  delay,
  type PaginationParams
} from '../base';

export class MockPermissionAPI {
  // 获取所有权限
  async getAllPermissions() {
    await delay();
    return successResponse(mockPermissions);
  }

  // 获取权限列表
  async getPermissions(params: PaginationParams = {}) {
    await delay();

    try {
      const result = filterAndPaginate(mockPermissions, params, [
        'name',
        'code',
        'description'
      ]);

      return result;
    } catch (error) {
      return errorResponse('获取权限列表失败');
    }
  }

  // 根据ID获取权限
  async getPermissionById(id: number) {
    await delay();

    try {
      const permission = findPermissionById(id);
      if (!permission) {
        return errorResponse('权限不存在');
      }

      return successResponse(permission);
    } catch (error) {
      return errorResponse('获取权限详情失败');
    }
  }

  // 创建权限
  async createPermission(
    permissionData: Omit<MockPermission, 'id' | 'createdAt' | 'updatedAt'>
  ) {
    await delay();

    try {
      // 验证权限名是否已存在
      if (isPermissionNameExist(permissionData.name)) {
        return errorResponse('权限名已存在');
      }

      const newPermission: MockPermission = {
        ...permissionData,
        id: getNextPermissionId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      mockPermissions.push(newPermission);

      return successResponse(newPermission);
    } catch (error) {
      return errorResponse('创建权限失败');
    }
  }

  // 更新权限
  async updatePermission(
    id: number,
    permissionData: Partial<
      Omit<MockPermission, 'id' | 'createdAt' | 'updatedAt'>
    >
  ) {
    await delay();

    try {
      const permissionIndex = mockPermissions.findIndex((p) => p.id === id);
      if (permissionIndex === -1) {
        return errorResponse('权限不存在');
      }

      // 检查权限名是否冲突
      if (
        permissionData.name &&
        isPermissionNameExist(permissionData.name, id)
      ) {
        return errorResponse('权限名已存在');
      }

      const updatedPermission = {
        ...mockPermissions[permissionIndex],
        ...permissionData,
        updatedAt: new Date().toISOString()
      };

      mockPermissions[permissionIndex] = updatedPermission;

      return successResponse(updatedPermission);
    } catch (error) {
      return errorResponse('更新权限失败');
    }
  }

  // 删除权限
  async deletePermission(id: number) {
    await delay();

    try {
      const permissionIndex = mockPermissions.findIndex((p) => p.id === id);
      if (permissionIndex === -1) {
        return errorResponse('权限不存在');
      }

      mockPermissions.splice(permissionIndex, 1);

      return successResponse({ message: '权限删除成功' });
    } catch (error) {
      return errorResponse('删除权限失败');
    }
  }

  // 根据父级ID获取子权限
  async getPermissionsByParent(parentId: number | null) {
    await delay();

    try {
      const permissions = getPermissionsByParent(parentId);
      return successResponse(permissions);
    } catch (error) {
      return errorResponse('获取子权限失败');
    }
  }

  // 获取顶级权限分类
  async getTopLevelPermissions() {
    await delay();

    try {
      const permissions = getTopLevelPermissions();
      return successResponse(permissions);
    } catch (error) {
      return errorResponse('获取顶级权限失败');
    }
  }

  // 获取权限树结构
  async getPermissionTree() {
    await delay();

    try {
      const tree = getPermissionTree();
      return successResponse(tree);
    } catch (error) {
      return errorResponse('获取权限树失败');
    }
  }
}
