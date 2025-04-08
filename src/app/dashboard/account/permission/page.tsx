'use client';

import { DataTable } from '@/components/table/data-table';
import { columns } from './columns';
import { Suspense, useEffect, useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/common/heading';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { DataTableSkeleton } from '@/components/table/data-table-skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { PermissionForm } from './components/permission-form';

export default function PermissionManagementPage() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<any>(null);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/permissions');
      const data = await response.json();
      setPermissions(data);
    } catch (error) {
      toast.error('获取权限列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdatePermission = async (values: any) => {
    try {
      const url = editingPermission
        ? `/api/permissions/${editingPermission.id}`
        : '/api/permissions';
      const method = editingPermission ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      if (response.ok) {
        toast.success(editingPermission ? '权限更新成功' : '权限创建成功');
        setOpen(false);
        fetchPermissions();
        setEditingPermission(null);
      }
    } catch (error) {
      toast.error(editingPermission ? '更新权限失败' : '创建权限失败');
    }
  };

  const handleDelete = async (permission: any) => {
    try {
      const response = await fetch(`/api/permissions/${permission.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('权限删除成功');
        fetchPermissions();
      }
    } catch (error) {
      toast.error('删除权限失败');
    }
  };

  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading title='权限管理' description='管理系统权限' />
          <Button
            onClick={() => {
              setEditingPermission(null);
              setOpen(true);
            }}
          >
            <Plus className='mr-2 h-4 w-4' />
            新增权限
          </Button>
        </div>
        <Separator />
        {loading ? (
          <DataTableSkeleton columnCount={5} rowCount={8} filterCount={2} />
        ) : (
          <DataTable
            columns={columns}
            data={permissions}
            totalItems={permissions.length}
            meta={{
              onEdit: (permission: any) => {
                setEditingPermission(permission);
                setOpen(true);
              },
              onDelete: handleDelete
            }}
          />
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPermission ? '编辑权限' : '新增权限'}
            </DialogTitle>
          </DialogHeader>
          <PermissionForm
            initialData={editingPermission}
            onSubmit={handleCreateOrUpdatePermission}
            onCancel={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
