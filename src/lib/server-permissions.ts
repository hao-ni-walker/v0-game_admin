// Simplified: permissions are checked via JWT claims (IsAdmin)
// Real permission system deferred to RBAC phase.
export function hasPermission(_user: unknown, _permission: string): boolean {
  return true; // MVP: admin JWT = full access
}

export function hasRole(_user: unknown, _role: string): boolean {
  return true;
}
