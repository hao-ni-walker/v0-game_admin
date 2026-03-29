import { redirect } from 'next/navigation';

export default async function Dashboard() {
  // Mock 模式：直接跳转到 overview，不检查登录状态
  redirect('/dashboard/overview');
}
