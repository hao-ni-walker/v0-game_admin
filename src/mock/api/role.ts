import {
  mockRoles,
  findRoleById,
  getNextRoleId,
  isRoleNameExist,
  getRoleLabels,
  type MockRole
} from '../data/role';
import {
  filterAndPaginate,
  successResponse,
  errorResponse,
  delay,
  type PaginationParams
} from '../base';

export class MockRoleAPI {
  // 获取角色列表
  async getRoles(params: PaginationParams = {}) {
    await delay();

    try {
      const result = filterAndPaginate(mockRoles, params, [
        'name',
        'description'
      ]);

      return result;
    } catch (error) {
      return errorResponse('获取角色列表失败');
    }
  }

  // 获取角色的权限列表
  async getRolePermissions(roleId: number) {
    await delay();
    return successResponse(mockRoles[roleId]);
  }

  // 更新角色的权限列表
  async updateRolePermissions(roleId: number, permissionIds: number[]) {
    await delay();
    return successResponse(mockRoles[roleId]);
  }

  // 根据ID获取角色
  async getRoleById(id: number) {
    await delay();

    try {
      const role = findRoleById(id);
      if (!role) {
        return errorResponse('角色不存在');
      }

      return successResponse(role);
    } catch (error) {
      return errorResponse('获取角色详情失败');
    }
  }

  // 创建角色
  async createRole(roleData: Omit<MockRole, 'id' | 'createdAt' | 'updatedAt'>) {
    await delay();

    try {
      // 验证角色名是否已存在
      if (isRoleNameExist(roleData.name)) {
        return errorResponse('角色名已存在');
      }

      const newRole: MockRole = {
        ...roleData,
        id: getNextRoleId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      mockRoles.push(newRole);

      return successResponse(newRole);
    } catch (error) {
      return errorResponse('创建角色失败');
    }
  }

  // 更新角色
  async updateRole(
    id: number,
    roleData: Partial<Omit<MockRole, 'id' | 'createdAt' | 'updatedAt'>>
  ) {
    await delay();

    try {
      const roleIndex = mockRoles.findIndex((r) => r.id === id);
      if (roleIndex === -1) {
        return errorResponse('角色不存在');
      }

      // 检查角色名是否冲突
      if (roleData.name && isRoleNameExist(roleData.name, id)) {
        return errorResponse('角色名已存在');
      }

      const updatedRole = {
        ...mockRoles[roleIndex],
        ...roleData,
        updatedAt: new Date().toISOString()
      };

      mockRoles[roleIndex] = updatedRole;

      return successResponse(updatedRole);
    } catch (error) {
      return errorResponse('更新角色失败');
    }
  }

  // 删除角色
  async deleteRole(id: number) {
    await delay();

    try {
      const roleIndex = mockRoles.findIndex((r) => r.id === id);
      if (roleIndex === -1) {
        return errorResponse('角色不存在');
      }

      // 防止删除admin角色
      if (mockRoles[roleIndex].name === 'admin') {
        return errorResponse('不能删除管理员角色');
      }

      mockRoles.splice(roleIndex, 1);

      return successResponse({ message: '角色删除成功' });
    } catch (error) {
      return errorResponse('删除角色失败');
    }
  }

  // 获取角色选项列表
  async getRoleOptions() {
    await delay();

    try {
      const options = getRoleLabels();
      return successResponse(options);
    } catch (error) {
      return errorResponse('获取角色选项失败');
    }
  }

  // 获取角色标签列表（兼容性方法）
  async getRoleLabels() {
    return this.getRoleOptions();
  }
}
