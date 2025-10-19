import { getRepositories } from '@/repository';

export async function isSuperAdmin(userId: number) {
  const repos = await getRepositories();
  const user = await repos.users.getById(userId);
  return Boolean(user?.isSuperAdmin);
}

export async function preventSuperAdminModification(userId: number) {
  const repos = await getRepositories();
  const user = await repos.users.getById(userId);
  if (user?.isSuperAdmin) {
    throw new Error('超级管理员不能被修改或删除');
  }
}

export async function preventSuperAdminDisable(
  userId: number,
  newStatus: string
) {
  if (newStatus === 'disabled') {
    const repos = await getRepositories();
    const user = await repos.users.getById(userId);
    if (user?.isSuperAdmin) {
      throw new Error('超级管理员不能被禁用');
    }
  }
}

export async function preventSuperRoleModification(roleId: number) {
  const repos = await getRepositories();
  const role = await repos.roles.getById(roleId);
  if (role?.isSuper) {
    throw new Error('超级管理员角色不能被修改或删除');
  }
}
