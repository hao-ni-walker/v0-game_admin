import { useEffect, useState } from 'react';
import type { Session } from '@/lib/auth';
import { AuthAPI } from '@/service/request';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getSession() {
      try {
        const res = await AuthAPI.getSession();
        if (res.code === 0) {
          setSession(res.data);
        }
      } catch (error) {
        console.error('获取会话失败:', error);
      } finally {
        setLoading(false);
      }
    }

    getSession();
  }, []);

  return { session, loading };
}
