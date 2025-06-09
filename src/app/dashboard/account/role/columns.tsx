'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';

export type Role = {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export const columns: ColumnDef<Role>[] = [
  {
    accessorKey: 'id',
    header: () => <div className='text-center'>ID</div>,
    cell: ({ row }) => {
      return <div className='text-center'>{row.getValue('id')}</div>;
    }
  },
  {
    accessorKey: 'name',
    header: '角色名称',
    meta: {
      variant: 'text',
      placeholder: '搜索角色名称...'
    }
  },
  {
    accessorKey: 'description',
    header: '描述',
    meta: {
      variant: 'text',
      placeholder: '搜索描述...'
    }
  },
  {
    accessorKey: 'createdAt',
    header: '创建时间',
    cell: ({ row }) => {
      return new Date(row.getValue('createdAt')).toLocaleString();
    },
    meta: {
      variant: 'dateRange',
      placeholder: '选择日期范围...'
    }
  },
  {
    id: 'actions',
    header: '操作',
    cell: ({ row, table }) => {
      const role = row.original;
      const meta = table.options.meta as {
        onEdit?: (role: Role) => void;
        onDelete?: (role: Role) => void;
        onAssignPermissions?: (role: Role) => void;
      };
      const { onEdit, onDelete, onAssignPermissions } = meta || {};

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem onSelect={() => onEdit?.(role)}>
              编辑
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onAssignPermissions?.(role)}>
              分配权限
            </DropdownMenuItem>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className='text-red-600'
                >
                  删除
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>确认删除</AlertDialogTitle>
                  <AlertDialogDescription>
                    确定要删除角色 "{role.name}" 吗？此操作不可撤销。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete?.(role)}>
                    确认删除
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }
];
