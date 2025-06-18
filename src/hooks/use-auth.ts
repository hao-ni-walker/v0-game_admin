import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth';

export function useAuth() {
  const { session, loading, initializeAuth, isInitialized } = useAuthStore();
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    // 手动触发水合
    useAuthStore.persist.rehydrate();
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (hasHydrated && !isInitialized) {
      initializeAuth();
    }
  }, [initializeAuth, isInitialized, hasHydrated]);

  return {
    session,
    loading: loading || !hasHydrated, // 水合完成前显示loading
    isAuthenticated: !!session?.user,
    hasHydrated
  };
}
