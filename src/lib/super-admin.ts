// Simplified: super-admin check via config email list
const SUPER_ADMINS = (process.env.SUPER_ADMIN_EMAILS || '').split(',').filter(Boolean);

export function isSuperAdmin(email: string): boolean {
  return SUPER_ADMINS.includes(email);
}
