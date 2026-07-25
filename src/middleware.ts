import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAdminToken } from '@/lib/jwt';

// 未改密会话仍可访问的端点(其余业务 API/页面一律 428/重定向)。
const ALLOWED_WHEN_PENDING = new Set([
  '/api/auth/login',
  '/api/auth/change-password',
  '/api/auth/logout'
]);

/**
 * mustChangePassword 闸门:只在 token 声明 mustChangePassword=true 时生效。
 * 该标志写进 JWT,所以 middleware(edge runtime,不能连 PG)无需查库即可判定。
 */
export async function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token) return NextResponse.next();

  const secret = process.env.JWT_SECRET;
  if (!secret) return NextResponse.next();

  const payload = await verifyAdminToken(token, secret);
  // 验签失败交给各路由自行返回 401,这里不拦。
  if (!payload || !payload.mustChangePassword) return NextResponse.next();

  const { pathname } = req.nextUrl;
  if (ALLOWED_WHEN_PENDING.has(pathname)) return NextResponse.next();

  if (pathname.startsWith('/api/')) {
    return NextResponse.json(
      { code: 428, message: '请先修改初始密码' },
      { status: 428 }
    );
  }
  return NextResponse.redirect(new URL('/change-password', req.url));
}

export const config = {
  // 仅拦截业务 API 与后台页面;登录页/静态资源不在内。
  matcher: ['/api/:path*', '/dashboard/:path*']
};
