import {
  successResponse,
  errorResponse
} from '@/service/response';
import { randomUUID } from 'crypto';

// Mock 模式：允许所有登录，返回 mock 用户信息
export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // 验证必填字段
    if (!username || !password) {
      return errorResponse('请填写用户名和密码');
    }

    // Mock 模式：直接允许登录，使用输入的用户名生成 mock 用户
    const token = randomUUID();
    const tokenType = 'bearer';

    const response = successResponse({
      message: '登录成功',
      token,
      tokenType,
      user: {
        id: 1,
        username: username,
        nickname: username === 'admin' ? '系统管理员' : username,
        role: 'admin'
      }
    });

    // 将 token 存储到 httpOnly cookie 中
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 // 24小时
    });

    return response;
  } catch (error) {
    console.error('登录错误:', error);
    return errorResponse('服务器错误');
  }
}
