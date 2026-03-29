import { auth } from '@/lib/auth';
import { successResponse } from '@/service/response';

// Mock session 数据
const MOCK_SESSION = {
  user: {
    id: 1,
    email: 'admin@example.com',
    username: 'admin',
    avatar: '/avatars/default.jpg',
    roleId: 'admin'
  }
};

export async function GET() {
  const session = await auth();
  // Mock 模式：如果 session 为 null，返回 mock session
  const finalSession = session || MOCK_SESSION;
  return successResponse(finalSession);
}
