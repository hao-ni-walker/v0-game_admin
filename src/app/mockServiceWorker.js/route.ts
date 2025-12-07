import { NextResponse } from 'next/server';

/**
 * 处理 mockServiceWorker.js 请求
 * 返回空响应，避免 404 错误
 * 
 * 这是因为浏览器可能缓存了之前注册的 Service Worker，导致它不断尝试加载该文件。
 * 返回一个空的 JS 文件可以解决这个问题，并允许浏览器注销该 Worker。
 */
export async function GET() {
  return new NextResponse('/* Mock Service Worker is disabled */', {
    status: 200,
    headers: {
      'Content-Type': 'application/javascript',
      'Service-Worker-Allowed': '/'
    }
  });
}

