'use client';

import { useEffect, useState } from 'react';
import { useAuth } from './use-auth';

/**
 * 客户端权限检查hook
 */
export function usePermissions() {
  const { session, loading } = useAuth();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState(true);

  useEffect(() => {
    async function fetchPermissions() {
      if (!session?.user) {
        setPermissions([]);
        setPermissionsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/permissions');
        if (response.ok) {
          const perms = await response.json();
          setPermissions(perms);
        }
      } catch (error) {
        console.error('获取权限失败:', error);
        setPermissions([]);
      } finally {
        setPermissionsLoading(false);
      }
    }

    if (!loading) {
      fetchPermissions();
    }
  }, [session, loading]);

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  const hasAnyPermission = (perms: string[]): boolean => {
    return perms.some((perm) => permissions.includes(perm));
  };

  const hasAllPermissions = (perms: string[]): boolean => {
    return perms.every((perm) => permissions.includes(perm));
  };

  return {
    permissions,
    loading: loading || permissionsLoading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions
  };
}
