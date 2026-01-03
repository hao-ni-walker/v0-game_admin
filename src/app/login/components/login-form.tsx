'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthAPI } from '@/service/request';
import { useAuthStore } from '@/stores/auth';
import { resetGlobalInitFlag } from '@/hooks/use-auth';

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const router = useRouter();
  const { forceReInitialize, setToken } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: process.env.NODE_ENV === 'development' ? 'admin' : '',
    password: process.env.NODE_ENV === 'development' ? 'Admin@123456' : ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await AuthAPI.login(formData);
      if (res.code === 0) {
        // 保存 token 到 store
        if (res.data?.token) {
          setToken(res.data.token, res.data.tokenType || 'bearer');
        }

        toast.success(res.data?.message || '登录成功');

        // 重置全局初始化标志，确保跳转后会重新初始化
        resetGlobalInitFlag();

        // 等待一小段时间，确保 cookie 已设置完成
        await new Promise((resolve) => setTimeout(resolve, 200));

        // 立即强制重新初始化认证状态（获取最新的会话和权限信息）
        // 等待初始化完成，确保 session 已更新
        await forceReInitialize();

        // 检查是否有保存的重定向路径
        const redirectPath = sessionStorage.getItem('redirectAfterLogin');
        if (redirectPath && redirectPath !== '/login') {
          // 清除保存的重定向路径
          sessionStorage.removeItem('redirectAfterLogin');
          // 跳转到原页面
          router.push(redirectPath);
          router.refresh();
        } else {
          // 没有保存的路径，默认跳转到 dashboard
          router.push('/dashboard');
          router.refresh();
        }
      } else {
        toast.error(res.message || '登录失败');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className='text-2xl'>登录</CardTitle>
          <CardDescription>请输入您的用户名和密码登录</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className='flex flex-col gap-6'>
              <div className='grid gap-2'>
                <Label htmlFor='username'>用户名</Label>
                <Input
                  id='username'
                  name='username'
                  type='text'
                  value={formData.username}
                  onChange={handleChange}
                  placeholder='请输入用户名'
                  required
                  disabled={loading}
                />
              </div>
              <div className='grid gap-2'>
                <div className='flex items-center'>
                  <Label htmlFor='password'>密码</Label>
                </div>
                <Input
                  id='password'
                  name='password'
                  type='password'
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
              <Button type='submit' className='w-full' disabled={loading}>
                {loading ? '登录中...' : '登录'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
