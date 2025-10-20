'use client';

import React from 'react';
import Image from 'next/image';
import { DataTable } from '@/components/table/data-table';
import { formatDateTime } from '@/components/table/utils';

type GameItem = {
  id: number | string;
  game_id: string;
  name: string;
  icon_url: string;
  category: string;
  provider_code?: string;
  is_featured?: boolean;
  is_new?: boolean;
  updated_at?: string;
};

export default function GamesPage() {
  const [data, setData] = React.useState<GameItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/games/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Language: 'en' }),
        cache: 'no-store'
      });
      const json = await res.json();
      if (!res.ok || json?.code !== 0 || !json?.data) {
        throw new Error(json?.message || json?.msg || '请求失败');
      }
      setData(json.data.List || []);
    } catch (e: any) {
      setError(e.message || '请求失败');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const columns = [
    {
      key: 'icon_url',
      title: '图标',
      className: 'w-[64px]',
      render: (_: any, record: GameItem) =>
        record.icon_url ? (
          <div className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={record.icon_url}
              alt={record.name}
              className="h-10 w-10 rounded object-cover border"
            />
          </div>
        ) : (
          <div className="h-10 w-10 rounded bg-muted" />
        )
    },
    {
      key: 'name',
      title: '名称',
      className: 'min-w-[180px]',
      render: (v: string, record: GameItem) => (
        <div className="flex flex-col">
          <span className="font-medium">{v}</span>
          <span className="text-muted-foreground text-xs">ID: {record.game_id}</span>
        </div>
      )
    },
    {
      key: 'category',
      title: '分类',
      className: 'w-[120px]',
      render: (v: string) => v ?? '-'
    },
    {
      key: 'provider_code',
      title: '厂商',
      className: 'w-[120px]',
      render: (v: string) => v ?? '-'
    },
    {
      key: 'is_new',
      title: '标签',
      className: 'w-[120px]',
      render: (_: any, r: GameItem) => (
        <div className="flex gap-2">
          {r.is_featured ? <span className="bg-amber-100 text-amber-800 rounded px-2 py-0.5 text-xs">推荐</span> : null}
          {r.is_new ? <span className="bg-green-100 text-green-800 rounded px-2 py-0.5 text-xs">新游</span> : null}
        </div>
      )
    },
    {
      key: 'updated_at',
      title: '更新时间',
      className: 'w-[180px]',
      render: (v: string) => (v ? formatDateTime(v) : '-')
    }
  ];

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">游戏列表</h1>
      {error ? (
        <div className="text-destructive text-sm">加载失败：{error}</div>
      ) : null}
      <DataTable<GameItem> columns={columns as any} data={data} loading={loading} rowKey={(r) => String(r.id || r.game_id)} />
    </div>
  );
}