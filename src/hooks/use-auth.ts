import { useEffect, useState } from 'react';
import type { Session } from '@/lib/auth';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getSession() {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          setSession(data);
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
