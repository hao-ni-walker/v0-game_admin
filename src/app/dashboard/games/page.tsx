'use client';

import { useEffect, useState } from 'react';

type Room = {
  id: string;
  seats?: number;
  phase?: string;
  created_at?: string;
};

export default function GamesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadRooms() {
      try {
        const res = await fetch('/api/admin/games');
        const data = await res.json();

        if (!cancelled) {
          setRooms(Array.isArray(data?.data?.items) ? data.data.items : []);
        }
      } catch {
        if (!cancelled) {
          setRooms([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadRooms();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="container mx-auto py-6">
      <h1 className="mb-6 text-2xl font-bold">对局管理</h1>
      <p className="text-muted-foreground mb-4">实时监控活跃房间与对局状态</p>
      <div className="rounded-lg border">
        <table className="w-full">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="p-3 text-left">房间 ID</th>
              <th className="p-3 text-left">玩家</th>
              <th className="p-3 text-left">阶段</th>
              <th className="p-3 text-left">创建时间</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">加载中...</td></tr>
            ) : rooms.length ? (
              rooms.map((room) => (
                <tr key={room.id} className="border-b">
                  <td className="p-3 font-mono">{room.id}</td>
                  <td className="p-3">{room.seats ?? 0}/4</td>
                  <td className="p-3">{room.phase || '-'}</td>
                  <td className="p-3">{room.created_at || '-'}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">暂无活跃房间</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
