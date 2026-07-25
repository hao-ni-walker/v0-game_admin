// fish-proxy.ts — BFF 转发:浏览器 → n-admin Route Handler → Go /admin/*。
// 浏览器永不直连 Go,也永不持有游戏后端凭据。管理员 JWT 从 httpOnly cookie
// 读取,转成 Authorization: Bearer 发给 Go api(requireAdmin 验签)。

/**
 * 把当前请求转发到 Go /admin/<adminPath>,携带管理员 token。
 * 透传查询串与上游状态码/正文。
 */
export async function proxyFishAdmin(
  req: Request,
  adminPath: string,
  init?: RequestInit
): Promise<Response> {
  const base = process.env.FISH_API_URL;
  if (!base) {
    return Response.json(
      { code: 500, message: 'FISH_API_URL 未配置' },
      { status: 500 }
    );
  }

  const token = req.headers.get('cookie')?.match(/token=([^;]+)/)?.[1];
  const qs = req.url.includes('?') ? '?' + req.url.split('?')[1] : '';
  const url = `${base.replace(/\/$/, '')}/admin/${adminPath}${qs}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const upstream = await fetch(url, { ...init, headers });
  const body = await upstream.text();
  return new Response(body, {
    status: upstream.status,
    headers: { 'content-type': upstream.headers.get('content-type') ?? 'application/json' }
  });
}
