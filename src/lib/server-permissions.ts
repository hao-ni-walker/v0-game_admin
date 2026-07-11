// Simplified: permissions are checked via JWT claims (IsAdmin)
// Real permission system deferred to RBAC phase.
export function hasPermission(_user: unknown, _permission: string): boolean {
  return true; // MVP: admin JWT = full access
}

export function hasRole(_user: unknown, _role: string): boolean {
  return true;
}

export async function getUserPermissions(_userId: string | number): Promise<string[]> {
  return [];
}

export async function hasAnyPermission(
  _permissions: string[],
  _userId: string | number
): Promise<boolean> {
  return true;
}

export async function hasAllPermissions(
  _permissions: string[],
  _userId: string | number
): Promise<boolean> {
  return true;
}
