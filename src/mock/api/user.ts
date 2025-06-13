import {
  mockUsers,
  findUserById,
  getNextUserId,
  isUsernameExist,
  isEmailExist,
  type MockUser
} from '../data/user';
import {
  filterAndPaginate,
  successResponse,
  errorResponse,
  delay,
  type PaginationParams
} from '../base';

export class MockUserAPI {
  // 获取用户列表
  async getUsers(params: PaginationParams = {}) {
    await delay();

    try {
      const result = filterAndPaginate(mockUsers, params, [
        'username',
        'email',
        'role'
      ]);

      return result;
    } catch (error) {
      return errorResponse('获取用户列表失败');
    }
  }

  // 根据ID获取用户
  async getUserById(id: number) {
    await delay();

    try {
      const user = findUserById(id);
      if (!user) {
        return errorResponse('用户不存在');
      }

      return successResponse(user);
    } catch (error) {
      return errorResponse('获取用户详情失败');
    }
  }

  // 创建用户
  async createUser(userData: Omit<MockUser, 'id' | 'createdAt' | 'updatedAt'>) {
    await delay();

    try {
      // 验证用户名是否已存在
      if (isUsernameExist(userData.username)) {
        return errorResponse('用户名已存在');
      }

      // 验证邮箱是否已存在
      if (isEmailExist(userData.email)) {
        return errorResponse('邮箱已存在');
      }

      const newUser: MockUser = {
        ...userData,
        id: getNextUserId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      mockUsers.push(newUser);

      return successResponse(newUser);
    } catch (error) {
      return errorResponse('创建用户失败');
    }
  }

  // 更新用户
  async updateUser(
    id: number,
    userData: Partial<Omit<MockUser, 'id' | 'createdAt' | 'updatedAt'>>
  ) {
    await delay();

    try {
      const userIndex = mockUsers.findIndex((u) => u.id === id);
      if (userIndex === -1) {
        return errorResponse('用户不存在');
      }

      // 检查用户名是否冲突
      if (userData.username && isUsernameExist(userData.username, id)) {
        return errorResponse('用户名已存在');
      }

      // 检查邮箱是否冲突
      if (userData.email && isEmailExist(userData.email, id)) {
        return errorResponse('邮箱已存在');
      }

      const updatedUser = {
        ...mockUsers[userIndex],
        ...userData,
        updatedAt: new Date().toISOString()
      };

      mockUsers[userIndex] = updatedUser;

      return successResponse(updatedUser);
    } catch (error) {
      return errorResponse('更新用户失败');
    }
  }

  // 删除用户
  async deleteUser(id: number) {
    await delay();

    try {
      const userIndex = mockUsers.findIndex((u) => u.id === id);
      if (userIndex === -1) {
        return errorResponse('用户不存在');
      }
      // 防止删除admin用户
      if (mockUsers[userIndex]?.isSuperAdmin) {
        return errorResponse('不能删除管理员用户');
      }

      mockUsers.splice(userIndex, 1);

      return successResponse({ message: '用户删除成功' });
    } catch (error) {
      return errorResponse('删除用户失败');
    }
  }

  // 批量删除用户
  async deleteUsers(ids: number[]) {
    await delay();

    try {
      const adminIds = mockUsers
        .filter((u) => ids.includes(u.id) && u.isSuperAdmin)
        .map((u) => u.id);

      if (adminIds.length > 0) {
        return errorResponse('不能删除管理员用户');
      }

      const deletedCount = mockUsers.length;

      // 删除用户
      for (let i = mockUsers.length - 1; i >= 0; i--) {
        if (ids.includes(mockUsers[i].id)) {
          mockUsers.splice(i, 1);
        }
      }

      const actualDeletedCount = deletedCount - mockUsers.length;

      return successResponse({
        message: `成功删除 ${actualDeletedCount} 个用户`,
        deletedCount: actualDeletedCount
      });
    } catch (error) {
      return errorResponse('批量删除用户失败');
    }
  }

  // 重置用户密码
  async resetPassword(id: number) {
    await delay();

    try {
      const user = findUserById(id);
      if (!user) {
        return errorResponse('用户不存在');
      }

      // 模拟重置密码（实际项目中会发送邮件等）
      const newPassword = '123456';

      return successResponse({
        message: '密码重置成功',
        newPassword // 实际项目中不应返回明文密码
      });
    } catch (error) {
      return errorResponse('重置密码失败');
    }
  }
}
