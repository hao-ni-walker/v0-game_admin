'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface UserFormProps {
  initialData?: any;
  onSubmit: (values: any) => void;
  onCancel?: () => void;
}

export function UserForm({ initialData, onSubmit, onCancel }: UserFormProps) {
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({
    username: initialData?.username || '',
    email: initialData?.email || '',
    password: '',
    roleId: initialData?.roleId ? String(initialData.roleId) : ''
  });

  useEffect(() => {
    // 获取角色列表
    const fetchRoles = async () => {
      try {
        const response = await fetch('/api/roles');
        const data = await response.json();
        setRoles(data);
      } catch (error) {
        toast.error('获取角色列表失败');
      }
    };
    fetchRoles();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRoleChange = (value: string) => {
    setFormData({
      ...formData,
      roleId: value
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='grid gap-2'>
        <Label htmlFor='username'>用户名</Label>
        <Input
          id='username'
          name='username'
          value={formData.username}
          onChange={handleChange}
          placeholder='请输入用户名'
          required
        />
      </div>
      <div className='grid gap-2'>
        <Label htmlFor='email'>邮箱</Label>
        <Input
          id='email'
          name='email'
          type='email'
          value={formData.email}
          onChange={handleChange}
          placeholder='请输入邮箱'
          required
        />
      </div>
      <div className='grid gap-2'>
        <Label htmlFor='password'>密码</Label>
        <Input
          id='password'
          name='password'
          type='password'
          value={formData.password}
          onChange={handleChange}
          placeholder='请输入密码'
          required={!initialData}
        />
      </div>
      <div className='grid gap-2'>
        <Label>角色</Label>
        <Select
          onValueChange={handleRoleChange}
          value={formData.roleId}
          required
        >
          <SelectTrigger className='w-full'>
            <SelectValue placeholder='请选择角色' />
          </SelectTrigger>
          <SelectContent className='w-full'>
            {roles.map((role: any) => (
              <SelectItem key={role.id} value={String(role.id)}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className='flex justify-end gap-2'>
        {onCancel && (
          <Button type='button' variant='outline' onClick={onCancel}>
            取消
          </Button>
        )}
        <Button type='submit'>提交</Button>
      </div>
    </form>
  );
}
