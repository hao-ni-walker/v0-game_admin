import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';

export function useAuth() {
  const { session, loading, initializeAuth, isInitialized } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) {
      initializeAuth();
    }
  }, [initializeAuth, isInitialized]);

  return {
    session,
    loading,
    isAuthenticated: !!session?.user
  };
}
