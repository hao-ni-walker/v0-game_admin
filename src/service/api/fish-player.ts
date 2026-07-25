// fish-player.ts — 玩家查询客户端(经 n-admin BFF 转发 Go /admin/players)。
// 浏览器只调本文件,不直连 Go。VIP 等级仅展示,不参与命中率计算。

export interface FishPlayerRow {
  player_id: number;
  nickname: string;
  is_robot: boolean;
  player_level: number;
  vip_level: number;
  realname_status: string;
  gold: number;
  gem: number;
  total_recharge: number;
}

export interface FishPlayerList {
  total: number;
  items: FishPlayerRow[];
  page: number;
  size: number;
}

export interface FishPlayerDetail {
  player: {
    player_id: number;
    nickname: string;
    is_robot: boolean;
    player_level: number;
    vip_level: number;
    realname_status: string;
  };
  account: {
    gold: number;
    gem: number;
    total_recharge: number;
  };
}

export class FishPlayerAPI {
  /** 列表;q 可为 player_id 或 nickname。size 上游夹断到 100。 */
  static async list(params?: {
    q?: string | number;
    page?: number;
    size?: number;
  }): Promise<FishPlayerList> {
    const qs = new URLSearchParams();
    if (params?.q !== undefined) qs.set('q', String(params.q));
    if (params?.page) qs.set('page', String(params.page));
    if (params?.size) qs.set('size', String(params.size));
    const res = await fetch(`/api/fish/players?${qs.toString()}`, {
      headers: { 'content-type': 'application/json' }
    });
    if (!res.ok) throw new Error(`players list: ${res.status}`);
    return (await res.json()) as FishPlayerList;
  }

  /** 详情:同时返回 players 与 accounts 字段。 */
  static async detail(playerId: number): Promise<FishPlayerDetail> {
    const res = await fetch(`/api/fish/players/${playerId}`, {
      headers: { 'content-type': 'application/json' }
    });
    if (!res.ok) throw new Error(`players detail: ${res.status}`);
    return (await res.json()) as FishPlayerDetail;
  }
}
