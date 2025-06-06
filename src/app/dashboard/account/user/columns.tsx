'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
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

export type User = {
  id: number;
  email: string;
  username: string;
  roleName: string;
  createdAt: string;
};

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'id',
    header: () => <div className='text-center'>ID</div>,
    cell: ({ row }) => {
      return <div className='text-center'>{row.getValue('id')}</div>;
    }
  },
  {
    accessorKey: 'username',
    header: '用户名'
  },
  {
    accessorKey: 'email',
    header: '邮箱'
  },
  {
    accessorKey: 'roleName',
    header: '角色',
    cell: ({ row }) => {
      return <Badge>{row.getValue('roleName')}</Badge>;
    }
  },
  {
    accessorKey: 'createdAt',
    header: '创建时间',
    cell: ({ row }) => {
      return new Date(row.getValue('createdAt')).toLocaleString();
    }
  },
  {
    id: 'actions',
    header: '操作',
    cell: ({ row, table }) => {
      const user = row.original;
      const meta = table.options.meta as {
        onEdit?: (user: User) => void;
        onDelete?: (user: User) => void;
      };
      const { onEdit, onDelete } = meta || {};

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem onSelect={() => onEdit?.(user)}>
              编辑
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
                    确定要删除用户 "{user.username}" 吗？此操作不可撤销。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete?.(user)}>
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
