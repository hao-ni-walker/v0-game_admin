'use client';

import { useEffect, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface RolePermissionsProps {
  roleId: number;
  onClose: () => void;
}

export function RolePermissions({ roleId, onClose }: RolePermissionsProps) {
  const [permissions, setPermissions] = useState<any[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPermissions();
    fetchRolePermissions();
  }, [roleId]);

  const fetchPermissions = async () => {
    try {
      const response = await fetch('/api/permissions');
      const data = await response.json();
      setPermissions(data);
    } catch (error) {
      toast.error('获取权限列表失败');
    }
  };

  const fetchRolePermissions = async () => {
    try {
      const response = await fetch(`/api/roles/${roleId}/permissions`);
      const data = await response.json();
      setSelectedPermissions(data.map((p: any) => p.id));
    } catch (error) {
      toast.error('获取角色权限失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(`/api/roles/${roleId}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissionIds: selectedPermissions })
      });

      if (response.ok) {
        toast.success('权限分配成功');
        onClose();
      }
    } catch (error) {
      toast.error('权限分配失败');
    }
  };

  if (loading) {
    return <div>加载中...</div>;
  }

  return (
    <div className='space-y-4'>
      <ScrollArea className='h-[300px] pr-4'>
        <div className='space-y-4'>
          {permissions.map((permission) => (
            <div key={permission.id} className='flex items-center space-x-2'>
              <Checkbox
                id={`permission-${permission.id}`}
                checked={selectedPermissions.includes(permission.id)}
                onCheckedChange={(checked) => {
                  setSelectedPermissions(
                    checked
                      ? [...selectedPermissions, permission.id]
                      : selectedPermissions.filter((id) => id !== permission.id)
                  );
                }}
              />
              <label
                htmlFor={`permission-${permission.id}`}
                className='text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
              >
                {permission.name}
                <p className='text-muted-foreground text-xs'>
                  {permission.description}
                </p>
              </label>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className='flex justify-end space-x-2'>
        <Button variant='outline' onClick={onClose}>
          取消
        </Button>
        <Button onClick={handleSubmit}>保存</Button>
      </div>
    </div>
  );
}
