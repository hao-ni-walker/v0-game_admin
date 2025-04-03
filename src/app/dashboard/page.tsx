import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const session = await auth();

  console.log(session)

  if (!session?.user) {
    // 未登录，重定向到登录页
    return redirect('/login');
  }

  return (
    <div>
      <h1>欢迎, {session.user.email}</h1>
      {/* 其他仪表盘内容 */}
    </div>
  );
}
